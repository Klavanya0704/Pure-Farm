import puppeteer from "puppeteer";
import path from "path";

async function test() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  const fileUrl = `file://${path.resolve("audit.html").replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "networkidle0" });

  await page.screenshot({ path: "audit_screenshot.jpg", fullPage: true, quality: 70 });
  console.log("Screenshot saved to audit_screenshot.jpg");
  await browser.close();
}
test();
