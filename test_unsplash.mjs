import axios from 'axios';
(async () => {
  try {
    const res = await axios.get('https://unsplash.com/napi/search/photos?query=paddy+seed&per_page=1');
    if (res.data.results && res.data.results.length > 0) {
      console.log(res.data.results[0].urls.regular);
    } else {
      console.log('No results');
    }
  } catch(e) {
    console.log(e.message);
  }
})();
