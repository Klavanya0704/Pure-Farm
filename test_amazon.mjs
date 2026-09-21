import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "site:amazon.in Urea fertilizer 46%";
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const imgUrls = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("a.iusc")).slice(0, 3);
    return imgs.map((img) => {
      try {
        return JSON.parse(img.getAttribute("m")).murl;
      } catch (e) {
        return null;
      }
    });
  });

  console.log("Found URLs:", imgUrls);
  await browser.close();
}
test();
