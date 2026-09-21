import asyncio
import subprocess
import time
from playwright.async_api import async_playwright

async def inspect():
    server_process = subprocess.Popen(
        ["npx", "vite", "preview", "--port", "3006"],
        cwd=r"c:\Users\Lavanya\Downloads\fresh-produce-connect-main\fresh-produce-connect-main",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )
    time.sleep(4)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={'width': 1280, 'height': 800})
            page = await context.new_page()

            print("Navigating to http://localhost:3006/machines-tools...")
            await page.goto("http://localhost:3006/machines-tools", wait_until="networkidle")
            await page.screenshot(path="scratch/inspect_machines.png")
            print("Saved scratch/inspect_machines.png")

            # Print all links text and hrefs
            links = await page.eval_on_selector_all("a", "elements => elements.map(e => ({ text: e.innerText, href: e.href }))")
            print(f"Found {len(links)} links:")
            for l in links[:15]:
                print(l)

            # Navigate directly to /machines-tools/list
            print("Navigating to http://localhost:3006/machines-tools/list...")
            await page.goto("http://localhost:3006/machines-tools/list", wait_until="networkidle")
            await page.screenshot(path="scratch/inspect_list.png")
            print("Saved scratch/inspect_list.png")

            await browser.close()
    finally:
        server_process.kill()

if __name__ == "__main__":
    asyncio.run(inspect())
