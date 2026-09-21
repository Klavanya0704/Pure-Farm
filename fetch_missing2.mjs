import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const missing = ["p-025", "p-038", "p-044", "p-047", "p-060", "p-071", "p-085"];
const queries = JSON.parse(fs.readFileSync("queries.json", "utf-8"));
const audit = JSON.parse(fs.readFileSync("product-image-audit.json", "utf-8"));

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

  for (const id of missing) {
    const dest = path.join("public/images/products", `${id}.jpg`);
    const query = queries[id];
    console.log(`Fetching ${query}...`);
    try {
      const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForSelector("a.iusc", { timeout: 5000 }).catch(() => {});

      const imgUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("a.iusc")).slice(0, 15);
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

      for (const iurl of imgUrls) {
        try {
          await downloadImage(iurl, dest);
          console.log(`  -> Downloaded ${id}`);
          const a = audit.find((x) => x.productId === id);
          if (a) {
            a.imagePath = `/images/products/${id}.jpg`;
            a.matchStatus = "verified";
          }
          break;
        } catch (e) {}
      }
    } catch (e) {
      console.log(`  -> Error: ${e.message}`);
    }
  }
  await browser.close();
  fs.writeFileSync("product-image-audit.json", JSON.stringify(audit, null, 2));
}
scrapeMissing();
