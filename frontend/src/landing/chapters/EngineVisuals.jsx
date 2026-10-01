/**
 * The four engine visuals.
 *
 * All four are real DOM/SVG rather than screenshots: the numbers stay selectable
 * and editable, and they cannot drift from the sample data in content.js. Each
 * one animates only while its stage is the active one (the CSS keys off
 * `.is-active`), which is also what keeps four stages from animating at once.
 *
 * Everything shown here is sample data and each panel is labelled as such.
 */
import React from 'react';
import { Check, Flame } from 'lucide-react';
import { IllustrativeNote } from '../ui.jsx';

export function CopilotVisual({ mock }) {
  return (
    <div className="dv-mock">
      <div className="dv-mock-head">
        <span className="dv-mock-avatar">
          <img src="/dhruvlogo.webp" alt="" />
        </span>
        <span className="dv-mock-headings">
          <span className="dv-mock-title">Dhruv · AI Career Copilot</span>
          <span className="dv-mock-meta">{mock.role}</span>
        </span>
        <span className="dv-chip">Live</span>
      </div>

      <div className="dv-chat">
        <p className="dv-bubble dv-bubble-ai" style={{ '--i': 0 }}>
          {mock.question}
        </p>
        <p className="dv-bubble dv-bubble-user" style={{ '--i': 1 }}>
          {mock.answer}
        </p>
        <p className="dv-bubble dv-bubble-ai" style={{ '--i': 2 }}>
          {mock.feedback}
        </p>
      </div>
    </div>
  );
}

/* Fixed-coordinate diagram: skill tree on the left, roles on the right, one
   evidence path per skill so every match is visibly attributable. */
const MATCH_SKILLS = [
  { label: 'React', y: 44, role: 0 },
  { label: 'TypeScript', y: 100, role: 0 },
  { label: 'Node.js', y: 156, role: 1 },
  { label: 'SQL', y: 212, role: 2 },
  { label: 'System Design', y: 268, role: 1 },
];

const MATCH_ROLES = [
  { label: 'Frontend Engineer', meta: 'Bengaluru · Full-time', score: 92, y: 60 },
  { label: 'Full Stack Developer', meta: 'Remote · Full-time', score: 78, y: 160 },
  { label: 'Data Analyst', meta: 'Hybrid · Internship', score: 61, y: 260 },
];

export function MatchingVisual() {
  return (
    <div className="dv-mock dv-mock-flush">
      <svg
        className="dv-evidence"
        viewBox="0 0 620 320"
        role="img"
        aria-label="Evidence paths from the assessed skills React, TypeScript, Node.js, SQL and System Design to the matched roles Frontend Engineer at 92 percent, Full Stack Developer at 78 percent and Data Analyst at 61 percent."
      >
        <g className="dv-evidence-paths">
          {MATCH_SKILLS.map((skill, index) => {
            const role = MATCH_ROLES[skill.role];
            return (
              <path
                key={skill.label}
                className="dv-path"
                style={{ '--i': index }}
                d={`M150,${skill.y} C 250,${skill.y} 260,${role.y} 356,${role.y}`}
              />
            );
          })}
        </g>

        {MATCH_SKILLS.map((skill) => (
          <g key={skill.label} className="dv-evidence-skill">
            <rect x="8" y={skill.y - 16} width="142" height="32" rx="10" />
            <circle cx="150" cy={skill.y} r="5" />
            <text x="26" y={skill.y + 5}>
              {skill.label}
            </text>
          </g>
        ))}

        {MATCH_ROLES.map((role) => (
          <g key={role.label} className="dv-evidence-role">
            <rect x="356" y={role.y - 32} width="256" height="64" rx="14" />
            <text className="dv-evidence-role-title" x="374" y={role.y - 8}>
              {role.label}
            </text>
            <text className="dv-evidence-role-meta" x="374" y={role.y + 14}>
              {role.meta}
            </text>
            <text className="dv-evidence-score" x="592" y={role.y + 6} textAnchor="end">
              {role.score}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function GamificationVisual({ mock }) {
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - mock.progress / 100);

  return (
    <div className="dv-mock">
      <div className="dv-mock-head">
        <span className="dv-mock-icon">
          <Flame className="w-4 h-4" aria-hidden="true" />
        </span>
        <span className="dv-mock-headings">
          <span className="dv-mock-title">{mock.streak}</span>
          <span className="dv-mock-meta">{mock.streakMeta}</span>
        </span>
        <span className="dv-chip">{mock.level}</span>
      </div>

      <div className="dv-xp">
        <svg className="dv-ring" viewBox="0 0 120 120" role="img" aria-label={`${mock.xp}, ${mock.toNext}`}>
          <circle className="dv-ring-track" cx="60" cy="60" r="52" />
          <circle
            className="dv-ring-value"
            cx="60"
            cy="60"
            r="52"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="dv-xp-readout">
          <span className="dv-xp-value">{mock.xp}</span>
          <span className="dv-mock-meta">{mock.toNext}</span>
        </div>
      </div>

      <p className="dv-mock-meta dv-board-title">WEEKLY LEADERBOARD</p>
      <ul className="dv-board">
        {mock.board.map((row) => (
          <li key={row.rank} className={row.name === 'You' ? 'is-self' : ''}>
            <span className="dv-board-rank">{row.rank}</span>
            <span className="dv-board-name">{row.name}</span>
            <span className="dv-board-xp">{row.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsVisual({ mock }) {
  return (
    <div className="dv-mock">
      <div className="dv-mock-head">
        <span className="dv-mock-headings">
          <span className="dv-mock-title">Cohort skill coverage</span>
          <span className="dv-mock-meta">Every bar is a share of the cohort assessed at or above the industry bar.</span>
        </span>
        <span className="dv-chip">{mock.cohort}</span>
      </div>

      <ul className="dv-coverage">
        {mock.bars.map((bar) => (
          <li key={bar.label} className={bar.value < 40 ? 'is-gap' : ''}>
            <span className="dv-coverage-label">{bar.label}</span>
            <span className="dv-coverage-track">
              <span className="dv-coverage-fill" style={{ '--value': `${bar.value}%` }} />
            </span>
            <span className="dv-coverage-value">{bar.value}%</span>
          </li>
        ))}
      </ul>

      <div className="dv-insight">
        <span className="dv-mock-icon">
          <Check className="w-4 h-4" aria-hidden="true" />
        </span>
        <span className="dv-mock-headings">
          <span className="dv-mock-title">{mock.insightTitle}</span>
          <span className="dv-mock-meta">{mock.insight}</span>
        </span>
      </div>
    </div>
  );
}

const VISUALS = {
  copilot: CopilotVisual,
  matching: MatchingVisual,
  gamification: GamificationVisual,
  analytics: AnalyticsVisual,
};

export function EngineVisual({ item }) {
  const Visual = VISUALS[item.id];
  if (!Visual) return null;
  return (
    <div className="dv-engine-mock">
      <Visual mock={item.mock} />
      
    </div>
  );
}
