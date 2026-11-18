import type { Colour, FabricSlug, OccasionSlug, PriceBand } from "./types.ts";

/** The brand palette, drawn from premium Banarasi silk. */
export const BRAND = {
  wineBurgundy: "#651D35",
  royalMaroon: "#A52C50",
  antiqueGold: "#B58A43",
  silkIvory: "#F4EBDD",
  emeraldGreen: "#27483C",
  royalPlum: "#42263D",
} as const;

export const COLOURS: Colour[] = [
  { slug: "maroon", name: "Maroon", hex: "#651D35", shadeHex: "#3F1020" },
  { slug: "red", name: "Rani Red", hex: "#A52C50", shadeHex: "#6E1731" },
  { slug: "green", name: "Emerald", hex: "#27483C", shadeHex: "#152A22" },
  { slug: "pink", name: "Rani Pink", hex: "#C2466F", shadeHex: "#8A2A4C" },
  { slug: "blue", name: "Royal Blue", hex: "#243C6B", shadeHex: "#132144" },
  { slug: "purple", name: "Royal Plum", hex: "#42263D", shadeHex: "#271427" },
  { slug: "gold", name: "Antique Gold", hex: "#B58A43", shadeHex: "#8A6626" },
  { slug: "ivory", name: "Silk Ivory", hex: "#E8DAC4", shadeHex: "#C4AE8E" },
];

export const colourBySlug = (slug: string): Colour =>
  COLOURS.find((c) => c.slug === slug) ?? COLOURS[0];

export interface OccasionMeta {
  slug: OccasionSlug;
  name: string;
  /** Shown on the "Shop by Occasion" card. */
  blurb: string;
  /** The cultural note — what the saree *means* at this occasion. */
  tradition: string;
  accent: string;
  /** Editorial photograph for the occasion card. Unsplash Licence. */
  image: string;
  imageAlt: string;
}

export const OCCASIONS: OccasionMeta[] = [
  {
    slug: "wedding-bridal",
    name: "Wedding & Bridal",
    blurb: "Kadwa bridal Banarasis in maroon, rani and deep red.",
    tradition:
      "A bride's Banarasi is woven to outlive the wedding — kept, folded in muslin, and passed to a daughter. Red and maroon carry saubhagya, the wish for a long and prosperous married life.",
    accent: BRAND.wineBurgundy,
    image: "/img/culture/bride-royal.jpg",
    imageAlt: "A royal bride adorned in auspicious vermilion and pure gold zari Banarasi Katan silk",
  },
  {
    slug: "festive",
    name: "Festivals",
    blurb: "Diwali, Karwa Chauth, Navratri and Teej.",
    tradition:
      "On festival mornings the heaviest silk comes out of the almirah. Gold zari catches diya light the way no printed fabric can — which is why the Banarasi has belonged to Indian festivals for six centuries.",
    accent: BRAND.antiqueGold,
    image: "/img/culture/diwali-diyas.jpg",
    imageAlt: "A woman in a red and green silk saree with a gold zari border, dressed for a festival",
  },
  {
    slug: "party-celebration",
    name: "Party & Celebration",
    blurb: "Lighter organza and georgette, easy to drape all evening.",
    tradition:
      "Receptions, sangeets and anniversaries ask for shine without weight. Organza and silk-georgette fall softly, pleat quickly, and photograph beautifully under warm light.",
    accent: BRAND.royalPlum,
    image: "/img/culture/tradition-festival.jpg",
    imageAlt: "Women adorned in elegant festive silk sarees celebrating Indian cultural heritage",
  },
  {
    slug: "traditional-functions",
    name: "Traditional Functions",
    blurb: "Griha pravesh, poojas, naming ceremonies and family rituals.",
    tradition:
      "For a pooja or a griha pravesh, silk is worn because it is considered shuddh — pure, untouched by synthetic thread. An ivory-and-gold Katan is the quiet, correct choice.",
    accent: BRAND.emeraldGreen,
    image: "/img/culture/pooja-lamps.jpg",
    imageAlt: "Sacred brass oil lamps lit with flower petals for a traditional pooja ritual",
  },
  {
    slug: "gifting",
    name: "Gifting",
    blurb: "Presented in a JAIISHA box, with the weaver's note enclosed.",
    tradition:
      "A saree given at a wedding, a vidaai or a first Diwali in a new home is a blessing you can hold. We pack each one so it can be handed over exactly as it left the loom.",
    accent: BRAND.royalMaroon,
    image: "/img/culture/loom-detail.jpg",
    imageAlt: "Master loom brocade detail with golden zari and authentic weaver card",
  },
];

export const occasionBySlug = (slug: string): OccasionMeta | undefined =>
  OCCASIONS.find((o) => o.slug === slug);

export interface FabricMeta {
  slug: FabricSlug;
  name: string;
  note: string;
}

export const FABRICS: FabricMeta[] = [
  { slug: "banarasi-silk", name: "Banarasi Silk", note: "The classic Varanasi brocade — dense zari, regal fall." },
  { slug: "katan-silk", name: "Katan Silk", note: "Pure twisted-filament silk. Crisp, lustrous, heirloom-grade." },
  { slug: "organza", name: "Organza", note: "Sheer and feather-light with a faint crunch. Made for evenings." },
  { slug: "georgette", name: "Georgette", note: "Fluid and forgiving. Drapes close, travels well." },
  { slug: "tissue-silk", name: "Tissue Silk", note: "Zari woven into the ground, so the whole saree shimmers." },
];

export const fabricBySlug = (slug: string): FabricMeta | undefined =>
  FABRICS.find((f) => f.slug === slug);

export const PRICE_BANDS: PriceBand[] = [
  { slug: "under-5000", label: "Below ₹5,000", minPaise: 0, maxPaise: 500000 },
  { slug: "5000-10000", label: "₹5,000 – ₹10,000", minPaise: 500000, maxPaise: 1000000 },
  { slug: "10000-20000", label: "₹10,000 – ₹20,000", minPaise: 1000000, maxPaise: 2000000 },
  { slug: "above-20000", label: "Above ₹20,000", minPaise: 2000000, maxPaise: null },
];

export const priceBandBySlug = (slug: string): PriceBand | undefined =>
  PRICE_BANDS.find((b) => b.slug === slug);

export const WEAVES = [
  { slug: "handloom", name: "Handloom" },
  { slug: "semi-handloom", name: "Semi-handloom" },
  { slug: "powerloom", name: "Powerloom" },
] as const;

export const ZARI_LABELS: Record<string, string> = {
  "pure-zari": "Pure silver zari, gold-plated",
  "tested-zari": "Tested zari",
  resham: "Resham (pure silk thread)",
  meenakari: "Meenakari — coloured resham over zari",
};

export const SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "bestsellers", label: "Bestsellers" },
  { key: "top-rated", label: "Top Rated" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
] as const;
