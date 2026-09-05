const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("https://fresh-produce-connect-main.vercel.app/register", { waitUntil: "networkidle0" });
  await page.screenshot({ path: "register_screenshot2.png" });
  await browser.close();
})();
