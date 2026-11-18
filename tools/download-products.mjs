import { writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productsDir = resolve(__dirname, "../apps/storefront/public/img/products");
const cultureDir = resolve(__dirname, "../apps/storefront/public/img/culture");

mkdirSync(productsDir, { recursive: true });

async function download(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.error(`Failed ${url}: ${res.status}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) {
      console.error(`File too small (${buf.length} bytes): ${url}`);
      return false;
    }
    writeFileSync(destPath, buf);
    console.log(`Saved ${(buf.length / 1024).toFixed(1)} KB to ${destPath}`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

// Master photographs by colour
const COLOR_PHOTOS = {
  maroon: {
    model: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1745482036050-3d644032416d?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1781077126479-437220427c93?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1792510200738-e8df3d232b1e?w=1200&auto=format&fit=crop&q=85"
  },
  red: {
    model: "https://images.unsplash.com/photo-1792510200738-e8df3d232b1e?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1745482036050-3d644032416d?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1742891603141-95b87334ce00?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=85"
  },
  purple: {
    model: "https://images.unsplash.com/photo-1622278934110-bdef7f0ec825?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1743015346391-5e24d3906071?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1762320562013-45bd4f133fba?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1622278934110-bdef7f0ec825?w=1200&auto=format&fit=crop&q=85"
  },
  green: {
    model: "https://images.unsplash.com/photo-1753981031189-27bb7bd1c079?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1674116562358-9afaebea36aa?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1753981031189-27bb7bd1c079?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1674116562358-9afaebea36aa?w=1200&auto=format&fit=crop&q=85"
  },
  blue: {
    model: "https://images.unsplash.com/photo-1731131400094-8de05619131a?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1757351122515-21a7b61d682e?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1677081756748-8e0444ab588e?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1731131400094-8de05619131a?w=1200&auto=format&fit=crop&q=85"
  },
  pink: {
    model: "https://images.unsplash.com/photo-1737972993739-c497a66938b1?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1737972993739-c497a66938b1?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?w=1200&auto=format&fit=crop&q=85"
  },
  gold: {
    model: "https://images.unsplash.com/photo-1702943547525-3bd48e89588e?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1745482036050-3d644032416d?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1702943547525-3bd48e89588e?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1745482036050-3d644032416d?w=1200&auto=format&fit=crop&q=85"
  },
  ivory: {
    model: "https://images.unsplash.com/photo-1702943547525-3bd48e89588e?w=1200&auto=format&fit=crop&q=85",
    pallu: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?w=1200&auto=format&fit=crop&q=85",
    detail: "https://images.unsplash.com/photo-1702943547525-3bd48e89588e?w=1200&auto=format&fit=crop&q=85",
    flatlay: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?w=1200&auto=format&fit=crop&q=85"
  }
};

async function main() {
  console.log("Downloading base colour photography...");
  const baseFiles = {};
  for (const [col, kinds] of Object.entries(COLOR_PHOTOS)) {
    baseFiles[col] = {};
    for (const [kind, url] of Object.entries(kinds)) {
      const dest = resolve(productsDir, `_base_${col}_${kind}.jpg`);
      if (!existsSync(dest)) {
        await download(url, dest);
      }
      baseFiles[col][kind] = dest;
    }
  }

  // Import PRODUCTS catalogue list
  const { PRODUCTS } = await import("../packages/catalogue/src/products.ts");

  console.log(`Writing product images for ${PRODUCTS.length} products...`);
  for (const prod of PRODUCTS) {
    for (const v of prod.variants) {
      const col = v.colour.slug;
      for (const kind of ["model", "flatlay", "pallu", "detail"]) {
        const dest = resolve(productsDir, `${prod.slug}-${col}-${kind}.jpg`);
        const src = baseFiles[col]?.[kind] || baseFiles["maroon"][kind];
        if (src && existsSync(src)) {
          copyFileSync(src, dest);
        }
      }
    }
  }

  console.log("Done populating product photographs!");
}

main();
