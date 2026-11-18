import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cultureDir = resolve(__dirname, "../apps/storefront/public/img/culture");
const productsDir = resolve(__dirname, "../apps/storefront/public/img/products");

mkdirSync(cultureDir, { recursive: true });
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

async function main() {
  const items = [
    {
      url: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "varanasi-ghats.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1691842208155-9460efbbbde8?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "ganga-aarti.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1782232396222-26e60e110927?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "weaver-at-loom.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1768749933937-dbad8b68a6e1?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "loom-detail.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1742891603141-95b87334ce00?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "bride-henna.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1781077126479-437220427c93?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "bride-jewellery.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1792510200738-e8df3d232b1e?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "bride-royal.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1745482039058-92017fb981cf?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "tradition-festival.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1719266307151-c07fadbee416?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "diwali-diyas.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1577083753695-e010191bacb5?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "pooja-lamps.jpg")
    },
    {
      url: "https://images.unsplash.com/flagged/photo-1593005510509-d05b264f1c9c?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "silk-threads.jpg")
    },
    {
      url: "https://images.unsplash.com/photo-1585484172678-879ab0efb064?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "varanasi-morning.jpg")
    }
  ];

  for (const item of items) {
    console.log(`Downloading: ${item.path}`);
    await download(item.url, item.path);
  }
  console.log("All cultural images successfully downloaded!");
}

main();

