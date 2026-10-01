/**
 * DevAstra landing — the chapter build (preview route: /v3).
 *
 * This is the composition layer only: it owns the page chrome (nav, footer,
 * ambience), the smooth-scroll driver and the chapter ORDER. Every chapter
 * owns its own scroll progress, its own WebGL stage and its own DOM copy, so
 * nothing here reaches into a scene.
 *
 * Two rules this file exists to hold:
 *  - the shell is plain DOM (nav, footer, headings) and stays selectable;
 *  - the page works with no WebGL at all — every chapter degrades to its own
 *    static diagram, which is why nothing is conditionally mounted here.
 *
 * Copy, routes and anchors come from `content.js` (lifted verbatim from the
 * previous landing page) — this file invents no product claims.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import '../landing.css';
import '../landing-v3.css';

import { NAV_LINKS } from './content.js';
import { useReducedMotion, useThemeMode } from './hooks.js';
import { useSmoothScroll } from './smoothScroll.js';
import { initSound, isSoundEnabled, setSoundEnabled } from './audio.js';
import { SceneErrorBoundary } from './SceneErrorBoundary.jsx';
import { Icon } from './ui.jsx';

import HeroChapter from './chapters/HeroChapter.jsx';
import StatsStrip from './chapters/StatsStrip.jsx';
import ProblemChapter from './chapters/ProblemChapter.jsx';
import HowItWorksChapter from './chapters/HowItWorksChapter.jsx';
import EnginesChapter from './chapters/EnginesChapter.jsx';
import AudienceChapter from './chapters/AudienceChapter.jsx';
import CtaChapter from './chapters/CtaChapter.jsx';
import FooterChapter from './chapters/FooterChapter.jsx';

export default function LandingV3() {
  const theme = useThemeMode();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  // One smooth-scroll system for the whole page, and none at all for visitors
  // who asked for reduced motion (they get the browser's own scrolling).
  useSmoothScroll(!reduced);

  useEffect(() => {
    initSound();
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    /* `.landing` carries the shared tokens, typography, buttons, nav and
       reduced-motion rules from landing.css; `.dv-landing` adds the chapter
       chrome in landing-v3.css. */
    <div className="landing dv-landing">
      <a className="dv-skip-link" href="#hero">
        Skip to content
      </a>

      <header className={`landing-nav dv-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-container">
          <div className="landing-nav-inner">
            <Link to="/" className="landing-brand" aria-label="DevAstra home">
              <span className="landing-brand-badge">
                <img src="/devlogo.jpg" alt="DevAstra" />
              </span>
              <span className="min-w-0">
                <span className="landing-wordmark">DevAstra</span>
                <span className="landing-brand-sub">Intelligence OS</span>
              </span>
            </Link>

            <nav className="landing-nav-links" aria-label="Landing page sections">
              {NAV_LINKS.map((link) => (
                <a key={link.href} className="landing-nav-link" href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="landing-nav-actions">
              {import.meta.env.DEV && (
                <Link to="/" className="dv-nav-preview">
                  Preview build
                  <span aria-hidden="true">·</span>
                  open current landing
                </Link>
              )}
              <button
                type="button"
                className="dv-sound-toggle"
                aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
                onClick={() => { const next = !soundOn; setSoundOn(next); setSoundEnabled(next); }}
              >
                <Icon name={soundOn ? 'Volume2' : 'VolumeX'} className="w-4 h-4" />
              </button>
              <Link to="/login" className="landing-btn landing-btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="landing-btn landing-btn-primary">
                Sign Up
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="dv-main">
        {/* 1 — the skill signal instrument, and the promise */}
        <SceneErrorBoundary fallback={null}>
          <HeroChapter theme={theme} />
        </SceneErrorBoundary>

        {/* 2 — the numbers, labelled for what they are */}
        <SceneErrorBoundary fallback={null}>
          <StatsStrip />
        </SceneErrorBoundary>

        {/* 3 — why the gap exists, argued with two rails */}
        <SceneErrorBoundary fallback={null}>
          <ProblemChapter theme={theme} />
        </SceneErrorBoundary>

        {/* 4 — assess → grow → match, one signal through three stations */}
        <SceneErrorBoundary fallback={null}>
          <HowItWorksChapter theme={theme} />
        </SceneErrorBoundary>

        {/* 5 — the four engines, one shared live stage */}
        <SceneErrorBoundary fallback={null}>
          <EnginesChapter theme={theme} />
        </SceneErrorBoundary>

        {/* 6 — the same evidence system, per perspective */}
        <SceneErrorBoundary fallback={null}>
          <AudienceChapter theme={theme} />
        </SceneErrorBoundary>

        {/* 7 — the parts resolve, into the ask */}
        <SceneErrorBoundary fallback={null}>
          <CtaChapter theme={theme} />
        </SceneErrorBoundary>
      </main>

      <FooterChapter />
    </div>
  );
}
