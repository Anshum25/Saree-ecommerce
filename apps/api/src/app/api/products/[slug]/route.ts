import { relatedIn, reviewsForProduct } from "@jaiisha/catalogue";
import { resolveProduct, resolveProducts } from "@/lib/catalogue";
import { fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/:slug
 * Returns the product with its reviews and recommendations, so a product page
 * needs one request rather than three.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const product = await resolveProduct(slug);

  if (!product) return fail(404, `No saree with the code or slug "${slug}".`);

  return ok(
    {
      product,
      reviews: reviewsForProduct(product.id),
      related: relatedIn(await resolveProducts(), product, 4),
    },
  );
}
