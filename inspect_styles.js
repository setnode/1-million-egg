const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: "new"
    });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Evaluate in the context of the page to get computed styles
    const styles = await page.evaluate(() => {
      // Find the main hero container
      // It has classes: mx-auto grid w-full max-w-6xl grid-cols-1 items-center...
      const heroContainer = document.querySelector('.grid-cols-1.max-w-6xl');
      if (!heroContainer) return { error: 'Hero container not found' };

      const computed = window.getComputedStyle(heroContainer);
      
      return {
        computed: {
          display: computed.display,
          gridTemplateColumns: computed.gridTemplateColumns,
          maxWidth: computed.maxWidth,
          marginLeft: computed.marginLeft,
          marginRight: computed.marginRight,
          paddingTop: computed.paddingTop,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          width: computed.width,
        },
        className: heroContainer.className
      };
    });

    console.log(JSON.stringify(styles, null, 2));
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  }
})();
