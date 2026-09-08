const https = require('https');
const url = "https://loremflickr.com/800/600/corn,seed";

https.get(url, (res) => {
  console.log("Status:", res.statusCode);
  if (res.statusCode === 301 || res.statusCode === 302) {
    console.log("Redirects to:", res.headers.location);
  }
});
