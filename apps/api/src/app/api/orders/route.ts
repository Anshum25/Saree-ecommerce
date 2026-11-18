import { notYet } from "@/lib/http";

/**
 * Phase 2 — orders, payment and GST invoicing.
 *
 * Planned contract:
 *
 *   POST /api/orders           { cartId, address, gstin? }
 *                              -> creates the order and returns a Razorpay
 *                                 order id for the checkout widget
 *   POST /api/orders/verify    { razorpayOrderId, paymentId, signature }
 *                              -> verifies the signature server-side, marks the
 *                                 order paid, decrements stock
 *   GET  /api/orders/:id       -> status, tracking number, invoice URL
 *
 * The catalogue already carries everything an invoice needs: the SKU, the price
 * in paise, HSN 5007 and the GST rate per product, and stock sits on the
 * variant. Phase 2 is therefore persistence, payment verification and a PDF —
 * not a remodelling of the catalogue.
 *
 * Two rules worth writing down before any of it is built:
 *   - Never trust a payment result reported by the browser. Verify the
 *     signature here with the key secret before marking anything paid.
 *   - Decrement stock inside the same transaction that records the payment, or
 *     two buyers will be sold the same handloom saree, of which there is one.
 */
const PLAN =
  "Razorpay checkout, server-side signature verification, stock decrement and GST invoices are Phase 2. Orders are taken on WhatsApp today.";

export async function GET() {
  return notYet("Order tracking", PLAN);
}

export async function POST() {
  return notYet("Order placement", PLAN);
}
