import React, { useRef } from 'react';
import { ENGINES, HERO, SCENES, STEPS } from '../content.js';
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

  const { status, stageRef, error } = useThreeStage(canvasRef, createStations, {
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

  const showStatic = false;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`dv-chapter dv-steps relative ${showStatic ? 'is-static' : ''}`}
      data-chapter="how-it-works"
    >
      {/* Sticky Background 3D Canvas - Now Full Bleed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          {showStatic ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black z-50 text-white p-10 overflow-auto" data-static-reason={staticReason || 'scene-failed'}>
              <pre>{error ? error.toString() + "\n" + error.stack : "Failed without error object"}</pre>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover revert-dark opacity-100"
              role="img"
              aria-label="3D scene of an evolving skill core."
              data-status={status}
            />
          )}
        </div>
      </div>

      {/* Foreground Scrolling Content - Clean Typography over 3D Assembly */}
      <div className="relative z-10 w-full pointer-events-auto">
        
        {/* Title Screen */}
        <div className="h-screen w-full flex flex-col justify-center items-start px-8 md:px-20 max-w-7xl mx-auto" ref={headRef}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold tracking-widest uppercase text-xs mb-8">
            <Icon name="Zap" className="w-4 h-4" />
            The Pathway Engine
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] drop-shadow-2xl max-w-3xl">
            A precision instrument for<br />
            <span className="text-[#93c5fd]">verified career readiness.</span>
          </h2>
        </div>

        {/* Steps Screens - Clean, unboxed text */}
        <div className="max-w-7xl mx-auto px-8 md:px-20 pb-[30vh]">
          {STEPS.map((step, index) => (
            <div key={step.id} className="min-h-[120vh] flex flex-col justify-center">
              <div 
                className={`max-w-xl transition-all duration-1000 ${
                  stage === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-10 translate-y-12 blur-sm'
                }`}
              >
                <div className="font-mono text-xl font-bold mb-6 text-indigo-400 tracking-widest uppercase">
                  {/* Semantic labeling (Assess, Grow, Match) mapped to the 3D stage */}
                  {index === 0 ? '01 / Calibration' : index === 1 ? '02 / AI Copilot' : '03 / Destination'}
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                  {step.title}
                </h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light drop-shadow-md">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
