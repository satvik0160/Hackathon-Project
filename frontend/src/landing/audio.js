/**
 * Landing page audio engine.
 * 
 * Synthesised interaction sounds. All sounds use the Web Audio API — no
 * external audio files. The system is opt-in: sounds are off by default
 * and the visitor can toggle them with the sound button in the nav.
 */

const STORAGE_KEY = 'devastra_landing_sound';

let ctx = null;
let enabled = false;

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value) {
  enabled = value;
  try { localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false'); } catch {}
}

export function initSound() {
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    enabled = false;
  }
}

/** Short triangle beep — hero panel hover. */
export function playHoverBeep() {
  if (!enabled) return;
  try {
    const ac = getContext();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2800, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.08);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.07, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {}
}

/** Rising charge tone — hero hold start. */
export function playChargeStart() {
  if (!enabled) return;
  try {
    const ac = getContext();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.5);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
    gain.gain.setValueAtTime(0.06, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  } catch {}
}

/** Explosion burst — hero blast release. */
export function playBlastRelease() {
  if (!enabled) return;
  try {
    const ac = getContext();
    const t = ac.currentTime;
    // White noise burst
    const bufferSize = ac.sampleRate * 0.3;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    noise.connect(filter).connect(gain).connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.35);
    // Sub thump
    const sub = ac.createOscillator();
    const subGain = ac.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.25);
    subGain.gain.setValueAtTime(0.15, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    sub.connect(subGain).connect(ac.destination);
    sub.start(t);
    sub.stop(t + 0.3);
  } catch {}
}

/** Soft glass click — tab switch, interaction. */
export function playTabClick() {
  if (!enabled) return;
  try {
    const ac = getContext();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {}
}

/** Settle sound — parts reassembling. */
export function playSettle() {
  if (!enabled) return;
  try {
    const ac = getContext();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.2);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  } catch {}
}

export function disposeAudio() {
  if (ctx) {
    ctx.close();
    ctx = null;
  }
}
