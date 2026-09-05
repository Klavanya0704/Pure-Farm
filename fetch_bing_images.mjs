import fs from 'fs';
import https from 'https';

function getBingImage(query) {
  return new Promise((resolve) => {
    https.get('https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&form=HDRSC2&first=1', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Find all matches to get a good one
        const matches = [...data.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)];
        if (matches.length > 0) {
          // try to pick one that is a standard image (not icon, not svg)
          for (const m of matches) {
             const url = m[1];
             if (!url.includes('.svg') && !url.includes('icon') && !url.includes('logo')) {
                resolve(url);
                return;
             }
          }
          resolve(matches[0][1]);
        } else {
          resolve(null);
        }
      });
      res.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  const mappings = {};
  let count = 0;
  
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      count++;
      
      let query = title;
      // Add intelligent keywords based on the user's instructions
      if (title.toLowerCase().includes('seed')) query = title + ' agriculture farm field crop';
      else if (title.toLowerCase().includes('urea') || title.toLowerCase().includes('dap') || title.toLowerCase().includes('npk')) query = title + ' fertilizer bag agriculture';
      else if (title.toLowerCase().includes('rhizome')) query = title + ' agriculture farm';
      else if (title.toLowerCase().includes('plant')) query = title + ' nursery agriculture';
      else query = title + ' agriculture real product';

      try {
        let url = await getBingImage(query);
        if (url) {
          mappings[title] = url;
          console.log(`[${count}/120] Found: ${title} -> ${url}`);
        } else {
          console.log(`[${count}/120] Not found: ${title}, trying without suffix`);
          url = await getBingImage(title);
          if (url) {
             mappings[title] = url;
             console.log(`[${count}/120] Found (fallback): ${title} -> ${url}`);
          } else {
             mappings[title] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg/960px-Groundnuts_yield%2C_World%2C_2024_%28cropped%29.svg.png';
          }
        }
      } catch (err) {
        mappings[title] = '';
      }
      
      // sleep 200ms to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done mapping images!');
})();
