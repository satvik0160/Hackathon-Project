/**
 * DevAstra landing — motion primitives.
 *
 * One place where GSAP + ScrollTrigger are registered and where the small
 * numeric helpers the scenes use live, so every chapter maps scroll the same
 * way (a single normalized 0-1 progress value per chapter).
 *
 * Deliberately framework-free: this module is imported by both React
 * components (through src/landing/hooks.js) and the plain Three.js scene
 * factories (src/landing/three/*).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Idempotent — safe to call from several modules.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Clamp a value into [min, max]. */
export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Hermite smoothstep. Used to give each stage inside a chapter its own
 * non-overlapping timing window derived from the chapter's single progress
 * value, e.g. smoothstep(0.28, 0.6, p).
 */
export function smoothstep(edge0, edge1, value) {
  const span = edge1 - edge0 || 1;
  const t = clamp((value - edge0) / span);
  return t * t * (3 - 2 * t);
}

/** Linear interpolation. */
export function mix(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Frame-rate independent damping: the classic 1 - e^(-lambda * dt) step.
 * Keeps movement responsive on a 144 Hz display without being jumpy on 30 fps.
 */
export function damp(current, target, lambda, dt) {
  const step = 1 - Math.exp(-lambda * clamp(dt, 0, 0.1));
  return current + (target - current) * step;
}

/** True when the visitor asked for less motion. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let webglSupport = null;

/**
 * Cached WebGL capability probe. We only ever need one context to answer this,
 * and we release it immediately so we never eat into the browser's context
 * budget before the real scenes start.
 */
export function hasWebgl() {
  if (webglSupport !== null) return webglSupport;
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    webglSupport = Boolean(context);
    if (context) {
      const lose = context.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * ScrollTrigger measures the document, so every late layout change (web fonts,
 * lazy images, the preloader unmounting) shifts what "top top" means. Refresh
 * once the document is complete, after fonts settle, and once more a beat
 * later to absorb below-the-fold images that decoded in between.
 */
export function scheduleScrollRefresh({ delay = 600 } = {}) {
  const refresh = () => ScrollTrigger.refresh();
  if (typeof document === 'undefined') return;

  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });

  if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});

  const timeout = window.setTimeout(refresh, delay);
  return () => {
    window.clearTimeout(timeout);
    window.removeEventListener('load', refresh);
  };
}

/** Shared easing so GSAP timelines and CSS transitions read the same. */
export const EASE = 'power3.out';
