import { adminConfigured, adminKeyOk, buildProduct } from "@/lib/admin";
import { resolveProducts, type StoredProduct } from "@/lib/catalogue";
import { fail, ok, readJson } from "@/lib/http";
import { insert, readAll } from "@/lib/store";

/**
 * GET  /api/admin/products   list the live catalogue (seed + admin edits)
 * POST /api/admin/products   create a product
 *
 * Auth: X-Admin-Key. See lib/admin.ts for what this is and is not.
 */

export const dynamic = "force-dynamic";

const guard = (req: Request) => {
  if (!adminConfigured()) {
    return fail(
      503,
      "Admin is disabled because ADMIN_KEY is not set. Add it to apps/api/.env.local and restart.",
    );
  }
  if (!adminKeyOk(req)) return fail(401, "Wrong or missing admin key.");
  return null;
};

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;

  const products = await resolveProducts();
  const overrides = await readAll<StoredProduct>("products");
  const overridden = new Set(overrides.filter((r) => !r.payload.deleted).map((r) => r.id));

  return ok(
    products.map((p) => ({ ...p, _edited: overridden.has(p.id) })),
    {
      total: products.length,
      edited: overridden.size,
      note: "Changes are live on this API at once. Rebuild the storefront to publish them.",
    },
  );
}

export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;

  const draft = await readJson<Record<string, unknown>>(req);
  if (!draft) return fail(400, "Expected a JSON body.");

  const { product, errors } = buildProduct(draft);
  if (!product) return fail(422, "Some fields need fixing.", errors);

  // Slugs are URLs; two products cannot share one.
  const existing = await resolveProducts();
  if (existing.some((p) => p.slug === product.slug)) {
    return fail(409, `A saree already uses the web address "${product.slug}".`, {
      slug: "Choose a different name, or set the URL by hand.",
    });
  }

  await insert<StoredProduct>("products", { product, deleted: false }, product.id);

  return ok(product, { created: true }, { status: 201 });
}
