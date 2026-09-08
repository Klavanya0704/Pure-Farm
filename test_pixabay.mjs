import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "rice";
  await page.goto(`https://pixabay.com/images/search/${encodeURIComponent(query)}/`, { waitUntil: 'domcontentloaded' });
  
  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('img[src*="pixabay.com"]');
    return img ? img.src : null;
  });
  
  console.log("Pixabay Image:", imgUrl);
  await browser.close();
}
test();
