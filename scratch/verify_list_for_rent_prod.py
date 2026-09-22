import asyncio
from playwright.async_api import async_playwright

async def verify_prod():
    console_logs = []
    page_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("1. Opening /machines-tools on production...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/machines-tools", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # 2. Click "List for Rent"
        print("2. Clicking 'List for Rent' button...")
        list_btn = page.locator("a[href*='machines-tools/list']").first
        await list_btn.click()
        await page.wait_for_timeout(2000)

        # 3. Verify the form actually opens
        print(f"3. Verified URL: {page.url}")
        assert "/machines-tools/list" in page.url, f"Failed URL check: {page.url}"
        await page.screenshot(path="scratch/prod_form_opened.png", full_page=True)
        print("Captured scratch/prod_form_opened.png")

        # 4. Refresh /machines-tools/list
        print("4. Refreshing /machines-tools/list...")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)
        assert "/machines-tools/list" in page.url, f"Failed reload URL check: {page.url}"
        await page.screenshot(path="scratch/prod_form_refreshed.png", full_page=True)
        print("5. Verified page reloaded cleanly! Captured scratch/prod_form_refreshed.png")

        # Fill and submit new listing
        print("Filling out machinery rental form...")
        await page.fill("input[placeholder*='Mahindra']", "Swaraj 855 FE Tractor (52 HP)")
        await page.fill("input[placeholder*='500']", "550")
        await page.fill("input[placeholder*='45 HP']", "52 HP, 3-Cylinder Diesel Engine, Power Steering")
        await page.fill("input[placeholder*='Ramesh']", "Venkateswara Rao")
        await page.fill("input[placeholder='9876543210']", "9848099887")

        print("Submitting machine listing...")
        submit_btn = page.locator("button[type='submit']:has-text('List for Rent')")
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        print(f"Redirected after submit to: {page.url}")
        await page.screenshot(path="scratch/prod_machines_updated.png", full_page=True)
        print("Captured scratch/prod_machines_updated.png")

        # 6. Use browser Back
        print("6. Navigating to /machines-tools/list again...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/machines-tools/list", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        print("Navigating back to /machines-tools...")
        await page.go_back(wait_until="networkidle")
        await page.wait_for_timeout(1000)
        print(f"7. Returned to URL: {page.url}")

        # 10. Test Mobile Viewport
        print("10. Testing mobile viewport for /machines-tools/list...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/machines-tools/list", wait_until="networkidle")
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/prod_form_mobile.png")
        print("Captured scratch/prod_form_mobile.png")

        await browser.close()

    print("\n9. Console errors check:")
    errors = [l for l in console_logs if "[error]" in l]
    print(f"Errors found: {len(errors)}")
    if errors:
        for err in errors:
            print(f"  Console Error: {err}")
    else:
        print("Zero console errors!")
    
    print(f"Page errors: {page_errors}")

if __name__ == "__main__":
    asyncio.run(verify_prod())
