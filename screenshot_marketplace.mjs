import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to login...");
  await page.goto("https://fresh-produce-connect-main.vercel.app/login", { waitUntil: "networkidle2" });
  
  console.log("Clicking Farmer demo profile...");
  await page.evaluate(() => {
     const buttons = Array.from(document.querySelectorAll("button"));
     const farmerBtn = buttons.find(b => b.innerText.includes("Farmer"));
     if (farmerBtn) farmerBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  console.log("Clicking Login...");
  await page.evaluate(() => {
     const buttons = Array.from(document.querySelectorAll("button"));
     const loginBtn = buttons.find(b => b.innerText.includes("Login"));
     if (loginBtn) loginBtn.click();
  });
  
  console.log("Waiting for navigation to dashboard...");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  
  console.log("Navigating to marketplace...");
  await page.goto("https://fresh-produce-connect-main.vercel.app/marketplace", { waitUntil: "networkidle2" });
  
  await page.screenshot({ path: "marketplace_screenshot.png", fullPage: true });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
