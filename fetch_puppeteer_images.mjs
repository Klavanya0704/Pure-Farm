import fs from 'fs';
import puppeteer from 'puppeteer';

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  
  const mappings = {};
  
  const items = [];
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      items.push(titleMatch[1]);
    }
  }

  console.log(`Starting Puppeteer scrape for ${items.length} items...`);
  
  // Scrape using a concurrency of 4
  const CONCURRENCY = 4;
  let index = 0;
  
  async function scrapeItem(title, i) {
      const page = await browser.newPage();
      try {
        let query = title;
        // smart query builder
        if (title.toLowerCase().includes('seed')) query = title + ' agriculture farm field crop';
        else if (title.toLowerCase().includes('urea') || title.toLowerCase().includes('dap') || title.toLowerCase().includes('npk')) query = title + ' fertilizer bag agriculture';
        else if (title.toLowerCase().includes('plant')) query = title + ' nursery agriculture';
        else query = title + ' agriculture real product';
        
        await page.goto('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(query), { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Google images are usually in img.rg_i
        const imgUrl = await page.evaluate(() => {
           const imgs = document.querySelectorAll('img.rg_i, img.YQ4gaf');
           for (let img of imgs) {
              const src = img.getAttribute('src') || img.getAttribute('data-src');
              if (src && src.startsWith('http')) return src;
           }
           return null;
        });
        
        if (imgUrl) {
           mappings[title] = imgUrl;
           console.log(`[${i+1}/${items.length}] Found: ${title}`);
        } else {
           mappings[title] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg/960px-Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg.png';
           console.log(`[${i+1}/${items.length}] Not found: ${title}`);
        }
      } catch (err) {
        mappings[title] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg/960px-Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg.png';
        console.log(`[${i+1}/${items.length}] Error: ${title}`);
      } finally {
        await page.close();
      }
  }

  const workers = [];
  for (let c = 0; c < CONCURRENCY; c++) {
      workers.push((async () => {
          while (index < items.length) {
              const currentIndex = index++;
              await scrapeItem(items[currentIndex], currentIndex);
          }
      })());
  }

  await Promise.all(workers);
  
  await browser.close();
  
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done mapping Google images via Puppeteer!');
})();
