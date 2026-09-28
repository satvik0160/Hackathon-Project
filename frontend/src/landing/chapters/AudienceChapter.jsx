/**
 * Chapter 5 — one platform, three perspectives.
 *
 * The accessible tablist stays exactly as it was (roving tabindex, arrow keys,
 * Home/End, visible selected/focus states). What changes is what the tabs do:
 * the selection is written into a ref the WebGL scene reads every frame, so
 * the SAME live evidence system re-composes into each audience's story —
 * learner profile → roadmap → opportunity; demand wall ⇄ candidate evidence
 * over a shortlist bench; cohort field resolving onto an alignment board.
 *
 * The copy panel sits INSIDE the scene's frame (the canvas is the panel's
 * other column, full-bleed behind), so controls change a scene you are
 * already looking at. Reduced motion / no WebGL keeps the SVG signal diagram
 * so the fallback still explains the three-stage story.
 */
import React, { useEffect, useRef, useState } from 'react';

import { AUDIENCE } from '../content.js';
import {
  useDocumentVisible,
  useOnScreen,
  useReducedMotion,
  useRevealOnEnter,
  useThreeStage,
  useWebglSupport,
} from '../hooks.js';
import { createAudienceScene } from '../three/audienceScene.js';
import { Icon } from '../ui.jsx';

function SignalDiagram({ nodes, caption }) {
  return (
    <figure className="dv-diagram">
      <svg
        className="dv-diagram-svg"
        viewBox="0 0 520 150"
        role="img"
        aria-label={nodes.map((node) => node.label).join(' → ')}
      >
        <path className="dv-diagram-line" d="M120 75 L232 75" />
        <path className="dv-diagram-line" d="M288 75 L400 75" />
        <path className="dv-diagram-line dv-diagram-line-thin" d="M120 75 L400 75" />
        <circle className="dv-diagram-dot dv-diagram-dot-gold" cx="120" cy="75" r="7" />
        <circle className="dv-diagram-dot dv-diagram-dot-indigo" cx="260" cy="75" r="7" />
        <circle className="dv-diagram-dot dv-diagram-dot-teal" cx="400" cy="75" r="7" />
      </svg>

      <ol className="dv-diagram-nodes">
        {nodes.map((node, index) => (
          <li key={node.label} className={`dv-diagram-node dv-tone-${node.tone}`}>
            <span className="dv-diagram-node-index">{`0${index + 1}`}</span>
            <span className="dv-diagram-node-label">{node.label}</span>
          </li>
        ))}
      </ol>

      <figcaption className="dv-diagram-caption">{caption}</figcaption>
    </figure>
  );
}

export default function AudienceChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef({});
  const tabRefs = useRef([]);
  const selectionRef = useRef(0);
  const [selected, setSelected] = useState(0);

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const { staticMode, staticReason } = useWebglSupport(reduced);
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  const contextRef = useRef(null);
  if (!contextRef.current) {
    contextRef.current = { selection: selectionRef, progress: { current: 0.5 }, labels: labelsRef, theme };
  }

  const { status, stageRef } = useThreeStage(canvasRef, createAudienceScene, {
    staticMode,
    active: onScreen && documentVisible,
    reduced,
    theme,
    context: contextRef.current,
    label: 'audience',
    maxPixelRatio: 1.5,
  });
  useStageActivity(stageRef, onScreen && documentVisible);

  /* Sync the scene's selection ref with React state. */
  useEffect(() => {
    selectionRef.current = selected;
  }, [selected]);

  const tabs = AUDIENCE.tabs;
  const live = !staticMode && status !== 'failed';

  const select = (index) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event) => {
    const last = tabs.length - 1;
    let next = null;
    if (event.key === 'ArrowRight') next = selected === last ? 0 : selected + 1;
    else if (event.key === 'ArrowLeft') next = selected === 0 ? last : selected - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    select(next);
  };

  return (
    <section
      id="audience"
      ref={sectionRef}
      className={`dv-chapter dv-audience ${staticMode ? 'is-static' : ''}`}
      data-chapter="audience"
    >
      <div className="landing-container">
        <div className="dv-chapter-head dv-chapter-head-center">
          <span className="landing-eyebrow" data-reveal>
            <Icon name="Users" className="w-3.5 h-3.5" />
            {AUDIENCE.eyebrow}
          </span>
          <h2 className="landing-h2 mt-5" data-reveal>
            {AUDIENCE.titleLead}{' '}
            <span className="landing-gradient-text">{AUDIENCE.titleAccent}</span>
          </h2>
        </div>

        <div className="dv-tabs" role="tablist" aria-label="Who DevAstra is for" onKeyDown={onKeyDown}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`dv-tab-${tab.id}`}
              className={`dv-tab ${selected === index ? 'is-selected' : ''}`}
              aria-selected={selected === index}
              aria-controls={`dv-panel-${tab.id}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => select(index)}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.tab}
            </button>
          ))}
        </div>

        <div className="dv-audience-frame">
          {!staticMode && (
            <div className="dv-stage dv-audience-stage">
              <canvas
                ref={canvasRef}
                className="dv-stage-canvas revert-dark"
                role="img"
                aria-label="Live 3D evidence system that reconfigures per perspective: a learner profile with roadmap steps and an opportunity ring; industry demand facing candidate evidence over a shortlist bench; a cohort field resolving onto a curriculum alignment board."
                data-status={status}
              />
              {live && (
                <div className="dv-stage-labels" aria-hidden="true">
                  <SignalLabel id="audience-profile" labelsRef={labelsRef} tone="gold">
                    Verified profile
                  </SignalLabel>
                  <SignalLabel id="audience-roadmap" labelsRef={labelsRef} tone="indigo">
                    Roadmap
                  </SignalLabel>
                  <SignalLabel id="audience-opportunity" labelsRef={labelsRef} tone="teal">
                    Opportunity
                  </SignalLabel>
                  <SignalLabel id="audience-demand" labelsRef={labelsRef} tone="teal">
                    Role demand
                  </SignalLabel>
                  <SignalLabel id="audience-shortlist" labelsRef={labelsRef} tone="indigo">
                    Shortlist
                  </SignalLabel>
                  <SignalLabel id="audience-cohort" labelsRef={labelsRef} tone="gold">
                    Cohort skills
                  </SignalLabel>
                </div>
              )}
            </div>
          )}

          <div className="dv-panels">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                role="tabpanel"
                id={`dv-panel-${tab.id}`}
                aria-labelledby={`dv-tab-${tab.id}`}
                className={`dv-panel ${selected === index ? 'is-active' : ''}`}
                aria-hidden={selected !== index}
                /* React 19 wants a real boolean here — an empty string made it
                   treat every panel as non-inert, leaving hidden panels
                   reachable by keyboard. */
                inert={selected !== index ? true : undefined}
              >
                <div className="dv-panel-copy">
                  <h3 className="landing-h3">{tab.heading}</h3>
                  <p className="landing-body mt-4">{tab.body}</p>

                  <ul className="dv-panel-list">
                    {tab.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className="landing-check">
                          <Icon name="Check" className="w-3 h-3" />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Static mode keeps the SVG signal diagram so the fallback
                      still tells the three-stage story. */}
                  {staticMode && <SignalDiagram nodes={tab.signal} caption={tab.signalCaption} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
