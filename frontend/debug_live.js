import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log("Navigating to https://6vjqpi3p.insforge.site ...");
  await page.goto('https://6vjqpi3p.insforge.site', { waitUntil: 'networkidle2' });
  
  await browser.close();
})();
