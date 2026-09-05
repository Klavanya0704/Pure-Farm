const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("https://www.pexels.com/search/indian%20farmer/", { waitUntil: "networkidle2" });
  
  const urls = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img[src^="https://images.pexels.com/photos/"]'));
    return images.map(img => img.src.split('?')[0]);
  });
  
  console.log([...new Set(urls)].slice(0, 5));
  await browser.close();
})();
