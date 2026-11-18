/**
 * JAIISHA — domain model.
 *
 * Designed so Phase 1 (catalogue + WhatsApp enquiry) and Phase 2 (cart,
 * payments, GST invoices, shipping) read from the SAME shapes. Nothing here
 * needs to be rebuilt when checkout switches on: the money, stock, tax and
 * variant fields already exist, they are simply not yet surfaced in the UI.
 */

export type CurrencyCode = "INR";

/** Money is stored in paise (integer) to avoid float drift in invoices. */
export interface Money {
  /** Integer paise. ₹12,500.00 => 1250000 */
  paise: number;
  currency: CurrencyCode;
}

export type Availability = "in_stock" | "made_to_order" | "sold_out";

export type OccasionSlug =
  | "wedding-bridal"
  | "festive"
  | "party-celebration"
  | "traditional-functions"
  | "gifting";

export type FabricSlug =
  | "banarasi-silk"
  | "katan-silk"
  | "organza"
  | "georgette"
  | "tissue-silk";

export type WeaveSlug = "handloom" | "powerloom" | "semi-handloom";
export type ZariSlug = "pure-zari" | "tested-zari" | "resham" | "meenakari";

export interface Colour {
  slug: string;
  name: string;
  /** Swatch colour for UI chips. */
  hex: string;
  /** Darker companion used for gradients / woven placeholder art. */
  shadeHex?: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Lets the PDP order the gallery meaningfully instead of by upload order. */
  kind: "model" | "flatlay" | "pallu" | "detail" | "blouse";
}

export interface ProductVideo {
  src: string;
  poster?: string;
  /** Vertical reels and 16x9 both occur; the player needs to know. */
  aspect: "16x9" | "9x16" | "4x5";
}

/**
 * A variant is one physically stocked saree: colour + its own SKU, price,
 * stock count and photographs. Colour swatches on the PDP are rendered FROM
 * this list, so a customer can never pick a colour that does not exist for
 * that design.
 */
export interface ProductVariant {
  id: string;
  /** Human-facing product code, printed on invoices and used in WhatsApp enquiries. */
  sku: string;
  colour: Colour;
  secondaryColour?: Colour;
  price: Money;
  /** Manufacturer's listed price; used for the struck-through price and savings badge. */
  mrp: Money;
  availability: Availability;
  /** Phase 2 inventory. `null` for made-to-order pieces with no fixed count. */
  stock: number | null;
  /** Weaving lead time in days for made-to-order pieces. */
  leadTimeDays?: number;
  images: ProductImage[];
}

export interface Rating {
  value: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One line of poetry for the card. */
  tagline: string;
  /** Why this saree, and what tradition it belongs to. Shown on the PDP. */
  story: string;
  collections: string[];
  occasions: OccasionSlug[];
  fabric: FabricSlug;
  weave: WeaveSlug;
  zari: ZariSlug;
  /** e.g. "Kadwa buta", "Jangla jaal" — the weaver's technique. */
  craft: string;
  /** Where it was woven. Provenance is a trust signal for silk. */
  origin: string;
  sareeLengthMetres: number;
  blousePieceMetres: number | null;
  weightGrams?: number;
  care: string[];
  rating: Rating;
  badges: Array<"bestseller" | "new-arrival" | "handloom" | "limited" | "bridal">;
  variants: ProductVariant[];
  video?: ProductVideo;
  /** Phase 2 tax fields — HSN 5007 is woven silk fabric. */
  tax: { hsn: string; gstRate: number };
  seo: { title: string; description: string };
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  /** Verified purchase flag — becomes automatic once Phase 2 orders exist. */
  verified: boolean;
  createdAt: string;
}

/** Filter facets accepted by the catalogue query layer. */
export interface ProductQuery {
  occasion?: OccasionSlug;
  colour?: string;
  fabric?: FabricSlug;
  weave?: WeaveSlug;
  /** Price band slug, e.g. "under-5000". */
  price?: string;
  collection?: string;
  search?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "bestsellers"
  | "top-rated";

export interface PriceBand {
  slug: string;
  label: string;
  minPaise: number;
  maxPaise: number | null;
}
