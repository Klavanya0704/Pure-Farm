import time
from playwright.sync_api import sync_playwright

def verify_live_prod():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to LIVE Vercel production site: https://fresh-produce-connect-main.vercel.app/learn")
        page.goto("https://fresh-produce-connect-main.vercel.app/learn", wait_until="networkidle")
        page.wait_for_timeout(3000)

        # Set localStorage language to Telugu
        page.evaluate("localStorage.setItem('purefarm-language', 'te')")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(3000)

        # Take screenshot of course catalog in Telugu
        page.screenshot(path="prod_learn_catalog_telugu.png")
        print("Captured catalog screenshot: prod_learn_catalog_telugu.png")

        # Find first Start Learning button in Telugu ("నేర్చుకోవడం ప్రారంభించండి")
        start_btns = page.locator("button:has-text('నేర్చుకోవడం ప్రారంభించండి')")
        print(f"Found {start_btns.count()} 'Start Learning' buttons in Telugu.")
        
        if start_btns.count() > 0:
            start_btns.first.click()
            page.wait_for_timeout(3000)

            # Take screenshot of open course detail with interactive lesson player in Telugu
            page.screenshot(path="prod_learn_lesson_player_telugu.png")
            print("Captured open lesson player screenshot: prod_learn_lesson_player_telugu.png")

            # Click Lesson 2 in sidebar
            lesson2_btn = page.locator("button:has-text('పాఠం 2')")
            if lesson2_btn.is_visible():
                print("Clicking Lesson 2 in Telugu...")
                lesson2_btn.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="prod_learn_lesson_2_telugu.png")
                print("Captured Lesson 2 screenshot: prod_learn_lesson_2_telugu.png")

        # Test invalid course ID URL on live production
        print("Testing invalid course ID URL on live production...")
        page.goto("https://fresh-produce-connect-main.vercel.app/learn?courseId=invalid-999", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.screenshot(path="prod_learn_invalid_course_telugu.png")
        print("Captured invalid course screenshot: prod_learn_invalid_course_telugu.png")

        browser.close()
        print("Live production verification complete!")

if __name__ == "__main__":
    verify_live_prod()
