/**
 * Lenis smooth scrolling, wired into GSAP's ticker so ScrollTrigger and the
 * scroll position can never disagree.
 *
 * This is the only smooth-scroll system in the app, it exists only while the
 * landing page is mounted, and it is skipped entirely for visitors who asked
 * for reduced motion — they get the browser's native scrolling instead.
 */
import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger, scheduleScrollRefresh } from './motion.js';

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      // Lenis must not run its own loop: GSAP's ticker drives both it and
      // ScrollTrigger from the same frame, so they stay in lockstep.
      autoRaf: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    const syncScrollTrigger = () => ScrollTrigger.update();
    lenis.on('scroll', syncScrollTrigger);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const cancelRefresh = scheduleScrollRefresh({ delay: 800 });
    ScrollTrigger.refresh();

    return () => {
      cancelRefresh?.();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off('scroll', syncScrollTrigger);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [enabled]);
}
