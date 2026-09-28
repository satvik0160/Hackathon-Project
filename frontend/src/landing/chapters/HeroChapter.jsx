/**
 * Chapter 1 — Hero.
 *
 * One full-viewport editorial composition, not a text column beside a canvas:
 * the Skill Signal renders full-bleed and is composed right-of-centre by the
 * scene itself, while the headline overlaps its negative space and the legend
 * hangs as a vertical rail inside the object's frame. The whole section steers
 * the object, so the pointer tilt tracks across the entire composition.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

import { HERO } from '../content.js';
import { EASE } from '../motion.js';
import {
  useDocumentVisible,
  useOnScreen,
  usePresented,
  useReducedMotion,
  useSectionProgress,
  useStageActivity,
  useThreeStage,
  useWebglSupport,
} from '../hooks.js';
import { createHeroSignal } from '../three/heroSignal.js';
import { HeroSignalStatic } from '../static/StaticScenes.jsx';
import { HoldHint, Icon, SignalLabel } from '../ui.jsx';

gsap.registerPlugin(SplitText);

export default function HeroChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef({});
  const titleRef = useRef(null);
  const lineTwoRef = useRef(null);

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const presented = usePresented(sectionRef);
  const { staticMode, staticReason } = useWebglSupport(reduced);
  const { progress } = useSectionProgress(sectionRef, { enabled: !reduced });

  const [hover, setHover] = useState(null);
  const [exploded, setExploded] = useState(false);
  const onHover = useCallback((next) => setHover(next), []);

  // Stable identity: the scene reads progress every frame and calls onHover.
  const contextRef = useRef(null);
  if (!contextRef.current) {
    contextRef.current = { progress, onHover, labels: labelsRef, theme, offsetX: 0.24 };
  }

  const { status, apiRef, stageRef } = useThreeStage(canvasRef, createHeroSignal, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'hero',
    // The whole hero steers the object, including the copy, so the tilt
    // tracks the pointer across the entire composition.
    pointerRef: sectionRef,
    // The brand object earns full resolution; the rest of the page is capped lower.
    maxPixelRatio: 2,
  });
  useStageActivity(stageRef, onScreen && documentVisible);

  // A scene that failed to build (or a browser without WebGL) must still leave
  // the chapter fully explained, so the static diagram takes over.
  const showStatic = staticMode || status === 'failed';

  /* Intro: the headline resolves from blurred to sharp with a randomised
     character order. It runs when the page is actually presented — mounting
     happens behind the app's boot preloader, where nobody would see it. */
  useEffect(() => {
    if (reduced || !presented || !titleRef.current) return undefined;

    let split = null;
    const context = gsap.context(() => {
      split = new SplitText(titleRef.current, { type: 'chars', charsClass: 'dv-char' });
      const timeline = gsap.timeline({ delay: 0.12, defaults: { ease: EASE } });

      timeline.fromTo(
        split.chars,
        { opacity: 0, y: 24, filter: 'blur(14px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, stagger: { each: 0.022, from: 'random' } }
      );
      timeline.fromTo(
        lineTwoRef.current,
        { opacity: 0, y: 26, filter: 'blur(16px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 },
        '-=0.62'
      );
      timeline.fromTo(
        gsap.utils.toArray('[data-intro]', sectionRef.current),
        { opacity: 0, y: 18, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.06 },
        '-=0.55'
      );
    }, sectionRef);

    return () => {
      context.revert();
      split?.revert();
    };
  }, [presented, reduced]);

  const toggleExplode = () => {
    const next = !exploded;
    setExploded(next);
    apiRef.current?.setExploded(next);
  };

  return (
    <section id="hero" ref={sectionRef} className="dv-chapter dv-hero" data-chapter="hero">
      <div className="dv-stage">
        {staticMode || status === 'failed' ? (
          <div className="dv-static-stage" data-static-reason={staticReason || 'scene-failed'}>
            <HeroSignalStatic />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="dv-stage-canvas revert-dark"
            role="img"
            aria-label="Interactive 3D skill signal. Assessed evidence, growth path and role match are fed by the assessed skills React, TypeScript, Node.js and SQL."
            data-status={status}
          />
        )}

        {!showStatic && (
          <div className="dv-stage-labels" aria-hidden="true">
            {HERO.signalParts.map((part) => (
              <SignalLabel key={part.id} id={part.id} labelsRef={labelsRef} tone={part.id}>
                {part.label}
              </SignalLabel>
            ))}
            {HERO.skills.map((skill) => (
              <SignalLabel key={skill} id={skill} labelsRef={labelsRef} tone="skill">
                {skill}
              </SignalLabel>
            ))}
          </div>
        )}
      </div>

      <div className="landing-container dv-hero-inner">
        <div className="dv-hero-copy">
          <span className="landing-eyebrow" data-intro>
            <Icon name="Sparkles" className="w-3.5 h-3.5" />
            {HERO.eyebrow}
          </span>

          <h1 className="landing-title dv-hero-title mt-4" ref={titleRef}>
            <span className="dv-hero-line">{HERO.lineOne}</span>{' '}
            <span className="dv-hero-line dv-hero-line-accent" ref={lineTwoRef}>
              <span className="landing-gradient-text">{HERO.lineTwo}</span>
            </span>
          </h1>

          <p className="landing-lede dv-hero-lede mt-4" data-intro>
            {HERO.lede}
          </p>

          <div className="dv-hero-actions mt-6" data-intro>
            <Link to={HERO.primaryCta.to} className="landing-btn landing-btn-primary landing-btn-lg">
              {HERO.primaryCta.label}
              <Icon name="ArrowRight" className="w-4 h-4" />
            </Link>
            <a href={HERO.secondaryCta.href} className="landing-btn landing-btn-outline landing-btn-lg">
              {HERO.secondaryCta.label}
            </a>

            <div className="dv-hero-hold">
              <HoldHint />
              <button
                type="button"
                className="dv-hold-button"
                aria-pressed={exploded}
                onClick={toggleExplode}
              >
                {exploded ? 'Bring the parts back together' : 'Separate the three parts'}
              </button>
            </div>
          </div>

          <div className="dv-hero-chips mt-5" data-intro>
            {HERO.chips.map((chip) => (
              <span key={chip} className="landing-chip">
                <Icon
                  name={chip.includes('React') ? 'Rocket' : chip.includes('Postgres') ? 'ShieldCheck' : 'Zap'}
                  className="w-3.5 h-3.5"
                />
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* The legend lives inside the object's frame: hovering a part of the
            canvas lights its row, and the row names the part you are looking
            at. It is a slim vertical rail, not a second copy column. */}
        {!showStatic && (
          <div className="dv-signal-legend-wrap" data-intro>
            <ul className="dv-signal-legend" aria-label="What the skill signal is made of">
              {HERO.signalParts.map((part, index) => (
                <li
                  key={part.id}
                  className={`dv-signal-legend-item dv-tone-${part.id} ${
                    hover?.kind === 'panel' && hover.index === index ? 'is-active' : ''
                  }`}
                >
                  <span className="dv-signal-dot" aria-hidden="true" />
                  <span className="dv-signal-legend-label">{part.label}</span>
                  <span className="dv-signal-legend-desc">{part.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
