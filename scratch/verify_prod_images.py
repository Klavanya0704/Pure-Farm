import asyncio
from playwright.async_api import async_playwright

async def verify_images():
    console_logs = []
    page_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 900})
        page = await context.new_page()

        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("1. Opening /machines-tools on production...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/machines-tools", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Scroll to ensure images load
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(2000)
        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(1000)

        # Take desktop screenshot
        await page.screenshot(path="scratch/prod_machines_updated.png", full_page=True)
        print("Captured scratch/prod_machines_updated.png")

        # Evaluate equipment card images
        cards_info = await page.evaluate('''() => {
            const cards = document.querySelectorAll('.grid > div');
            const results = [];
            cards.forEach(card => {
                const titleEl = card.querySelector('h3');
                const imgEl = card.querySelector('img');
                const catEl = card.querySelector('span');
                if (titleEl && imgEl) {
                    results.push({
                        title: titleEl.innerText.trim(),
                        src: imgEl.src,
                        complete: imgEl.complete,
                        naturalWidth: imgEl.naturalWidth,
                        naturalHeight: imgEl.naturalHeight
                    });
                }
            });
            return results;
        }''')

        print("\n--- EQUIPMENT CARDS IMAGE LOAD STATUS ---")
        for i, card in enumerate(cards_info, 1):
            loaded = card['naturalWidth'] > 0 and card['complete']
            status = "OK" if loaded else "BROKEN"
            print(f"{i}. [{status}] {card['title']}\n   URL: {card['src']}\n   Dimensions: {card['naturalWidth']}x{card['naturalHeight']}\n")

        # Mobile viewport test
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/prod_machines_mobile.png")
        print("Captured scratch/prod_machines_mobile.png")

        await browser.close()

    errors = [l for l in console_logs if "[error]" in l]
    print(f"\nConsole Errors: {len(errors)}")
    if errors:
        for err in errors:
            print(f"  Console Error: {err}")
    else:
        print("Zero console errors!")

if __name__ == "__main__":
    asyncio.run(verify_images())
