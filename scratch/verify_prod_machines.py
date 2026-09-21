import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        print("Navigating to https://fresh-produce-connect-main.vercel.app/machines-tools...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/machines-tools", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Screenshot English desktop
        await page.screenshot(path="scratch/prod_machines_english.png", full_page=True)
        print("Captured scratch/prod_machines_english.png")

        # Click Telugu language switcher if present
        telugu_btn = page.locator("button:has-text('తెలుగు')")
        if await telugu_btn.count() > 0:
            await telugu_btn.first.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path="scratch/prod_machines_telugu.png", full_page=True)
            print("Captured scratch/prod_machines_telugu.png")

        # Test mobile viewport
        await page.set_viewport_size({'width': 375, 'height': 812})
        await page.wait_for_timeout(1000)
        await page.screenshot(path="scratch/prod_machines_mobile.png")
        print("Captured scratch/prod_machines_mobile.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
