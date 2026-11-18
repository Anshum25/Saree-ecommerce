import { fail, isEmail, ok, readJson, str } from "@/lib/http";
import { append, clientKey, list, rateLimited } from "@/lib/store";

/**
 * POST /api/newsletter  { email }
 *
 * One letter a month. Stored locally in Phase 1; move to your email provider's
 * list API in Phase 2 and keep this endpoint as the single entry point so the
 * storefront never changes.
 */
export async function POST(req: Request) {
  if (rateLimited(`news:${clientKey(req)}`, 5, 60_000)) {
    return fail(429, "Too many attempts. Please try again shortly.");
  }

  const body = await readJson<{ email?: unknown }>(req);
  const email = str(body?.email, 160).toLowerCase();

  if (!isEmail(email)) return fail(422, "That email address does not look right.");

  // Subscribing twice should be a no-op, not an error the visitor sees.
  const existing = await list<{ email: string }>("newsletter");
  if (existing.some((r) => r.payload.email === email)) {
    return ok({ subscribed: true, alreadySubscribed: true });
  }

  await append("newsletter", { email, source: "website" });
  return ok({ subscribed: true }, undefined, { status: 201 });
}
