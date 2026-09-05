const fs = require('fs');
async function search(query) {
  const url = \https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=\&srnamespace=6&format=json&utf8=\;
  const res = await fetch(url);
  const data = await res.json();
  const titles = data.query.search.map(s => s.title);
  for (const title of titles.slice(0, 3)) {
     const iurl = \https://en.wikipedia.org/w/api.php?action=query&titles=\&prop=imageinfo&iiprop=url&format=json\;
     const r = await fetch(iurl);
     const d = await r.json();
     const pages = d.query.pages;
     for (const p in pages) {
         if (pages[p].imageinfo) {
             console.log(query + ' -> ' + pages[p].imageinfo[0].url);
             return;
         }
     }
  }
}
async function main() {
  await search('farmer field india');
  await search('crop protection field');
  await search('storm clouds field agriculture');
  await search('farmer smartphone agriculture');
  await search('modern agriculture laptop');
  await search('crop growth stages field');
  await search('sunrise agricultural field');
  await search('fertilizer bags warehouse');
}
main();
