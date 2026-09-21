const https = require("https");
const url = "https://upload.wikimedia.org/wikipedia/commons/9/91/Paddy_seed.jpg";
https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);
});
