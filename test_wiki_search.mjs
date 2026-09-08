import puppeteer from 'puppeteer';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "Paddy seed";
  const url = `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(query)}&title=Special:MediaSearch&type=image`;
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  
  const imgUrl = await page.evaluate(() => {
    const img = document.querySelector('.sdms-image-result img');
    return img ? img.src : null;
  });
  
  console.log("Wikimedia Image:", imgUrl);
  await browser.close();
}
test();
