import puppeteer from "puppeteer";

const TARGET_URL = "https://fresh-produce-connect-main.vercel.app";

async function testSidebarClicks() {
  console.log("=== STARTING PUPPETEER E2E SIDEBAR CLICK TEST (FARMER VIEW) ===");
  console.log("Target URL:", TARGET_URL);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log("Step 1: Navigating to Home Page...");
  await page.goto(`${TARGET_URL}/`, { waitUntil: "networkidle2" });

  console.log("Page URL:", page.url());
  console.log("Page Title:", await page.title());

  const farmerSidebarItems = [
    { label: "Home", expectedPath: "/" },
    { label: "Marketplace", expectedPath: "/marketplace" },
    { label: "Market Prices", expectedPath: "/market-prices" },
    { label: "Cold Storage", expectedPath: "/cold-storage" },
    { label: "Schemes", expectedPath: "/schemes" },
    { label: "Crop Insurance", expectedPath: "/crop-insurance" },
    { label: "Weather", expectedPath: "/weather" },
    { label: "Learn", expectedPath: "/learn" },
    { label: "Internships", expectedPath: "/internships" },
    { label: "Crop Calendar", expectedPath: "/crop-calendar" },
    { label: "Notifications", expectedPath: "/notifications" },
    { label: "My Products (Sell)", expectedPath: "/seller" },
    { label: "My Orders", expectedPath: "/order" },
    { label: "My Cart", expectedPath: "/cart" },
    { label: "Browse Catalog", expectedPath: "/marketplace" },
  ];

  const results = [];

  for (const item of farmerSidebarItems) {
    console.log(`\nTesting Click on Sidebar Item: "${item.label}"...`);

    // Ensure we are back on a page with sidebar if needed or click directly
    const elementHandle = await page.evaluateHandle((text) => {
      const links = Array.from(document.querySelectorAll("aside nav a, aside a"));
      return links.find(
        (a) => a.textContent.trim() === text || a.textContent.trim().startsWith(text),
      );
    }, item.label);

    const element = elementHandle.asElement();

    if (!element) {
      console.log(`❌ Element for "${item.label}" NOT FOUND in sidebar!`);
      results.push({
        label: item.label,
        expected: item.expectedPath,
        actual: "NOT FOUND",
        clickStatus: "FAIL",
        refreshStatus: "N/A",
      });
      continue;
    }

    const href = await page.evaluate((el) => el.getAttribute("href"), element);
    console.log(`   Link href: "${href}"`);

    // Perform actual click on sidebar link
    await element.click();
    await page.waitForTimeout(1500);

    let currentUrl = page.url();
    let urlObj = new URL(currentUrl);
    let actualPath = urlObj.pathname;

    const clickPass = actualPath === item.expectedPath;
    console.log(`   Path after click: "${actualPath}" -> ${clickPass ? "PASS ✓" : "FAIL ✗"}`);

    // Test browser refresh on destination
    console.log(`   Refreshing page at "${actualPath}"...`);
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForTimeout(1000);

    const refreshUrl = page.url();
    const refreshPath = new URL(refreshUrl).pathname;
    const refreshPass = refreshPath === item.expectedPath;
    console.log(`   Path after refresh: "${refreshPath}" -> ${refreshPass ? "PASS ✓" : "FAIL ✗"}`);

    results.push({
      label: item.label,
      expected: item.expectedPath,
      actual: actualPath,
      clickStatus: clickPass ? "PASS" : "FAIL",
      refreshStatus: refreshPass ? "PASS" : "FAIL",
    });
  }

  await browser.close();

  console.log("\n================ FARMER SIDEBAR E2E CLICK & REFRESH RESULTS ================");
  console.table(results);
}

testSidebarClicks().catch((err) => {
  console.error("Test Error:", err);
});
