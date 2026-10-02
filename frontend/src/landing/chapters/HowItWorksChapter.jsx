import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
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

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function HowItWorksChapter({ theme }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef({});

  const onScreen = useOnScreen(sectionRef);
  const documentVisible = useDocumentVisible();
  const { staticMode, staticReason } = useWebglSupport(reduced);
  
  // Keep the 3D scene synced to the exact scroll progress of the section
  const { progress } = useSectionProgress(sectionRef, {
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

  // The true "Trionn-style" smoothing: Use GSAP ScrollTrigger to scrub the text elements 
  // directly based on their position in the viewport, giving them a buttery parallax/fade effect 
  // rather than a sudden React state class toggle.
  useEffect(() => {
    if (reduced) return;
    
    const ctx = gsap.context(() => {
      // 1. Reveal the Head Section smoothly
      if (headRef.current) {
        const headTitle = headRef.current.querySelector('h2');
        const headSplit = new SplitText(headTitle, { type: 'lines' });
        
        gsap.fromTo(headSplit.lines, 
          { opacity: 0, y: 40 },
          { 
            opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: {
              trigger: headRef.current,
              start: "top 75%",
            }
          }
        );
      }

      // 2. Scrub the Steps
      const steps = gsap.utils.toArray('.dv-scroll-step');
      steps.forEach((step, i) => {
        const heading = step.querySelector('h3');
        const body = step.querySelector('p');
        const label = step.querySelector('.dv-step-label');
        
        const splitHeading = new SplitText(heading, { type: 'words,chars' });
        
        // Setup initial states
        gsap.set([label, body], { opacity: 0, y: 30 });
        gsap.set(splitHeading.chars, { opacity: 0, y: 20 });

        // Create a scrubbing timeline tied to this specific step's viewport position
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 80%", // Start animating when the top of the step hits 80% down the viewport
            end: "top 20%",   // Finish animating when it reaches 20% down the viewport
            scrub: 1,         // Smooth catch-up
          }
        });

        // Animate in
        tl.to(label, { opacity: 1, y: 0, duration: 0.2, ease: 'power1.out' }, 0)
          .to(splitHeading.chars, { opacity: 1, y: 0, stagger: 0.02, duration: 0.4, ease: 'power2.out' }, 0.1)
          .to(body, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.3);
          
        // As it scrolls past the center, fade it out to keep focus on the next step
        const tlOut = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 20%",
            end: "top -30%",
            scrub: 1,
          }
        });
        
        tlOut.to(step, { opacity: 0, y: -50, duration: 1, ease: 'power2.in' });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  const showStatic = staticMode || status === 'failed';

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`dv-chapter relative ${showStatic ? 'is-static' : ''}`}
      data-chapter="how-it-works"
    >
      {/* Sticky Background 3D Canvas */}
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

      {/* Foreground Scrolling Content - Keeps exact DOM structure, but uses GSAP for motion */}
      <div className="relative z-10 w-full pointer-events-auto">
        
        {/* Title Screen */}
        <div className="h-screen w-full flex flex-col justify-center items-start px-8 md:px-20 max-w-7xl mx-auto" ref={headRef}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold tracking-widest uppercase text-xs mb-8 backdrop-blur-sm shadow-lg">
            <Icon name="Zap" className="w-4 h-4" />
            The Pathway Engine
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05] drop-shadow-2xl max-w-4xl">
            A precision instrument for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-400">verified career readiness.</span>
          </h2>
        </div>

        {/* Steps Screens - Replaced state-based classes with GSAP scrub targets */}
        <div className="max-w-7xl mx-auto px-8 md:px-20 pb-[30vh]">
          {STEPS.map((step, index) => (
            <div key={step.id} className="min-h-[120vh] flex flex-col justify-center dv-scroll-step">
              <div className="max-w-2xl">
                <div className="dv-step-label font-mono text-xl font-bold mb-6 text-indigo-400 tracking-widest uppercase drop-shadow-md">
                  {index === 0 ? '01 / Calibration' : index === 1 ? '02 / AI Copilot' : '03 / Destination'}
                </div>
                <h3 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
                  {step.title}
                </h3>
                <p className="text-2xl md:text-3xl text-white/80 leading-snug font-light drop-shadow-lg">
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
