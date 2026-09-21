import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to http://localhost:8080/learn...")
        page.goto("http://localhost:8080/learn")
        page.wait_for_timeout(2000)

        # 1. Verify 12 cards present
        cards = page.locator("button:has-text('Start Learning')")
        print(f"Found {cards.count()} 'Start Learning' buttons.")
        assert cards.count() >= 12, "Expected at least 12 course cards with Start Learning buttons"

        # 2. Click 'Start Learning' on first course
        first_card_title = page.locator("h3").first.inner_text()
        print(f"Clicking Start Learning on course: '{first_card_title}'...")
        cards.first.click()
        page.wait_for_timeout(1000)

        # 3. Check course details view rendered
        header_title = page.locator("h1").first.inner_text()
        print(f"Rendered course header title: '{header_title}'")
        assert first_card_title in header_title, "Course detail title should match clicked course"

        # Check lessons sidebar
        lesson_sidebar_buttons = page.locator("button:has-text('Lesson 1'), button:has-text('Lesson 2'), button:has-text('Lesson 3'), button:has-text('Lesson 4')")
        print(f"Found {lesson_sidebar_buttons.count()} lesson buttons in sidebar.")
        assert lesson_sidebar_buttons.count() == 4, f"Expected 4 lesson buttons, found {lesson_sidebar_buttons.count()}"

        # 4. Click Lesson 2
        print("Clicking Lesson 2...")
        lesson_sidebar_buttons.nth(1).click()
        page.wait_for_timeout(500)
        
        # Check active lesson title
        active_lesson_heading = page.locator("h2").inner_text()
        print(f"Active lesson heading: '{active_lesson_heading}'")

        # 5. Mark lesson as complete
        mark_complete_btn = page.locator("button:has-text('Mark as Complete')")
        if mark_complete_btn.count() > 0:
            print("Clicking 'Mark as Complete'...")
            mark_complete_btn.click()
            page.wait_for_timeout(500)
            
            progress_text = page.locator("text=% completed").first.inner_text()
            print(f"Updated progress text: {progress_text}")
            assert "25%" in progress_text, f"Expected 25% completed, got {progress_text}"

        # 6. Switch language to Telugu
        print("Switching language to Telugu (తెలుగు)...")
        lang_btn = page.locator("button:has-text('EN'), button:has-text('English'), button:has-text('తెలుగు')").first
        if lang_btn.is_visible():
            lang_btn.click()
            page.wait_for_timeout(300)
            te_option = page.locator("text=తెలుగు")
            if te_option.is_visible():
                te_option.click()
                page.wait_for_timeout(1000)

        te_back_btn = page.locator("button:has-text('అభ్యాస కేంద్రానికి తిరిగి వెళ్ళండి')")
        print(f"Telugu back button visible: {te_back_btn.is_visible()}")
        assert te_back_btn.is_visible(), "Expected Telugu back button 'అభ్యాస కేంద్రానికి తిరిగి వెళ్ళండి'"

        # Screenshot course detail in Telugu
        page.screenshot(path="scratch/learn_interactive_telugu.png")
        print("Saved screenshot to scratch/learn_interactive_telugu.png")

        # 7. Test Invalid Course ID
        page.goto("http://localhost:8080/learn?courseId=invalid-course-xyz")
        page.wait_for_timeout(1000)
        not_found_text = page.locator("h2").inner_text()
        print(f"Invalid course heading: '{not_found_text}'")
        assert "Course Not Found" in not_found_text or "కోర్సు కనుగొనబడలేదు" in not_found_text, "Expected Course Not Found header"

        page.screenshot(path="scratch/learn_invalid_course.png")
        print("Saved invalid course screenshot to scratch/learn_invalid_course.png")

        browser.close()
        print("Test passed successfully!")

if __name__ == "__main__":
    run()
