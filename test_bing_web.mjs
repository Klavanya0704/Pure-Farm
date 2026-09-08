import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("https://www.bing.com/search?q=site:amazon.in+Urea+46+fertilizer+bag", { waitUntil: 'domcontentloaded' });
  
  const link = await page.evaluate(() => {
    const a = document.querySelector('h2 a');
    return a ? a.href : null;
  });
  
  console.log("Found Amazon Link:", link);
  
  if (link && link.includes('amazon.in')) {
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    const imgUrl = await page.evaluate(() => {
      const img = document.querySelector('#landingImage');
      return img ? img.src : null;
    });
    console.log("Amazon Image:", imgUrl);
  }
  
  await browser.close();
}
test();
