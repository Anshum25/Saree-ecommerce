/**
 * Single place for everything the brand will want to change without touching
 * markup: contact details, nav, announcements, social links.
 */

export const SITE = {
  name: "JAIISHA",
  /** Shown under the wordmark. */
  descriptor: "Banarasi Silk · Varanasi",
  tagline: "Handwoven Banarasi silk, for the occasions you keep.",
  /** TODO before launch: confirm jayishasaree.com or .in and update here + astro.config.mjs. */
  domain: "www.jayishasaree.com",
  url: "https://www.jayishasaree.com",

  /** Phase 1 ordering channel. Digits only, with country code. */
  whatsapp: "919000000000",
  phoneDisplay: "+91 90000 00000",
  email: "care@jayishasaree.com",
  instagram: "https://www.instagram.com/jaiisha",
  instagramHandle: "@jaiisha",

  freeShippingOver: 300000, // paise — ₹3,000
} as const;

/** Rotating announcement bar. Keep each line short; they marquee on mobile. */
export const ANNOUNCEMENTS = [
  "Festive Collection 2026 — now on the loom",
  "Complimentary shipping across India on orders above ₹3,000",
  "Every saree ships with its weaver's certificate",
];

export interface NavItem {
  label: string;
  href: string;
  /** Mega-menu column, if any. */
  children?: Array<{ label: string; href: string; note?: string }>;
}

export const NAV: NavItem[] = [
  { label: "New Arrivals", href: "/sarees?sort=newest" },
  {
    label: "Banarasi Silk",
    href: "/sarees?fabric=banarasi-silk",
    children: [
      { label: "Pure Katan Silk", href: "/sarees?fabric=katan-silk", note: "Heirloom weight" },
      { label: "Banarasi Silk", href: "/sarees?fabric=banarasi-silk", note: "The classic brocade" },
      { label: "Organza", href: "/sarees?fabric=organza", note: "Sheer and light" },
      { label: "Georgette", href: "/sarees?fabric=georgette", note: "Fluid drape" },
      { label: "Tissue Silk", href: "/sarees?fabric=tissue-silk", note: "Zari ground" },
      { label: "Handloom only", href: "/sarees?weave=handloom", note: "Woven by hand" },
    ],
  },
  {
    label: "Wedding",
    href: "/occasion/wedding-bridal",
    children: [
      { label: "Bridal Katan", href: "/occasion/wedding-bridal", note: "Kadwa, pure zari" },
      { label: "Trousseau & Gifting", href: "/occasion/gifting", note: "Boxed with a note" },
      { label: "Reception Sarees", href: "/occasion/party-celebration", note: "Lighter silks" },
      { label: "Above ₹20,000", href: "/sarees?price=above-20000", note: "Heirloom pieces" },
    ],
  },
  {
    label: "Festive",
    href: "/occasion/festive",
    children: [
      { label: "Diwali", href: "/occasion/festive", note: "Tissue and zari" },
      { label: "Karwa Chauth", href: "/sarees?colour=pink", note: "Rani, red, maroon" },
      { label: "Navratri & Teej", href: "/occasion/festive" },
      { label: "Pooja & Griha Pravesh", href: "/occasion/traditional-functions", note: "Ivory silks" },
    ],
  },
  { label: "Shop by Colour", href: "/sarees#colour" },
  { label: "Our Craft", href: "/craft" },
];

export const PHASE2_NOTICE =
  "Online checkout opens shortly. Until then every order is confirmed personally on WhatsApp.";

/** Pre-fills the WhatsApp message so the enquiry arrives with context. */
export const whatsappLink = (message: string): string =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
