import fs from 'fs';

async function getWikiImage(query) {
  const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json';
  try {
    const wikiRes = await fetch(wikiUrl);
    const wikiJson = await wikiRes.json();
    if (wikiJson.query && wikiJson.query.pages) {
      const pages = Object.values(wikiJson.query.pages);
      if (pages.length > 0 && pages[0].thumbnail) {
        return pages[0].thumbnail.source;
      }
    }
  } catch (e) {}
  return null;
}

(async () => {
  const content = fs.readFileSync('src/data/products.ts', 'utf8');
  const match = content.match(/const ROWS: Row\[\] = \[([\s\S]*?)\];/);
  if (!match) return;
  const rowsRaw = match[1].split('],\n');
  
  const mappings = {};
  
  for (const row of rowsRaw) {
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      
      // Simplify query for better wiki hits
      let query = title.replace(/\(.*?\)/g, '').trim(); // remove (5 kg) etc
      query = query.split(' ').slice(0, 2).join(' '); // take first 2-3 words
      
      let url = await getWikiImage(query);
      if (!url) {
         // fallback to category-like search
         if (title.toLowerCase().includes('seed')) url = await getWikiImage('seeds agriculture');
         else if (title.toLowerCase().includes('fertilizer') || title.toLowerCase().includes('urea')) url = await getWikiImage('fertilizer bag agriculture');
         else if (title.toLowerCase().includes('tractor') || title.toLowerCase().includes('sprayer')) url = await getWikiImage('agricultural machinery');
         else url = await getWikiImage('agriculture');
      }
      
      if (url) {
        mappings[title] = url;
        console.log('Found:', title, '->', url);
      } else {
        mappings[title] = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Tractor_in_a_field.jpg/600px-Tractor_in_a_field.jpg';
      }
    }
  }
  fs.writeFileSync('src/data/image_mappings.json', JSON.stringify(mappings, null, 2));
  console.log('Done!');
})();
