import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "Urea 46% N fertilizer bag";
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector("a.iusc");
    if (img) {
      try {
        const m = JSON.parse(img.getAttribute("m"));
        return m.murl; // The direct image URL
      } catch (e) {}
    }
    return null;
  });

  console.log("Found URL:", imgUrl);
  await browser.close();
}
test();
