const https = require("https");
const vqd = "4-224776906924181397189811263375201521737";
const options = {
  hostname: "duckduckgo.com",
  path: "/i.js?l=us-en&o=json&q=tractor&vqd=" + vqd,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }
};
https.get(options, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log(json.results[0].image);
    } catch(e) { console.log("Error parsing:", data.substring(0, 100)); }
  });
});
