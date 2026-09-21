import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const productsTsPath = "src/data/products.ts";
const content = fs.readFileSync(productsTsPath, "utf-8");

// Parse ROWS to get product names and IDs
const match = content.match(/const ROWS.*?\[([\s\S]*?)\];\s*export const PRODUCTS/);
const regex = /^\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/gm;
let m;
const products = [];
let i = 1;
while ((m = regex.exec(content)) !== null) {
  const id = `p-${String(i).padStart(3, "0")}`;
  products.push({ id, name: m[1], category: m[3] });
  i++;
}

console.log(`Extracted ${products.length} products`);

const outDir = "public/images/products";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode !== 200) {
          req.destroy();
          return reject(new Error(`Failed to download, status: ${res.statusCode}`));
        }
        // Check content type to make sure it's an image
        const contentType = res.headers["content-type"];
        if (!contentType || !contentType.startsWith("image/")) {
          req.destroy();
          return reject(new Error(`Not an image, got: ${contentType}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(true);
        });
        file.on("error", (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });

    // Timeout
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function scrapeProducts() {
  const browser = await puppeteer.launch({ headless: true });

  // Scrape using 4 concurrent pages
  const concurrency = 4;
  let index = 0;

  async function worker() {
    const page = await browser.newPage();
    // Block unwanted resources for speed
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["stylesheet", "font", "media"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    while (index < products.length) {
      const myIndex = index++;
      const p = products[myIndex];
      const dest = path.join(outDir, `${p.id}.jpg`);

      if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
        console.log(`[${myIndex + 1}/${products.length}] ${p.id} already exists`);
        continue;
      }

      console.log(`[${myIndex + 1}/${products.length}] Fetching ${p.name}...`);

      // Clean query
      let query = p.name;
      if (p.category === "seeds") query += " seeds";
      if (p.category === "fertilizers") query += " fertilizer bag";

      try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

        // Wait for images to load
        await page.waitForSelector("a.iusc", { timeout: 5000 }).catch(() => {});

        const imgUrls = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("a.iusc")).slice(0, 5);
          return imgs
            .map((img) => {
              try {
                return JSON.parse(img.getAttribute("m")).murl;
              } catch (e) {
                return null;
              }
            })
            .filter((u) => u && !u.includes("svg") && !u.includes("gif"));
        });

        let success = false;
        for (const iurl of imgUrls) {
          try {
            await downloadImage(iurl, dest);
            console.log(`  -> Downloaded ${p.id}`);
            success = true;
            break;
          } catch (e) {
            // Try next
          }
        }

        if (!success) {
          console.log(`  -> Failed to download ${p.id}`);
        }
      } catch (e) {
        console.log(`  -> Error scraping ${p.id}: ${e.message}`);
      }
    }
    await page.close();
  }

  const workers = Array(concurrency)
    .fill(null)
    .map(() => worker());
  await Promise.all(workers);

  await browser.close();
}

scrapeProducts().then(() => console.log("Done scraping"));
