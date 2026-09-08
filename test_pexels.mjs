import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = "corn seeds";
  const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article img', { timeout: 5000 }).catch(() => {});
  
  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('article img');
    return img ? img.src : null;
  });
  
  console.log("Pexels Image:", imgUrl);
  await browser.close();
}
test();
