import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERROR_STACK:', error.stack));
  
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.addEventListener('unhandledrejection', event => {
      console.log('UNHANDLED REJECTION:', event.reason?.stack || event.reason);
    });
  });
  
  await page.type('input[name="fullName"]', 'Test User');
  await page.type('input[name="username"]', 'testuser_' + Date.now());
  await page.type('input[name="email"]', 'test_' + Date.now() + '@example.com');
  await page.type('input[name="password"]', 'Password123!');
  await page.type('input[name="confirmPassword"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 6000));
  await browser.close();
})();
