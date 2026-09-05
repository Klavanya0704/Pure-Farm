import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto("https://fresh-produce-connect-main.vercel.app/register", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "register_screenshot.png", fullPage: true });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
