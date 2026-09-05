const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173/login", { waitUntil: "networkidle0" });
  await page.click('button:has-text("Farmer")'); // Assuming there's a button for Farmer demo login
  await page.waitForNavigation();
  await page.goto("http://localhost:4173/market", { waitUntil: "networkidle0" });
  await page.screenshot({ path: "market_screenshot.png", fullPage: true });
  await browser.close();
})();
