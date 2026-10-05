const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  await page.goto('http://localhost:5173/ai/resume');
  
  // Wait for the "AI Resume Analyzer" card to be clickable and click it
  await page.waitForFunction(() => {
    const els = Array.from(document.querySelectorAll('h3'));
    const el = els.find(e => e.textContent.includes('AI Resume Analyzer'));
    if (el) {
      el.click();
      return true;
    }
    return false;
  });
  
  // Wait for file input
  await page.waitForSelector('input[type="file"]');
  const fileInput = await page.$('input[type="file"]');
  
  console.log('Uploading file...');
  await fileInput.uploadFile('../Sandy_Singh_Resume.pdf');
  
  // Wait for a bit to see console logs
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
})();
