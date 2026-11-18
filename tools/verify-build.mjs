import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../apps/storefront/dist");

console.log("=== VERIFYING BUILD ARTIFACTS ===");

function checkFile(relPath, assertions) {
  const filePath = resolve(distDir, relPath);
  if (!existsSync(filePath)) {
    console.error(`FAIL: File not found: ${relPath}`);
    return false;
  }
  const content = readFileSync(filePath, "utf-8");
  console.log(`\nChecking ${relPath} (${(content.length / 1024).toFixed(1)} KB)...`);

  let allPassed = true;
  for (const { desc, test } of assertions) {
    const passed = typeof test === "string" ? content.includes(test) : test.test(content);
    if (passed) {
      console.log(`  ✓ ${desc}`);
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      allPassed = false;
    }
  }
  return allPassed;
}

// 1. Homepage
checkFile("index.html", [
  { desc: "New royal font families linked (Cinzel, Playfair Display, Plus Jakarta Sans, Rozha One)", test: /Cinzel.*Playfair\+Display.*Plus\+Jakarta\+Sans.*Rozha\+One/ },
  { desc: "Global Cart Drawer present", test: "data-cart-drawer" },
  { desc: "Varanasi Ghats cultural image loaded", test: "/img/culture/varanasi-ghats.jpg" },
  { desc: "Ganga Aarti cultural image loaded", test: "/img/culture/ganga-aarti.jpg" },
  { desc: "Master Weaver at Loom cultural image loaded", test: "/img/culture/weaver-at-loom.jpg" },
  { desc: "Royal Bride cultural image loaded", test: "/img/culture/bride-royal.jpg" },
  { desc: "Loom detail cultural image loaded", test: "/img/culture/loom-detail.jpg" },
  { desc: "Product cards have Quick Add to Bag buttons", test: "data-quick-add" },
  { desc: "Product cards link directly to product pages (/sarees/[slug])", test: 'href="/sarees/kadwa-buta-bridal-katan"' },
  { desc: "Real .jpg product photography referenced", test: /kadwa-buta-bridal-katan-maroon-model\.jpg/ }
]);

// 2. Product Detail Page
checkFile("sarees/kadwa-buta-bridal-katan/index.html", [
  { desc: "Product page loads with real .jpg image gallery", test: /kadwa-buta-bridal-katan-maroon-model\.jpg/ },
  { desc: "Interactive quantity selector on PDP", test: "data-pdp-qty" },
  { desc: "Primary Add to Bag button on PDP", test: "data-add-bag" },
  { desc: "WhatsApp enquiry button on PDP", test: "data-wa" },
  { desc: "Customer Reviews section present", test: 'id="reviews"' },
  { desc: "Write a review interactive button", test: "data-open-rev" },
  { desc: "Review submission modal present", test: "data-rev-modal" },
  { desc: "Star rating picker inside review modal", test: "data-star-picker" },
  { desc: "Lightbox is properly hidden on initial render", test: 'data-zoom hidden style="display: none;"' },
  { desc: "Lightbox has accessible close button", test: "data-zoom-close" }
]);

// 3. Shopping Bag Page
checkFile("bag/index.html", [
  { desc: "Bag page contains itemized container", test: "data-list" },
  { desc: "Free shipping meter present", test: "data-bag-shipping-meter" },
  { desc: "Coupon code input present", test: "data-bag-coupon-input" },
  { desc: "Order notes / gift message textarea present", test: "data-order-notes" },
  { desc: "WhatsApp Order placement button present", test: "data-wa-order" },
  { desc: "Instant Checkout simulation present", test: "data-checkout-btn" }
]);

// 4. Craft & Culture Page
checkFile("craft/index.html", [
  { desc: "Craft photo showcase present", test: "craft-media" },
  { desc: "Weaver at loom photo referenced", test: "/img/culture/weaver-at-loom.jpg" },
  { desc: "Loom detail photo referenced", test: "/img/culture/loom-detail.jpg" },
  { desc: "Varanasi Ghats photo referenced", test: "/img/culture/varanasi-ghats.jpg" }
]);

console.log("\n=== BUILD VERIFICATION COMPLETE ===");

