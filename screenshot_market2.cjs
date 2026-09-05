const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173/login", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Farmer')).click();
  });
  await page.waitForNavigation();
  await page.goto("http://localhost:4173/market", { waitUntil: "networkidle0" });
  await page.screenshot({ path: "market_screenshot.png", fullPage: true });
  await browser.close();
})();
