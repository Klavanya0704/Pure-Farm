import fs from 'fs';
import https from 'https';

function getBingImage(query) {
  return new Promise((resolve) => {
    // Add strict terms
    const exactQuery = `"${query}" agriculture OR farm`;
    https.get('https://www.bing.com/images/search?q=' + encodeURIComponent(exactQuery) + '&form=HDRSC2&first=1', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const matches = [...data.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)];
        if (matches.length > 0) {
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
  console.log(await getBingImage('Paddy Seed PR-126'));
  console.log(await getBingImage('Urea 46% N'));
})();
