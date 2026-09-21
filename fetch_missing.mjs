import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const missing = [
  { id: "p-033", name: "Sorghum Seed CSH-16 (5 kg)" },
  { id: "p-037", name: "Lentil Seed IPL-406 (5 kg)" },
  { id: "p-076", name: "Boron 20% Powder (1 kg)" },
  { id: "p-087", name: "Manual Knapsack Sprayer 16 L" },
];

const outDir = "public/images/products";

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode !== 200) {
          req.destroy();
          return reject(new Error(`Failed to download, status: ${res.statusCode}`));
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
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

async function scrapeMissing() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const p of missing) {
    const dest = path.join(outDir, `${p.id}.jpg`);
    const query = p.name;
    console.log(`Fetching ${query}...`);
    try {
      const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
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
        } catch (e) {}
      }
    } catch (e) {
      console.log(`  -> Error scraping ${p.id}: ${e.message}`);
    }
  }
  await browser.close();
}
scrapeMissing();
