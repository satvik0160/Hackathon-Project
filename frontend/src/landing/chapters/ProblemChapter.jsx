/**
 * Chapter 2 — the problem.
 *
 * The visual is the argument: two rails drifting apart, a labelled gap, then
 * assessed evidence drawn down between them. The chapter's copy is the real
 * DOM text above it, and the phase rail inside the pinned frame names which
 * half of the argument the scene is currently showing — so the meaning never
 * lives only in the canvas.
 */
import React, { useRef } from 'react';

import { PROBLEM } from '../content.js';
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
import { createGapTracks } from '../three/gapTracks.js';
import { GapTracksStatic } from '../static/StaticScenes.jsx';
import { Icon, SignalLabel } from '../ui.jsx';

const PHASES = PROBLEM.diagram.phases;

export default function ProblemChapter({ theme }) {
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
    stages: PHASES.length,
    headRef,
  });

  const contextRef = useRef(null);
  if (!contextRef.current) contextRef.current = { progress, labels: labelsRef };

  const { status, stageRef } = useThreeStage(canvasRef, createGapTracks, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'problem',
  });
  useStageActivity(stageRef, onScreen && documentVisible);
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  // Reduced motion, no WebGL, or a scene that failed to build all end up in
  // document mode: laid out in flow, nothing scrubbed, meaning intact.
  const showStatic = staticMode || status === 'failed';

  return (
    <section
      id="problem"
      ref={sectionRef}
      className={`dv-chapter dv-problem ${showStatic ? 'is-static' : ''}`}
      data-chapter="problem"
    >
      <div className="landing-container dv-chapter-head" ref={headRef}>
        <span className="landing-eyebrow" data-reveal>
          <Icon name="GraduationCap" className="w-3.5 h-3.5" />
          {PROBLEM.eyebrow}
        </span>

        <h2 className="landing-h2 mt-5" data-reveal>
          {PROBLEM.titleLead} <span className="landing-gradient-text">{PROBLEM.titleAccent}</span>.
        </h2>

        <div className="dv-problem-copy">
          {PROBLEM.paragraphs.map((paragraph) => (
            <p className="landing-body" key={paragraph} data-reveal>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="dv-sticky">
        <div className="dv-stage">
          {showStatic ? (
            <div className="dv-static-stage" data-static-reason={staticReason || 'scene-failed'}>
              <GapTracksStatic />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="dv-stage-canvas revert-dark"
              role="img"
              aria-label="3D comparison of a curriculum track moving slowly against industry demand moving quickly, opening a verification gap that assessed evidence then closes."
              data-status={status}
            />
          )}

          {!showStatic && (
            <div className="dv-stage-labels" aria-hidden="true">
              <SignalLabel id="curriculum" labelsRef={labelsRef} tone="indigo">
                {PROBLEM.diagram.curriculum}
              </SignalLabel>
              <SignalLabel id="demand" labelsRef={labelsRef} tone="teal">
                {PROBLEM.diagram.demand}
              </SignalLabel>
              <SignalLabel id="gap" labelsRef={labelsRef} tone="gold">
                {PROBLEM.diagram.gap}
              </SignalLabel>
            </div>
          )}
        </div>

        <ol className="dv-phase-rail">
          {PHASES.map((phase, index) => (
            <li
              key={phase.id}
              className={`dv-phase ${stage === index ? 'is-active' : ''}`}
              data-active={stage === index}
            >
              <span className="dv-phase-index">{`0${index + 1}`}</span>
              <span className="dv-phase-label">{phase.label}</span>
              <span className="dv-phase-detail">{phase.detail}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Scroll runway: this is what the pinned frame is scrubbed against.
          Deliberately not aria-hidden — the app-wide
          `[aria-hidden="true"] { display: none }` rule in src/index.css would
          collapse it to zero height and unpin the chapter. An empty div is
          invisible to assistive tech anyway. */}
      <div className="dv-chapter-tail" />
    </section>
  );
}
