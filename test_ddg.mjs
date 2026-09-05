import fs from 'fs';
import https from 'https';

function getDDGImage(query) {
  return new Promise((resolve) => {
    https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Find the vqd token
        const vqdMatch = data.match(/vqd=['"](.*?)['"]/);
        if (!vqdMatch) return resolve(null);
        const vqd = vqdMatch[1];
        
        // request images endpoint
        const opts = {
          hostname: 'duckduckgo.com',
          path: '/i.js?l=us-en&o=json&q=' + encodeURIComponent(query) + '&vqd=' + vqd,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        };
        
        https.get(opts, (res2) => {
          let data2 = '';
          res2.on('data', c => data2 += c);
          res2.on('end', () => {
            try {
              const json = JSON.parse(data2);
              if (json.results && json.results.length > 0) {
                 for (const res of json.results) {
                    if (res.image && !res.image.includes('shutterstock') && !res.image.includes('alamy')) {
                       return resolve(res.image);
                    }
                 }
                 resolve(json.results[0].image);
              } else {
                 resolve(null);
              }
            } catch(e) { resolve(null); }
          });
        }).on('error', () => resolve(null));
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const url = await getDDGImage('paddy seed PR-126');
  console.log('Result:', url);
})();
