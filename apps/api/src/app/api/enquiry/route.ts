import { getProduct } from "@jaiisha/catalogue";
import { fail, isEmail, isPhone, ok, readJson, str } from "@/lib/http";
import { append, clientKey, rateLimited } from "@/lib/store";

/**
 * POST /api/enquiry
 *
 * The Phase 1 order channel in writing. A customer can reach us three ways —
 * WhatsApp, this form, or the phone — and this endpoint makes sure the written
 * ones are recorded rather than lost in an inbox.
 *
 * Body: { name, phone, email?, occasion?, budget?, message, productSlug?, sku?, source? }
 */

interface Body {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  occasion?: unknown;
  budget?: unknown;
  message?: unknown;
  productSlug?: unknown;
  sku?: unknown;
  source?: unknown;
  /** Honeypot: a real person never fills this. */
  website?: unknown;
}

export async function POST(req: Request) {
  if (rateLimited(`enquiry:${clientKey(req)}`, 5, 60_000)) {
    return fail(429, "Too many enquiries from this connection. Please try again in a minute.");
  }

  const body = await readJson<Body>(req);
  if (!body) return fail(400, "Expected a JSON body.");

  // Silently accept and discard bot submissions, so the bot does not learn.
  if (str(body.website)) return ok({ received: true });

  const name = str(body.name, 120);
  const phone = str(body.phone, 30);
  const email = str(body.email, 160);
  const message = str(body.message, 2000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please give a name we can address you by.";
  if (!isPhone(phone)) errors.phone = "Please give a phone number with 8 to 15 digits.";
  if (email && !isEmail(email)) errors.email = "That email address does not look right.";
  if (message.length < 5) errors.message = "Please say a little about what you are looking for.";

  if (Object.keys(errors).length) return fail(422, "Some details need fixing.", errors);

  const productSlug = str(body.productSlug, 120);
  const product = productSlug ? getProduct(productSlug) : undefined;

  const row = await append("enquiries", {
    name,
    phone,
    email: email || null,
    occasion: str(body.occasion, 60) || null,
    budget: str(body.budget, 60) || null,
    message,
    sku: str(body.sku, 40) || null,
    product: product ? { id: product.id, slug: product.slug, name: product.name } : null,
    source: str(body.source, 60) || "website",
    status: "new",
  });

  /**
   * Phase 2: also notify the shop here — a WhatsApp Business API template
   * message, or email via Resend — so nobody has to watch a file. Deliberately
   * left out of Phase 1 rather than half-wired.
   */

  return ok(
    { id: row.id, received: true },
    { reply: "We reply on WhatsApp within a few hours, 10am to 8pm IST." },
    { status: 201 },
  );
}

export async function GET() {
  // Reading enquiries is an admin action; it needs auth before it exists.
  return fail(405, "Enquiries are written here, not read. The admin view arrives with Phase 2.");
}
