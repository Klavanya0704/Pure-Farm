import https from 'https';

function getBingImage(query) {
  return new Promise((resolve) => {
    https.get('https://www.bing.com/images/search?q=' + encodeURIComponent(query), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/murl&quot;:&quot;(http[^&]+)&quot;/);
        if (match) resolve(match[1]);
        else resolve(null);
      });
    });
  });
}

(async () => {
  console.log(await getBingImage('paddy seed'));
})();
