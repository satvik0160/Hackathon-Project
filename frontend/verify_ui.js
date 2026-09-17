import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Navigate to login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  // Fill login
  await page.type('input[name="identifier"]', 'test_1724649887718@example.com');
  await page.type('input[name="password"]', 'Password123!');
  
  // Click login
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'debug_dashboard2.png', fullPage: true });
  console.log("Screenshot taken: debug_dashboard2.png");
  
  await browser.close();
})();
