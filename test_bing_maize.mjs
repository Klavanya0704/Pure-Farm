import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const query = "Hybrid Maize Seed DKC-9108";
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC3`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const results = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("a.iusc")).slice(0, 10);
    return imgs
      .map((img) => {
        try {
          const m = JSON.parse(img.getAttribute("m"));
          return {
            title: m.t || "",
            purl: m.purl || "",
            murl: m.murl || "",
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}
test();
