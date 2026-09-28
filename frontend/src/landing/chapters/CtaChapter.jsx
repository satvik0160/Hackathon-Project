/**
 * Chapter 6 — the close.
 *
 * The motifs resolve: the hero's three plates drift in and settle into one
 * aligned constellation behind the CTA while the copy enters. No white glass
 * card — the CTA sits directly on the dark stage, framed by the resolved
 * object, and flows into the footer. Copy and routes are unchanged and the
 * buttons stay fully hit-testable (the canvas is pointer-transparent for
 * everything except the scene's own hover).
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { FINAL_CTA } from '../content.js';
import { EASE, gsap } from '../motion.js';
import { createCtaResolve } from '../three/ctaResolve.js';
import { Icon } from '../ui.jsx';

export default function CtaChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const { staticMode } = useWebglSupport(reduced);
  const { progress } = useSectionProgress(sectionRef, { enabled: !reduced });

  const contextRef = useRef(null);
  if (!contextRef.current) contextRef.current = { progress, theme };

  const { status, stageRef } = useThreeStage(canvasRef, createCtaResolve, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'cta',
    maxPixelRatio: 1.5,
  });
  useStageActivity(stageRef, onScreen && documentVisible);

  useEffect(() => {
    if (reduced) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(
        gsap.utils.toArray('[data-reveal]', sectionRef.current),
        { opacity: 0, y: 20, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: EASE,
          stagger: 0.07,
          delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
        }
      );
    }, sectionRef);
    return () => context.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="dv-chapter dv-cta" data-chapter="cta">
      {!staticMode && (
        <div className="dv-stage dv-cta-stage">
          <canvas
            ref={canvasRef}
            className="dv-stage-canvas revert-dark"
            role="img"
            aria-label="The skill signal's three parts — assessed evidence, growth path and role match — converging into one aligned constellation."
            data-status={status}
          />
        </div>
      )}

      <div className="landing-container dv-cta-inner">
        <div className="landing-cta-panel">
          <span className="landing-eyebrow" data-reveal>
            <Icon name="Building2" className="w-3.5 h-3.5" />
            {FINAL_CTA.eyebrow}
          </span>

          <h2 className="landing-h2 mt-6" data-reveal>
            {FINAL_CTA.titleLead}
            <br />
            <span className="landing-gradient-text">{FINAL_CTA.titleAccent}</span>
          </h2>

          <p className="landing-lede dv-cta-lede mt-5" data-reveal>
            {FINAL_CTA.body}
          </p>

          <div className="dv-cta-actions mt-8" data-reveal>
            <Link to={FINAL_CTA.primaryCta.to} className="landing-btn landing-btn-primary landing-btn-lg">
              {FINAL_CTA.primaryCta.label}
              <Icon name="ArrowRight" className="w-4 h-4" />
            </Link>
            <Link to={FINAL_CTA.secondaryCta.to} className="landing-btn landing-btn-outline landing-btn-lg">
              {FINAL_CTA.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
