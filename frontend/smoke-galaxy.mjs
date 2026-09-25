/* Headless smoke test: loads the app, fails on any console error / page error,
   and samples the background canvas to confirm the galaxy layer is painting. */
import puppeteer from 'puppeteer';

const url = process.env.SMOKE_URL || 'http://localhost:4173/';
const failures = [];
const browser = await puppeteer.launch({
  headless: 'true',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});
try {
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    // The SDK's unauthenticated session-refresh probe 401s by design.
    if (/\/api\/auth\/refresh/.test(msg.location?.url || '')) return;
    if (/Failed to load resource.*401/.test(msg.text())) return; // verified pre-existing, see below
    failures.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => failures.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    const u = req.url();
    // Ignore telemetry; anything else failing to load is a real problem.
    if (!/posthog|sentry|telemetry/i.test(u)) failures.push(`requestfailed: ${u}`);
  });
  page.on('response', (res) => {
    if (res.status() === 401 && /\/api\/auth\/refresh/.test(res.url())) {
      console.log(`info: 401 from ${res.url()} (expected when unauthenticated)`);
    } else if (res.status() >= 400) {
      failures.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

  /* The app shows a preloader first; wait up to 20s for the background canvas
     to mount, then give the animation loop a moment to paint. */
  await page.waitForFunction(
    () => document.querySelector('.dv-aurora__canvas'),
    { timeout: 20000 },
  );
  await new Promise((r) => setTimeout(r, 2500)); // let a few animation frames run

  const info = await page.evaluate(() => {
    const canvas = document.querySelector('.dv-aurora__canvas');
    if (!canvas) return { found: false };
    // Sample the canvas centre where the galactic core is drawn.
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const px = ctx.getImageData(Math.floor(width * 0.5), Math.floor(height * 0.44), 1, 1).data;
    // Sample an off-band corner for comparison.
    const px2 = ctx.getImageData(Math.floor(width * 0.04), Math.floor(height * 0.04), 1, 1).data;
    return {
      found: true,
      w: width,
      h: height,
      centre: [px[0], px[1], px[2], px[3]],
      corner: [px2[0], px2[1], px2[2], px2[3]],
    };
  });

  console.log('canvas:', JSON.stringify(info));
  if (!info.found) failures.push('background canvas (.dv-aurora__canvas) not found');
  else if (info.centre[3] === 0) failures.push('canvas centre is fully transparent — galaxy did not paint');
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('SMOKE FAILED:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('SMOKE PASSED: no console/page errors, galaxy layer painting.');
