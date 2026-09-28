/**
 * Static diagrams.
 *
 * Rendered instead of a WebGL scene when a visitor asked for reduced motion or
 * the browser cannot give us a context. They carry the same information the
 * animated scene carries — same three parts, same two rails, same three
 * stations — so nothing about the chapter's meaning depends on the 3D layer
 * being available. Copy lives next to them in the DOM either way.
 */
import React from 'react';

const SKILL_NODES = [
  { id: 'React', x: 96, y: 74 },
  { id: 'TypeScript', x: 624, y: 88 },
  { id: 'Node.js', x: 120, y: 436 },
  { id: 'SQL', x: 604, y: 424 },
];

export function HeroSignalStatic() {
  return (
    <svg
      className="dv-static-svg"
      viewBox="0 0 720 520"
      role="img"
      aria-labelledby="dv-hero-static-title dv-hero-static-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dv-hero-static-title">The DevAstra skill signal, static diagram</title>
      <desc id="dv-hero-static-desc">
        Four assessed skills — React, TypeScript, Node.js and SQL — feed a central hub. The hub feeds
        three parts: Assessed evidence, Growth path, and Role match.
      </desc>

      {/* hub → the three parts */}
      <g className="dv-static-lines">
        <path d="M360 215 L248 116" />
        <path d="M360 215 L472 150" />
        <path d="M360 215 L360 336" />
      </g>

      {/* skills → hub */}
      <g className="dv-static-lines dv-static-lines-dim">
        {SKILL_NODES.map((node) => (
          <path key={node.id} d={`M${node.x} ${node.y} L360 215`} />
        ))}
      </g>

      <g className="dv-static-hex dv-static-hex-gold">
        <polygon points="248,82 284,103 284,145 248,166 212,145 212,103" />
        <text x="248" y="120" textAnchor="middle">
          ASSESSED
        </text>
      </g>

      <g className="dv-static-hex dv-static-hex-indigo">
        <polygon points="472,116 508,137 508,179 472,200 436,179 436,137" />
        <text x="472" y="154" textAnchor="middle">
          GROWTH PATH
        </text>
      </g>

      <g className="dv-static-hex dv-static-hex-teal">
        <polygon points="360,302 396,323 396,365 360,386 324,365 324,323" />
        <text x="360" y="340" textAnchor="middle">
          ROLE MATCH
        </text>
      </g>

      <g className="dv-static-hub">
        <polygon points="360,199 376,215 360,231 344,215" />
      </g>

      {SKILL_NODES.map((node) => (
        <g key={node.id} className="dv-static-node">
          <circle cx={node.x} cy={node.y} r="9" />
          <text x={node.x} y={node.y - 18} textAnchor="middle">
            {node.id}
          </text>
        </g>
      ))}

      <text className="dv-static-caption" x="360" y="490" textAnchor="middle">
        Assessed evidence feeds the growth path, which feeds role matching.
      </text>
    </svg>
  );
}

export function GapTracksStatic() {
  const pairs = [0, 1, 2, 3, 4];
  const left = (index) => 120 + index * 118;

  return (
    <svg
      className="dv-static-svg"
      viewBox="0 0 720 400"
      role="img"
      aria-labelledby="dv-gap-static-title dv-gap-static-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dv-gap-static-title">Curriculum against industry demand, static diagram</title>
      <desc id="dv-gap-static-desc">
        The curriculum rail moves slowly while the industry demand rail moves quickly, opening a
        verification gap. Assessed evidence is drawn down between the rails until each requirement
        sits beneath the syllabus item it belongs to.
      </desc>

      <g className="dv-static-lines">
        <path d="M60 110 L660 110" />
        <path d="M60 288 L660 288" />
      </g>

      <text className="dv-static-rail-label" x="60" y="88">
        CURRICULUM — MOVES IN YEARS
      </text>
      <text className="dv-static-rail-label" x="60" y="322">
        INDUSTRY DEMAND — MOVES IN MONTHS
      </text>

      {/* the wedge-shaped gap between the drifts */}
      <polygon className="dv-static-wedge" points="262,110 362,110 386,288 166,288" />

      {pairs.map((index) => (
        <g key={index}>
          <path className="dv-static-evidence" d={`M${left(index)} 122 L${left(index) + 44} 276`} />
          <polygon
            className="dv-static-marker dv-static-marker-indigo"
            points={`${left(index)},96 ${left(index) + 17},105 ${left(index) + 17},123 ${left(index)},132 ${left(index) - 17},123 ${left(index) - 17},105`}
          />
          <polygon
            className="dv-static-marker dv-static-marker-teal"
            points={`${left(index) + 44},274 ${left(index) + 61},283 ${left(index) + 61},301 ${left(index) + 44},310 ${left(index) + 27},301 ${left(index) + 27},283`}
          />
        </g>
      ))}

      <text className="dv-static-gap-label" x="374" y="196" textAnchor="middle">
        VERIFICATION GAP
      </text>
      <text className="dv-static-caption" x="360" y="372" textAnchor="middle">
        Gold links are assessed evidence — each requirement pinned to the skill that satisfies it.
      </text>
    </svg>
  );
}

export function StationsStatic() {
  const stations = [
    { x: 130, title: 'ASSESS & BASELINE' },
    { x: 360, title: 'AI-GUIDED GROWTH' },
    { x: 592, title: 'DETERMINISTIC MATCH' },
  ];

  return (
    <svg
      className="dv-static-svg"
      viewBox="0 0 720 400"
      role="img"
      aria-labelledby="dv-stations-static-title dv-stations-static-desc"
      preserveAspectRatio="xMidYMid meet"
    >
      <title id="dv-stations-static-title">Assess, grow and match, static diagram</title>
      <desc id="dv-stations-static-desc">
        Three stations along one path. Station one assesses and baselines the skill tree. Station two
        branches a route from Dhruv toward the assessed gaps. Station three draws evidence lines from
        the verified profile to matched roles.
      </desc>

      <path className="dv-static-lines" d="M130 196 L360 210 L592 188" />

      {stations.map((station, index) => (
        <g key={station.title} className="dv-static-station">
          <circle cx={station.x} cy={index === 1 ? 210 : 190} r="34" />
          <text x={station.x} y={index === 1 ? 215 : 195} textAnchor="middle">
            {`0${index + 1}`}
          </text>
          <text className="dv-static-rail-label" x={station.x} y="120" textAnchor="middle">
            {station.title}
          </text>
        </g>
      ))}

      {/* station 2 branches toward the two assessed gaps */}
      <g className="dv-static-lines dv-static-lines-indigo">
        <path d="M360 176 L404 116" />
        <path d="M360 176 L316 116" />
      </g>
      <circle className="dv-static-dot dv-static-dot-indigo" cx="404" cy="112" r="8" />
      <circle className="dv-static-dot dv-static-dot-indigo" cx="316" cy="112" r="8" />
      <text className="dv-static-caption" x="360" y="96" textAnchor="middle">
        route to assessed gaps
      </text>

      {/* station 3 evidence lines out to matched roles */}
      <g className="dv-static-lines dv-static-lines-gold">
        <path d="M592 188 L662 138" />
        <path d="M592 188 L664 188" />
        <path d="M592 188 L662 238" />
      </g>
      <circle className="dv-static-dot dv-static-dot-gold" cx="664" cy="138" r="7" />
      <circle className="dv-static-dot dv-static-dot-gold" cx="666" cy="188" r="7" />
      <circle className="dv-static-dot dv-static-dot-gold" cx="664" cy="238" r="7" />

      <text className="dv-static-caption" x="360" y="352" textAnchor="middle">
        Station one feeds station two, which feeds station three — one signal, three stages.
      </text>
    </svg>
  );
}
