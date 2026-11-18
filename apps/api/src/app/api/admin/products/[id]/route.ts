import { adminConfigured, adminKeyOk, buildProduct } from "@/lib/admin";
import { isSeedProduct, resolveProduct, resolveProducts, type StoredProduct } from "@/lib/catalogue";
import { fail, ok, readJson } from "@/lib/http";
import { find, remove, upsert } from "@/lib/store";

/**
 * GET    /api/admin/products/:id   read one
 * PATCH  /api/admin/products/:id   update (full form payload, merged)
 * DELETE /api/admin/products/:id   remove
 *
 * Deleting a SEED product writes a tombstone rather than erasing anything, so
 * the seed file stays the baseline and the deletion can be undone by removing
 * one row from .data/products.json. Deleting an admin-CREATED product drops
 * its row outright — there is no baseline to fall back to.
 */

export const dynamic = "force-dynamic";

const guard = (req: Request) => {
  if (!adminConfigured()) {
    return fail(503, "Admin is disabled because ADMIN_KEY is not set.");
  }
  if (!adminKeyOk(req)) return fail(401, "Wrong or missing admin key.");
  return null;
};

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const product = await resolveProduct(id);
  if (!product) return fail(404, `No product with the id "${id}".`);

  return ok(product);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const current = await resolveProduct(id);
  if (!current) return fail(404, `No product with the id "${id}".`);

  const draft = await readJson<Record<string, unknown>>(req);
  if (!draft) return fail(400, "Expected a JSON body.");

  const { product, errors } = buildProduct(draft, current);
  if (!product) return fail(422, "Some fields need fixing.", errors);

  // Another product must not already hold the new slug.
  const clash = (await resolveProducts()).find((p) => p.slug === product.slug && p.id !== id);
  if (clash) {
    return fail(409, `"${product.slug}" is already used by ${clash.name}.`, {
      slug: "Choose a different web address.",
    });
  }

  await upsert<StoredProduct>("products", id, { product, deleted: false });
  return ok(product, { updated: true });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const current = await resolveProduct(id);
  if (!current) return fail(404, `No product with the id "${id}".`);

  if (isSeedProduct(id)) {
    // Tombstone: hides the seed product without touching the seed file.
    await upsert<StoredProduct>("products", id, { product: current, deleted: true });
    return ok(
      { id, removed: true, reversible: true },
      { note: "Seed product hidden. Delete its row in .data/products.json to restore it." },
    );
  }

  const existed = await find<StoredProduct>("products", id);
  if (existed) await remove("products", id);

  return ok({ id, removed: true, reversible: false });
}
