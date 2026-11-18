/**
 * Policy copy.
 *
 * DRAFTS. These are written to be honest and specific rather than boilerplate,
 * but they must be reviewed against your actual courier contract, GST
 * registration and refund practice before launch — and the bracketed values
 * filled in.
 */

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Policy {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
}

export const POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping",
    intro:
      "Every saree is insured in transit and packed in a rigid box with a muslin sleeve, because silk creases and zari catches.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Within India",
        paragraphs: [
          "Complimentary insured shipping on orders above ₹3,000. Below that, a flat ₹150.",
          "In-stock pieces are dispatched within 24 working hours. Made-to-order pieces ship when the weaving is finished — the lead time is stated on the product page before you order, and we send photographs from the loom while it is being woven.",
        ],
        list: [
          "Metros: 2–4 working days",
          "Other cities and towns: 4–7 working days",
          "Remote pin codes: up to 10 working days",
        ],
      },
      {
        heading: "International",
        paragraphs: [
          "We ship worldwide by DHL or India Post registered air parcel. Shipping is quoted per order on WhatsApp before payment.",
          "Customs duty and import tax in the destination country are payable by you, and are not included in the price. We declare the true value, as required.",
        ],
      },
      {
        heading: "Tracking",
        paragraphs: [
          "A tracking number is sent on WhatsApp the moment the parcel is picked up. If tracking has not moved for 48 hours, message us and we will chase the courier ourselves rather than ask you to.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchange",
    intro:
      "Colour on a screen is never exactly colour in the hand. If a saree is not what you expected, send it back.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "The window",
        paragraphs: [
          "Seven days from delivery, for any reason, on in-stock pieces.",
          "The saree must be unworn and unwashed, with the weaver's certificate and the fall and tassels untouched. Once a saree has been to a tailor for fall-and-pico or blouse stitching, we cannot take it back.",
        ],
      },
      {
        heading: "Made-to-order pieces",
        paragraphs: [
          "A piece woven to order for you cannot be returned for a change of mind, because the loom time was bought on your behalf. It is of course returnable if it arrives damaged or is not what was described.",
        ],
      },
      {
        heading: "How it works",
        paragraphs: [
          "Message us on WhatsApp with the order number and a photograph. We arrange a reverse pickup where the courier serves your pin code, or share a prepaid label.",
          "Refunds are issued to the original payment method within [X] working days of the saree reaching us and passing inspection. Exchanges ship the same day as inspection.",
        ],
      },
      {
        heading: "Damage in transit",
        paragraphs: [
          "Photograph the parcel before opening it fully if the box is crushed, and message us within 48 hours. Transit damage is our problem, not yours, and is replaced or refunded in full.",
        ],
      },
    ],
  },
  {
    slug: "cancellations",
    title: "Cancellations",
    intro: "Before dispatch, a cancellation costs nothing.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "In-stock orders",
        paragraphs: [
          "Cancel any time before dispatch for a full refund. Message us on WhatsApp — it is faster than any form.",
          "Once a parcel has been picked up by the courier, treat it as a return instead.",
        ],
      },
      {
        heading: "Made-to-order",
        paragraphs: [
          "Cancellable within 48 hours of confirmation, before the warp is dressed. After that the loom is committed and the deposit is not refundable, because the weaver has already been paid for the work.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      "We hold the minimum we need to send you a saree and answer your questions, and we do not sell it.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "Your name, delivery address, phone number and email, when you place an order or send an enquiry. Payment details are handled by the payment gateway and never reach our servers.",
          "Your wishlist and bag are stored in your own browser, not on our servers, until you create an account.",
        ],
      },
      {
        heading: "What we do with it",
        paragraphs: [
          "Fulfil and support your order, answer your enquiry, and — only if you asked for it — send the monthly letter. We share your address with the courier and your order value with the payment gateway, and that is the extent of it.",
          "We do not sell or rent your details to anyone, and we do not add enquiry numbers to marketing broadcasts.",
        ],
      },
      {
        heading: "Your choices",
        paragraphs: [
          "Ask us and we will tell you everything we hold about you, correct it, or delete it — except records we are required to keep for GST and accounting. Write to [EMAIL] with the subject \"my data\".",
        ],
      },
      {
        heading: "Cookies and analytics",
        paragraphs: [
          "The site uses local browser storage for your wishlist and bag. [State your analytics provider here, or that you use none, before launch.]",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Use",
    intro: "The short version: we describe sarees accurately, and you pay for what you order.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Products",
        paragraphs: [
          "Every listing states the fabric, the weave (handloom, semi-handloom or powerloom) and the zari type. Handwoven cloth varies slightly piece to piece; small irregularities in the weft are characteristic of handloom and are not defects.",
          "Colour reproduction varies between screens. Ask us for a daylight video of the exact piece if colour is critical.",
        ],
      },
      {
        heading: "Pricing and orders",
        paragraphs: [
          "Prices are in Indian rupees and include GST at the applicable rate. We reserve the right to decline or cancel an order where a price or stock figure was listed in error, and to refund you in full if that happens.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "Photographs, text and the JAIISHA name on this site belong to us. Traditional Banarasi motifs do not — they belong to the weaving community of Varanasi, and we claim no ownership of them.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: ["These terms are governed by Indian law, with jurisdiction at [CITY]."],
      },
    ],
  },
  {
    slug: "faq",
    title: "Frequently Asked",
    intro: "The questions we are actually asked on WhatsApp, answered once.",
    updated: "2026-11-01",
    sections: [
      {
        heading: "Is the blouse piece included?",
        paragraphs: [
          "Yes, on every saree where the product page says so — an unstitched piece of 0.8m, attached to the saree, in the matching or contrast fabric stated. It is not stitched, and we do not offer stitching.",
        ],
      },
      {
        heading: "Will you send a video before I pay?",
        paragraphs: [
          "Always. Message us the product code and we will send a clip of that exact saree in daylight and in lamp light, which is the only honest way to judge zari.",
        ],
      },
      {
        heading: "How do I know it is handloom and not powerloom?",
        paragraphs: [
          "Our listings say which it is, in plain words, and we are not shy about selling powerloom sarees as powerloom. Turn any saree over: kadwa handloom work has no cut float threads behind the motifs. There is more on this on our Craft page.",
        ],
      },
      {
        heading: "Can you match a colour I already have?",
        paragraphs: [
          "Often, yes. Send a photograph of the fabric in daylight and we will tell you honestly whether we can match it off the shelf or whether it needs a dye lot on a made-to-order piece.",
        ],
      },
      {
        heading: "Do you take orders on WhatsApp?",
        paragraphs: [
          "That is our main channel right now. Online checkout, with UPI and cards, is being added — until then every order is confirmed personally, and the price you are quoted is the price you pay.",
        ],
      },
      {
        heading: "What about a GST invoice for a business purchase?",
        paragraphs: [
          "Give us your GSTIN with the order and we will raise a tax invoice against it.",
        ],
      },
    ],
  },
];

export const policyBySlug = (slug: string): Policy | undefined =>
  POLICIES.find((p) => p.slug === slug);
