import { queryIn, type ProductQuery, type SortKey } from "@jaiisha/catalogue";
import { resolveProducts } from "@/lib/catalogue";
import { ok } from "@/lib/http";

/**
 * GET /api/products
 *
 * Query: occasion, colour, fabric, weave, price, collection, search, sort,
 *        page, perPage — the same ProductQuery the storefront uses, so the
 *        Astro build and this endpoint can never disagree on filter semantics.
 *
 * Example: /api/products?occasion=festive&colour=pink&sort=price-asc
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const query: ProductQuery = {
    occasion: (sp.get("occasion") as ProductQuery["occasion"]) ?? undefined,
    colour: sp.get("colour") ?? undefined,
    fabric: (sp.get("fabric") as ProductQuery["fabric"]) ?? undefined,
    weave: (sp.get("weave") as ProductQuery["weave"]) ?? undefined,
    price: sp.get("price") ?? undefined,
    collection: sp.get("collection") ?? undefined,
    search: sp.get("search") ?? sp.get("q") ?? undefined,
    sort: (sp.get("sort") as SortKey) ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
    perPage: sp.get("perPage") ? Math.min(Number(sp.get("perPage")), 100) : undefined,
  };

  // The LIVE catalogue: seed products plus the admin's edits.
  const result = queryIn(await resolveProducts(), query);

  return ok(result.items, {
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    pages: result.pages,
    query,
  });
}
