import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "rice seeds";
  await page.goto(`https://www.pexels.com/search/${encodeURIComponent(query)}/`, { waitUntil: 'domcontentloaded' });
  
  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('article img');
    return img ? img.src : null;
  });
  
  console.log("Pexels Image:", imgUrl);
  await browser.close();
}
test();
