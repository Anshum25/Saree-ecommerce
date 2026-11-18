/**
 * @jaiisha/catalogue — the single source of truth for products, taxonomy and
 * query logic.
 *
 * Both runtimes read from here, which is what keeps them honest:
 *   - the Astro storefront imports it directly at build time (no network hop,
 *     fully static pages, instant filtering);
 *   - the Next.js API serves it over HTTP for anything stateful (enquiries,
 *     reviews, and in Phase 2 cart / orders / payments).
 *
 * To move to a real database in Phase 2, reimplement the functions below
 * against your DB. Nothing in the UI needs to change.
 */

export * from "./types.ts";
export * from "./taxonomy.ts";
export { PRODUCTS } from "./products.ts";
export { REVIEWS, reviewsForProduct } from "./reviews.ts";

import { PRODUCTS } from "./products.ts";
import { COLOURS, FABRICS, OCCASIONS, PRICE_BANDS, WEAVES } from "./taxonomy.ts";
import type {
  Money,
  Product,
  ProductQuery,
  ProductVariant,
  SortKey,
} from "./types.ts";

/* ------------------------------------------------------------------ money - */

export const formatINR = (money: Money): string => {
  const rupees = money.paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(rupees);
};

/** Compact form for cards: 28,500 rather than ₹28,500.00 */
export const formatINRCompact = (money: Money): string =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(money.paise / 100);

export const discountPercent = (variant: ProductVariant): number => {
  if (variant.mrp.paise <= variant.price.paise) return 0;
  return Math.round(((variant.mrp.paise - variant.price.paise) / variant.mrp.paise) * 100);
};

/* --------------------------------------------------------------- products - */

/** The variant a card and the PDP open on: first in stock, else the first. */
export const defaultVariant = (product: Product): ProductVariant =>
  product.variants.find((v) => v.availability === "in_stock") ?? product.variants[0];

export const priceFrom = (product: Product): Money =>
  product.variants.reduce(
    (min, v) => (v.price.paise < min.paise ? v.price : min),
    product.variants[0].price,
  );

export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

/** Colours actually available for this design — never a generic colour list. */
export const availableColours = (product: Product) =>
  product.variants.map((v) => ({
    ...v.colour,
    variantId: v.id,
    availability: v.availability,
  }));

const matchesPriceBand = (product: Product, bandSlug: string): boolean => {
  const band = PRICE_BANDS.find((b) => b.slug === bandSlug);
  if (!band) return true;
  return product.variants.some(
    (v) => v.price.paise >= band.minPaise && (band.maxPaise === null || v.price.paise < band.maxPaise),
  );
};

const searchHaystack = (p: Product): string =>
  [p.name, p.tagline, p.craft, p.fabric, p.origin, ...p.collections, ...p.occasions,
   ...p.variants.map((v) => `${v.colour.name} ${v.sku}`)]
    .join(" ")
    .toLowerCase();

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => priceFrom(a).paise - priceFrom(b).paise,
  "price-desc": (a, b) => priceFrom(b).paise - priceFrom(a).paise,
  // Review count is the best proxy for units sold until Phase 2 orders exist.
  bestsellers: (a, b) =>
    Number(b.badges.includes("bestseller")) - Number(a.badges.includes("bestseller")) ||
    b.rating.count - a.rating.count,
  "top-rated": (a, b) => b.rating.value - a.rating.value || b.rating.count - a.rating.count,
};

export interface ProductQueryResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

/**
 * Runs a query against an arbitrary product list.
 *
 * The API serves the LIVE catalogue — the seed products with the shop
 * owner's admin edits layered on — so it must be able to query a list it
 * supplies, not the baked-in constant. `queryProducts` below is this same
 * function bound to the seed list, which is what the static storefront
 * builds from.
 */
export const queryIn = (source: Product[], q: ProductQuery = {}): ProductQueryResult => {
  const search = q.search?.trim().toLowerCase();

  let items = source.filter((p) => {
    if (q.occasion && !p.occasions.includes(q.occasion)) return false;
    if (q.fabric && p.fabric !== q.fabric) return false;
    if (q.weave && p.weave !== q.weave) return false;
    if (q.collection && !p.collections.includes(q.collection)) return false;
    if (q.colour && !p.variants.some((v) => v.colour.slug === q.colour)) return false;
    if (q.price && !matchesPriceBand(p, q.price)) return false;
    if (search && !searchHaystack(p).includes(search)) return false;
    return true;
  });

  items = items.sort(sorters[q.sort ?? "newest"]);

  const perPage = q.perPage ?? 24;
  const page = Math.max(1, q.page ?? 1);
  const total = items.length;

  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
};

/** The seed catalogue, queried. Used by the static storefront build. */
export const queryProducts = (q: ProductQuery = {}): ProductQueryResult => queryIn(PRODUCTS, q);

/** Facet counts, so the filter rail can grey out combinations that return nothing. */
export const facetCountsIn = (source: Product[], base: ProductQuery = {}) => {
  const count = (patch: ProductQuery) =>
    queryIn(source, { ...base, ...patch, page: 1, perPage: 999 }).total;
  return {
    occasion: Object.fromEntries(OCCASIONS.map((o) => [o.slug, count({ occasion: o.slug })])),
    colour: Object.fromEntries(COLOURS.map((c) => [c.slug, count({ colour: c.slug })])),
    fabric: Object.fromEntries(FABRICS.map((f) => [f.slug, count({ fabric: f.slug })])),
    weave: Object.fromEntries(WEAVES.map((w) => [w.slug, count({ weave: w.slug })])),
    price: Object.fromEntries(PRICE_BANDS.map((b) => [b.slug, count({ price: b.slug })])),
  };
};

export const facetCounts = (base: ProductQuery = {}) => facetCountsIn(PRODUCTS, base);

/** Same design in other colourways, then same occasion, then same fabric. */
export const relatedIn = (source: Product[], product: Product, limit = 4): Product[] => {
  const score = (p: Product) =>
    (p.occasions.filter((o) => product.occasions.includes(o)).length * 2) +
    (p.fabric === product.fabric ? 2 : 0) +
    p.collections.filter((c) => product.collections.includes(c)).length;

  return source
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || b.p.rating.value - a.p.rating.value)
    .slice(0, limit)
    .map((x) => x.p);
};

export const relatedProducts = (product: Product, limit = 4): Product[] =>
  relatedIn(PRODUCTS, product, limit);

export const bestsellers = (limit = 8): Product[] =>
  queryProducts({ sort: "bestsellers", perPage: limit }).items;

export const newArrivals = (limit = 8): Product[] =>
  queryProducts({ sort: "newest", perPage: limit }).items;

/** Every colour that at least one product is actually woven in. */
export const colourFacets = () =>
  COLOURS.map((c) => ({
    ...c,
    count: PRODUCTS.filter((p) => p.variants.some((v) => v.colour.slug === c.slug)).length,
  })).filter((c) => c.count > 0);
