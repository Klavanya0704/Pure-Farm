import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Search DuckDuckGo Web
  const query = "site:indiamart.com Urea 46% N IFFCO bag";
  await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);

  const link = await page.evaluate(() => {
    const a = document.querySelector("a.result__url");
    return a ? a.href : null;
  });

  console.log("Product Link:", link);

  if (link && link.includes("indiamart.com")) {
    await page.goto(link, { waitUntil: "domcontentloaded" });
    const imgUrl = await page.evaluate(() => {
      // Indiamart main product image
      const img =
        document.querySelector(".zoom-img") || document.querySelector('meta[property="og:image"]');
      return img ? img.src || img.content : null;
    });
    console.log("Extracted Image:", imgUrl);
  }

  await browser.close();
}
test();
