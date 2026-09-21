import asyncio
import subprocess
import time
from playwright.async_api import async_playwright
import os

async def run_test():
    console_logs = []
    page_errors = []

    # Start preview server
    server_process = subprocess.Popen(
        ["npx", "vite", "preview", "--port", "3005"],
        cwd=r"c:\Users\Lavanya\Downloads\fresh-produce-connect-main\fresh-produce-connect-main",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )
    time.sleep(3)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={'width': 1280, 'height': 800})
            page = await context.new_page()

            page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
            page.on("pageerror", lambda err: page_errors.append(str(err)))

            print("1. Navigating to http://localhost:3005/machines-tools...")
            await page.goto("http://localhost:3005/machines-tools", wait_until="networkidle")
            await page.wait_for_timeout(1000)

            print("2. Clicking 'List for Rent' link/button...")
            list_btn = page.locator("a[href*='machines-tools/list'], :text('List for Rent')").first
            await list_btn.click()
            await page.wait_for_timeout(1000)

            print(f"Current URL: {page.url}")
            assert "/machines-tools/list" in page.url, f"Expected URL to contain /machines-tools/list, got {page.url}"

            await page.screenshot(path="scratch/form_loaded.png", full_page=True)
            print("Captured scratch/form_loaded.png")

            # 4. Refresh /machines-tools/list
            print("4. Refreshing /machines-tools/list...")
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(1000)
            await page.screenshot(path="scratch/form_refreshed.png", full_page=True)
            print("Captured scratch/form_refreshed.png")

            # 6. Browser Back
            print("6. Navigating back...")
            await page.go_back(wait_until="networkidle")
            await page.wait_for_timeout(1000)
            print(f"URL after back: {page.url}")

            # 8. Click List for Rent again
            print("8. Clicking 'List for Rent' button again...")
            list_btn = page.locator("a[href*='machines-tools/list'], :text('List for Rent')").first
            await list_btn.click()
            await page.wait_for_timeout(1000)

            # 10. Fill out form and submit
            print("10. Filling out machine listing form...")
            await page.fill("input[placeholder*='Mahindra']", "John Deere 5050D Tractor (50 HP)")
            await page.fill("input[placeholder*='500']", "650")
            await page.fill("input[placeholder*='45 HP']", "50 HP, Dual PTO, Oil Immersed Brakes")
            await page.fill("input[placeholder*='Ramesh']", "Srinivas Farmer")
            await page.fill("input[placeholder='9876543210']", "9849011223")

            print("Submitting form...")
            submit_btn = page.locator("button[type='submit']:has-text('List for Rent')")
            await submit_btn.click()
            await page.wait_for_timeout(2000)

            print(f"URL after submit: {page.url}")
            await page.screenshot(path="scratch/after_submit.png", full_page=True)
            print("Captured scratch/after_submit.png")

            # 11. Mobile test
            print("11. Testing mobile viewport for /machines-tools/list...")
            await page.goto("http://localhost:3005/machines-tools/list", wait_until="networkidle")
            await page.set_viewport_size({'width': 375, 'height': 812})
            await page.wait_for_timeout(1000)
            await page.screenshot(path="scratch/form_mobile.png")
            print("Captured scratch/form_mobile.png")

            await browser.close()

    finally:
        server_process.kill()

    print("\n--- CONSOLE LOGS ---")
    for log in console_logs[-10:]:
        print(log)

    print("\n--- PAGE ERRORS ---")
    print(page_errors)

if __name__ == "__main__":
    asyncio.run(run_test())
