import { writeFileSync, mkdirSync, existsSync } from "node:fs";
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
  console.log("Downloading culture and saree images...");

  // Culture Images
  const cultureImages = [
    {
      url: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "varanasi-ghats.jpg")
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/4/47/Ganga_Aarti_ceremony_in_Varanasi_at_night.jpg",
      path: resolve(cultureDir, "ganga-aarti.jpg")
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Alkama_Ansari_-_A_Banarasi_Saree_Weaver.jpg",
      path: resolve(cultureDir, "weaver-at-loom.jpg")
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Banarasi_sari_pallu_by_ashish4.JPG",
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
      url: "https://images.unsplash.com/photo-1702943547525-3bd48e89588e?w=1600&auto=format&fit=crop&q=85",
      path: resolve(cultureDir, "pooja-lamps.jpg")
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/India_-_Varanasi_roll_of_fabric_-_0997.jpg",
      path: resolve(cultureDir, "silk-threads.jpg")
    }
  ];

  for (const item of cultureImages) {
    console.log(`Fetching culture: ${item.path}`);
    await download(item.url, item.path);
  }

  console.log("Culture images downloaded successfully.");
}

main();

