/**
 * Small shared pieces used by several chapters.
 *
 * `SignalLabel` is the bridge between the WebGL scenes and the DOM: the scene
 * projects a 3D anchor and writes a transform/opacity onto the element, so the
 * text stays real, selectable markup instead of being baked into the canvas.
 */
import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  Check,
  Code,
  Flame,
  GraduationCap,
  Info,
  MousePointerClick,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { ILLUSTRATIVE_NOTE } from './content.js';

const ICONS = {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  Check,
  Code,
  Flame,
  GraduationCap,
  Info,
  MousePointerClick,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
};

export function Icon({ name, className = 'w-4 h-4', ...rest }) {
  const Component = ICONS[name] || Sparkles;
  return <Component className={className} aria-hidden="true" {...rest} />;
}

/** Marks sample data as sample data, everywhere it appears. */
export function IllustrativeNote({ className = '' }) {
  return (
    <p className={`dv-illustrative ${className}`}>
      <Info className="w-3 h-3" aria-hidden="true" />
      {ILLUSTRATIVE_NOTE}
    </p>
  );
}

/** A DOM label that a Three.js scene positions each frame. */
export function SignalLabel({ id, labelsRef, tone = 'default', children }) {
  return (
    <span
      ref={(element) => {
        labelsRef.current[id] = element;
      }}
      className={`dv-signal-label dv-signal-label-${tone}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/** The "press and hold" affordance for the hero object. */
export function HoldHint({ className = '' }) {
  return (
    <p className={`dv-hold-hint ${className}`}>
      <MousePointerClick className="w-3.5 h-3.5" aria-hidden="true" />
      Press and hold the signal
    </p>
  );
}

export { ArrowRight };
