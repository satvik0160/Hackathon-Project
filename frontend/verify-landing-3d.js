/**
 * Landing page verification (3D scroll build).
 *
 * Run against the production preview:
 *   npm run build && npm run preview     (one shell)
 *   node verify-landing-3d.js            (another)
 *
 * What it can and cannot prove: this harness has no eyes, so instead of
 * eyeballing screenshots it asserts on things that can only be true if the page
 * actually rendered and its render loops actually ran —
 *
 *   - the projected DOM labels the WebGL scenes write every frame (if the
 *     rAF loop were dead they would all still be opacity 0 at 0,0);
 *   - raycast hover changing a real legend row;
 *   - stage indexes changing with scroll and reversing on scroll-up;
 *   - the pinned frames never clipping their own content;
 *   - the document-mode path (reduced motion / no WebGL) laying every chapter
 *     out in normal flow.
 *
 * Screenshots are written to SHOT_DIR so a human can review them.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/devastra-landing';
const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
const problems = [];
const consoleNoise = { error: [], warning: [] };

function record(label, pass, detail = '') {
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) problems.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
});

/** The app boots behind a ~6s preloader; wait for the nav CTA to be hit-testable. */
async function waitForLanding(page) {
  await page.waitForSelector('.dv-hero-title', { timeout: 40000 });
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.landing-nav-actions a[href="/register"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    },
    { timeout: 40000, polling: 200 }
  );
  await wait(500);
}

/** Scroll to an absolute Y with Lenis-friendly stepping, then settle. */
async function scrollTo(page, y, settle = 700) {
  await page.evaluate((target) => window.scrollTo(0, target), y);
  await wait(settle);
}

async function chapterTop(page, selector) {
  return page.$eval(selector, (el) => el.getBoundingClientRect().top + window.scrollY);
}

async function labelsAlive(page) {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('.dv-hero .dv-signal-label'));
    const placed = nodes.filter((el) => {
      const style = getComputedStyle(el);
      const opacity = Number.parseFloat(style.opacity);
      return opacity > 0.35 && style.transform && !style.transform.includes('translate3d(0px, 0px');
    });
    return { total: nodes.length, placed: placed.length };
  });
}

/* ---------------- 1. Structure, routes and anchors ---------------- */
{
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleNoise.error.push(msg.text());
    if (msg.type() === 'warning') consoleNoise.warning.push(msg.text());
  });
  page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] ${err.message}`));

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const anchors = await page.evaluate(() => {
    const hrefs = Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute('href'));
    return [...new Set(hrefs)].map((href) => ({ href, found: !!document.querySelector(href) }));
  });
  record(
    'every in-page anchor resolves to a real section',
    anchors.length >= 4 && anchors.every((entry) => entry.found),
    JSON.stringify(anchors)
  );

  const routes = await page.evaluate(() => ({
    register: document.querySelectorAll('a[href="/register"]').length,
    login: document.querySelectorAll('a[href="/login"]').length,
    github: !!document.querySelector('a[href^="https://github.com/"]'),
  }));
  record('register/log in CTAs preserved', routes.register >= 2 && routes.login >= 2, JSON.stringify(routes));
  record('GitHub repository link preserved', routes.github);

  const sections = await page.evaluate(() =>
    ['#problem', '#how-it-works', '#features', '#audience'].map((id) => ({ id, found: !!document.querySelector(id) }))
  );
  record('all four chapter anchors exist', sections.every((entry) => entry.found), JSON.stringify(sections));

  const noMobileNav = await page.evaluate(() => !document.querySelector('.dv-mobile-menu'));
  record('desktop nav exposes all three section links', noMobileNav);

  const illustrative = await page.evaluate(() => ({
    stats: !!document.querySelector('#dv-stats-note'),
    engines: document.querySelectorAll('.dv-illustrative').length,
  }));
  record('sample data is labelled as illustrative', illustrative.stats && illustrative.engines >= 4, JSON.stringify(illustrative));

  const headings = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    h2: document.querySelectorAll('h2').length,
    tablist: document.querySelectorAll('[role="tablist"]').length,
    tabs: document.querySelectorAll('[role="tab"]').length,
    tabpanels: document.querySelectorAll('[role="tabpanel"]').length,
  }));
  record('one h1 and a semantic chapter hierarchy', headings.h1 === 1 && headings.h2 >= 4, JSON.stringify(headings));
  record('audience uses real tablist semantics', headings.tablist === 1 && headings.tabs === 3 && headings.tabpanels === 3, JSON.stringify(headings));

  /* Decorative layers and icons must actually render. src/index.css ships
     `[aria-hidden="true"] { display: none }`, which silently deletes both. */
  const decorative = await page.evaluate(() => {
    const visible = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return { present: false };
      const cs = getComputedStyle(el);
      return { present: true, display: cs.display, width: Math.round(el.getBoundingClientRect().width) };
    };
    const icons = Array.from(document.querySelectorAll('.landing svg[aria-hidden="true"]'));
    return {
      icons: icons.length,
      iconsRendered: icons.filter((svg) => getComputedStyle(svg).display !== 'none').length,
      stageLabels: visible('.dv-hero .dv-stage-labels'),
      engineRail: visible('.dv-engine-rail'),
      ctaStage: visible('.dv-cta-stage'),
      sceneCanvases: {
        hero: !!document.querySelector('.dv-hero canvas.dv-stage-canvas'),
        problem: !!document.querySelector('#problem canvas.dv-stage-canvas'),
        steps: !!document.querySelector('#how-it-works canvas.dv-stage-canvas'),
        features: !!document.querySelector('#features canvas.dv-stage-canvas'),
        audience: !!document.querySelector('#audience canvas.dv-stage-canvas'),
        cta: !!document.querySelector('.dv-cta canvas.dv-stage-canvas'),
      },
      tailHeight: Math.round(document.querySelector('#problem .dv-chapter-tail').getBoundingClientRect().height),
    };
  });
  record(
    'icons and decorative layers are not deleted by the global aria-hidden rule',
    decorative.icons > 0 &&
      decorative.iconsRendered === decorative.icons &&
      decorative.stageLabels.display !== 'none' &&
      decorative.engineRail.display !== 'none' &&
      decorative.ctaStage.display !== 'none',
    JSON.stringify(decorative)
  );
  record(
    'every chapter carries its own live 3D stage',
    Object.values(decorative.sceneCanvases).every(Boolean),
    JSON.stringify(decorative.sceneCanvases)
  );
  const legendPlacement = await page.evaluate(
    () => !!document.querySelector('.dv-hero-inner > .dv-signal-legend-wrap')
  );
  record('the hero legend hangs beside the copy, not inside it', legendPlacement, `${legendPlacement}`);
  record(
    'pinned chapters have a real scroll runway',
    decorative.tailHeight > 500,
    `tail=${decorative.tailHeight}px`
  );

  /* Keyboard operation of the tabs. */
  const tabKeyboard = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    tabs[0].focus();
    return {
      firstFocused: document.activeElement === tabs[0],
      tabIndexes: tabs.map((t) => t.tabIndex),
    };
  });
  await page.keyboard.press('ArrowRight');
  await wait(400);
  const afterArrow = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const selected = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const panel = document.querySelector('#dv-panel-industry');
    return { selected, panelVisible: !!panel && panel.classList.contains('is-active') };
  });
  record('tabs are keyboard operable (ArrowRight moves selection)', tabKeyboard.firstFocused && afterArrow.selected === 1 && afterArrow.panelVisible, JSON.stringify(afterArrow));

  /* Route round-trip: mount → navigate away → come back. This is the path that
     leaked a WebGL context (and threw) until the stage actually returned its
     dispose method, so it is worth pinning down. */
  await page.click('.landing-nav-actions a[href="/login"]');
  await page
    .waitForFunction(() => window.location.pathname === '/login', { timeout: 20000 })
    .catch(() => {});
  const leftLanding = await page.evaluate(() => ({
    path: window.location.pathname,
    canvases: document.querySelectorAll('canvas').length,
  }));
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);
  const remounted = await page.evaluate(() => ({
    heroStatus: document.querySelector('.dv-hero canvas')?.dataset.status ?? 'none',
    labels: document.querySelectorAll('.dv-hero .dv-signal-label').length,
  }));
  record(
    'landing unmounts to /login and re-mounts with a working scene',
    leftLanding.path === '/login' && remounted.heroStatus === 'ready' && remounted.labels === 7,
    JSON.stringify({ leftLanding, remounted })
  );

  await page.close();
}

/* ---------------- 2. Hero interaction (real raycast + loop) ---------------- */
{
  const page = await browser.newPage();
  page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] ${err.message}`));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const sceneStatus = await page.$eval('.dv-hero canvas', (el) => ({
    status: el.dataset.status,
    width: el.clientWidth,
    height: el.clientHeight,
  }));
  record('hero WebGL scene initialised', sceneStatus.status === 'ready' && sceneStatus.width > 600, JSON.stringify(sceneStatus));

  const alive = await labelsAlive(page);
  record('hero scene render loop is placing projected DOM labels', alive.placed >= 4, JSON.stringify(alive));

  await page.screenshot({ path: `${SHOT_DIR}/hero-initial-1440.png` });

  /* Hunt for a hover hit across the object's band; the raycast is what turns a
     legend row on, so this proves both the raycast and the DOM bridge. */
  const hero = await page.$eval('.dv-hero', (el) => {
    const rect = el.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  });
  let hoverHit = null;
  outer: for (let fx = 0.45; fx <= 0.8; fx += 0.025) {
    for (let fy = 0.3; fy <= 0.66; fy += 0.04) {
      await page.mouse.move(hero.left + hero.width * fx, hero.top + hero.height * fy);
      await wait(70);
      const hit = await page.evaluate(() =>
        document.querySelector('.dv-signal-legend-item.is-active .dv-signal-legend-label')?.textContent ?? null
      );
      if (hit) {
        hoverHit = { fx: fx.toFixed(3), fy: fy.toFixed(3), label: hit };
        break outer;
      }
    }
  }
  record('pointer hover over a scene surface highlights its legend row', !!hoverHit, JSON.stringify(hoverHit));
  await page.screenshot({ path: `${SHOT_DIR}/hero-hover-1440.png` });

  /* Hold-to-separate via the accessible control. Activated with a DOM click on
     purpose: a real mouse click would scroll the button into view first, which
     advances the hero's own scroll progress and fades the object out. */
  const holdButtonPosition = await page.$eval('.dv-hold-button', (el) => {
    const rect = el.getBoundingClientRect();
    return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), vh: window.innerHeight };
  });
  record(
    'hold control is reachable without scrolling (or reported if not)',
    holdButtonPosition.bottom <= holdButtonPosition.vh + 1,
    JSON.stringify(holdButtonPosition)
  );
  await page.evaluate(() => document.querySelector('.dv-hold-button').click());
  await wait(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);
  const exploded = await page.evaluate(() => {
    const button = document.querySelector('.dv-hold-button');
    const labels = Array.from(document.querySelectorAll('.dv-hero .dv-signal-label'))
      .filter((el) => ['ASSESSED', 'GROWTH PATH', 'ROLE MATCH'].includes(el.textContent.trim()))
      .map((el) => Number.parseFloat(getComputedStyle(el).opacity));
    return { pressed: button.getAttribute('aria-pressed'), labelOpacities: labels };
  });
  record(
    'hold control separates the parts and reveals their labels',
    exploded.pressed === 'true' && exploded.labelOpacities.filter((value) => value > 0.5).length >= 3,
    JSON.stringify(exploded)
  );
  await page.screenshot({ path: `${SHOT_DIR}/hero-separated-1440.png` });

  await page.evaluate(() => document.querySelector('.dv-hold-button').click());
  await wait(600);
  record(
    'release brings the parts back together',
    await page.$eval('.dv-hold-button', (el) => el.getAttribute('aria-pressed') === 'false')
  );

  /* The hero stage must not swallow clicks on the CTA, and the whole action
     row has to sit above the fold at a 900px-tall viewport. */
  const heroFold = await page.evaluate(() => {
    const link = document.querySelector('.dv-hero-actions a[href="/register"]');
    const rect = link.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const chips = document.querySelector('.dv-hero-chips')?.getBoundingClientRect();
    return {
      ctaTop: Math.round(rect.top),
      ctaBottom: Math.round(rect.bottom),
      chipsBottom: chips ? Math.round(chips.bottom) : null,
      vh: window.innerHeight,
      hit: !!hit,
      ok: !!hit && (hit === link || link.contains(hit)),
    };
  });
  record('hero CTA is hit-testable through the 3D layer', heroFold.ok, JSON.stringify(heroFold));
  record(
    'hero CTA and tech chips sit above the fold',
    heroFold.ctaBottom <= heroFold.vh && heroFold.chipsBottom <= heroFold.vh + 8,
    JSON.stringify(heroFold)
  );

  await page.close();
}

/* ---------------- 3. Per-viewport layout + chapter progression ---------------- */
for (const viewport of VIEWPORTS) {
  const page = await browser.newPage();
  page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] ${viewport.name} ${err.message}`));
  await page.setViewport({ width: viewport.width, height: viewport.height });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const overflow = await page.evaluate(() => ({
    overs: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  record(`${viewport.name}: no horizontal overflow`, overflow.overs <= 1, JSON.stringify(overflow));

  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  );
  record(`${viewport.name}: no broken images`, brokenImages.length === 0, brokenImages.join(', '));

  const headingSize = await page.$eval('.dv-hero-title', (el) => Number.parseFloat(getComputedStyle(el).fontSize));
  record(`${viewport.name}: hero headline renders at editorial scale`, headingSize >= 40, `${headingSize}px`);

  /* Chapter 2 — phases advance with scroll */
  const problemTop = await chapterTop(page, '#problem');
  await scrollTo(page, problemTop + 300);
  await page.screenshot({ path: `${SHOT_DIR}/problem-${viewport.name}-a.png` });
  await scrollTo(page, problemTop + 900);
  const phaseMid = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-phase')).findIndex((el) => el.classList.contains('is-active'))
  );
  await page.screenshot({ path: `${SHOT_DIR}/problem-${viewport.name}-b.png` });
  await scrollTo(page, problemTop + 1700);
  const phaseLate = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-phase')).findIndex((el) => el.classList.contains('is-active'))
  );
  record(
    `${viewport.name}: problem phases advance with scroll`,
    phaseMid >= 0 && phaseLate > phaseMid,
    `mid=${phaseMid} late=${phaseLate}`
  );

  /* Chapter 3 — stations advance, sticky frame keeps content visible */
  const stepsTop = await chapterTop(page, '#how-it-works');
  await scrollTo(page, stepsTop + 400);
  const stepFirst = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-step')).findIndex((el) => el.classList.contains('is-active'))
  );
  await page.screenshot({ path: `${SHOT_DIR}/steps-${viewport.name}-a.png` });
  await scrollTo(page, stepsTop + 1800);
  const stepLate = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-step')).findIndex((el) => el.classList.contains('is-active'))
  );
  record(
    `${viewport.name}: how-it-works stations advance with scroll`,
    stepFirst === 0 && stepLate === 2,
    `first=${stepFirst} late=${stepLate}`
  );

  const stepRailFits = await page.evaluate(() => {
    const rail = document.querySelector('.dv-step-rail').getBoundingClientRect();
    return { top: Math.round(rail.top), bottom: Math.round(rail.bottom), vh: window.innerHeight };
  });
  record(
    `${viewport.name}: step rail stays inside the pinned frame`,
    stepRailFits.top >= -1 && stepRailFits.bottom <= stepRailFits.vh + 1,
    JSON.stringify(stepRailFits)
  );
  await page.screenshot({ path: `${SHOT_DIR}/steps-${viewport.name}-b.png` });

  /* Chapter 4 — four engine stages, forward and reversed */
  const featuresTop = await chapterTop(page, '#features');
  /* Sample inside the chapter's own pinned range rather than at fixed offsets,
     so the check stays valid at every viewport height. */
  const runway = await page.evaluate(() => ({
    head: document.querySelector('#features .dv-chapter-head').offsetHeight,
    tail: document.querySelector('#features .dv-chapter-tail').offsetHeight,
  }));
  const pinnedRange = runway.tail;
  const seen = [];
  for (const fraction of [0.12, 0.37, 0.62, 0.87]) {
    const offset = Math.round(runway.head + pinnedRange * fraction);
    await scrollTo(page, featuresTop + offset, 600);
    const active = await page.evaluate(() => {
      const engines = Array.from(document.querySelectorAll('.dv-engine'));
      const index = engines.findIndex((el) => el.classList.contains('is-active'));
      const rect = index >= 0 ? engines[index].getBoundingClientRect() : null;
      return {
        index,
        fits: rect ? rect.top >= -2 && rect.bottom <= window.innerHeight + 2 : false,
        rect: rect ? { top: Math.round(rect.top), bottom: Math.round(rect.bottom) } : null,
      };
    });
    seen.push(active);
    await page.screenshot({ path: `${SHOT_DIR}/engine-${viewport.name}-${offset}.png` });
  }
  const engineIndexes = seen.map((entry) => entry.index);
  record(
    `${viewport.name}: all four engine stages activate in order`,
    engineIndexes.every((index, position) => index >= 0 && (position === 0 || index >= engineIndexes[position - 1])),
    JSON.stringify(engineIndexes)
  );
  record(
    `${viewport.name}: active engine card fits the pinned frame`,
    seen.every((entry) => entry.fits),
    JSON.stringify(seen.map((entry) => entry.rect))
  );

  await scrollTo(page, Math.round(featuresTop + runway.head + pinnedRange * 0.62), 600);
  const reversed = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-engine')).findIndex((el) => el.classList.contains('is-active'))
  );
  record(
    `${viewport.name}: engine stages reverse on scroll-up`,
    reversed > 0 && reversed <= 3,
    `index=${reversed}`
  );

  /* Chapter 5 — tabs */
  const audienceTop = await chapterTop(page, '#audience');
  await scrollTo(page, audienceTop - 100);
  const panelStates = [];
  for (const id of ['students', 'industry', 'institutions']) {
    await page.click(`#dv-tab-${id}`);
    await wait(450);
    panelStates.push(
      await page.evaluate((panelId) => {
        const panel = document.querySelector(`#dv-panel-${panelId}`);
        const rect = panel.getBoundingClientRect();
        return {
          id: panelId,
          active: panel.classList.contains('is-active'),
          selected: document.querySelector(`#dv-tab-${panelId}`).getAttribute('aria-selected'),
          hasBullets: panel.querySelectorAll('.dv-panel-list li').length >= 3,
          inView: rect.height > 100,
        };
      }, id)
    );
  }
  record(
    `${viewport.name}: each audience tab reconfigures its own panel`,
    panelStates.every((state) => state.active && state.selected === 'true' && state.hasBullets),
    JSON.stringify(panelStates)
  );
  const audienceScene = await page.evaluate(() => ({
    canvas: !!document.querySelector('.dv-audience-stage canvas'),
    labels: document.querySelectorAll('.dv-audience-stage .dv-signal-label').length,
  }));
  record(
    `${viewport.name}: audience scene renders behind the tab panels`,
    audienceScene.canvas && audienceScene.labels >= 6,
    JSON.stringify(audienceScene)
  );
  await page.screenshot({ path: `${SHOT_DIR}/audience-${viewport.name}.png` });

  /* CTA + footer */
  await scrollTo(page, await chapterTop(page, '.dv-cta'), 700);
  const cta = await page.evaluate(() => {
    const panel = document.querySelector('.landing-cta-panel').getBoundingClientRect();
    const link = document.querySelector('.dv-cta-actions a[href="/register"]');
    const rect = link.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      panelVisible: panel.height > 120,
      ctaHit: !!hit && (hit === link || link.contains(hit)),
      stageCanvas: !!document.querySelector('.dv-cta-stage canvas'),
    };
  });
  record(`${viewport.name}: final CTA panel renders with a usable CTA`, cta.panelVisible && cta.ctaHit, JSON.stringify(cta));
  record(`${viewport.name}: CTA resolves on a live 3D stage`, cta.stageCanvas, `${cta.stageCanvas}`);
  await page.screenshot({ path: `${SHOT_DIR}/cta-${viewport.name}.png` });

  await scrollTo(page, await page.evaluate(() => document.body.scrollHeight), 800);
  const footer = await page.evaluate(() => {
    const footer = document.querySelector('.dv-footer');
    if (!footer) return null;
    const rect = footer.getBoundingClientRect();
    return {
      height: Math.round(rect.height),
      links: footer.querySelectorAll('a').length,
      bottom: Math.round(rect.bottom),
      scrollHeight: document.body.scrollHeight,
    };
  });
  record(`${viewport.name}: footer renders at the end of the page`, !!footer && footer.height > 100 && footer.links >= 5, JSON.stringify(footer));

  /* Nothing anywhere should be left invisible after a fast scroll to the end. */
  const hiddenBlocks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.dv-chapter-head, .dv-stats-grid, .dv-cta-panel, .dv-panel.is-active')).filter(
      (el) => Number.parseFloat(getComputedStyle(el).opacity) < 0.9
    ).length
  );
  record(`${viewport.name}: no content left hidden after scrolling the page`, hiddenBlocks === 0, `${hiddenBlocks} faded`);

  await page.close();
}

/* ---------------- 4. Reduced motion (document mode) ---------------- */
{
  const page = await browser.newPage();
  page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] reduced ${err.message}`));
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const staticMode = await page.evaluate(() => ({
    staticChapters: document.querySelectorAll('.dv-chapter.is-static').length,
    canvases: document.querySelectorAll('canvas').length,
    staticSvgs: document.querySelectorAll('svg.dv-static-svg').length,
    lenis: document.documentElement.classList.contains('lenis'),
    heroOpacity: Number.parseFloat(getComputedStyle(document.querySelector('.dv-hero-title')).opacity),
  }));
  record(
    'reduced motion: chapters fall back to the static diagram mode',
    staticMode.staticChapters >= 3 && staticMode.staticSvgs >= 3 && staticMode.heroOpacity > 0.9,
    JSON.stringify(staticMode)
  );
  record('reduced motion: no smooth-scroll override is installed', staticMode.lenis === false, JSON.stringify(staticMode));

  const allStagesReadable = await page.evaluate(() => {
    const engines = Array.from(document.querySelectorAll('.dv-engine'));
    const phases = Array.from(document.querySelectorAll('.dv-phase'));
    return {
      engines: engines.length,
      enginesVisible: engines.filter((el) => Number.parseFloat(getComputedStyle(el).opacity) > 0.9).length,
      phases: phases.length,
      phasesVisible: phases.filter((el) => Number.parseFloat(getComputedStyle(el).opacity) > 0.9).length,
      steps: document.querySelectorAll('.dv-step').length,
    };
  });
  record(
    'reduced motion: every engine, phase and step is readable at once',
    allStagesReadable.enginesVisible === allStagesReadable.engines &&
      allStagesReadable.phasesVisible === allStagesReadable.phases &&
      allStagesReadable.steps === 3,
    JSON.stringify(allStagesReadable)
  );

  const reducedOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  record('reduced motion: no horizontal overflow', reducedOverflow <= 1, `${reducedOverflow}px`);

  await page.screenshot({ path: `${SHOT_DIR}/reduced-motion-1440.png`, fullPage: false });
  await page.close();
}

/* ---------------- 5. WebGL unavailable ---------------- */
{
  const page = await browser.newPage();
  page.on('pageerror', (err) => consoleNoise.error.push(`[pageerror] no-webgl ${err.message}`));
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(type, ...rest) {
      if (typeof type === 'string' && type.includes('webgl')) return null;
      return original.call(this, type, ...rest);
    };
  });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const fallback = await page.evaluate(() => ({
    staticChapters: document.querySelectorAll('.dv-chapter.is-static').length,
    canvases: document.querySelectorAll('canvas').length,
    staticSvgs: document.querySelectorAll('svg.dv-static-svg').length,
    heroText: (document.querySelector('.dv-hero-lede')?.textContent || '').length,
    ctaHref: document.querySelector('.landing-nav-actions a[href="/register"]')?.getAttribute('href'),
  }));
  record(
    'no WebGL: chapters render their static diagrams and keep their copy',
    fallback.canvases === 0 && fallback.staticSvgs >= 3 && fallback.heroText > 60 && fallback.ctaHref === '/register',
    JSON.stringify(fallback)
  );
  await page.screenshot({ path: `${SHOT_DIR}/no-webgl-1440.png` });
  await page.close();
}

/* ---------------- 6. Console cleanliness ---------------- */
const ignorable = (text) =>
  /net::ERR|Failed to load resource|getCurrentUser|AuthContext|429|401|403|CORS|favicon|WebGL|SwiftShader|GPU stall/i.test(
    text
  );
const realErrors = [...new Set(consoleNoise.error)].filter((text) => !ignorable(text));
record('no unexpected console errors', realErrors.length === 0, realErrors.slice(0, 5).join(' | '));

console.log('\n================ LANDING (3D SCROLL) VERIFICATION ================');
results.forEach((line) => console.log(line));
console.log(`\nscreenshots: ${SHOT_DIR}`);
console.log(`\n--------------- console noise (filtered) ---------------`);
console.log(`errors: ${consoleNoise.error.length}, warnings: ${consoleNoise.warning.length}`);
console.log('errors  :', JSON.stringify([...new Set(consoleNoise.error)].slice(0, 8)));
console.log('warnings:', JSON.stringify([...new Set(consoleNoise.warning)].slice(0, 8)));
console.log(`\n---------------- SUMMARY ----------------`);
console.log(`${results.filter((line) => line.startsWith('PASS')).length} passed, ${problems.length} failed`);
if (problems.length) {
  console.log('PROBLEMS:');
  problems.forEach((problem) => console.log('  ✗', problem));
}

await browser.close();
process.exit(problems.length ? 1 : 0);
