/**
 * Chapter 3 — Assess → Grow → Match.
 *
 * The 3D journey carries the chapter; the rail beneath holds the real step
 * copy, sized up now that the thumbnail strip is gone (the photos competed
 * with the live scene and left the frame feeling sparse). The active step is
 * whichever station the travelling signal is actually at, so words and objects
 * cannot disagree.
 */
import React, { useRef } from 'react';

import { ENGINES, HERO, STEPS } from '../content.js';
import {
  useDocumentVisible,
  useOnScreen,
  useReducedMotion,
  useRevealOnEnter,
  useSectionProgress,
  useStageActivity,
  useThreeStage,
  useWebglSupport,
} from '../hooks.js';
import { createStations } from '../three/stations.js';
import { StationsStatic } from '../static/StaticScenes.jsx';
import { Icon, SignalLabel } from '../ui.jsx';

const ROLE_LABELS = ENGINES.items.find((item) => item.id === 'matching').mock.roles.map(
  (role) => role.name
);

export default function HowItWorksChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef({});

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const { staticMode, staticReason } = useWebglSupport(reduced);
  const { progress, stage } = useSectionProgress(sectionRef, {
    enabled: !reduced,
    stages: STEPS.length,
    headRef,
  });

  const contextRef = useRef(null);
  if (!contextRef.current) contextRef.current = { progress, labels: labelsRef, theme };

  const { status, stageRef } = useThreeStage(canvasRef, createStations, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'how-it-works',
    maxPixelRatio: 1.5,
  });
  useStageActivity(stageRef, onScreen && documentVisible);
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  const showStatic = staticMode || status === 'failed';

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`dv-chapter dv-steps ${showStatic ? 'is-static' : ''}`}
      data-chapter="how-it-works"
    >
      <div className="landing-container dv-chapter-head" ref={headRef}>
        <span className="landing-eyebrow" data-reveal>
          <Icon name="Zap" className="w-3.5 h-3.5" />
          How it works
        </span>
        <h2 className="landing-h2 mt-5" data-reveal>
          One signal, <span className="landing-gradient-text">three stations</span>.
        </h2>
        <p className="landing-body dv-chapter-lede" data-reveal>
          Assess and baseline, grow along the route Dhruv builds for you, then get matched on the
          evidence that comes out of both.
        </p>
      </div>

      <div className="dv-sticky">
        <div className="dv-stage">
          {showStatic ? (
            <div className="dv-static-stage" data-static-reason={staticReason || 'scene-failed'}>
              <StationsStatic />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="dv-stage-canvas revert-dark"
              role="img"
              aria-label="3D scene with three stations along one path: an assessment ring measuring the four assessed skills, Dhruv's monolith branching routes toward the assessed gaps, and a profile ring feeding matched roles. A signal travels from the first station to the last as you scroll."
              data-status={status}
            />
          )}

          {!showStatic && (
            <div className="dv-stage-labels" aria-hidden="true">
              {HERO.skills.map((skill) => (
                <SignalLabel key={skill} id={skill} labelsRef={labelsRef} tone="skill">
                  {skill}
                </SignalLabel>
              ))}
              <SignalLabel id="dhruv" labelsRef={labelsRef} tone="indigo">
                Dhruv · AI Copilot
              </SignalLabel>
              {ROLE_LABELS.map((role, index) => (
                <SignalLabel key={role} id={`role${index + 1}`} labelsRef={labelsRef} tone="teal">
                  {role}
                </SignalLabel>
              ))}
            </div>
          )}
        </div>

        <ol className="dv-step-rail">
          {STEPS.map((step, index) => (
            <li key={step.id} className={`dv-step ${stage === index ? 'is-active' : ''}`}>
              <div className="dv-step-content">
                <span className="dv-step-index">{step.index}</span>
                <h3 className="dv-step-title">{step.title}</h3>
                <p className="dv-step-text">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Not aria-hidden: src/index.css hides every [aria-hidden="true"] node,
          which would collapse this scroll runway to zero height. */}
      <div className="dv-chapter-tail" />
    </section>
  );
}
