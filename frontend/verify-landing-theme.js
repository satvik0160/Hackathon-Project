/**
 * Landing page theme + contrast verification.
 *
 * Loads the landing page twice (dark and light, via the app's own
 * `devastra-theme` localStorage key) and computes WCAG contrast ratios for the
 * text the user actually has to read, resolving each element's real painted
 * background by walking up the DOM for the first opaque ancestor.
 *
 *   node verify-landing-theme.js
 */
import puppeteer from 'puppeteer';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1280, height: 900 },
});

const problems = [];

async function analyse(theme) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((t) => {
    localStorage.setItem('devastra-theme', t);
  }, theme);

  await page.bringToFront();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.landing-title', { timeout: 30000 });

  // Wait for the app's ThemeProvider to apply the requested theme. The
  // preloader overlay is irrelevant here — every value measured below is a
  // computed style, which the overlay cannot change.
  await page
    .waitForFunction(
      (t) => document.documentElement.getAttribute('data-theme') === t,
      { timeout: 20000, polling: 200 },
      theme
    )
    .catch(() => {});
  await wait(1500);

  // Scroll through the whole page so every section has painted.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await wait(600);

  const data = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((v) => parseFloat(v));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    /* Composite `fg` over `bg` keeping real alpha, so a stack of translucent
     * surfaces (e.g. rgba(255,255,255,.03) over .05 over the page) resolves to
     * the colour actually painted instead of collapsing to white. */
    const over = (fg, bg) => {
      const a = fg.a + bg.a * (1 - fg.a);
      if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
      return {
        r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
        g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
        b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
        a,
      };
    };
    const lum = ({ r, g, b }) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const l1 = lum(a);
      const l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    /** Approximate a gradient background by averaging its colour stops.
     *  backgroundColor is transparent for gradient fills, so without this
     *  a gradient button reads as "text on the page background". */
    const gradientAvg = (bgImage) => {
      if (!bgImage || !bgImage.includes('gradient')) return null;
      const hits = bgImage.match(/rgba?\([^)]+\)/g) || [];
      const cols = hits.map(parse).filter(Boolean);
      if (!cols.length) return null;
      const opaque = cols.filter((c) => c.a > 0.5);
      const use = opaque.length ? opaque : cols;
      const avg = use.reduce((a, c) => ({ r: a.r + c.r / use.length, g: a.g + c.g / use.length, b: a.b + c.b / use.length }), { r: 0, g: 0, b: 0 });
      return { ...avg, a: 1 };
    };

    const bgOf = (el) => {
      let node = el;
      let acc = null;
      while (node && node !== document.documentElement.parentNode) {
        const cs = getComputedStyle(node);
        const grad = gradientAvg(cs.backgroundImage);
        if (grad) {
          return acc ? over(acc, grad) : grad;
        }
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) {
          acc = acc ? over(acc, c) : c;
          if (acc.a >= 0.999) return acc;
        }
        node = node.parentElement;
      }
      return acc || { r: 255, g: 255, b: 255, a: 1 };
    };

    const samples = [
      ['.landing-title', 'hero headline'],
      ['.landing-lede', 'hero supporting line'],
      ['.landing-body', 'section body copy'],
      ['.landing-eyebrow', 'eyebrow label'],
      ['.landing-nav-link', 'nav section link'],
      ['.landing-mock-meta', 'card meta text'],
      ['.landing-mock-title', 'card title'],
      ['.landing-feature-index', 'feature index label'],
      ['.landing-score', 'match score text'],
      ['.landing-chip', 'info chip'],
      ['.landing-feature-list li', 'feature bullet'],
      ['.landing-footer-link', 'footer link'],
      ['.landing-btn-primary', 'primary CTA label'],
      ['.landing-btn-outline', 'outline CTA label'],
    ];

    const out = samples.map(([sel, label]) => {
      const el = document.querySelector(sel);
      if (!el) return { label, sel, missing: true };
      const cs = getComputedStyle(el);
      const fgRaw = parse(cs.color);
      const bg = bgOf(el);
      const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      return {
        label,
        sel,
        size: Math.round(size * 10) / 10,
        ratio: Math.round(ratio(fg, bg) * 100) / 100,
        required: large ? 3 : 4.5,
      };
    });

    const rootBg = parse(getComputedStyle(document.querySelector('.landing')).backgroundColor);
    const navBg = parse(getComputedStyle(document.querySelector('.landing-nav.is-scrolled') || document.querySelector('.landing-nav')).backgroundColor);
    const de = document.documentElement;

    return {
      samples: out,
      rootBg: rootBg ? `rgba(${Math.round(rootBg.r)},${Math.round(rootBg.g)},${Math.round(rootBg.b)},${rootBg.a})` : null,
      navBg: navBg ? `rgba(${Math.round(navBg.r)},${Math.round(navBg.g)},${Math.round(navBg.b)},${navBg.a})` : null,
      theme: de.getAttribute('data-theme'),
      overs: de.scrollWidth - de.clientWidth,
    };
  });

  await page.close();
  return data;
}

for (const theme of ['dark', 'light']) {
  const r = await analyse(theme);
  console.log(`\n================ THEME: ${theme} ================`);
  console.log(`data-theme="${r.theme}"  root bg: ${r.rootBg}  nav bg: ${r.navBg}`);
  console.log(`horizontal overflow: ${r.overs <= 1 ? 'none' : `${r.overs}px`}`);

  if (r.theme !== theme) problems.push(`${theme}: ThemeContext did not apply data-theme="${theme}"`);
  if (r.overs > 1) problems.push(`${theme}: horizontal overflow of ${r.overs}px`);

  for (const s of r.samples) {
    if (s.missing) {
      problems.push(`${theme}: ${s.label} (${s.sel}) not found`);
      console.log(`  MISSING  ${s.label}`);
      continue;
    }
    const ok = s.ratio >= s.required;
    if (!ok) problems.push(`${theme}: ${s.label} contrast ${s.ratio}:1 (needs ${s.required}:1)`);
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${s.label.padEnd(24)} ${String(s.ratio).padStart(6)}:1  need ${s.required}:1  (${s.size}px)`
    );
  }
}

console.log('\n================ THEME SUMMARY ================');
if (problems.length === 0) {
  console.log('PASS — dark and light both render with AA-contrast text and no overflow.');
} else {
  console.log('PROBLEMS:');
  problems.forEach((p) => console.log('  ✗', p));
}

await browser.close();
process.exit(problems.length ? 1 : 0);
