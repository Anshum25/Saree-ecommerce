import {
  addLine,
  cartId,
  emptyCart,
  priceCart,
  removeLine,
  setLine,
} from "@/lib/cart";
import { clientKey, rateLimited } from "@/lib/store";
import { fail, ok, readJson, str } from "@/lib/http";

/**
 * The cart. Full CRUD, identified by an httpOnly cookie.
 *
 *   GET    /api/cart                  read the priced cart
 *   POST   /api/cart   { sku, qty? }  add to a line (qty defaults to 1)
 *   PATCH  /api/cart   { sku, qty }   set an exact quantity; 0 removes
 *   DELETE /api/cart?sku=...          remove one line
 *   DELETE /api/cart                  empty it
 *
 * Prices are never accepted from the client — see lib/cart.ts.
 *
 * Credentialed requests: the storefront must send `credentials: "include"`,
 * and ACCESS_CONTROL_ALLOW_ORIGIN must be the exact storefront origin rather
 * than `*`, or the browser will refuse to carry the cookie. STOREFRONT_ORIGIN
 * in .env does this.
 */

export const dynamic = "force-dynamic";

const qtyOf = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
};

export async function GET() {
  const id = await cartId(true);
  return ok(await priceCart(id));
}

export async function POST(req: Request) {
  if (rateLimited(`cart:${clientKey(req)}`, 60, 60_000)) {
    return fail(429, "Too many cart updates. Slow down a moment.");
  }

  const body = await readJson<{ sku?: unknown; qty?: unknown }>(req);
  const sku = str(body?.sku, 40);
  if (!sku) return fail(400, "A sku is required.");

  const id = await cartId(true);
  const result = await addLine(id, sku, qtyOf(body?.qty, 1));
  if (!result.ok) return fail(409, result.error ?? "Could not add that to the bag.");

  const cart = await priceCart(id);
  return ok(cart, result.error ? { notice: result.error } : undefined, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await readJson<{ sku?: unknown; qty?: unknown }>(req);
  const sku = str(body?.sku, 40);
  if (!sku) return fail(400, "A sku is required.");
  if (body?.qty === undefined) return fail(400, "A qty is required.");

  const id = await cartId(true);
  const result = await setLine(id, sku, qtyOf(body.qty, 1));
  if (!result.ok) return fail(409, result.error ?? "Could not update that line.");

  return ok(await priceCart(id), result.error ? { notice: result.error } : undefined);
}

export async function DELETE(req: Request) {
  const sku = new URL(req.url).searchParams.get("sku");
  const id = await cartId(true);

  if (sku) await removeLine(id, sku);
  else await emptyCart(id);

  return ok(await priceCart(id));
}
