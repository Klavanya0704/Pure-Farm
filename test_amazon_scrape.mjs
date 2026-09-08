import puppeteer from 'puppeteer';
import fs from 'fs';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Search DDG for an Amazon India product
  await page.goto("https://html.duckduckgo.com/html/?q=site:amazon.in+Urea+46+fertilizer+bag");
  
  const link = await page.evaluate(() => {
    const a = document.querySelector('.result__snippet');
    return a ? a.closest('.result').querySelector('.result__url').href : null;
  });
  
  console.log("Found Amazon Link:", link);
  
  if (link) {
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
