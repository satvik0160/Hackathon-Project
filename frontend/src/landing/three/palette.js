/**
 * Scene palettes.
 *
 * Two separate concerns live here:
 *
 * 1. The material palette for meshes (MeshStandard colors/emissives).
 *
 * 2. The chrome palette — the backdrop, floor, label ink and stage-glass
 *    colours a scene hands to DOM. IMPORTANT: the app's dark mode is a global
 *    `html.dark { filter: invert(1) hue-rotate(180deg) ... }` pass
 *    (src/dark-mode.css). A WebGL canvas carries `.revert-dark`, so unlike the
 *    DOM it renders exactly the colours we author. The DARK values below are
 *    therefore the exact on-screen targets, authored in solved hex (the CSS
 *    chrome around them is pre-compensated separately in landing.css).
 *
 * Keep both sets on the brand: gold = assessed evidence, indigo =
 * intelligence/growth, teal = verified progress.
 */

export const PALETTES = {
  light: {
    // Pale stage: accents need depth, not glow.
    gold: 0xb45309,
    goldSoft: 0xd9af67,
    indigo: 0x5450e8,
    indigoSoft: 0x8f8dfc,
    teal: 0x0f766e,
    tealSoft: 0x2bc49a,
    line: 0x6b7593,
    faint: 0xc7cce0,
    panel: 0xffffff,
    panelDeep: 0xe2e8ff,
    text: 0x161c38,
    textDim: 0x4a5578,
    labelInk: '#2a3159',
    floor: 0xdfe4f2,
    floorShadow: 0x33395c,
    floorOpacity: 0.55,
    backdropTop: '#f2f4fc',
    backdropMid: '#e6eaf8',
    backdropBottom: '#dfe4f2',
  },
  dark: {
    // Deep-ink stage, authored exactly: canvas colors bypass the invert.
    gold: 0xe2b76a,
    goldSoft: 0xf0d194,
    indigo: 0x9a97ff,
    indigoSoft: 0xc3c1ff,
    teal: 0x4fd8b0,
    tealSoft: 0x86ead0,
    line: 0x39406b,
    faint: 0x39406b,
    panel: 0x1a2040,
    panelDeep: 0x121735,
    text: 0xeef1fb,
    textDim: 0xa8afc9,
    labelInk: '#eef1fb',
    floor: 0x0b101f,
    floorShadow: 0x03040a,
    floorOpacity: 0.8,
    backdropTop: '#060a18',
    backdropMid: '#0e1430',
    backdropBottom: '#05070f',
  },
};

export function paletteFor(theme) {
  return theme === 'dark' ? PALETTES.dark : PALETTES.light;
}
