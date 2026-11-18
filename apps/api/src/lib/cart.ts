import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { find, upsert } from "./store";
import { findVariantBySku } from "./catalogue";

/**
 * Server-side cart.
 *
 * The stored cart holds only { sku, qty } — never a price. Prices, names,
 * stock and GST are resolved from the live catalogue every time the cart is
 * read, which means:
 *   - a price change is reflected in open carts immediately;
 *   - a browser cannot tell the server what something costs;
 *   - a SKU that has been withdrawn drops out of the cart with a notice
 *     rather than being sold.
 */

const COOKIE = "jaiisha_cart";
const FREE_SHIPPING_PAISE = 300_000; // ₹3,000
const FLAT_SHIPPING_PAISE = 15_000; // ₹150
const MAX_QTY = 10;

export interface StoredCart {
  lines: Array<{ sku: string; qty: number }>;
}

export interface PricedLine {
  sku: string;
  qty: number;
  productId: string;
  slug: string;
  name: string;
  colour: string;
  unitPaise: number;
  mrpPaise: number;
  linePaise: number;
  gstRate: number;
  image: string;
  availability: string;
  /** Null for made-to-order pieces, which have no fixed count. */
  stock: number | null;
}

export interface PricedCart {
  id: string;
  lines: PricedLine[];
  /** SKUs that were in the cart but are no longer sold. */
  dropped: string[];
  count: number;
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  /** GST is included in the price; this is the tax component, for the invoice. */
  gstPaise: number;
  freeShippingAtPaise: number;
  currency: "INR";
}

/* ------------------------------------------------------------- identity - */

/**
 * Reads the cart cookie, creating one if needed. `mutable` must be true for
 * calls made from a route handler that is allowed to set cookies.
 */
export const cartId = async (mutable: boolean): Promise<string> => {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  if (mutable) {
    jar.set(COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return id;
};

/* -------------------------------------------------------------- reading - */

const loadCart = async (id: string): Promise<StoredCart> =>
  (await find<StoredCart>("carts", id))?.payload ?? { lines: [] };

export const priceCart = async (id: string): Promise<PricedCart> => {
  const stored = await loadCart(id);

  const lines: PricedLine[] = [];
  const dropped: string[] = [];

  for (const line of stored.lines) {
    const found = await findVariantBySku(line.sku);
    if (!found) {
      dropped.push(line.sku);
      continue;
    }
    const { product, variant } = found;
    lines.push({
      sku: variant.sku,
      qty: line.qty,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      colour: variant.colour.name,
      unitPaise: variant.price.paise,
      mrpPaise: variant.mrp.paise,
      linePaise: variant.price.paise * line.qty,
      gstRate: product.tax.gstRate,
      image: (variant.images.find((i) => i.kind === "model") ?? variant.images[0])?.src ?? "",
      availability: variant.availability,
      stock: variant.stock,
    });
  }

  const subtotalPaise = lines.reduce((n, l) => n + l.linePaise, 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  // Prices are GST-inclusive, so the tax component is backed out of the total
  // rather than added to it.
  const gstPaise = Math.round(
    lines.reduce((n, l) => n + l.linePaise - l.linePaise / (1 + l.gstRate / 100), 0),
  );

  const shippingPaise =
    subtotalPaise === 0 || subtotalPaise >= FREE_SHIPPING_PAISE ? 0 : FLAT_SHIPPING_PAISE;

  return {
    id,
    lines,
    dropped,
    count,
    subtotalPaise,
    shippingPaise,
    totalPaise: subtotalPaise + shippingPaise,
    gstPaise,
    freeShippingAtPaise: FREE_SHIPPING_PAISE,
    currency: "INR",
  };
};

/* -------------------------------------------------------------- writing - */

const persist = async (id: string, cart: StoredCart) => {
  await upsert<StoredCart>("carts", id, cart);
};

export interface MutationResult {
  ok: boolean;
  error?: string;
}

/** Adds `qty` to a line, creating it if absent. Clamped to stock. */
export const addLine = async (id: string, sku: string, qty: number): Promise<MutationResult> => {
  const found = await findVariantBySku(sku);
  if (!found) return { ok: false, error: `No saree with the code ${sku}.` };
  if (found.variant.availability === "sold_out") {
    return { ok: false, error: `${found.product.name} in ${found.variant.colour.name} is sold out.` };
  }

  const cart = await loadCart(id);
  const line = cart.lines.find((l) => l.sku === sku);
  const wanted = (line?.qty ?? 0) + qty;
  const capped = capQty(wanted, found.variant.stock);

  if (line) line.qty = capped;
  else cart.lines.push({ sku, qty: capped });

  await persist(id, cart);

  if (capped < wanted) {
    return {
      ok: true,
      error: `Only ${capped} of this piece ${capped === 1 ? "is" : "are"} available.`,
    };
  }
  return { ok: true };
};

/** Sets an exact quantity. Zero removes the line. */
export const setLine = async (id: string, sku: string, qty: number): Promise<MutationResult> => {
  const cart = await loadCart(id);

  if (qty <= 0) {
    cart.lines = cart.lines.filter((l) => l.sku !== sku);
    await persist(id, cart);
    return { ok: true };
  }

  const found = await findVariantBySku(sku);
  if (!found) return { ok: false, error: `No saree with the code ${sku}.` };

  const capped = capQty(qty, found.variant.stock);
  const line = cart.lines.find((l) => l.sku === sku);
  if (line) line.qty = capped;
  else cart.lines.push({ sku, qty: capped });

  await persist(id, cart);
  return capped < qty
    ? { ok: true, error: `Only ${capped} available.` }
    : { ok: true };
};

export const removeLine = async (id: string, sku: string): Promise<MutationResult> => {
  const cart = await loadCart(id);
  cart.lines = cart.lines.filter((l) => l.sku !== sku);
  await persist(id, cart);
  return { ok: true };
};

export const emptyCart = async (id: string): Promise<MutationResult> => {
  await persist(id, { lines: [] });
  return { ok: true };
};

/**
 * A handloom saree is often a single physical piece, so the cap is whichever
 * is smaller: remaining stock, or a sane per-order limit. Made-to-order pieces
 * (stock === null) are only limited by MAX_QTY.
 */
const capQty = (qty: number, stock: number | null): number => {
  const ceiling = stock === null ? MAX_QTY : Math.min(stock, MAX_QTY);
  return Math.max(1, Math.min(Math.floor(qty), Math.max(1, ceiling)));
};
