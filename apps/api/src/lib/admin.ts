import { randomUUID } from "node:crypto";
import type { Product } from "@jaiisha/catalogue";
import { COLOURS } from "@jaiisha/catalogue";

/**
 * Admin auth and product validation.
 *
 * Auth is a single shared key in ADMIN_KEY, sent as `X-Admin-Key`. That is
 * appropriate for one shop owner in Phase 1 and nothing more: it has no
 * sessions, no per-user audit trail and no password reset. Replace it with
 * real accounts before more than one person has it.
 */

export const adminKeyOk = (req: Request): boolean => {
  const expected = process.env.ADMIN_KEY;
  // Refuse rather than default-allow when the key has not been configured.
  if (!expected) return false;

  const given = req.headers.get("x-admin-key") ?? "";
  if (given.length !== expected.length) return false;

  // Constant-time-ish compare so the key cannot be guessed a byte at a time.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
};

export const adminConfigured = (): boolean => Boolean(process.env.ADMIN_KEY);

/* ------------------------------------------------------------ validation - */

export type Draft = Record<string, unknown>;

const asString = (v: unknown, max = 400): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const asNumber = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const slugify = (v: string): string =>
  v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export interface BuildResult {
  product?: Product;
  errors: Record<string, string>;
}

/**
 * Builds a Product from an admin form payload.
 *
 * The form is deliberately simpler than the full Product type — a shop owner
 * should not have to hand-author a variant array — so this fills the
 * structural parts (ids, SKUs, image paths, ratings) and validates the rest.
 */
export const buildProduct = (draft: Draft, existing?: Product): BuildResult => {
  const errors: Record<string, string> = {};

  const name = asString(draft.name, 140) || existing?.name || "";
  if (name.length < 3) errors.name = "Give the saree a name of at least 3 characters.";

  const slug = slugify(asString(draft.slug, 90) || existing?.slug || name);
  if (!slug) errors.slug = "Could not make a URL from that name.";

  const price = asNumber(draft.price);
  if (price === null || price <= 0) errors.price = "Price must be a number greater than zero.";

  const mrpRaw = asNumber(draft.mrp);
  const mrp = mrpRaw === null || mrpRaw <= 0 ? price : mrpRaw;
  if (price !== null && mrp !== null && mrp < price) {
    errors.mrp = "MRP cannot be lower than the selling price.";
  }

  const colourSlugs = Array.isArray(draft.colours)
    ? (draft.colours as unknown[]).map((c) => asString(c, 30)).filter(Boolean)
    : [];
  if (colourSlugs.length === 0) errors.colours = "Choose at least one colour.";

  const unknownColour = colourSlugs.find((c) => !COLOURS.some((k) => k.slug === c));
  if (unknownColour) errors.colours = `"${unknownColour}" is not one of the house colours.`;

  const occasions = Array.isArray(draft.occasions)
    ? (draft.occasions as unknown[]).map((o) => asString(o, 40)).filter(Boolean)
    : [];
  if (occasions.length === 0) errors.occasions = "Choose at least one occasion.";

  const stockRaw = asNumber(draft.stock);
  const madeToOrder = draft.madeToOrder === true;
  const stock = madeToOrder ? null : Math.max(0, Math.floor(stockRaw ?? 0));

  if (Object.keys(errors).length) return { errors };

  const id = existing?.id ?? `p-${randomUUID().slice(0, 8)}`;
  const fabric = (asString(draft.fabric, 40) || existing?.fabric || "banarasi-silk") as Product["fabric"];
  const weave = (asString(draft.weave, 30) || existing?.weave || "handloom") as Product["weave"];
  const zari = (asString(draft.zari, 30) || existing?.zari || "tested-zari") as Product["zari"];

  const product: Product = {
    id,
    slug,
    name,
    tagline: asString(draft.tagline, 160) || existing?.tagline || "",
    story: asString(draft.story, 4000) || existing?.story || "",
    collections: existing?.collections ?? [],
    occasions: occasions as Product["occasions"],
    fabric,
    weave,
    zari,
    craft: asString(draft.craft, 120) || existing?.craft || "Banarasi weave",
    origin: asString(draft.origin, 120) || existing?.origin || "Varanasi",
    sareeLengthMetres: asNumber(draft.sareeLengthMetres) ?? existing?.sareeLengthMetres ?? 5.5,
    blousePieceMetres:
      draft.blousePiece === false ? null : (asNumber(draft.blousePieceMetres) ?? 0.8),
    weightGrams: asNumber(draft.weightGrams) ?? existing?.weightGrams,
    care:
      Array.isArray(draft.care) && draft.care.length
        ? (draft.care as unknown[]).map((c) => asString(c, 200)).filter(Boolean)
        : (existing?.care ?? ["Dry clean only"]),
    // Ratings are earned, not typed in. A new product starts with none.
    rating: existing?.rating ?? { value: 0, count: 0 },
    badges: Array.isArray(draft.badges)
      ? ((draft.badges as unknown[]).map((b) => asString(b, 20)).filter(Boolean) as Product["badges"])
      : (existing?.badges ?? []),
    variants: colourSlugs.map((colourSlug, i) => {
      const colour = COLOURS.find((c) => c.slug === colourSlug)!;
      const prior = existing?.variants.find((v) => v.colour.slug === colourSlug);
      return {
        id: `${slug}-${colourSlug}`,
        sku:
          prior?.sku ??
          `JAI-${slug.slice(0, 3).toUpperCase()}-${colourSlug.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
        colour,
        price: { paise: Math.round(price! * 100), currency: "INR" as const },
        mrp: { paise: Math.round(mrp! * 100), currency: "INR" as const },
        availability: madeToOrder ? ("made_to_order" as const) : stock! > 0 ? ("in_stock" as const) : ("sold_out" as const),
        stock,
        leadTimeDays: madeToOrder ? (asNumber(draft.leadTimeDays) ?? 21) : undefined,
        images:
          prior?.images ??
          (["model", "flatlay", "pallu", "detail"] as const).map((kind) => ({
            src: `/img/products/${slug}-${colourSlug}-${kind}.svg`,
            alt: `${name} in ${colour.name}`,
            width: 1200,
            height: 1600,
            kind,
          })),
      };
    }),
    video: existing?.video,
    tax: { hsn: "5007", gstRate: asNumber(draft.gstRate) ?? existing?.tax.gstRate ?? 5 },
    seo: {
      title: asString(draft.seoTitle, 160) || `${name} | JAIISHA`,
      description:
        asString(draft.seoDescription, 300) ||
        asString(draft.tagline, 160) ||
        `${name} — handwoven Banarasi silk from Varanasi.`,
    },
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  };

  return { product, errors: {} };
};
