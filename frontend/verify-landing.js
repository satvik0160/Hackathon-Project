/**
 * Landing page verification.
 *
 * Run against the built preview server:
 *   npm run build && npm run preview   (in one shell)
 *   node verify-landing.js             (in another)
 *
 * Checks: console/page errors, routing into the existing auth pages,
 * sticky nav, no horizontal overflow, zigzag stacking at three
 * breakpoints, and that scroll-reveal content is never left hidden.
 */
import puppeteer from 'puppeteer';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const VIEWPORTS = [
  { name: 'mobile 375', width: 375, height: 812 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'desktop 1440', width: 1440, height: 900 },
];

const results = [];
const problems = [];
const consoleNoise = { error: [], warning: [] };

function record(label, pass, detail = '') {
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) problems.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForLanding(page) {
  // The preloader renders on every full page load (~8s) as a fixed inset-0
  // overlay on top of the app, so wait until the nav CTA is genuinely
  // hit-testable at its centre point — that is what a real user click does.
  await page.waitForSelector('.landing-title', { timeout: 30000 });
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.landing-nav-actions a[href="/register"]');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const el2 = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!el2 && (el2 === el || el.contains(el2));
    },
    { timeout: 30000, polling: 200 }
  );
  await wait(200);
}

async function gotoLanding(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await waitForLanding(page);
}

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
page.on('console', (msg) => {
  const type = msg.type();
  if (type === 'error') consoleNoise.error.push(msg.text());
  if (type === 'warning') consoleNoise.warning.push(msg.text());
});
page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => {
  const url = req.url();
  // Ignore the app's backend/API calls — no local backend is running here.
  if (url.startsWith(BASE)) {
    consoleNoise.error.push(`[requestfailed] ${req.failure()?.errorText} ${url}`);
  }
});

/* ---------------- 1. Routing into existing auth pages ---------------- */
await gotoLanding(page);

const navHrefs = await page.$$eval('.landing-nav-actions a', (as) =>
  as.map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') }))
);
const loginLink = navHrefs.find((l) => l.text === 'Log In');
const signupLink = navHrefs.find((l) => l.text.startsWith('Sign Up'));
record('nav Log In points at existing /login route', loginLink?.href === '/login', JSON.stringify(loginLink));
record('nav Sign Up points at existing /register route', signupLink?.href === '/register', JSON.stringify(signupLink));

// Click Log In -> should land on the real auth page with the sign-in form.
await page.click('.landing-nav-actions a[href="/login"]');
await wait(500);
await page.waitForFunction(() => window.location.pathname === '/login', { timeout: 10000 }).catch(() => {});
const loginUrl = new URL(page.url()).pathname;
const loginFormOk = await page
  .waitForSelector('input[placeholder="hacker@university.edu"]', { timeout: 10000 })
  .then(() => true)
  .catch(() => false);
record('Log In click navigates to /login (no 404)', loginUrl === '/login', `pathname=${loginUrl}`);
record('login page renders its form', loginFormOk);

// Back to landing, then Sign Up.
await gotoLanding(page);
await page.click('.landing-nav-actions a[href="/register"]');
await page.waitForFunction(() => window.location.pathname === '/register', { timeout: 10000 }).catch(() => {});
const registerUrl = new URL(page.url()).pathname;
const registerFormOk = await page
  .waitForFunction(
    () => {
      const btn = document.querySelector('form button[type="submit"]');
      return !!btn && /create account/i.test(btn.textContent || '');
    },
    { timeout: 15000, polling: 200 }
  )
  .then(() => true)
  .catch(() => false);
record('Sign Up click navigates to /register (no 404)', registerUrl === '/register', `pathname=${registerUrl}`);
record('register page renders the register form (not the login form)', registerFormOk);

/* ---------------- 2. Smoke-check existing protected routes ---------------- */
for (const path of ['/dashboard', '/assessments', '/jobs', '/roadmap', '/interview', '/resume']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
  await wait(300);
  const where = new URL(page.url()).pathname;
  const redirected = where === '/login';
  record(`${path} still guarded (redirects to /login when signed out)`, redirected, `landed on ${where}`);
}

/* ---------------- 3. Catch-all fallback ---------------- */
await page.goto(`${BASE}/some/unknown/path`, { waitUntil: 'networkidle2' });
await wait(500);
const catchAll = new URL(page.url()).pathname;
record('unknown path falls back to /', catchAll === '/', `landed on ${catchAll}`);

/* ---------------- 4. Per-breakpoint layout checks ---------------- */
for (const vp of VIEWPORTS) {
  await page.setViewport({ width: vp.width, height: vp.height });
  await gotoLanding(page);

  // No horizontal overflow.
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      overs: de.scrollWidth - de.clientWidth,
    };
  });
  record(`${vp.name}: no horizontal overflow`, overflow.overs <= 1, `scrollWidth=${overflow.scrollWidth} client=${overflow.clientWidth}`);

  // Hero headline actually renders large (design-system h1 rule must not win).
  const titleSize = await page.$eval('.landing-title', (el) => parseFloat(getComputedStyle(el).fontSize));
  const minTitle = vp.width < 500 ? 30 : vp.width < 900 ? 36 : 48;
  record(`${vp.name}: hero headline scales up`, titleSize >= minTitle, `${titleSize}px (min ${minTitle}px)`);

  // Nav visible at rest.
  const navAtRest = await page.$eval('.landing-nav', (el) => el.getBoundingClientRect().top);
  record(`${vp.name}: nav visible at top of page`, Math.abs(navAtRest) < 2, `top=${navAtRest}`);

  // Zigzag stacking: single column on mobile/tablet, two columns on desktop.
  const layout = await page.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('.landing-feature-grid'));
    return grids.map((grid, i) => {
      const t = grid.querySelector('.landing-feature-text').getBoundingClientRect();
      const v = grid.querySelector('.landing-feature-visual').getBoundingClientRect();
      const reversed = grid.classList.contains('is-reversed');
      return {
        i,
        reversed,
        textTop: Math.round(t.top + window.scrollY),
        textBottom: Math.round(t.bottom + window.scrollY),
        textLeft: Math.round(t.left),
        textRight: Math.round(t.right),
        visualTop: Math.round(v.top + window.scrollY),
        visualLeft: Math.round(v.left),
        visualRight: Math.round(v.right),
        visualWidth: Math.round(v.width),
        textWidth: Math.round(t.width),
        overlap: t.bottom > v.top + 1 && t.left < v.right - 1 && v.left < t.right - 1,
      };
    });
  });

  const stacked = vp.width < 900;
  layout.forEach((row) => {
    record(
      `${vp.name}: feature ${row.i + 1} text/visual do not overlap`,
      !row.overlap,
      `text=${row.textBottom} visualTop=${row.visualTop}`
    );
    if (stacked) {
      record(
        `${vp.name}: feature ${row.i + 1} stacks vertically (text above visual)`,
        row.textBottom <= row.visualTop + 1,
        `textBottom=${row.textBottom} visualTop=${row.visualTop}`
      );
    } else if (row.reversed) {
      record(
        `${vp.name}: feature ${row.i + 1} zigzag (visual on the left)`,
        row.visualLeft < row.textLeft,
        `visualLeft=${row.visualLeft} textLeft=${row.textLeft}`
      );
    } else {
      record(
        `${vp.name}: feature ${row.i + 1} zigzag (visual on the right)`,
        row.textLeft < row.visualLeft,
        `textLeft=${row.textLeft} visualLeft=${row.visualLeft}`
      );
    }
  });

  // Scroll-reveal must not leave content hidden: jump straight to the bottom.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(900);
  const hiddenCount = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.landing-feature-text, .landing-card, .landing-cta-panel')).filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.95
    ).length
  );
  record(`${vp.name}: no content left hidden after fast scroll`, hiddenCount === 0, `${hiddenCount} faded elements`);

  // Sticky nav: after scrolling, the bar must still be pinned and blurred.
  await page.evaluate(() => window.scrollTo(0, 1400));
  await wait(400);
  const nav = await page.evaluate(() => {
    const el = document.querySelector('.landing-nav');
    const cs = getComputedStyle(el);
    return {
      top: el.getBoundingClientRect().top,
      scrolled: el.classList.contains('is-scrolled'),
      blur: cs.backdropFilter || cs.webkitBackdropFilter,
    };
  });
  record(`${vp.name}: nav stays pinned on scroll`, Math.abs(nav.top) < 2, `top=${nav.top}`);
  record(`${vp.name}: nav gains blur once scrolled`, nav.scrolled && /blur/.test(nav.blur), `scrolled=${nav.scrolled} blur=${nav.blur}`);

  // Reveal must not re-trigger/flicker when scrolling back up.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await wait(600);
  const revealedAfterUp = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.landing-feature-text')).every(
      (el) => parseFloat(getComputedStyle(el.parentElement).opacity) > 0.95
    )
  );
  record(`${vp.name}: reveals do not flicker on scroll-up`, revealedAfterUp);

  // Hero visual must be a real inline SVG, never a broken image.
  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  );
  record(`${vp.name}: no broken images`, brokenImages.length === 0, brokenImages.join(', '));
}

/* ---------------- 5. Console cleanliness ---------------- */
const ignorable = (text) =>
  /net::ERR|Failed to load resource|getCurrentUser|AuthContext|429|401|403|CORS/i.test(text);

const realErrors = consoleNoise.error.filter((t) => !ignorable(t));
record('no unexpected console errors on the landing page', realErrors.length === 0, realErrors.slice(0, 5).join(' | '));

console.log('\n================ LANDING VERIFICATION ================');
results.forEach((r) => console.log(r));

console.log('\n---------------- console noise (filtered) ----------------');
console.log(`errors: ${consoleNoise.error.length}, warnings: ${consoleNoise.warning.length}`);
console.log('errors  :', JSON.stringify([...new Set(consoleNoise.error)].slice(0, 8), null, 0));
console.log('warnings:', JSON.stringify([...new Set(consoleNoise.warning)].slice(0, 8), null, 0));

console.log('\n---------------- SUMMARY ----------------');
console.log(`${results.filter((r) => r.startsWith('PASS')).length} passed, ${problems.length} failed`);
if (problems.length) {
  console.log('PROBLEMS:');
  problems.forEach((p) => console.log('  ✗', p));
}

await browser.close();
process.exit(problems.length ? 1 : 0);
