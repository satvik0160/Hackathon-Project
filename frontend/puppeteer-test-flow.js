import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Intercept and print console logs
  page.on('console', msg => {
    if (msg.text().includes('RAW setProfile response') || 
        msg.text().includes('extracted meta') ||
        msg.text().includes('updateProfile returning') ||
        msg.text().includes('completeOnboarding res.data') ||
        msg.text().includes('updated (passed to setUser)') ||
        msg.text().includes('Layout check')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  console.log("Navigating to localhost...");
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Login
  console.log("Logging in...");
  await page.type('input[name="identifier"]', 'test_1724649887718@example.com');
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Wait for Onboarding page
  console.log("Waiting for Onboarding page...");
  await page.waitForSelector('text/What is your Aim?', { timeout: 10000 });

  // Step 1: Aim
  console.log("Step 1...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const dsBtn = btns.find(b => b.textContent.includes('Data Scientist'));
    if (dsBtn) dsBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent === 'Next Step');
    if (nextBtn) nextBtn.click();
  });

  // Step 2: Academic
  console.log("Step 2...");
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent === 'Next Step');
    if (nextBtn) nextBtn.click();
  });

  // Step 3: Experience
  console.log("Step 3...");
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent === 'Next Step');
    if (nextBtn) nextBtn.click();
  });

  // Step 4: Assessment (10 questions)
  console.log("Step 4 (Assessment)...");
  await new Promise(r => setTimeout(r, 2000)); // wait for questions to load
  
  // Start assessment
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent.includes('Start Assessment'));
    if (startBtn) startBtn.click();
  });
  
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => {
      // Click first option
      const options = document.querySelectorAll('.group.relative.w-full.text-left');
      if (options.length > 0) options[0].click();
      
      // Click Next or Finish
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent === 'Next' || b.textContent === 'Finish Assessment');
      if (nextBtn) nextBtn.click();
    });
  }

  // Final Step: Complete Onboarding
  console.log("Finishing Onboarding...");
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const finishBtn = btns.find(b => b.textContent === 'Complete Onboarding' || b.textContent.includes('Dashboard'));
    if (finishBtn) finishBtn.click();
  });

  // Wait for logs to flush and layout redirect to happen
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Test complete.");
  await browser.close();
})();
