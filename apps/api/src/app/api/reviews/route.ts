import { reviewsForProduct } from "@jaiisha/catalogue";
import { resolveProducts } from "@/lib/catalogue";
import { fail, ok, readJson, str } from "@/lib/http";
import { append, clientKey, list, rateLimited } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * GET  /api/reviews?product=<slug>   published reviews for a saree
 * POST /api/reviews                  submit one for moderation
 *
 * Submitted reviews are held unpublished — a shop that auto-publishes reviews
 * ends up hosting spam. In Phase 2, `verified` is set from the customer's order
 * history rather than claimed by the reviewer.
 */

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("product");

  const products = await resolveProducts();

  if (!slug) {
    const all = products.flatMap((p) => reviewsForProduct(p.id));
    return ok(all, { total: all.length });
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) return fail(404, `No saree with the slug "${slug}".`);

  const reviews = reviewsForProduct(product.id);
  return ok(reviews, { total: reviews.length, rating: product.rating });
}

interface ReviewBody {
  productSlug?: unknown;
  author?: unknown;
  city?: unknown;
  rating?: unknown;
  title?: unknown;
  body?: unknown;
  orderRef?: unknown;
}

export async function POST(req: Request) {
  if (rateLimited(`review:${clientKey(req)}`, 3, 300_000)) {
    return fail(429, "Too many submissions. Please try again later.");
  }

  const incoming = await readJson<ReviewBody>(req);
  if (!incoming) return fail(400, "Expected a JSON body.");

  const slug = str(incoming.productSlug, 120);
  const product = (await resolveProducts()).find((p) => p.slug === slug);
  const rating = Number(incoming.rating);
  const author = str(incoming.author, 80);
  const text = str(incoming.body, 2000);

  const errors: Record<string, string> = {};
  if (!product) errors.productSlug = "Tell us which saree this is about.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Rating must be a whole number from 1 to 5.";
  }
  if (author.length < 2) errors.author = "Please give a name to publish with the review.";
  if (text.length < 10) errors.body = "Please write a little more.";

  if (Object.keys(errors).length) return fail(422, "Some details need fixing.", errors);

  const row = await append("reviews", {
    productId: product!.id,
    productSlug: product!.slug,
    author,
    city: str(incoming.city, 80) || null,
    rating,
    title: str(incoming.title, 160) || null,
    body: text,
    orderRef: str(incoming.orderRef, 60) || null,
    verified: false,
    published: false,
  });

  const pending = (await list("reviews")).length;

  return ok(
    { id: row.id, published: false },
    { note: "Thank you. Reviews are read by a person before they appear.", pending },
    { status: 201 },
  );
}
