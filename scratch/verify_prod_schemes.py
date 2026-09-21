import sys
import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 960})
        page = await context.new_page()

        print("Navigating to https://fresh-produce-connect-main.vercel.app/schemes...")
        await page.goto("https://fresh-produce-connect-main.vercel.app/schemes", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        art_dir = r"C:\Users\Lavanya\.gemini\antigravity\brain\8ce10d7e-14c7-4ab5-bac4-1e42aafd3bae"
        await page.screenshot(path=f"{art_dir}\\prod_schemes_english.png", full_page=False)

        # Set localStorage to purefarm-language = te
        await page.evaluate("localStorage.setItem('purefarm-language', 'te')")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        await page.screenshot(path=f"{art_dir}\\prod_schemes_telugu.png", full_page=False)
        print("Captured Telugu screenshot successfully")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
