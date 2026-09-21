import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const query = "corn seeds";
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('img[src*="images.unsplash.com/photo-"]');
    return img ? img.src : null;
  });

  console.log("Unsplash Image:", imgUrl);
  await browser.close();
}
test();
