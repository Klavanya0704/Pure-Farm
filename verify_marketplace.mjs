import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("https://fresh-produce-connect-main.vercel.app/marketplace", { waitUntil: "networkidle2" });
  
  const metrics = await page.evaluate(() => {
     const cards = document.querySelectorAll("article.group");
     if (cards.length === 0) return { error: "No cards found" };
     
     const firstCard = cards[0];
     const rect = firstCard.getBoundingClientRect();
     
     const grid = firstCard.parentElement;
     const gridStyles = window.getComputedStyle(grid);
     
     // Find the gap
     let gap = gridStyles.gap;
     
     // Find how many cards in a row
     let cardsInRow = 1;
     for (let i = 1; i < cards.length; i++) {
        if (cards[i].getBoundingClientRect().top === rect.top) {
           cardsInRow++;
        } else {
           break;
        }
     }
     
     const img = firstCard.querySelector("img");
     let imgAspect = null;
     if (img) {
       const imgRect = img.getBoundingClientRect();
       imgAspect = imgRect.width / imgRect.height;
     }
     
     const button = firstCard.querySelector("button.bg-\\[\\#145A43\\]") || firstCard.querySelector("button:last-child");
     let buttonText = button ? button.innerText : null;
     let buttonWidth = button ? button.getBoundingClientRect().width : null;
     let isButtonFullWidth = buttonWidth ? (buttonWidth >= rect.width * 0.9) : false;

     return {
       cardCount: cards.length,
       firstCardRect: { width: rect.width, height: rect.height },
       gridDisplay: gridStyles.display,
       gridTemplateColumns: gridStyles.gridTemplateColumns,
       gap: gap,
       cardsInRow: cardsInRow,
       imgAspect: imgAspect,
       buttonText: buttonText,
       isButtonFullWidth: isButtonFullWidth,
       images: Array.from(cards).slice(0, 5).map(c => c.querySelector("img")?.src)
     };
  });
  
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
