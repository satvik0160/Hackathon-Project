import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5173/v3', { waitUntil: 'networkidle0' });
  
  // also get bounding boxes of key elements to check layout
  const layouts = await page.evaluate(() => {
     const getBox = (sel) => {
         const el = document.querySelector(sel);
         if (!el) return null;
         const rect = el.getBoundingClientRect();
         return { width: rect.width, height: rect.height, top: rect.top, left: rect.left };
     };
     return {
         hero: getBox('.dv-hero'),
         heroCopy: getBox('.dv-hero-copy'),
         heroStage: getBox('.dv-hero .dv-stage'),
         timeline: getBox('.dv-timeline'),
         problemStage: getBox('.dv-problem .dv-stage'),
     };
  });
  console.log('LAYOUTS:', JSON.stringify(layouts, null, 2));
  
  await page.screenshot({ path: 'v3_preview.png', fullPage: true });
  console.log('Screenshot saved to v3_preview.png');
  
  await browser.close();
})();
