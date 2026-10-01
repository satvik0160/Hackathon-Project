/**
 * The four platform capabilities.
 *
 * Previously this section showed unverified placeholder numbers. Now it
 * highlights verified capabilities with short descriptions — no invented
 * counts, no disclaimer needed.
 */
import React from 'react';

import { STATS } from '../content.js';
import { useReducedMotion, useRevealOnEnter } from '../hooks.js';
import { Icon } from '../ui.jsx';

export default function StatsStrip() {
  const reduced = useReducedMotion();
  const sectionRef = React.useRef(null);
  useRevealOnEnter(sectionRef, { enabled: !reduced });

  return (
    <section ref={sectionRef} className="dv-stats" aria-labelledby="dv-stats-heading">
      <div className="landing-container">
        <div className="dv-stats-head">
          <h2 id="dv-stats-heading" className="dv-stats-heading">
            Core capabilities
          </h2>
        </div>

        <ul className="dv-stats-grid">
          {STATS.map((stat) => (
            <li key={stat.id} className="dv-stat" data-reveal>
              <span className="dv-stat-icon">
                <Icon name={stat.icon} className="w-5 h-5" />
              </span>
              <span className="dv-stat-value">{stat.value}</span>
              <span className="dv-stat-label">{stat.label}</span>
              {stat.description && (
                <span className="dv-stat-desc">{stat.description}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
