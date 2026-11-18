import type { Money, Product, ProductImage, ProductVariant } from "./types.ts";
import { colourBySlug } from "./taxonomy.ts";

const inr = (rupees: number): Money => ({ paise: Math.round(rupees * 100), currency: "INR" });

/**
 * Placeholder art is generated into /img/products by `npm run placeholders`.
 * Replace a file in place with a real photograph of the same name and the site
 * picks it up with no code change — keep real shots at 3:4 (1200x1600).
 */
const img = (
  slug: string,
  colour: string,
  kind: ProductImage["kind"],
  alt: string,
): ProductImage => ({
  src: `/img/products/${slug}-${colour}-${kind}.jpg`,
  alt,
  width: 1200,
  height: 1600,
  kind,
});

interface VariantSeed {
  colour: string;
  secondary?: string;
  price: number;
  mrp: number;
  stock: number | null;
  availability?: ProductVariant["availability"];
  leadTimeDays?: number;
}

const variants = (slug: string, name: string, seeds: VariantSeed[]): ProductVariant[] =>
  seeds.map((s, i) => {
    const colour = colourBySlug(s.colour);
    return {
      id: `${slug}-${s.colour}`,
      sku: `JAI-${slug.slice(0, 3).toUpperCase()}-${s.colour.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
      colour,
      secondaryColour: s.secondary ? colourBySlug(s.secondary) : undefined,
      price: inr(s.price),
      mrp: inr(s.mrp),
      availability:
        s.availability ??
        (s.stock === null ? "made_to_order" : s.stock > 0 ? "in_stock" : "sold_out"),
      stock: s.stock,
      leadTimeDays: s.leadTimeDays,
      images: [
        img(slug, s.colour, "model", `${name} in ${colour.name}, draped`),
        img(slug, s.colour, "flatlay", `${name} in ${colour.name}, full saree laid flat`),
        img(slug, s.colour, "pallu", `Pallu and zari border of the ${name} in ${colour.name}`),
        img(slug, s.colour, "detail", `Close detail of the weave on the ${name} in ${colour.name}`),
      ],
    };
  });

export const PRODUCTS: Product[] = [
  {
    id: "p-001",
    slug: "kadwa-buta-bridal-katan",
    name: "Kadwa Buta Bridal Katan Silk Saree",
    tagline: "The saree a bride keeps for her daughter.",
    story:
      "Kadwa is the slowest way to weave a Banarasi: every buta is worked as a separate motif, so no float thread is cut away at the back. One saree occupies a loom for close to three weeks. We make this one in the colours a bride is traditionally married in, deep maroon and rani red, with pure silver zari that has been gold-plated rather than coated.",
    collections: ["wedding-collection", "bestsellers", "heirloom"],
    occasions: ["wedding-bridal", "traditional-functions"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "pure-zari",
    craft: "Kadwa buta with a kadhuwa pallu",
    origin: "Madanpura, Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 920,
    care: [
      "Dry clean only",
      "Store folded in muslin, refold every 3 months",
      "Keep away from direct sunlight and perfume",
    ],
    rating: { value: 4.9, count: 86 },
    badges: ["bestseller", "handloom", "bridal"],
    variants: variants("kadwa-buta-bridal-katan", "Kadwa Buta Bridal Katan Silk Saree", [
      { colour: "maroon", secondary: "gold", price: 28500, mrp: 34000, stock: 3 },
      { colour: "red", secondary: "gold", price: 28500, mrp: 34000, stock: 2 },
      { colour: "purple", secondary: "gold", price: 29900, mrp: 35500, stock: null, leadTimeDays: 21 },
    ]),
    // Demonstrates the PDP video slot. Replace with a clip of this exact saree.
    video: { src: "/media/jaiisha-hero.mp4", aspect: "16x9" },
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Kadwa Buta Bridal Katan Silk Banarasi Saree | JAIISHA",
      description:
        "Handloom kadwa Banarasi bridal saree in pure Katan silk with gold-plated silver zari. Woven in Madanpura, Varanasi. Blouse piece included.",
    },
    createdAt: "2026-09-02",
  },
  {
    id: "p-002",
    slug: "jangla-jaal-katan",
    name: "Jangla Jaal Katan Silk Saree",
    tagline: "A garden, net over net, across six metres.",
    story:
      "Jangla means jungle: a continuous creeper jaal that covers the whole field instead of sitting in neat rows. It is the oldest Banarasi pattern still woven, and the hardest to keep even, because the weaver cannot hide a mistake in open ground.",
    collections: ["banarasi-silk", "festive-collection", "heirloom"],
    occasions: ["wedding-bridal", "festive"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "meenakari",
    craft: "Jangla jaal with meenakari accents",
    origin: "Lallapura, Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 870,
    care: ["Dry clean only", "Air in shade before storing", "Do not hang on metal hangers"],
    rating: { value: 4.8, count: 54 },
    badges: ["handloom", "bestseller"],
    variants: variants("jangla-jaal-katan", "Jangla Jaal Katan Silk Saree", [
      { colour: "purple", secondary: "gold", price: 24500, mrp: 29000, stock: 4 },
      { colour: "green", secondary: "gold", price: 24500, mrp: 29000, stock: 2 },
      { colour: "blue", secondary: "gold", price: 25900, mrp: 30500, stock: 1 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Jangla Jaal Pure Katan Silk Banarasi Saree with Meenakari | JAIISHA",
      description:
        "Handwoven jangla jaal Banarasi saree in pure Katan silk with meenakari resham detailing. Festive and bridal.",
    },
    createdAt: "2026-09-20",
  },
  {
    id: "p-003",
    slug: "mughlai-jaal-katan",
    name: "Mughlai Jaal Katan Silk Saree",
    tagline: "Court motifs, softened by six hundred years.",
    story:
      "The Mughal karkhanas brought Persian arabesque to Varanasi looms in the sixteenth century, and the vocabulary never left: the shikargah, the ashrafi buti, the serpentine jaal on this saree. Worn at a wedding reception, it reads as heritage rather than costume.",
    collections: ["banarasi-silk", "wedding-collection"],
    occasions: ["wedding-bridal", "party-celebration"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "pure-zari",
    craft: "Mughlai jaal, kadhuwa border",
    origin: "Madanpura, Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 950,
    care: ["Dry clean only", "Refold along a different line each season"],
    rating: { value: 4.7, count: 41 },
    badges: ["handloom", "limited"],
    variants: variants("mughlai-jaal-katan", "Mughlai Jaal Katan Silk Saree", [
      { colour: "maroon", secondary: "gold", price: 26500, mrp: 31000, stock: 2 },
      { colour: "blue", secondary: "gold", price: 26500, mrp: 31000, stock: 3 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Mughlai Jaal Katan Silk Banarasi Saree | JAIISHA",
      description:
        "Pure Katan silk Banarasi saree with Mughlai jaal and pure zari kadhuwa border. Limited handloom piece.",
    },
    createdAt: "2026-10-04",
  },
  {
    id: "p-004",
    slug: "diwali-tissue-silk",
    name: "Diwali Tissue Silk Saree",
    tagline: "Woven to catch diya light.",
    story:
      "Tissue silk carries zari in the ground weave itself, not only in the motif, so the entire saree lifts in low light. We weave this one for Diwali evenings and Lakshmi pooja, when a room is lit by lamps rather than bulbs.",
    collections: ["festive-collection", "bestsellers"],
    occasions: ["festive", "traditional-functions", "gifting"],
    fabric: "tissue-silk",
    weave: "semi-handloom",
    zari: "tested-zari",
    craft: "Tissue ground with kadwa buti",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 560,
    care: ["Dry clean recommended", "Iron on low heat through a cotton cloth"],
    rating: { value: 4.8, count: 112 },
    badges: ["bestseller", "new-arrival"],
    variants: variants("diwali-tissue-silk", "Diwali Tissue Silk Saree", [
      { colour: "gold", secondary: "maroon", price: 9800, mrp: 12500, stock: 9 },
      { colour: "ivory", secondary: "gold", price: 9800, mrp: 12500, stock: 7 },
      { colour: "pink", secondary: "gold", price: 10400, mrp: 13000, stock: 5 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Diwali Tissue Silk Banarasi Saree | JAIISHA",
      description:
        "Festive tissue silk saree with zari ground weave and kadwa buti. Light to drape, made for Diwali and pooja.",
    },
    createdAt: "2026-10-12",
  },
  {
    id: "p-005",
    slug: "karwa-chauth-rani-katan",
    name: "Karwa Chauth Rani Katan Saree",
    tagline: "Rani pink, the colour of a kept fast.",
    story:
      "Karwa Chauth asks for red, rani or maroon, never white or black. This Katan is cut with a broad gold border so it sits well with chooda and a nath, and the pallu is weighted enough to stay in place through the evening chhalni ritual.",
    collections: ["festive-collection", "bestsellers"],
    occasions: ["festive", "traditional-functions"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "tested-zari",
    craft: "Plain Katan field with kadhuwa border",
    origin: "Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 780,
    care: ["Dry clean only", "Store away from naphthalene"],
    rating: { value: 4.9, count: 137 },
    badges: ["bestseller", "handloom"],
    variants: variants("karwa-chauth-rani-katan", "Karwa Chauth Rani Katan Saree", [
      { colour: "pink", secondary: "gold", price: 14500, mrp: 18000, stock: 6 },
      { colour: "red", secondary: "gold", price: 14500, mrp: 18000, stock: 8 },
      { colour: "maroon", secondary: "gold", price: 14500, mrp: 18000, stock: 4 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Karwa Chauth Rani Pink Katan Silk Saree | JAIISHA",
      description:
        "Handloom Katan silk saree in rani pink with a broad gold kadhuwa border. Woven for Karwa Chauth and festive wear.",
    },
    createdAt: "2026-09-28",
  },
  {
    id: "p-006",
    slug: "emerald-kadwa-organza",
    name: "Emerald Kadwa Organza Saree",
    tagline: "Weightless, and still unmistakably Banarasi.",
    story:
      "Organza lets a Banarasi be worn for eight hours without strain. The buti here is still kadwa, woven in rather than embroidered on, so the saree keeps the brocade character while weighing a third of a Katan.",
    collections: ["new-arrivals", "party-collection"],
    occasions: ["party-celebration", "festive"],
    fabric: "organza",
    weave: "handloom",
    zari: "tested-zari",
    craft: "Kadwa buti on organza",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 380,
    care: ["Dry clean only", "Roll on a tube rather than folding, to avoid creases"],
    rating: { value: 4.6, count: 38 },
    badges: ["new-arrival", "handloom"],
    variants: variants("emerald-kadwa-organza", "Emerald Kadwa Organza Saree", [
      { colour: "green", secondary: "gold", price: 7400, mrp: 9500, stock: 11 },
      { colour: "ivory", secondary: "gold", price: 7400, mrp: 9500, stock: 6 },
      { colour: "blue", secondary: "gold", price: 7900, mrp: 9900, stock: 4 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Emerald Kadwa Organza Banarasi Saree | JAIISHA",
      description:
        "Handloom kadwa buti organza saree in emerald green. Light, sheer and easy to drape for parties and receptions.",
    },
    createdAt: "2026-10-26",
  },
  {
    id: "p-007",
    slug: "satin-tanchoi-silk",
    name: "Satin Tanchoi Silk Saree",
    tagline: "No zari at all, only silk on silk.",
    story:
      "Tanchoi uses two or three coloured silk wefts and no metallic thread, which gives a satin surface with the pattern sunk into it. It travels beautifully and reads rich without shine, which makes it the saree to wear when everyone else will be in zari.",
    collections: ["banarasi-silk", "new-arrivals"],
    occasions: ["party-celebration", "gifting", "traditional-functions"],
    fabric: "banarasi-silk",
    weave: "powerloom",
    zari: "resham",
    craft: "Tanchoi, multi-weft resham",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 640,
    care: ["Dry clean only", "Do not wring or spot-clean with water"],
    rating: { value: 4.5, count: 29 },
    badges: ["new-arrival"],
    variants: variants("satin-tanchoi-silk", "Satin Tanchoi Silk Saree", [
      { colour: "blue", secondary: "ivory", price: 6200, mrp: 7800, stock: 12 },
      { colour: "maroon", secondary: "gold", price: 6200, mrp: 7800, stock: 9 },
      { colour: "purple", secondary: "pink", price: 6200, mrp: 7800, stock: 7 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Satin Tanchoi Banarasi Silk Saree | JAIISHA",
      description:
        "Tanchoi Banarasi saree woven with coloured resham wefts and no zari. Satin finish, light weight, easy to carry.",
    },
    createdAt: "2026-11-01",
  },
  {
    id: "p-008",
    slug: "shikargah-wedding-katan",
    name: "Shikargah Wedding Katan Saree",
    tagline: "A hunting scene, read closely.",
    story:
      "Shikargah is the most narrative of Banarasi patterns: animals, birds and hunters moving through foliage. Weavers charge by the figure, because each one must be lifted separately on the loom. Reserved, usually, for a wedding in the family.",
    collections: ["wedding-collection", "heirloom"],
    occasions: ["wedding-bridal", "gifting"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "pure-zari",
    craft: "Shikargah, kadwa throughout",
    origin: "Madanpura, Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 1010,
    care: ["Dry clean only", "Keep in a cotton or muslin cover, never plastic"],
    rating: { value: 5, count: 23 },
    badges: ["handloom", "limited", "bridal"],
    variants: variants("shikargah-wedding-katan", "Shikargah Wedding Katan Saree", [
      { colour: "maroon", secondary: "green", price: 42000, mrp: 49000, stock: null, leadTimeDays: 28 },
      { colour: "green", secondary: "gold", price: 42000, mrp: 49000, stock: 1 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Shikargah Handloom Wedding Katan Silk Saree | JAIISHA",
      description:
        "Shikargah Banarasi wedding saree in pure Katan silk with gold-plated silver zari. Made to order, 28-day weave.",
    },
    createdAt: "2026-08-18",
  },
  {
    id: "p-009",
    slug: "half-and-half-georgette",
    name: "Half-and-Half Georgette Saree",
    tagline: "Two colours, one drape.",
    story:
      "The half-and-half is a Banarasi weaver answer to indecision: the body in one colour, the pallu and lower third in another, joined on the loom rather than stitched. On georgette it falls close to the body, which is why it is the most forgiving saree for a first-time wearer.",
    collections: ["new-arrivals", "party-collection", "bestsellers"],
    occasions: ["party-celebration", "festive", "gifting"],
    fabric: "georgette",
    weave: "powerloom",
    zari: "tested-zari",
    craft: "Half-and-half, woven join",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 480,
    care: ["Dry clean preferred", "Low-heat iron, no steam on zari"],
    rating: { value: 4.6, count: 74 },
    badges: ["bestseller", "new-arrival"],
    variants: variants("half-and-half-georgette", "Half-and-Half Georgette Saree", [
      { colour: "pink", secondary: "maroon", price: 4600, mrp: 5900, stock: 14 },
      { colour: "green", secondary: "gold", price: 4600, mrp: 5900, stock: 10 },
      { colour: "blue", secondary: "pink", price: 4600, mrp: 5900, stock: 8 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Half-and-Half Georgette Banarasi Saree with Blouse Piece | JAIISHA",
      description:
        "Two-tone half-and-half georgette Banarasi saree, woven join, blouse piece included. Under 5,000 rupees.",
    },
    createdAt: "2026-11-08",
  },
  {
    id: "p-010",
    slug: "ivory-pooja-katan",
    name: "Ivory Pooja Katan Saree",
    tagline: "The quiet, correct choice.",
    story:
      "For a griha pravesh, a satyanarayan pooja or a naming ceremony, silk is worn because it is considered shuddh, pure, with no synthetic thread in it. Ivory with a thin gold border is what elders in most families will recognise as right.",
    collections: ["traditional", "heirloom"],
    occasions: ["traditional-functions", "festive", "gifting"],
    fabric: "katan-silk",
    weave: "handloom",
    zari: "pure-zari",
    craft: "Plain Katan, fine zari border",
    origin: "Varanasi",
    sareeLengthMetres: 6.3,
    blousePieceMetres: 0.8,
    weightGrams: 720,
    care: ["Dry clean only", "Ivory silk yellows with light, so store it in the dark"],
    rating: { value: 4.8, count: 46 },
    badges: ["handloom"],
    variants: variants("ivory-pooja-katan", "Ivory Pooja Katan Saree", [
      { colour: "ivory", secondary: "gold", price: 16500, mrp: 20000, stock: 5 },
      { colour: "gold", secondary: "maroon", price: 16500, mrp: 20000, stock: 3 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Ivory Pure Katan Silk Pooja Saree with Gold Zari Border | JAIISHA",
      description:
        "Handloom ivory Katan silk saree with a fine pure-zari border. Traditional choice for poojas and griha pravesh.",
    },
    createdAt: "2026-09-10",
  },
  {
    id: "p-011",
    slug: "rani-tilfi-banarasi",
    name: "Rani Tilfi Banarasi Saree",
    tagline: "Three colours in a single motif.",
    story:
      "Tilfi carries three threads, two silk and one zari, through every buta, so a single motif changes colour as you turn it to the light. It is the technique that made Banaras famous, and it is still counted by hand.",
    collections: ["banarasi-silk", "festive-collection"],
    occasions: ["festive", "wedding-bridal", "party-celebration"],
    fabric: "banarasi-silk",
    weave: "semi-handloom",
    zari: "tested-zari",
    craft: "Tilfi, three-thread buta",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 690,
    care: ["Dry clean only", "Refold every few months to protect the fold lines"],
    rating: { value: 4.7, count: 63 },
    badges: ["bestseller"],
    variants: variants("rani-tilfi-banarasi", "Rani Tilfi Banarasi Saree", [
      { colour: "pink", secondary: "green", price: 11900, mrp: 14500, stock: 7 },
      { colour: "red", secondary: "blue", price: 11900, mrp: 14500, stock: 5 },
      { colour: "purple", secondary: "gold", price: 12500, mrp: 15200, stock: 2 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "Rani Pink Tilfi Banarasi Silk Saree | JAIISHA",
      description:
        "Tilfi Banarasi saree woven with three threads per motif. Rani pink with contrast resham and zari.",
    },
    createdAt: "2026-10-18",
  },
  {
    id: "p-012",
    slug: "first-banarasi-starter",
    name: "First Banarasi Silk Saree",
    tagline: "For the saree you will wear, not save.",
    story:
      "Most women own one Banarasi they are afraid to wear. This one is woven to be the opposite: lighter silk, a shorter 5.5-metre length that pleats easily, a border that does not need a matched petticoat, and a price that survives a function with children at it.",
    collections: ["new-arrivals", "bestsellers", "gifting"],
    occasions: ["festive", "gifting", "party-celebration"],
    fabric: "banarasi-silk",
    weave: "powerloom",
    zari: "tested-zari",
    craft: "Buti field with woven border",
    origin: "Varanasi",
    sareeLengthMetres: 5.5,
    blousePieceMetres: 0.8,
    weightGrams: 520,
    care: ["Dry clean preferred", "Hand-air after wearing, then fold"],
    rating: { value: 4.5, count: 158 },
    badges: ["bestseller"],
    variants: variants("first-banarasi-starter", "First Banarasi Silk Saree", [
      { colour: "maroon", secondary: "gold", price: 3400, mrp: 4500, stock: 22 },
      { colour: "green", secondary: "gold", price: 3400, mrp: 4500, stock: 18 },
      { colour: "blue", secondary: "gold", price: 3400, mrp: 4500, stock: 15 },
      { colour: "pink", secondary: "gold", price: 3400, mrp: 4500, stock: 20 },
    ]),
    tax: { hsn: "5007", gstRate: 5 },
    seo: {
      title: "First Banarasi Silk Saree Under 5,000 | JAIISHA",
      description:
        "A light, easy-to-drape Banarasi silk saree with blouse piece, made to be worn often.",
    },
    createdAt: "2026-11-11",
  },
];
