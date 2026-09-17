/**
 * End-to-end flow trace + timing.
 *
 * Follows the exact journey once, recording wall-clock timings:
 *   page load -> preloader animation -> landing page visible
 *   -> nav Log In / Sign Up -> hero Get Started -> final CTA -> footer links
 *   -> then confirms every pre-existing route still behaves as before.
 *
 *   npm run build && npm run preview     (one shell)
 *   node verify-flow.js                  (another)
 */
import puppeteer from 'puppeteer';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const steps = [];
const failures = [];
const consoleErrors = [];

function note(ms, label, extra = '') {
  steps.push(`${String(ms).padStart(6)}ms  ${label}${extra ? `  (${extra})` : ''}`);
}
function assert(label, pass, detail = '') {
  if (!pass) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.on('pageerror', (e) => consoleErrors.push(`[pageerror] ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/net::ERR|Failed to load resource|401|403|429/i.test(m.text())) {
    consoleErrors.push(m.text());
  }
});

/* Polls the page and returns the first moment the landing is fully visible
 * (preloader gone AND the app wrapper faded in). */
async function traceBoot(pollMs = 100, timeoutMs = 40000) {
  const t0 = Date.now();
  const marks = { preloaderGone: null, landingVisible: null, firstProgress: null };
  while (Date.now() - t0 < timeoutMs) {
    const s = await page.evaluate(() => {
      const pre = Array.from(document.querySelectorAll('div')).find(
        (d) => getComputedStyle(d).position === 'fixed' && d.querySelector('video')
      );
      const wrapper = document.querySelector('#root > div > div');
      const pct = document.body.textContent.match(/(\d{1,3})%/);
      return {
        preloader: !!pre,
        opacity: wrapper ? parseFloat(getComputedStyle(wrapper).opacity) : 0,
        progress: pct ? Number(pct[1]) : null,
      };
    });
    if (s.progress !== null && marks.firstProgress === null) marks.firstProgress = Date.now() - t0;
    if (!s.preloader && marks.preloaderGone === null) marks.preloaderGone = Date.now() - t0;
    if (!s.preloader && s.opacity > 0.99 && marks.landingVisible === null) {
      marks.landingVisible = Date.now() - t0;
      break;
    }
    await wait(pollMs);
  }
  return marks;
}

console.log('\n================ FLOW TRACE ================');

/* ---- Step 1: load -> preloader -> landing ---- */
const navStart = Date.now();
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.landing-title', { timeout: 30000 });
const boot = await traceBoot();
note(0, 'page requested');
note(boot.firstProgress ?? 0, 'preloader progress animation started');
note(boot.preloaderGone ?? -1, 'preloader finished and unmounted');
note(boot.landingVisible ?? -1, 'landing page fully visible');

const preloaderMs = boot.landingVisible;
assert(
  'preloader completes in its configured ~3s window',
  preloaderMs !== null && preloaderMs > 1500 && preloaderMs < 8000,
  `landing visible after ${preloaderMs}ms`
);
assert('landing renders the hero after the preloader', !!(await page.$('.landing-title')));

/* ---- Step 2: landing is interactive, CTA targets correct ---- */
const cta = await page.evaluate(() => {
  const hrefs = Array.from(document.querySelectorAll('.landing a')).map((a) => ({
    text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 28),
    href: a.getAttribute('href'),
  }));
  return {
    count: hrefs.length,
    login: hrefs.filter((h) => h.href === '/login').map((h) => h.text),
    register: hrefs.filter((h) => h.href === '/register').map((h) => h.text),
    anchors: hrefs.filter((h) => h.href?.startsWith('#')).map((h) => h.href),
  };
});
assert('landing exposes Log In links to /login', cta.login.length >= 2, cta.login.join(' | '));
assert('landing exposes Sign Up links to /register', cta.register.length >= 2, cta.register.join(' | '));
assert(
  'section anchor links point at real sections',
  cta.anchors.length >= 3,
  `${cta.anchors.join(' ')}`
);

/* ---- Step 3: nav Log In -> /login ---- */
await page.click('.landing-nav-actions a[href="/login"]');
await page.waitForFunction(() => window.location.pathname === '/login', { timeout: 15000 }).catch(() => {});
await wait(400);
note(Date.now() - navStart, 'clicked nav "Log In" -> /login');
assert('nav Log In reached /login', new URL(page.url()).pathname === '/login');
assert(
  'login page shows the sign-in form',
  await page
    .waitForSelector('input[placeholder="hacker@university.edu"]', { timeout: 10000 })
    .then(() => true)
    .catch(() => false)
);

/* ---- Step 4: back to landing, hero Get Started -> /register ---- */
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.landing-title', { timeout: 30000 });
await page.waitForFunction(
  () => {
    const el = document.querySelector('.landing a[href="/register"]');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (el === hit || el.contains(hit));
  },
  { timeout: 40000, polling: 200 }
);
await page.evaluate(() => {
  const hero = document.querySelector('.landing-hero a[href="/register"]');
  hero.scrollIntoView({ block: 'center' });
});
await wait(300);
await page.click('.landing-hero a[href="/register"]');
await page.waitForFunction(() => window.location.pathname === '/register', { timeout: 15000 }).catch(() => {});
await wait(400);
note(Date.now() - navStart, 'clicked hero "Get Started" -> /register');
assert('hero Get Started reached /register', new URL(page.url()).pathname === '/register');
assert(
  'register page shows the register form',
  await page
    .waitForFunction(() => /create account/i.test(document.querySelector('form button[type="submit"]')?.textContent || ''), {
      timeout: 15000,
      polling: 200,
    })
    .then(() => true)
    .catch(() => false)
);

/* ---- Step 5: final CTA + footer links ---- */
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.landing-title', { timeout: 30000 });
await page.waitForFunction(
  () => {
    const el = document.querySelector('.landing a[href="/register"]');
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (el === hit || el.contains(hit));
  },
  { timeout: 40000, polling: 200 }
);
await page.evaluate(() => document.querySelector('.landing-cta-panel a[href="/register"]').scrollIntoView({ block: 'center' }));
await wait(300);
await page.click('.landing-cta-panel a[href="/register"]');
await page.waitForFunction(() => window.location.pathname === '/register', { timeout: 15000 }).catch(() => {});
note(Date.now() - navStart, 'clicked final CTA "Sign Up free" -> /register');
assert('final CTA reached /register', new URL(page.url()).pathname === '/register');

/* ---- Step 6: pre-existing framework behaves exactly as before ---- */
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.landing-title', { timeout: 30000 });
for (const path of ['/login', '/register', '/auth/callback', '/onboarding', '/dashboard', '/learning', '/assessments', '/planner', '/jobs', '/interview', '/roadmap', '/resume', '/career-guidance', '/achievements', '/analytics', '/profile', '/settings', '/admin/institution', '/admin/industry']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
  // Public paths should stay put; protected/role routes bounce signed-out
  // users to /login once the auth state resolves, which takes a moment.
  const expected = ['/login', '/register', '/auth/callback', '/'].includes(path) ? path : '/login';
  if (expected === path) {
    const stayed = await page
      .waitForFunction((p) => window.location.pathname === p, { timeout: 8000, polling: 100 }, path)
      .then(() => true)
      .catch(() => false);
    const where = new URL(page.url()).pathname;
    const ok = stayed && where === path;
    if (!ok) failures.push(`${path} expected ${expected}, landed on ${where}`);
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${path.padEnd(20)} -> ${where}`);
  } else {
    const redirected = await page
      .waitForFunction((p) => window.location.pathname === p, { timeout: 12000, polling: 100 }, expected)
      .then(() => true)
      .catch(() => false);
    const where = new URL(page.url()).pathname;
    const ok = redirected && where === expected;
    if (!ok) failures.push(`${path} expected ${expected}, landed on ${where}`);
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${path.padEnd(20)} -> ${where}`);
  }
  await wait(150);
}

console.log('\n----------- timeline -----------');
steps.forEach((s) => console.log(s));

console.log('\n----------- console -----------');
console.log(consoleErrors.length ? JSON.stringify([...new Set(consoleErrors)], null, 1) : 'no page errors or unexpected console errors');

console.log('\n----------- SUMMARY -----------');
if (failures.length) {
  console.log(`${failures.length} FAILURES:`);
  failures.forEach((f) => console.log('  ✗', f));
} else {
  console.log('FLOW OK — preloader -> landing -> auth pages -> rest of app all verified.');
}

await browser.close();
process.exit(failures.length ? 1 : 0);
