import fs from 'fs';

async function searchImage(query) {
  try {
    const response = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' agricultural product'));
    const text = await response.text();
    // DuckDuckGo HTML might not have direct image links easily for images since it's the web search.
    // Let's use Wikipedia API instead!
    const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(query) + '&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json';
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
  const rowsRaw = match[1].split('],');
  
  const mappings = {};
  for (const row of rowsRaw) {
    if (!row.trim()) continue;
    const titleMatch = row.match(/"([^"]+)"/);
    if (titleMatch) {
      const title = titleMatch[1];
      const url = await searchImage(title);
      if (url) {
        mappings[title] = url;
        console.log('Found:', title, '->', url);
      } else {
        console.log('Not found:', title);
      }
    }
  }
  fs.writeFileSync('image_mappings.json', JSON.stringify(mappings, null, 2));
})();
