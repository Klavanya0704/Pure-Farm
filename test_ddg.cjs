const https = require("https");
https.get("https://duckduckgo.com/?q=tractor&t=h_&iar=images&iax=images&ia=images", (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    const match = data.match(/vqd=([^&'"]+)/);
    console.log(match ? match[1] : "No VQD");
  });
});
