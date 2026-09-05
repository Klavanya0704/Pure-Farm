import fs from 'fs';
import axios from 'axios';

async function getUnsplashImage(query) {
  try {
    const res = await axios.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (res.data.results && res.data.results.length > 0) {
      return res.data.results[0].urls.regular;
    }
  } catch (e) {
    // ignore
  }
  return null;
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
      
      let query = title.replace(/\(.*?\)/g, '').trim().toLowerCase(); // e.g. "paddy seed pr-126"
      // Smart query generation for Unsplash
      if (query.includes('seed')) {
         query = query.split(' ')[0] + ' crop agriculture'; // e.g. "paddy crop agriculture"
      } else if (query.includes('rhizome')) {
         query = query.split(' ')[0] + ' harvest';
      } else if (query.includes('urea') || query.includes('dap') || query.includes('npk') || query.includes('potash') || query.includes('phosphate') || query.includes('sulphate') || query.includes('nitrate')) {
         query = 'fertilizer agriculture bag';
      } else if (query.includes('vermicompost') || query.includes('manure') || query.includes('bone meal') || query.includes('neem cake')) {
         query = 'organic compost agriculture';
      } else if (query.includes('biofertiliser') || query.includes('bacteria') || query.includes('mycorrhiza') || query.includes('pseudomonas') || query.includes('trichoderma')) {
         query = 'soil agriculture farm';
      } else if (query.includes('acid') || query.includes('extract') || query.includes('micronutrient') || query.includes('boron') || query.includes('tonic') || query.includes('concentrate') || query.includes('liquid')) {
         query = 'agricultural chemical bottle';
      } else if (query.includes('sprayer') || query.includes('pump') || query.includes('controller')) {
         query = 'agriculture water pump';
      } else if (query.includes('weeder') || query.includes('cutter') || query.includes('rotavator') || query.includes('drill') || query.includes('trolley')) {
         query = 'tractor agriculture equipment';
      } else if (query.includes('irrigation') || query.includes('sprinkler') || query.includes('pipe') || query.includes('mulching') || query.includes('net')) {
         query = 'irrigation field agriculture';
      } else if (query.includes('testing') || query.includes('meter')) {
         query = 'soil testing agriculture';
      } else if (query.includes('sickle') || query.includes('hoe') || query.includes('spade') || query.includes('secateur') || query.includes('wheelbarrow')) {
         query = 'agriculture hand tools';
      } else if (query.includes('tarpaulin') || query.includes('bag') || query.includes('silo') || query.includes('scale') || query.includes('trough') || query.includes('milking') || query.includes('drinker') || query.includes('fogger') || query.includes('trap') || query.includes('kit') || query.includes('station')) {
         query = 'agriculture farm equipment';
      } else if (query.includes('plant') || query.includes('sapling')) {
         query = query.split(' ')[0] + ' plant nursery';
      } else {
         query = query.split(' ').slice(0, 2).join(' ') + ' agriculture';
      }

      try {
        let url = await getUnsplashImage(query);
        if (url) {
          mappings[title] = url;
          console.log(`[${count}/120] Found: ${title} -> ${url}`);
        } else {
          // generic fallback if absolutely needed, though Unsplash rarely misses broad terms
          console.log(`[${count}/120] Not found for ${query}, using fallback.`);
          mappings[title] = 'https://images.unsplash.com/photo-1595841696650-6a75f8f53702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
        }
      } catch (err) {
        mappings[title] = 'https://images.unsplash.com/photo-1595841696650-6a75f8f53702?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 250));
    }
  }
  
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done mapping Unsplash images!');
})();
