import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "site:indiamart.com Urea 46% N fertilizer bag";
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector("a.iusc");
    if (img) {
      try {
        return JSON.parse(img.getAttribute("m")).murl;
      } catch (e) {}
    }
    return null;
  });

  console.log("Found URL:", imgUrl);
  await browser.close();
}
test();
