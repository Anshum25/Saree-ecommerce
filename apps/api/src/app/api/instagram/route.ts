import { PRODUCTS, defaultVariant } from "@jaiisha/catalogue";
import { CATALOGUE_CACHE, ok } from "@/lib/http";

/**
 * GET /api/instagram
 *
 * Placeholder feed, built from catalogue imagery so the homepage strip is never
 * empty before the account is connected.
 *
 * TO CONNECT THE REAL ACCOUNT:
 *   1. Create a Meta app, add the Instagram Graph API, and connect the JAIISHA
 *      professional account.
 *   2. Put the long-lived token in INSTAGRAM_ACCESS_TOKEN.
 *   3. Replace the body below with a fetch of
 *      https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,media_type
 *      and cache the result — the token is rate limited and the feed changes
 *      rarely. A nightly revalidate is plenty.
 *   4. Keep the response shape below, and the storefront needs no change.
 */
export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  const posts = PRODUCTS.slice(0, 6).map((p) => {
    const v = defaultVariant(p);
    const image = v.images.find((i) => i.kind === "detail") ?? v.images[0];
    return {
      id: p.id,
      caption: `${p.name} — ${p.tagline}`,
      mediaUrl: image.src,
      permalink: `/sarees/${p.slug}`,
      mediaType: "IMAGE" as const,
    };
  });

  return ok(
    posts,
    {
      source: token ? "placeholder (token present, fetch not wired yet)" : "placeholder",
      note: "See the comment in this route for how to connect the real feed.",
    },
    { headers: CATALOGUE_CACHE },
  );
}
