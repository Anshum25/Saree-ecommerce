import {
  COLOURS,
  FABRICS,
  OCCASIONS,
  PRICE_BANDS,
  SORT_OPTIONS,
  WEAVES,
  facetCountsIn,
} from "@jaiisha/catalogue";
import { resolveProducts } from "@/lib/catalogue";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/facets
 * Everything a filter UI needs in one call: the taxonomies and how many
 * products sit behind each option.
 */
export async function GET() {
  return ok(
    {
      occasions: OCCASIONS,
      colours: COLOURS,
      fabrics: FABRICS,
      weaves: WEAVES,
      priceBands: PRICE_BANDS,
      sortOptions: SORT_OPTIONS,
      counts: facetCountsIn(await resolveProducts()),
    },
  );
}
