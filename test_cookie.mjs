import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setCookie({
    name: 'CONSENT',
    value: 'YES+cb.20230501-14-p0.en+FX+414',
    domain: '.google.com'
  });
  
  await page.goto("https://www.google.com/search?tbm=isch&q=tractor", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "google.png" });
  await browser.close();
})();
