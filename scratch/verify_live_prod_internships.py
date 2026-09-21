import time
from playwright.sync_api import sync_playwright

def verify_live_internships():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to LIVE Vercel production site: https://fresh-produce-connect-main.vercel.app/internships")
        page.goto("https://fresh-produce-connect-main.vercel.app/internships", wait_until="networkidle")
        page.wait_for_timeout(3000)

        # Set localStorage language to Telugu
        page.evaluate("localStorage.setItem('purefarm-language', 'te')")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(3000)

        # Take screenshot of internship catalog in Telugu
        page.screenshot(path="prod_internships_catalog_telugu.png")
        print("Captured live catalog screenshot: prod_internships_catalog_telugu.png")

        # Find first Apply Now button in Telugu ("ఇప్పుడే దరఖాస్తు చేయండి")
        apply_btns = page.locator("button:has-text('ఇప్పుడే దరఖాస్తు చేయండి')")
        print(f"Found {apply_btns.count()} 'Apply Now' buttons in Telugu.")

        if apply_btns.count() > 0:
            print("Clicking Apply Now on first internship card...")
            apply_btns.first.click()
            page.wait_for_timeout(3000)

            # Take screenshot of open internship detail page in Telugu
            page.screenshot(path="prod_internships_detail_telugu.png")
            print("Captured live detail page screenshot: prod_internships_detail_telugu.png")

        browser.close()
        print("Live production verification script finished successfully!")

if __name__ == "__main__":
    verify_live_internships()
