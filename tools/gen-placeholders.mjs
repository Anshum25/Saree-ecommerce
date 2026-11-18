/**
 * Generates woven-brocade placeholder art for every product variant image
 * referenced by the catalogue.
 *
 * These are deliberately abstract: zari motifs, borders and pallu bands in the
 * actual product colour, rather than grey "image missing" boxes. The site
 * therefore looks finished while you shoot the real catalogue.
 *
 * REPLACING WITH REAL PHOTOGRAPHS
 *   Each file is named <product-slug>-<colour-slug>-<kind>.svg.
 *   Drop in a real photo with the same base name and a .jpg/.webp extension,
 *   then update the `img()` helper in packages/catalogue/src/products.ts to
 *   use that extension. Shoot at 3:4 (1200x1600 or larger).
 *
 * Run: npm run placeholders
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../apps/storefront/public/img/products");

// Kept in sync with packages/catalogue/src/taxonomy.ts COLOURS.
const COLOURS = {
  maroon: { hex: "#651D35", shade: "#3F1020" },
  red: { hex: "#A52C50", shade: "#6E1731" },
  green: { hex: "#27483C", shade: "#152A22" },
  pink: { hex: "#C2466F", shade: "#8A2A4C" },
  blue: { hex: "#243C6B", shade: "#132144" },
  purple: { hex: "#42263D", shade: "#271427" },
  gold: { hex: "#B58A43", shade: "#8A6626" },
  ivory: { hex: "#E8DAC4", shade: "#C4AE8E" },
};

const ZARI = "#D9B872";
const ZARI_BRIGHT = "#F0DCAE";

const W = 1200;
const H = 1600;

/** A buta — the single teardrop motif that defines Banarasi brocade. */
const buta = (id, fill, opacity) => `
  <g id="${id}" opacity="${opacity}">
    <path d="M30 4 C44 14 50 30 44 44 C39 56 30 60 30 60 C30 60 21 56 16 44 C10 30 16 14 30 4 Z"
          fill="none" stroke="${fill}" stroke-width="2.2"/>
    <path d="M30 16 C37 22 40 32 36 41 C33 48 30 50 30 50 C30 50 27 48 24 41 C20 32 23 22 30 16 Z"
          fill="${fill}" opacity="0.55"/>
    <circle cx="30" cy="33" r="3" fill="${ZARI_BRIGHT}"/>
  </g>`;

/** The jaal — a lattice of fine zari lines under the butas. */
const jaal = (fill) => `
  <path d="M0 40 L40 0 M-40 40 L40 -40 M0 80 L80 0 M40 80 L80 40" stroke="${fill}"
        stroke-width="0.8" opacity="0.35" fill="none"/>`;

const defs = (c) => `
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${c.hex}"/>
      <stop offset="55%" stop-color="${c.shade}"/>
      <stop offset="100%" stop-color="${c.hex}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="42%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="zariBand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ZARI}"/>
      <stop offset="30%" stop-color="${ZARI_BRIGHT}"/>
      <stop offset="60%" stop-color="${ZARI}"/>
      <stop offset="100%" stop-color="${ZARI_BRIGHT}"/>
    </linearGradient>
    <pattern id="brocade" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#ground)"/>
      ${jaal(ZARI)}
      <use href="#buta-a" x="18" y="14"/>
      <use href="#buta-a" x="78" y="74" transform="rotate(180 108 104)"/>
      <circle cx="100" cy="24" r="2.4" fill="${ZARI}" opacity="0.7"/>
      <circle cx="22" cy="96" r="2.4" fill="${ZARI}" opacity="0.7"/>
    </pattern>
    <pattern id="brocadeFine" width="64" height="64" patternUnits="userSpaceOnUse">
      <rect width="64" height="64" fill="url(#ground)"/>
      <circle cx="16" cy="16" r="3.2" fill="none" stroke="${ZARI}" stroke-width="1.4" opacity="0.8"/>
      <circle cx="48" cy="48" r="3.2" fill="none" stroke="${ZARI}" stroke-width="1.4" opacity="0.8"/>
      <path d="M44 12 l4 4 l-4 4 l-4 -4 Z" fill="${ZARI}" opacity="0.6"/>
      <path d="M12 44 l4 4 l-4 4 l-4 -4 Z" fill="${ZARI}" opacity="0.6"/>
    </pattern>
    ${buta("buta-a", ZARI, "0.9")}
  </defs>`;

/** Gold border band with a repeating paisley edge, as on a saree's selvedge. */
const border = (y, h) => `
  <rect x="0" y="${y}" width="${W}" height="${h}" fill="url(#zariBand)" opacity="0.92"/>
  <rect x="0" y="${y}" width="${W}" height="2" fill="#ffffff" opacity="0.35"/>
  <rect x="0" y="${y + h - 2}" width="${W}" height="2" fill="#000000" opacity="0.18"/>
  <g opacity="0.5">
    ${Array.from({ length: Math.ceil(W / 60) }, (_, i) =>
      `<path d="M${i * 60 + 14} ${y + h - 8} q16 -${h - 16} 32 0" fill="none" stroke="#6B4C16" stroke-width="1.6"/>`,
    ).join("")}
  </g>`;

const frame = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${inner}</svg>`;

const views = {
  /** Draped on the body: vertical pleats, pallu falling over the shoulder. */
  model: (c) => frame(`
    ${defs(c)}
    <rect width="${W}" height="${H}" fill="#2A1B20"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#ground)" opacity="0.25"/>
    <g>
      <path d="M300 0 h620 v${H} h-620 Z" fill="url(#brocade)"/>
      <g opacity="0.5">
        ${Array.from({ length: 11 }, (_, i) => {
          const x = 320 + i * 56;
          return `<path d="M${x} 0 q18 ${H / 2} 0 ${H}" stroke="#000000" stroke-width="${i % 2 ? 10 : 5}" opacity="0.22" fill="none"/>
                  <path d="M${x + 16} 0 q18 ${H / 2} 0 ${H}" stroke="#ffffff" stroke-width="3" opacity="0.10" fill="none"/>`;
        }).join("")}
      </g>
      <path d="M300 0 h620 v${H} h-620 Z" fill="url(#sheen)"/>
      <path d="M840 0 q180 420 60 ${H} l-180 0 q120 -620 20 -${H} Z" fill="url(#brocadeFine)" opacity="0.95"/>
      <path d="M840 0 q180 420 60 ${H} l-180 0 q120 -620 20 -${H} Z" fill="url(#sheen)"/>
      <path d="M296 0 v${H} M922 0 v${H}" stroke="url(#zariBand)" stroke-width="22" opacity="0.9"/>
    </g>
    ${border(H - 150, 120)}
  `),

  /** The whole saree laid flat: field, border, pallu at the foot. */
  flatlay: (c) => frame(`
    ${defs(c)}
    <rect width="${W}" height="${H}" fill="url(#brocade)"/>
    <rect width="${W}" height="${H}" fill="url(#sheen)"/>
    ${border(0, 70)}
    ${border(H - 420, 56)}
    <rect x="0" y="${H - 364}" width="${W}" height="364" fill="url(#brocadeFine)"/>
    <g opacity="0.95">
      ${Array.from({ length: 5 }, (_, i) =>
        `<use href="#buta-a" x="${110 + i * 220}" y="${H - 300}" transform="scale(2.1) translate(-${(110 + i * 220) * 0.52}, -${(H - 300) * 0.52})"/>`,
      ).join("")}
    </g>
    ${border(H - 84, 84)}
  `),

  /** Pallu: the decorated end, shot close. */
  pallu: (c) => frame(`
    ${defs(c)}
    <rect width="${W}" height="${H}" fill="url(#brocadeFine)"/>
    ${border(120, 92)}
    <g>
      ${Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) =>
          `<use href="#buta-a" x="0" y="0" transform="translate(${150 + col * 330} ${330 + row * 360}) scale(3.4)"/>`,
        ).join(""),
      ).join("")}
    </g>
    ${border(H - 212, 92)}
    <rect width="${W}" height="${H}" fill="url(#sheen)"/>
  `),

  /** Detail: weave structure, warp and weft visible. */
  detail: (c) => frame(`
    ${defs(c)}
    <rect width="${W}" height="${H}" fill="url(#ground)"/>
    <g opacity="0.5">
      ${Array.from({ length: Math.ceil(H / 7) }, (_, i) =>
        `<rect x="0" y="${i * 7}" width="${W}" height="3" fill="#000000" opacity="0.14"/>`,
      ).join("")}
      ${Array.from({ length: Math.ceil(W / 7) }, (_, i) =>
        `<rect x="${i * 7}" y="0" width="3" height="${H}" fill="#ffffff" opacity="0.06"/>`,
      ).join("")}
    </g>
    <use href="#buta-a" transform="translate(300 420) scale(10)"/>
    <rect width="${W}" height="${H}" fill="url(#sheen)"/>
  `),

  blouse: (c) => frame(`
    ${defs(c)}
    <rect width="${W}" height="${H}" fill="url(#brocade)"/>
    ${border(H - 120, 100)}
    <rect width="${W}" height="${H}" fill="url(#sheen)"/>
  `),
};

/* -------------------------------------------------------------------------- */

// Read the catalogue's image list without needing a TS toolchain: the slugs and
// colours are stable, so we derive filenames from the same shape products.ts uses.
const { PRODUCT_IMAGE_KEYS } = await import("./image-keys.mjs");

mkdirSync(outDir, { recursive: true });

let written = 0;
for (const { slug, colour, kind } of PRODUCT_IMAGE_KEYS) {
  const c = COLOURS[colour];
  if (!c) {
    console.warn(`! unknown colour "${colour}" for ${slug} — skipped`);
    continue;
  }
  const render = views[kind] ?? views.flatlay;
  writeFileSync(resolve(outDir, `${slug}-${colour}-${kind}.svg`), render(c), "utf8");
  written++;
}

console.log(`Wrote ${written} placeholder images to ${outDir}`);
