const https = require("https");
const url = "https://source.unsplash.com/800x600/?onion,seed";

https.get(url, (res) => {
  console.log("Status:", res.statusCode);
  if (res.statusCode === 301 || res.statusCode === 302) {
    console.log("Redirects to:", res.headers.location);
  }
});
