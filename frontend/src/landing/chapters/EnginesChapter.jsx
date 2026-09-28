/**
 * Chapter 4 — the four engines.
 *
 * One chapter progress value, four non-overlapping timing windows, four
 * distinct 3D scenes — one live canvas now sits behind the whole chapter and
 * each engine state frames its own scene part (see three/engineScenes.js).
 * The DOM panels keep every word readable and carry the illustrative-data
 * labels; the eight-of-eighty rule still applies: only the active stage
 * animates, and on upward scroll the sequence simply runs backwards.
 */
import React, { useRef } from 'react';

import { ENGINES } from '../content.js';
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
import { createEngineScenes } from '../three/engineScenes.js';
import { Icon, SignalLabel } from '../ui.jsx';
import { EngineVisual } from './EngineVisuals.jsx';

export default function EnginesChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef({});

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const { staticMode } = useWebglSupport(reduced);
  const { progress, stage } = useSectionProgress(sectionRef, {
    enabled: !reduced,
    stages: ENGINES.items.length,
    headRef,
  });
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  const contextRef = useRef(null);
  if (!contextRef.current) contextRef.current = { progress, labels: labelsRef, theme };

  const { status, stageRef } = useThreeStage(canvasRef, createEngineScenes, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'features',
    maxPixelRatio: 1.5,
  });
  useStageActivity(stageRef, onScreen && documentVisible);

  return (
    <section
      id="features"
      ref={sectionRef}
      className={`dv-chapter dv-engines ${staticMode ? 'is-static' : ''}`}
      data-chapter="features"
    >
      <div className="landing-container dv-chapter-head" ref={headRef}>
        <span className="landing-eyebrow" data-reveal>
          <Icon name="Sparkles" className="w-3.5 h-3.5" />
          {ENGINES.eyebrow}
        </span>
        <h2 className="landing-h2 mt-5" data-reveal>
          {ENGINES.titleLead} <span className="landing-gradient-text">{ENGINES.titleAccent}</span>{' '}
          {ENGINES.titleTail}
        </h2>
        <p className="landing-body dv-chapter-lede" data-reveal>
          {ENGINES.lede}
        </p>
      </div>

      <div className="dv-sticky">
        {!staticMode && (
          <div className="dv-stage dv-engines-stage">
            <canvas
              ref={canvasRef}
              className="dv-stage-canvas revert-dark"
              role="img"
              aria-label="3D scenes for the four engines: Dhruv's interview console scoring Structure, Depth and Clarity; an evidence board wiring assessed skills to matched roles; an XP engine ring with level block and streak orbit; and a cohort field of metric columns against the industry demand bar. All sample values are illustrative."
              data-status={status}
            />
            <div className="dv-stage-labels" aria-hidden="true">
              {['structure', 'depth', 'clarity'].map((key) => (
                <SignalLabel key={key} id={key} labelsRef={labelsRef} tone="indigo">
                  {{ structure: 'Structure 82', depth: 'Depth 74', clarity: 'Clarity 88' }[key]}
                </SignalLabel>
              ))}
              {['react', 'typescript', 'nodejs', 'sql', 'systemDesign'].map((key) => (
                <SignalLabel key={key} id={key} labelsRef={labelsRef} tone="skill">
                  {{ react: 'React', typescript: 'TypeScript', nodejs: 'Node.js', sql: 'SQL', systemDesign: 'System Design' }[key]}
                </SignalLabel>
              ))}
              <SignalLabel id="streak" labelsRef={labelsRef} tone="gold">
                Level 7 · 2,480 XP
              </SignalLabel>
              <SignalLabel id="level" labelsRef={labelsRef} tone="skill">
                520 XP to Level 8
              </SignalLabel>
              {['dsw', 'sqlCol', 'cloud', 'testing'].map((key) => (
                <SignalLabel key={key} id={key} labelsRef={labelsRef} tone="gold">
                  {{ dsw: 'DSA 78%', sqlCol: 'SQL 64%', cloud: 'Cloud 31%', testing: 'Testing 22%' }[key]}
                </SignalLabel>
              ))}
            </div>
          </div>
        )}

        <div className="dv-engines-frame">
          {ENGINES.items.map((item, index) => (
            <article
              key={item.id}
              className={`dv-engine dv-engine-${item.id} ${stage === index ? 'is-active' : ''}`}
              data-stage={index}
              /* Inactive stages stay in the accessibility tree on purpose —
                 opacity only, never display/visibility — so a screen reader can
                 read all four engines without having to scroll the page. */
              data-active={stage === index}
            >
              <div className="dv-engine-copy">
                <div className="dv-engine-head">
                  <span className="dv-engine-icon">
                    <Icon name={item.icon} className="w-5 h-5" />
                  </span>
                  <span className="dv-engine-headings">
                    <span className="dv-engine-index">{item.index}</span>
                    <span className="dv-engine-eyebrow">{item.eyebrow}</span>
                  </span>
                </div>

                <h3 className="landing-h3 mt-5">{item.title}</h3>
                <p className="landing-body mt-4">{item.body}</p>

                <ul className="dv-engine-list">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>
                      <span className="landing-check">
                        <Icon name="Check" className="w-3 h-3" />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dv-engine-visual">
                <EngineVisual item={item} />
              </div>
            </article>
          ))}
        </div>

        <ol className="dv-engine-rail" aria-hidden="true">
          {ENGINES.items.map((item, index) => (
            <li key={item.id} className={stage === index ? 'is-active' : ''}>
              <span className="dv-engine-rail-index">{item.index}</span>
              <span className="dv-engine-rail-label">{item.eyebrow}</span>
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
