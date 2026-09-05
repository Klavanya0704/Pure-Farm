import fs from 'fs';
import google from 'googlethis';

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  let existingMappings = {};
  if (fs.existsSync('src/data/image_mappings.json')) {
    existingMappings = JSON.parse(fs.readFileSync('src/data/image_mappings.json', 'utf8'));
  }
  
  const mappings = {};
  
  let count = 0;
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      count++;
      
      let query = title.replace(/\(.*?\)/g, '').trim(); // e.g. Paddy Seed PR-126
      if (query.toLowerCase().includes('seed') || query.toLowerCase().includes('rhizome')) query += ' agriculture field crop';
      else if (query.toLowerCase().includes('urea') || query.toLowerCase().includes('dap') || query.toLowerCase().includes('npk') || query.toLowerCase().includes('compost')) query += ' fertilizer bag';
      else if (query.toLowerCase().includes('pump') || query.toLowerCase().includes('sprayer') || query.toLowerCase().includes('cutter') || query.toLowerCase().includes('tractor')) query += ' agricultural equipment';
      else query += ' fresh farm';

      try {
        const images = await google.image(query, { safe: false });
        if (images && images.length > 0) {
          // find a valid jpg/png
          let selected = images.find(img => img.url && !img.url.includes('svg') && !img.url.includes('shutterstock') && !img.url.includes('istock') && !img.url.includes('x.com'));
          if (!selected) selected = images[0];
          
          mappings[title] = selected.url;
          console.log(`[${count}/120] Found for: ${title} -> ${selected.url}`);
        } else {
           console.log(`[${count}/120] No results for: ${title}`);
           mappings[title] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/600px-Eq_it-na_pizza-margherita_sep2005_sml.jpg'; // obvious error
        }
      } catch (err) {
        console.log(`[${count}/120] Error fetching: ${title}`);
      }
    }
  }
  
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done!');
})();
