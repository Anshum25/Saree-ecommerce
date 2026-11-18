import { PRODUCTS, type Product, type ProductVariant } from "@jaiisha/catalogue";
import { readAll } from "./store";

/**
 * The live catalogue = the seed catalogue in @jaiisha/catalogue, with the
 * admin's edits layered on top.
 *
 * Seed products are never mutated on disk. The `products` store holds one row
 * per product the admin has touched:
 *   - an edited seed product  -> row with the same id, `deleted: false`
 *   - a brand-new product     -> row with a fresh id
 *   - a removed seed product  -> row with `deleted: true` (a tombstone)
 *
 * That keeps `git`-tracked seed data as the baseline and makes every admin
 * change visible, reversible and diffable in one JSON file.
 *
 * IMPORTANT: the Astro storefront compiles the seed catalogue in at build
 * time, so edits made here are live on the API immediately but reach the
 * storefront on its next `npm run build`. The admin UI says so.
 */

export interface StoredProduct {
  product: Product;
  deleted: boolean;
}

export const resolveProducts = async (): Promise<Product[]> => {
  const rows = await readAll<StoredProduct>("products");
  if (rows.length === 0) return PRODUCTS;

  const byId = new Map(rows.map((r) => [r.id, r.payload]));

  const merged: Product[] = [];

  for (const seed of PRODUCTS) {
    const override = byId.get(seed.id);
    if (!override) {
      merged.push(seed);
      continue;
    }
    byId.delete(seed.id);
    if (!override.deleted) merged.push(override.product);
  }

  // Products that exist only in the store — created through the admin panel.
  for (const stored of byId.values()) {
    if (!stored.deleted) merged.push(stored.product);
  }

  return merged;
};

export const resolveProduct = async (slugOrId: string): Promise<Product | undefined> => {
  const all = await resolveProducts();
  return all.find((p) => p.slug === slugOrId || p.id === slugOrId);
};

export interface FoundVariant {
  product: Product;
  variant: ProductVariant;
}

/** Looks a SKU up across the live catalogue. The cart prices from this. */
export const findVariantBySku = async (sku: string): Promise<FoundVariant | undefined> => {
  for (const product of await resolveProducts()) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
};

/** True when the seed catalogue has this id, i.e. editing rather than creating. */
export const isSeedProduct = (id: string): boolean => PRODUCTS.some((p) => p.id === id);
