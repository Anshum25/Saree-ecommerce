/**
 * JAIISHA Cart Management System
 * Full client-side CRUD engine for shopping bag with local persistence,
 * event dispatching, coupon calculation, and WhatsApp order formatting.
 */

export interface CartItem {
  sku: string;
  slug: string;
  name: string;
  colour: string;
  price: string;
  paise: number;
  gst: number;
  image: string;
  quantity: number;
}

export const CART_STORAGE_KEY = "jaiisha:bag";
export const FREE_SHIPPING_PAISE = 300000; // ₹3,000 in paise
export const DEFAULT_WHATSAPP = "919000000000";

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountPaise?: number;
  description: string;
}

export const VALID_COUPONS: Record<string, Coupon> = {
  JAIISHA10: {
    code: "JAIISHA10",
    discountPercent: 10,
    description: "10% Festive Luxury Discount",
  },
  UTSAV: {
    code: "UTSAV",
    discountPaise: 150000,
    description: "₹1,500 Festive Celebration Discount",
  },
  FIRSTSAREE: {
    code: "FIRSTSAREE",
    discountPercent: 15,
    description: "15% Welcome Blessing on First Saree",
  },
};

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/**
 * Normalizes cart data stored in localStorage.
 * Handles both new CartItem[] format and legacy string[] (SKU array) format.
 */
export function getCartItems(skuIndexLookup?: Map<string, any>): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // If legacy array of strings
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      const counts: Record<string, number> = {};
      parsed.forEach((sku: string) => {
        counts[sku] = (counts[sku] || 0) + 1;
      });

      const converted: CartItem[] = [];
      for (const [sku, qty] of Object.entries(counts)) {
        const itemInfo = skuIndexLookup?.get(sku);
        if (itemInfo) {
          converted.push({
            ...itemInfo,
            quantity: qty,
          });
        }
      }
      return converted;
    }

    return parsed as CartItem[];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* private browsing quota */
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPaise = items.reduce((sum, item) => sum + item.paise * item.quantity, 0);

  // Dispatch events for live updates across components
  window.dispatchEvent(
    new CustomEvent("jaiisha:bag-updated", {
      detail: { items, count, totalPaise },
    })
  );
  window.dispatchEvent(new CustomEvent("jaiisha:store"));
}

export function addToCart(newItem: Omit<CartItem, "quantity"> & { quantity?: number }): CartItem[] {
  const items = getCartItems();
  const qtyToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
  const existingIndex = items.findIndex((i) => i.sku === newItem.sku);

  if (existingIndex > -1) {
    items[existingIndex].quantity += qtyToAdd;
  } else {
    items.push({
      ...newItem,
      quantity: qtyToAdd,
    });
  }

  saveCartItems(items);
  return items;
}

export function updateCartQuantity(sku: string, delta: number): CartItem[] {
  const items = getCartItems();
  const existingIndex = items.findIndex((i) => i.sku === sku);

  if (existingIndex > -1) {
    const newQty = items[existingIndex].quantity + delta;
    if (newQty <= 0) {
      items.splice(existingIndex, 1);
    } else {
      items[existingIndex].quantity = newQty;
    }
    saveCartItems(items);
  }

  return items;
}

export function removeFromCart(sku: string): CartItem[] {
  const items = getCartItems().filter((i) => i.sku !== sku);
  saveCartItems(items);
  return items;
}

export function clearCart(): void {
  saveCartItems([]);
}

export function getCartTotals(items: CartItem[], couponCode?: string) {
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalPaise = items.reduce((sum, i) => sum + i.paise * i.quantity, 0);

  let discountPaise = 0;
  let activeCoupon: Coupon | null = null;

  if (couponCode) {
    const coupon = VALID_COUPONS[couponCode.trim().toUpperCase()];
    if (coupon) {
      activeCoupon = coupon;
      if (coupon.discountPercent) {
        discountPaise = Math.round((subtotalPaise * coupon.discountPercent) / 100);
      } else if (coupon.discountPaise) {
        discountPaise = Math.min(coupon.discountPaise, subtotalPaise);
      }
    }
  }

  const finalPaise = Math.max(0, subtotalPaise - discountPaise);
  const freeShipping = finalPaise >= FREE_SHIPPING_PAISE;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_PAISE - finalPaise);

  return {
    count,
    subtotalPaise,
    subtotalFormatted: formatINR(subtotalPaise),
    discountPaise,
    discountFormatted: formatINR(discountPaise),
    finalPaise,
    finalFormatted: formatINR(finalPaise),
    freeShipping,
    amountToFreeShippingFormatted: formatINR(amountToFreeShipping),
    shippingProgress: Math.min(100, Math.round((finalPaise / FREE_SHIPPING_PAISE) * 100)),
    activeCoupon,
  };
}

export function generateWhatsAppOrderUrl(items: CartItem[], couponCode?: string, notes?: string): string {
  const totals = getCartTotals(items, couponCode);
  const lines = items.map(
    (i) => `• ${i.name} — ${i.colour} (Qty: ${i.quantity}) — ${i.price} each [${i.sku}]`
  );

  const textLines = [
    "✨ *Hello JAIISHA, I would like to place an order from your boutique:*",
    "",
    ...lines,
    "",
    `*Items:* ${totals.count}`,
    `*Subtotal:* ${totals.subtotalFormatted}`,
  ];

  if (totals.activeCoupon) {
    textLines.push(`*Coupon Applied (${totals.activeCoupon.code}):* -${totals.discountFormatted}`);
    textLines.push(`*Final Total:* ${totals.finalFormatted}`);
  }

  if (totals.freeShipping) {
    textLines.push("*Shipping:* Free Insured Delivery");
  } else {
    textLines.push("*Shipping:* Please confirm standard express delivery");
  }

  if (notes && notes.trim()) {
    textLines.push("", `*Customer Note / Gift Blessing:* ${notes.trim()}`);
  }

  textLines.push("", "Kindly confirm availability and share payment details. Thank you!");

  return `https://wa.me/${DEFAULT_WHATSAPP}?text=${encodeURIComponent(textLines.join("\n"))}`;
}

