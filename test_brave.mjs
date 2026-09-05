import https from 'https';

function getBraveImage(query) {
  return new Promise((resolve) => {
    https.get('https://search.brave.com/images?q=' + encodeURIComponent(query), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/&quot;url&quot;:&quot;(http[^&]+)&quot;/);
        if (match) resolve(match[1]);
        else resolve(null);
      });
    });
  });
}

(async () => {
  console.log(await getBraveImage('paddy seed'));
})();
