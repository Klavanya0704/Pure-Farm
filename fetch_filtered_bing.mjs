import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const productsTsPath = 'src/data/products.ts';
const content = fs.readFileSync(productsTsPath, 'utf-8');

const regex = /^\s*\[\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",/gm;
let m;
const products = [];
let i = 1;
while ((m = regex.exec(content)) !== null) {
  const id = `p-${String(i).padStart(3, "0")}`;
  products.push({ id, name: m[1], category: m[3] });
  i++;
}

const queries = JSON.parse(fs.readFileSync('queries.json', 'utf-8'));
const outDir = 'public/images/products';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const negativeKeywords = ['molecule', 'chemical', 'structure', 'formula', 'vector', 'illustration', 'drawing', 'cartoon', 'clipart', 'youtube', 'ytimg', 'logo', 'poster', 'academy', 'step-by-step', 'tutorial', 'dreamstime', 'shutterstock', 'alamy', 'png', 'svg', 'icon', 'art', 'sketch', 'painting'];

function isUrlClean(url) {
  const l = url.toLowerCase();
  for (const w of negativeKeywords) {
    if (l.includes(w)) return false;
  }
  return true;
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        req.destroy();
        return reject(new Error(`Failed to download, status: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

const audit = [];

async function scrapeProducts() {
  const browser = await puppeteer.launch({ headless: true });
  
  // Scrape using 5 concurrent pages
  const concurrency = 5;
  let index = 0;
  
  async function worker() {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    while (index < products.length) {
      const myIndex = index++;
      const p = products[myIndex];
      const dest = path.join(outDir, `${p.id}.jpg`);
      const query = queries[p.id];
      
      console.log(`[${myIndex+1}/${products.length}] Fetching ${p.name} using query: ${query}`);
      
      let success = false;
      try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForSelector('a.iusc', { timeout: 5000 }).catch(() => {});
        
        const imgUrls = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('a.iusc')).slice(0, 15);
          return imgs.map(img => {
            try { return JSON.parse(img.getAttribute('m')).murl; } catch(e) { return null; }
          }).filter(u => u && !u.includes('svg') && !u.includes('gif'));
        });
        
        const cleanUrls = imgUrls.filter(isUrlClean);
        
        for (const iurl of cleanUrls) {
          try {
            await downloadImage(iurl, dest);
            console.log(`  -> Downloaded ${p.id}`);
            
            audit.push({
              productId: p.id,
              productTitle: p.name,
              searchQuery: query,
              imagePath: `/images/products/${p.id}.jpg`,
              sourceUrl: iurl,
              matchStatus: "verified"
            });
            success = true;
            break;
          } catch(e) {}
        }
        
      } catch (e) {
        console.log(`  -> Error scraping ${p.id}: ${e.message}`);
      }
      
      if (!success) {
        console.log(`  -> Failed to download ${p.id}`);
        audit.push({
          productId: p.id,
          productTitle: p.name,
          searchQuery: query,
          imagePath: null,
          matchStatus: "broken"
        });
      }
    }
    await page.close();
  }
  
  const workers = Array(concurrency).fill(null).map(() => worker());
  await Promise.all(workers);
  await browser.close();
  
  fs.writeFileSync('product-image-audit.json', JSON.stringify(audit, null, 2));
  console.log("Done scraping and created audit JSON.");
}

scrapeProducts();
