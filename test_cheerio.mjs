import axios from 'axios';
import * as cheerio from 'cheerio';

(async () => {
  try {
    const res = await axios.get('https://www.bing.com/images/search?q=farm+safety+kit&form=HDRSC2&first=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    console.log(res.status);
    console.log(res.data.substring(0, 200));
  } catch(e) { console.log(e.message); }
})();
