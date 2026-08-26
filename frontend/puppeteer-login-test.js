import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Fill login form
  console.log('Typing identifier...');
  await page.type('input[name="identifier"]', 'testuser@example.com');
  console.log('Typing password...');
  await page.type('input[name="password"]', 'password123');
  
  console.log('Submitting...');
  await page.click('button[type="submit"]');
  
  // Wait a bit to see any toasts
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
})();
