import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER_LOG:', msg.type(), msg.text());
  });
  
  page.on('pageerror', err => {
    console.log('BROWSER_ERROR:', err.message);
  });

  try {
    console.log('Navigating to live site...');
    await page.goto('https://6vjqpi3p.insforge.site/', { waitUntil: 'networkidle0' });
    console.log('Page loaded!');
    
    // Check if we are redirected to /login
    console.log('Current URL:', page.url());
    
  } catch (e) {
    console.error('Script Error:', e);
  } finally {
    await browser.close();
  }
})();
