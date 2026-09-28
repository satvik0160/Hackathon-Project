/**
 * The four headline numbers.
 *
 * These values are unverified placeholders carried over from the previous
 * landing page, so they are kept for visual parity but labelled in the open —
 * once, in the strip, with `aria-describedby` wiring the caveat to every card
 * so it is announced alongside the number rather than overlooked.
 */
import React from 'react';

import { STATS } from '../content.js';
import { useReducedMotion, useRevealOnEnter } from '../hooks.js';
import { Icon } from '../ui.jsx';

const NOTE_ID = 'dv-stats-note';

export default function StatsStrip() {
  const reduced = useReducedMotion();
  const sectionRef = React.useRef(null);
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  return (
    <section ref={sectionRef} className="dv-stats" aria-labelledby="dv-stats-heading">
      <div className="landing-container">
        <div className="dv-stats-head">
          <h2 id="dv-stats-heading" className="dv-stats-heading">
            Platform at a glance
          </h2>
          <p id={NOTE_ID} className="dv-stats-note">
            <Icon name="Info" className="w-3.5 h-3.5" />
            Illustrative demo figures — not verified. Shown to demonstrate the interface.
          </p>
        </div>

        <ul className="dv-stats-grid">
          {STATS.map((stat) => (
            <li key={stat.id} className="dv-stat" aria-describedby={NOTE_ID} data-reveal>
              <span className="dv-stat-icon">
                <Icon name={stat.icon} className="w-5 h-5" />
              </span>
              <span className="dv-stat-value">{stat.value}</span>
              <span className="dv-stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
