/**
 * Dark-mode pre-compensation solver (temporary tooling).
 *
 * The app's dark mode wraps the page in
 *   filter: invert(1) hue-rotate(180deg) brightness(1.1) contrast(0.95)
 * (src/dark-mode.css). To make the landing's dark stage render as an exact
 * target colour, we need the source colour s whose filtered result f(s) equals
 * the target. Every step is closed-form and invertible, so s = f⁻¹(target):
 *
 *   f(s) = contrast( brightness( H · invert(s) ) )
 *
 * with H the CSS filter-effects hue-rotate matrix. Applied in sRGB per spec.
 */
const rad = (Math.PI / 180) * 0; // placeholder

// CSS hue-rotate matrix for angle a (degrees), per filter-effects spec.
function hueMatrix(a) {
  const t = (a * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  // spec matrix
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
}

function apply(m, v) {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

const invert = (v) => v.map((x) => 1 - x);
const brightness = (v, b) => v.map((x) => x * b);
const contrast = (v, c) => v.map((x) => (x - 0.5) * c + 0.5);

const H = hueMatrix(180);
const Hinv = invert3(H);

function invert3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    A / det, -(b * i - c * h) / det, (b * f - c * e) / det,
    B / det, (a * i - c * g) / det, -(a * f - c * d) / det,
    C / det, -(a * h - b * g) / det, (a * e - b * d) / det,
  ];
}

const BRIGHTNESS = 1.1;
const CONTRAST = 0.95;

/** forward filter: source -> rendered (0..1 triplets) */
function forward(s) {
  let v = invert(s);
  v = apply(H, v);
  v = brightness(v, BRIGHTNESS);
  v = contrast(v, CONTRAST);
  return v;
}

/** solve source for a rendered target */
function solve(target) {
  let v = contrast(target, 1 / CONTRAST);
  v = brightness(v, 1 / BRIGHTNESS);
  v = apply(Hinv, v);
  v = invert(v);
  return v;
}

const hex = (v) =>
  '#' +
  v
    .map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0'))
    .join('');
const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/* Desired on-screen (post-filter) palette for the landing's dark stage. */
const targets = {
  'stage bg (deep ink)': '#0a0e1f',
  'stage bg raised': '#111631',
  'panel glass': '#161c3d',
  'hairline border': '#2a3160',
  'text primary': '#eef1fb',
  'text secondary': '#a8afc9',
  'text tertiary': '#7c84a6',
  'gold accent': '#e2b76a',
  'indigo accent': '#9a97ff',
  'teal accent': '#4fd8b0',
  'scrim base': '#070a17',
};

console.log('/* html.dark pre-compensated sources — paste into landing.css */');
for (const [name, targetHex] of Object.entries(targets)) {
  const t = parse(targetHex);
  const s = solve(t);
  const back = forward(s.map((x) => Math.min(1, Math.max(0, x))));
  console.log(
    `${name.padEnd(24)} target ${targetHex}  ->  source ${hex(s)}   (round-trips to ${hex(back)})`
  );
}
