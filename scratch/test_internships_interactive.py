import time
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to http://localhost:8080/internships...")
        page.goto("http://localhost:8080/internships")
        page.wait_for_timeout(2000)

        # 1. Verify Page Title
        title_text = page.locator("h1").first.inner_text()
        print(f"Loaded page title: '{title_text}'")
        assert "Agriculture Internship Hub" in title_text or "వ్యవసాయ ఇంటర్న్షిప్ కేంద్రం" in title_text, "Title should be Agriculture Internship Hub"

        # 2. Check 9 Internship Cards
        apply_btns = page.locator("button:has-text('Apply Now'), button:has-text('ఇప్పుడే దరఖాస్తు చేయండి')")
        print(f"Found {apply_btns.count()} internship cards.")
        assert apply_btns.count() >= 9, f"Expected at least 9 agriculture internships, found {apply_btns.count()}"

        # 3. Test Filter Button (e.g. Agritech)
        agritech_filter = page.locator("button:has-text('Agritech'), button:has-text('అగ్రిటెక్')").first
        if agritech_filter.is_visible():
            print("Clicking Agritech filter...")
            agritech_filter.click()
            page.wait_for_timeout(500)
            filtered_count = page.locator("h3").count()
            print(f"Found {filtered_count} items under Agritech filter.")

            all_filter = page.locator("button:has-text('All Internships'), button:has-text('అన్ని ఇంటర్న్షిప్లు')").first
            all_filter.click()
            page.wait_for_timeout(500)

        # 4. Click 'Apply Now' on first card ('AgriTech Field Operations Intern')
        first_title = page.locator("h3").first.inner_text()
        print(f"Clicking Apply Now for internship: '{first_title}'...")
        apply_btns.first.click()
        page.wait_for_timeout(1000)

        # 5. Check Detail View loaded
        detail_header = page.locator("h1").first.inner_text()
        print(f"Rendered detail header: '{detail_header}'")
        assert first_title in detail_header, "Detail view title should match clicked internship"

        responsibilities_heading = page.locator("text=Key Responsibilities")
        print(f"Key Responsibilities section visible: {responsibilities_heading.is_visible()}")

        # 6. Switch Language to Telugu
        print("Switching site language to Telugu...")
        page.evaluate("localStorage.setItem('purefarm-language', 'te')")
        page.reload()
        page.wait_for_timeout(2000)

        print("Page reloaded in Telugu mode.")

        te_back_btn = page.locator("button:has-text('ఇంటర్న్షిప్లకు తిరిగి వెళ్ళండి')")
        print(f"Telugu back button visible: {te_back_btn.is_visible()}")
        assert te_back_btn.is_visible(), "Expected Telugu back button 'ఇంటర్న్షిప్లకు తిరిగి వెళ్ళండి'"

        # Take screenshot of detail page in Telugu
        page.screenshot(path="scratch/internship_detail_telugu.png")
        print("Saved screenshot: scratch/internship_detail_telugu.png")

        # Click Back button
        te_back_btn.click()
        page.wait_for_timeout(1000)

        # Take screenshot of catalog page in Telugu
        page.screenshot(path="scratch/internship_catalog_telugu.png")
        print("Saved screenshot: scratch/internship_catalog_telugu.png")

        browser.close()
        print("Local interactive Playwright test PASSED successfully!")

if __name__ == "__main__":
    run_test()
