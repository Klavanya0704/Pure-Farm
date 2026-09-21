import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "Paddy Seed PR-126 bag";
  const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const imgUrl = await page.evaluate(() => {
    // Google Images stores image data in scripts or src attributes
    // We can just grab the first visible img with a src starting with http
    const imgs = Array.from(document.querySelectorAll("img")).filter(
      (img) => img.src.startsWith("http") && !img.src.includes("googlelogo"),
    );
    return imgs.length > 0 ? imgs[0].src : null;
  });

  console.log("Google Image:", imgUrl);
  await browser.close();
}
test();
