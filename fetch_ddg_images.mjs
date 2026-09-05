import fs from 'fs';
import { image_search } from 'duckduckgo-images-api';

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  const mappings = {};
  let i = 0;
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      try {
        let searchQuery = title;
        if (title.toLowerCase().includes('seed')) searchQuery += ' seed packet or crop';
        else if (title.toLowerCase().includes('fertilizer') || title.toLowerCase().includes('urea') || title.toLowerCase().includes('dap')) searchQuery += ' fertilizer bag';
        else if (title.toLowerCase().includes('plant')) searchQuery += ' plant nursery';
        else searchQuery += ' agricultural product';
        
        const results = await image_search({ query: searchQuery, moderate: true, iterations: 1 });
        
        let found = false;
        if (results && results.length > 0) {
          for (const res of results) {
            if (res.image && !res.image.includes('svg') && !res.image.includes('shutterstock')) {
              mappings[title] = res.image;
              console.log(`[${i}/120] Found for: ${title}`);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          mappings[title] = '';
          console.log(`[${i}/120] No results for: ${title}`);
        }
      } catch (err) {
        mappings[title] = '';
        console.log(`[${i}/120] Error for: ${title}`);
      }
    }
    i++;
  }
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done!');
})();
