/**
 * Derives the list of product images to generate straight from
 * packages/catalogue/src/products.ts, so adding a saree or a colourway needs no
 * change here — just re-run `npm run placeholders`.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../packages/catalogue/src/products.ts"), "utf8");

/** Must match the `images:` array built by the `variants()` helper. */
const KINDS = ["model", "flatlay", "pallu", "detail"];

const keys = [];

// Each product declares: variants("<slug>", "<name>", [ { colour: "x", ... }, ... ])
const variantBlock = /variants\(\s*"([a-z0-9-]+)"\s*,\s*"[^"]*"\s*,\s*\[([\s\S]*?)\]\s*\)/g;

let match;
while ((match = variantBlock.exec(source)) !== null) {
  const [, slug, body] = match;
  const colours = [...body.matchAll(/colour:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const colour of colours) {
    for (const kind of KINDS) keys.push({ slug, colour, kind });
  }
}

if (keys.length === 0) {
  throw new Error(
    "No product variants parsed from products.ts — the variants() call shape changed. " +
      "Update the regex in tools/image-keys.mjs.",
  );
}

export const PRODUCT_IMAGE_KEYS = keys;
