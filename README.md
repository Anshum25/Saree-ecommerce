# JAIISHA

A premium festive Banarasi silk saree boutique. Astro storefront, Next.js commerce API, one shared catalogue package.

Built e-commerce-ready from day one: the data model, SKUs, stock, prices in paise and GST fields all exist now, even though Phase 1 takes orders on WhatsApp. Turning on checkout is a backend change, not a rebuild.

---

## Running it

```bash
npm install          # once, from the repo root
npm run dev          # storefront  → http://localhost:4321
npm run dev:api      # API         → http://localhost:3000
```

The storefront does **not** need the API running. It compiles the catalogue in at build time, so every page works standalone; the API is only used for enquiries, the newsletter and review submissions, and the forms fall back to WhatsApp when it is unreachable.

```bash
npm run build         # static storefront → apps/storefront/dist
npm run placeholders  # regenerate product art after adding a saree
```

---

## Why this shape

```
packages/catalogue/     the only source of truth: types, taxonomy, products, query logic
apps/storefront/        Astro 5 — every customer-facing page, fully static
apps/api/               Next.js 15 — route handlers for everything stateful
tools/                  placeholder art generator
```

Both runtimes import `@jaiisha/catalogue`. The storefront compiles it in for static pages and instant filtering; the API serves it over HTTP for anything that needs a server. Filter and sort semantics therefore **cannot drift** between the two — there is one `queryProducts()`, used by both.

A saree catalogue is mostly read-only, heavily photographed and needs to rank in search. Astro ships zero framework JavaScript by default, so product pages are HTML and images; the only JS is the ~6 KB that runs the gallery, filters and wishlist. Next.js handles the things a static site genuinely cannot: writes, secrets and, in Phase 2, payment verification.

---

## What is built (Phase 1)

**Storefront** — 32 prerendered pages

| Route | What it does |
|---|---|
| `/` | Photographic hero, the cultural case for the saree, tradition gallery, occasions, bestsellers, saree films, colour rail, craft, reviews, Instagram |
| `/sarees` | Full catalogue with five facets, sort, active-filter chips, URL-synced, mobile filter drawer |
| `/sarees/[slug]` | 12 product pages: gallery with magnifier and lightbox, colour swatches, video, full spec sheet, reviews, related |
| `/occasion/[slug]` | 5 prerendered landing pages with the tradition behind each occasion |
| `/craft` | How a Banarasi is woven, the weavers, how to spot a fake, care, draping |
| `/contact` | Enquiry form with validation and a WhatsApp fallback |
| `/wishlist`, `/bag` | Saved pieces and a written WhatsApp order with subtotal |
| `/policies/[slug]` | Shipping, returns, cancellations, privacy, terms, FAQ |
| `/account`, `/orders` | Honest Phase 2 placeholders, not broken screens |

**API** — `npm run dev:api`, index at `http://localhost:3000`

| Method | Endpoint | |
|---|---|---|
| GET | `/api/products` | filter, sort, paginate |
| GET | `/api/products/[slug]` | product + reviews + related in one call |
| GET | `/api/facets` | taxonomies with counts |
| GET/POST | `/api/reviews` | read published, submit for moderation |
| POST | `/api/enquiry` | the Phase 1 order channel, validated and recorded |
| POST | `/api/newsletter` | subscribe, idempotent |
| GET | `/api/instagram` | placeholder feed; route comment explains wiring the real one |
| GET/POST/PATCH/DELETE | `/api/cart` | server-side cart, cookie-identified, priced from the catalogue |
| GET/POST | `/api/admin/products` | list and create (needs `X-Admin-Key`) |
| GET/PATCH/DELETE | `/api/admin/products/[id]` | read, update, remove |
| — | `/api/orders` | **501 with the planned contract written out** |

**Admin panel** — `http://localhost:3000/admin`

Add/edit/delete sarees from one screen: price, MRP, stock or made-to-order lead time, colourways (each gets its own SKU), occasions, fabric, weave, zari, badges and SEO. Set `ADMIN_KEY` in `apps/api/.env.local` first — admin is disabled, not open, when the key is unset.

Edits are live on the API immediately. The storefront compiles the catalogue in at build time, so run `npm run build` to publish them to the shop. The panel says so on screen.

Phase 1 writes go to JSON files under `JAIISHA_DATA_DIR` — inspectable by a non-technical person, and no launch blocked on provisioning Postgres. Single instance only; move to a database before scaling out.

---

## Before you launch

These are the things only you can supply. Each one is a drop-in replacement, not a code change.

1. **The real logo.** `src/components/Logo.astro` draws a typographic wordmark. Drop the artwork at `public/img/jaiisha-logo.svg` and swap the `<svg>` for an `<img>` — the file says exactly where.
2. **Real photographs.** 136 placeholder SVGs stand in, named `<slug>-<colour>-<kind>.svg`. Shoot at 3:4 (1200×1600 or larger), four per colourway — `model`, `flatlay`, `pallu`, `detail` — and change the extension in the `img()` helper in `packages/catalogue/src/products.ts`.
3. **Real products, prices and stock.** `packages/catalogue/src/products.ts`. The 12 sarees there are realistic samples with correct weaving vocabulary, but the prices are invented.
4. **Contact details.** `apps/storefront/src/lib/site.ts` — the WhatsApp number is a placeholder `+91 90000 00000` and appears in several places via that file. Also update the hardcoded `WHATSAPP` constant in the inline scripts of `contact.astro`, `wishlist.astro` and `bag.astro` (client scripts cannot import server config).
5. **The domain.** Set it in `site.ts` and in `astro.config.mjs` (`site:`), which drives canonical URLs and structured data.
6. **A PNG share card.** `public/img/og-default.svg` is a placeholder; WhatsApp, Facebook and X will not render SVG. Export it as a 1200×630 PNG and point `image` in `Base.astro` at it.
7. **Policy review.** `src/lib/policies.ts` is written to be specific rather than boilerplate, but bracketed values (`[X]`, `[CITY]`, `[EMAIL]`) need filling and the whole set needs checking against your courier contract, GST registration and refund practice.
8. **The brand film.** It is no longer on the homepage: the film carries its own baked-in typography ("Silk that carries your traditions"), which collided with the site's own headline. It still lives at `public/media/jaiisha-hero.mp4` and plays on the product page that references it. If you want it back on the homepage, give it a full-width band of its own with nothing overlaid.
9. **Film.** `/media/films/*.mp4` are three vertical clips of silk sarees under the [Pexels Licence](https://www.pexels.com/license/) (free commercial use, no attribution required; creators credited on the page anyway). They are `preload="none"` behind poster frames, so the ~27 MB downloads only when a visitor presses play. Replace them with footage of your own stock and the section needs no code change.

   The craft film (`banarasi-weaving.mp4`) is real Banarasi weaving on a pit loom. The source was 1920x1080/60fps and 70 MB; it ships re-encoded to 1280x720/30fps, CRF 26, `+faststart`, at 13.5 MB. To redo it after swapping footage:
   `ffmpeg -i in.mp4 -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an out.mp4`
   `+faststart` matters: without it the browser downloads the whole file before the first frame appears.

10. **Cultural photography.** `/img/culture/*.jpg` are Unsplash stock under the [Unsplash Licence](https://unsplash.com/license) — free for commercial use, no attribution required — standing in for your own photography. They are used only for editorial sections (hero portrait, tradition gallery, occasion cards), never as product shots. Replace the files under the same names when you shoot your own.
11. **An admin key.** `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` into `ADMIN_KEY`. The current one in `.env.local` was generated for local development — do not ship it.

---

## Phase 2, and why it is cheap from here

What is already in place: SKU per colourway, `stock` and `leadTimeDays`, prices as integer paise (no float drift in invoices), `mrp` for the struck-through price, `tax: { hsn: "5007", gstRate }` per product, and `availability` states including `made_to_order`.

What remains: cart persistence, Razorpay, server-side payment verification, stock decrement in the same transaction as payment, invoice PDFs, accounts, coupons and a shipping integration. The contracts for cart and orders are written out in `apps/api/src/app/api/cart/route.ts` and `orders/route.ts`.

Two rules recorded there, worth repeating: never trust a payment result reported by the browser — verify the signature server-side; and decrement stock inside the payment transaction, or two buyers get sold the same handloom saree, of which there is exactly one.

When the catalogue passes roughly 300 products, change `/sarees` to `export const prerender = false` and call `GET /api/products` instead of filtering in the browser. The query shape is already identical, so that is a few lines.

---

## Design notes

Palette is the brief's: wine burgundy `#651D35`, royal maroon `#A52C50`, antique gold `#B58A43`, silk ivory `#F4EBDD`, emerald `#27483C`, royal plum `#42263D`. Ivory ground, burgundy identity, gold used sparingly as an accent — plus deliberately dark sections (hero, craftsmanship, footer) so the silk photography has somewhere to glow.

Type is Cinzel for display, Playfair Display for italic flourishes, Plus Jakarta Sans for UI, and Rozha One / Tiro Devanagari Hindi for the Devanagari accents in the heritage section. All tokens live at the top of `src/styles/global.css`; components carry their own scoped styles.

The homepage hero is photography, not video: an arch-framed bridal portrait, the arch echoing the Mughal arches of the Varanasi weaving houses, drawn with `border-radius` rather than an image mask so it costs nothing and degrades everywhere.

Accessibility and performance were not treated as an afterthought: the hero image is preloaded as the LCP element, every interactive control is a real button with an accessible name, reveal animations are disabled under reduced-motion, focus is visible throughout, and colour selection is driven by actual variant data so a customer can never pick a colourway that does not exist.
