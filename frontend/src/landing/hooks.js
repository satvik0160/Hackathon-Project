/**
 * React bindings for the landing page's scroll + WebGL layers.
 *
 * The rule these hooks exist to enforce: scroll never touches React state
 * frame by frame. Chapter progress lives in a ref that the render loop reads;
 * only *discrete* things (which of four engine stages is active) go through
 * state, and that state only updates when the index actually changes.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, clamp, prefersReducedMotion, hasWebgl, EASE } from './motion.js';
import { createStage } from './three/stage.js';
import { paletteFor } from './three/palette.js';

/** Reactive `prefers-reduced-motion: reduce`. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Which theme the app is actually showing.
 *
 * The app records dark mode as a class on <html> (see src/hooks/useTheme.js),
 * so this watches the class attribute instead of a media query.
 */
export function useThemeMode() {
  const [mode, setMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const read = () => setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return mode;
}

/** IntersectionObserver-backed "is this chapter anywhere near the viewport". */
export function useOnScreen(ref, { rootMargin = '35% 0% 35% 0%' } = {}) {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin,
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return onScreen;
}

/** True while the document is visible — hidden tabs must not render. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}

/**
 * One normalized progress value for a chapter.
 *
 * `start: 'top top'` → `end: 'bottom bottom'` maps exactly onto a chapter whose
 * visual column is CSS-sticky for the whole section: progress is 0 the moment
 * the sticky column pins and 1 when it releases. No scroll jacking, no
 * scroll-snap, and the mapping reverses for free when the user scrolls up.
 *
 * Returns the progress ref (read by render loops) plus the active stage index
 * when `stages` is supplied.
 */
export function useSectionProgress(sectionRef, { enabled = true, stages = 0, headRef = null } = {}) {
  const progress = useRef(0);
  const [stage, setStage] = useState(0);

  useLayoutEffect(() => {
    const element = sectionRef.current;
    if (!element || !enabled) return undefined;

    const context = gsap.context(() => {
      // Fraction of the chapter's scroll during which its visual is actually
      // pinned. A section is [head][sticky visual][tail], so the sticky part
      // starts once the head has scrolled past and lasts for the tail.
      let pinnedFraction = 1;

      const measure = (self) => {
        const total = Math.max(self.end - self.start, 1);
        const head = headRef?.current ? headRef.current.offsetHeight : 0;
        pinnedFraction = clamp(1 - head / total, 0.15, 1);
      };

      const apply = (self) => {
        const relative = clamp((self.progress - (1 - pinnedFraction)) / pinnedFraction);
        progress.current = relative;
        if (stages <= 0) return;
        const next = clamp(Math.floor(relative * stages), 0, stages - 1);
        setStage((previous) => (previous === next ? previous : next));
      };

      ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure(self);
          apply(self);
        },
        onUpdate: apply,
      });
    }, element);

    return () => context.revert();
  }, [sectionRef, enabled, stages, headRef]);

  return { progress, stage };
}

/**
 * Mounts a Three.js scene factory against a canvas and keeps it alive.
 *
 * `staticMode` (reduced motion, or no WebGL) skips WebGL entirely — chapters
 * then render their static SVG diagram instead, which is why this hook reports
 * a status rather than throwing.
 *
 * `context` must be a stable object (a ref payload) holding anything the scene
 * reads per frame, such as the chapter's progress ref.
 */
export function useThreeStage(
  canvasRef,
  sceneFactory,
  { staticMode, active, reduced, theme, context, label, pointerRef = null, maxPixelRatio = 2 }
) {
  const apiRef = useRef(null);
  const stageRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const optionsRef = useRef({ reduced, context, theme });
  optionsRef.current = { reduced, context, theme };

  useLayoutEffect(() => {
    if (staticMode) {
      setStatus('idle');
      return undefined;
    }
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let stage = null;
    let api = null;
    try {
      stage = createStage(canvas, {
        // The chapter wrapper (or an explicit element), never the canvas: the
        // pointer should steer the scene even when it is over the DOM copy.
        pointerElement: pointerRef?.current || canvas.parentElement || canvas,
        reduced: optionsRef.current.reduced,
        maxPixelRatio,
      });
      api = sceneFactory({
        stage,
        palette: paletteFor(theme),
        reduced: optionsRef.current.reduced,
        context: optionsRef.current.context,
      });
      stage.onContextLost(() => setStatus('failed'));
      stage.setUpdate((dt, elapsed, state) => api.update(dt, elapsed, state));
      stage.resize();
      apiRef.current = api;
      stageRef.current = stage;
      setStatus('ready');
    } catch (error) {
      console.error(`[landing] ${label} scene could not initialise`, error);
      try {
        api?.dispose?.();
      } catch {
        /* already gone */
      }
      try {
        stage?.dispose?.();
      } catch {
        /* already gone */
      }
      apiRef.current = null;
      stageRef.current = null;
      setStatus('failed');
      return undefined;
    }

    return () => {
      apiRef.current = null;
      stageRef.current = null;
      try {
        api.dispose();
      } finally {
        stage.dispose();
      }
      setStatus('idle');
    };
  }, [staticMode, sceneFactory, theme, canvasRef, label, pointerRef, maxPixelRatio]);

  return { status, apiRef, stageRef };
}

/** Start/stop the render loop as the chapter enters and leaves the viewport. */
export function useStageActivity(stageRef, active) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (active) stage.start();
    else stage.stop();
  }, [stageRef, active]);
}

/** Convenience wrapper so chapters can ask "can I do WebGL at all?". */
export function useWebglSupport(reduced) {
  const [supported, setSupported] = useState(() => hasWebgl());

  useEffect(() => {
    setSupported(hasWebgl());
  }, []);

  const staticMode = reduced || !supported;
  const staticReason = reduced ? 'reduced-motion' : !supported ? 'no-webgl' : null;

  return { supported, staticMode, staticReason };
}

/**
 * Has the page actually been *presented* to the visitor yet?
 *
 * The app boots behind a full-screen preloader that holds the whole `<main>` at
 * `opacity: 0`, so anything animated on mount plays unseen. Rather than couple
 * the landing page to the preloader's internals, this walks the ancestor chain
 * and reports false while any of them is invisible — which is also the correct
 * answer for any future wrapper that hides the page.
 */
export function usePresented(ref, { interval = 180, timeout = 20000 } = {}) {
  const [presented, setPresented] = useState(false);

  useEffect(() => {
    if (presented) return undefined;
    const startedAt = Date.now();

    const isVisible = (element) => {
      let node = element;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (Number.parseFloat(style.opacity) === 0) return false;
        node = node.parentElement;
      }
      return true;
    };

    const timer = window.setInterval(() => {
      if (ref.current && isVisible(ref.current)) {
        setPresented(true);
      } else if (Date.now() - startedAt > timeout) {
        // Never leave the page looking blank: after the timeout we animate
        // regardless, so content can only ever be late, never missing.
        setPresented(true);
      }
    }, interval);

    return () => window.clearInterval(timer);
  }, [ref, interval, timeout, presented]);

  return presented;
}

/**
 * Cinematic enter for a chapter's DOM copy: rise + un-blur, staggered, fired
 * once when the chapter reaches the viewport. Skipped entirely under reduced
 * motion, where the copy is simply present.
 */
export function useRevealOnEnter(rootRef, { enabled, selector = '[data-reveal]', stagger = 0.06, y = 22 } = {}) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return undefined;

    const context = gsap.context(() => {
      const items = gsap.utils.toArray(selector, root);
      if (!items.length) return;
      gsap.fromTo(
        items,
        { opacity: 0, y, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: EASE,
          stagger,
          scrollTrigger: { trigger: root, start: 'top 82%', once: true },
        }
      );
    }, root);

    return () => context.revert();
  }, [rootRef, enabled, selector, stagger, y]);
}

/** Stable callback identity helper used by the chapter tab/legend handlers. */
export function useStableCallback(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args) => ref.current(...args), []);
}
