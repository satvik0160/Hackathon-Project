/**
 * Pre-edit inspection probe (temporary tooling).
 *
 * Loads the running landing page at the three desktop sizes, captures
 * screenshots of every chapter state, and reports objective numbers:
 *   - element geometry (title size, copy width, stage heights);
 *   - "ink coverage" — the share of a region's pixels that differ from the
 *     page background, plus the ink bounding box — a proxy for how much of a
 *     frame is actually occupied by scene vs empty background;
 *   - which chapters render any WebGL canvas at all.
 *
 * Usage: node inspect-landing.mjs   (BASE_URL / SHOT_DIR env overrides)
 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/devastra-before';
mkdirSync(SHOT_DIR, { recursive: true });

/* ---------- tiny PNG decoder (8-bit, RGB/RGBA, non-interlaced) ---------- */
function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a png');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[12] !== 0) throw new Error('interlaced png unsupported');
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += length + 12;
  }
  if (bitDepth !== 8) throw new Error(`bit depth ${bitDepth} unsupported`);
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`color type ${colorType} unsupported`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * channels);
  let inPos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[inPos];
    inPos += 1;
    const row = raw.subarray(inPos, inPos + stride);
    inPos += stride;
    const out = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? pixels[out + x - channels] : 0;
      const up = y > 0 ? pixels[out - stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[out - stride + x - channels] : 0;
      let value = row[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      pixels[out + x] = value & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

/** Ink coverage + bbox of a screenshot region. Region in fractional coords. */
function analyze(png, region = { x: 0, y: 0, w: 1, h: 1 }) {
  const { width, height, channels, pixels } = png;
  const x0 = Math.floor(region.x * width);
  const y0 = Math.floor(region.y * height);
  const x1 = Math.min(width, Math.ceil((region.x + region.w) * width));
  const y1 = Math.min(height, Math.ceil((region.y + region.h) * height));
  // Background estimate: median luminance of the region's border pixels.
  const border = [];
  for (let x = x0; x < x1; x += 4) {
    border.push([x, y0 + 2], [x, y1 - 3]);
  }
  for (let y = y0; y < y1; y += 4) {
    border.push([x0 + 2, y], [x1 - 3, y]);
  }
  const lums = border.map(([x, y]) => {
    const i = (y * width + x) * channels;
    return 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
  });
  lums.sort((a, b) => a - b);
  const bg = lums[Math.floor(lums.length / 2)];
  let ink = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * width + x) * channels;
      const lum = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
      if (Math.abs(lum - bg) > 24) {
        ink += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const total = ((x1 - x0) / 2) * ((y1 - y0) / 2);
  return {
    coverage: +(ink / total * 100).toFixed(1),
    bbox: maxX < 0
      ? null
      : {
          left: +(minX / width).toFixed(2),
          right: +(maxX / width).toFixed(2),
          top: +(minY / height).toFixed(2),
          bottom: +(maxY / height).toFixed(2),
          width: +((maxX - minX) / width).toFixed(2),
          height: +((maxY - minY) / height).toFixed(2),
        },
  };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1440, height: 900 },
});

async function waitForLanding(page) {
  await page.waitForSelector('.dv-hero-title', { timeout: 40000 });
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.landing-nav-actions a[href="/register"]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    },
    { timeout: 40000, polling: 200 }
  );
  await wait(600);
}

async function shot(page, name) {
  const file = `${SHOT_DIR}/${name}.png`;
  await page.screenshot({ path: file });
  const png = decodePng(await page.screenshot({ encoding: 'binary' }));
  return { file, ...analyze(png) };
}

const report = { baseUrl: BASE, sizes: {} };

for (const vp of [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
]) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLanding(page);

  const data = {};
  data.hero = {};
  data.hero.metrics = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const rect = (sel) => {
      const el = q(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) };
    };
    return {
      titleFontPx: parseFloat(getComputedStyle(q('.dv-hero-title')).fontSize),
      copyBox: rect('.dv-hero-copy'),
      ctaBox: rect('.dv-hero-actions'),
      legendFontPx: parseFloat(getComputedStyle(q('.dv-signal-legend-label')).fontSize),
      stageLabelFontPx: parseFloat(getComputedStyle(q('.dv-signal-label')).fontSize),
      canvases: document.querySelectorAll('canvas').length,
    };
  });
  data.hero.shot = await shot(page, `hero-${vp.name}`);
  // Ink bbox for the right half (where the 3D object should be)
  data.hero.rightHalf = analyze(
    decodePng(await page.screenshot({ encoding: 'binary' })),
    { x: 0.5, y: 0.08, w: 0.5, h: 0.84 }
  );

  const top = async (sel) => page.$eval(sel, (el) => el.getBoundingClientRect().top + window.scrollY);
  const scrollTo = async (y, settle = 700) => {
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await wait(settle);
  };

  /* problem chapter */
  const problemTop = await top('#problem');
  await scrollTo(problemTop + 400);
  data.problemA = { shot: await shot(page, `problem-drift-${vp.name}`) };
  await scrollTo(problemTop + 1100);
  data.problemB = { shot: await shot(page, `problem-gap-${vp.name}`) };
  await scrollTo(problemTop + 1900);
  data.problemC = { shot: await shot(page, `problem-bridge-${vp.name}`) };
  data.problemMetrics = await page.evaluate(() => ({
    stageH: Math.round(document.querySelector('#problem .dv-stage').getBoundingClientRect().height),
    phaseFontPx: parseFloat(getComputedStyle(document.querySelector('.dv-phase-detail')).fontSize),
    phaseOpacity: getComputedStyle(document.querySelector('.dv-phase')).opacity,
  }));

  /* how it works */
  const stepsTop = await top('#how-it-works');
  await scrollTo(stepsTop + 500);
  data.stepsA = { shot: await shot(page, `steps-1-${vp.name}`) };
  await scrollTo(stepsTop + 1400);
  data.stepsB = { shot: await shot(page, `steps-2-${vp.name}`) };
  await scrollTo(stepsTop + 2300);
  data.stepsC = { shot: await shot(page, `steps-3-${vp.name}`) };
  data.stepsMetrics = await page.evaluate(() => ({
    stageH: Math.round(document.querySelector('#how-it-works .dv-stage').getBoundingClientRect().height),
    photoW: Math.round(document.querySelector('.dv-step-photo').getBoundingClientRect().width),
    stepTextPx: parseFloat(getComputedStyle(document.querySelector('.dv-step-text')).fontSize),
  }));

  /* engines */
  const featuresTop = await top('#features');
  const runway = await page.evaluate(() => ({
    head: document.querySelector('#features .dv-chapter-head').offsetHeight,
    tail: document.querySelector('#features .dv-chapter-tail').offsetHeight,
  }));
  data.engines = [];
  for (const [i, fraction] of [0.12, 0.37, 0.62, 0.87].entries()) {
    await scrollTo(featuresTop + runway.head + runway.tail * fraction, 650);
    data.engines.push({ shot: await shot(page, `engine-${i + 1}-${vp.name}`) });
  }
  data.enginesMetrics = await page.evaluate(() => ({
    canvasInEngines: document.querySelectorAll('#features canvas').length,
    mockW: Math.round(document.querySelector('.dv-engine.is-active .dv-mock')?.getBoundingClientRect().width ?? 0),
    bubblePx: parseFloat(getComputedStyle(document.querySelector('.dv-bubble-ai')).fontSize),
  }));

  /* audience */
  const audienceTop = await top('#audience');
  await scrollTo(audienceTop - 80);
  data.audience = [];
  for (const id of ['students', 'industry', 'institutions']) {
    await page.click(`#dv-tab-${id}`);
    await wait(500);
    data.audience.push({ id, shot: await shot(page, `audience-${id}-${vp.name}`) });
  }
  data.audienceMetrics = await page.evaluate(() => ({
    canvasInAudience: document.querySelectorAll('#audience canvas').length,
    diagramNodePx: parseFloat(getComputedStyle(document.querySelector('.dv-diagram-node-label')).fontSize),
  }));

  /* cta */
  await scrollTo(await top('.dv-cta'), 800);
  data.cta = { shot: await shot(page, `cta-${vp.name}`) };
  data.ctaMetrics = await page.evaluate(() => {
    const panel = document.querySelector('.landing-cta-panel');
    const cs = getComputedStyle(panel);
    return { bg: cs.backgroundColor, w: Math.round(panel.getBoundingClientRect().width) };
  });
  data.pageErrors = errors;
  report.sizes[vp.name] = data;
  await page.close();
}

await browser.close();
writeFileSync(`${SHOT_DIR}/report.json`, JSON.stringify(report, null, 2));
/* compact stdout */
for (const [name, data] of Object.entries(report.sizes)) {
  const d = data;
  console.log(`\n== ${name} ==`);
  console.log('hero:', JSON.stringify({ title: d.hero.metrics.titleFontPx, copy: d.hero.metrics.copyBox, ink: d.hero.shot.coverage + '%', rightHalf: d.hero.rightHalf.bbox }));
  console.log('problem:', JSON.stringify({ stageH: d.problemMetrics.stageH, inkA: d.problemA.shot.coverage, inkB: d.problemB.shot.coverage, inkC: d.problemC.shot.coverage, bboxB: d.problemB.shot.bbox }));
  console.log('steps:', JSON.stringify({ stageH: d.stepsMetrics.stageH, photoW: d.stepsMetrics.photoW, ink: d.stepsA.shot.coverage, bbox: d.stepsA.shot.bbox }));
  console.log('engines:', JSON.stringify({ canvas: d.enginesMetrics.canvasInEngines, mockW: d.enginesMetrics.mockW, ink: d.engines.map((e) => e.shot.coverage) }));
  console.log('audience:', JSON.stringify({ canvas: d.audienceMetrics.canvasInAudience, ink: d.audience.map((a) => a.shot.coverage) }));
  console.log('cta:', JSON.stringify({ bg: d.ctaMetrics.bg, ink: d.cta.shot.coverage }));
  console.log('pageErrors:', d.pageErrors.length ? d.pageErrors : 'none');
}
console.log(`\nscreenshots + report.json -> ${SHOT_DIR}`);
