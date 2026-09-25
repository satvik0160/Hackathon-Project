import React from 'react';

/* ───── 3D Planet keyframes (injected once) ───── */
const planetStyles = `
@keyframes hero-planet-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes hero-planet-float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}
@keyframes hero-ring-shimmer {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
@keyframes hero-atmo-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(1.04); }
}
`;

export default function HeroBanner({ firstName = 'Guest' }) {
  return (
    <div 
      className="relative w-full rounded-[22px] overflow-hidden min-h-[174px] p-8 flex flex-col justify-center shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #fae8ff 100%)'
      }}
    >
      <style>{planetStyles}</style>

      {/* ═══════ 3D Planet ═══════ */}
      <div
        className="absolute right-6 top-[-16px] pointer-events-none select-none hidden md:block"
        style={{ animation: 'hero-planet-float 5s ease-in-out infinite' }}
      >
        <svg width="160" height="160" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* ── Main sphere gradient (lit from upper-left) ── */}
            <radialGradient id="hb-sphere" cx="35%" cy="30%" r="65%" fx="35%" fy="30%">
              <stop offset="0%"  stopColor="#e0d4ff" />
              <stop offset="18%" stopColor="#c4b5fd" />
              <stop offset="42%" stopColor="#8b5cf6" />
              <stop offset="72%" stopColor="#5b21b6" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>

            {/* ── Specular highlight ── */}
            <radialGradient id="hb-spec" cx="38%" cy="28%" r="28%">
              <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* ── Atmosphere outer glow ── */}
            <radialGradient id="hb-atmo" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#a78bfa" stopOpacity="0" />
              <stop offset="88%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </radialGradient>

            {/* ── Inner atmosphere rim ── */}
            <radialGradient id="hb-rim" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.15" />
            </radialGradient>

            {/* ── Shadow terminator (dark side) ── */}
            <linearGradient id="hb-shadow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor="#000000" stopOpacity="0" />
              <stop offset="55%" stopColor="#000000" stopOpacity="0" />
              <stop offset="85%" stopColor="#0f0a2a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0a0520" stopOpacity="0.7" />
            </linearGradient>

            {/* ── Ring gradient ── */}
            <linearGradient id="hb-ringG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#e9e0ff" stopOpacity="0.9" />
              <stop offset="25%"  stopColor="#c4b5fd" stopOpacity="0.6" />
              <stop offset="50%"  stopColor="#ddd6fe" stopOpacity="0.85" />
              <stop offset="75%"  stopColor="#a78bfa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e9e0ff" stopOpacity="0.9" />
            </linearGradient>

            {/* ── Ring shadow (cast by planet) ── */}
            <linearGradient id="hb-ringShadow" x1="0.3" y1="0" x2="0.7" y2="0">
              <stop offset="0%"  stopColor="#000" stopOpacity="0" />
              <stop offset="35%" stopColor="#000" stopOpacity="0.3" />
              <stop offset="65%" stopColor="#000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>

            {/* ── Surface band mask ── */}
            <clipPath id="hb-clip">
              <circle cx="120" cy="120" r="56" />
            </clipPath>

            {/* ── Drop shadow filter ── */}
            <filter id="hb-drop" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#7c3aed" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Atmosphere glow (outer) */}
          <circle cx="120" cy="120" r="80"  fill="url(#hb-atmo)"
            style={{ animation: 'hero-atmo-pulse 4s ease-in-out infinite' }} />

          {/* ── Back half of ring (behind planet) ── */}
          <ellipse cx="120" cy="120" rx="95" ry="24"
            fill="none" stroke="url(#hb-ringG)" strokeWidth="7"
            transform="rotate(-18 120 120)"
            strokeDasharray="145 300" strokeDashoffset="220"
            opacity="0.55"
            style={{ animation: 'hero-ring-shimmer 3s ease-in-out infinite' }} />

          {/* ── Planet body ── */}
          <g filter="url(#hb-drop)">
            {/* Base sphere */}
            <circle cx="120" cy="120" r="56" fill="url(#hb-sphere)" />

            {/* Surface texture bands (clipped to sphere) */}
            <g clipPath="url(#hb-clip)" opacity="0.18"
               style={{ animation: 'hero-planet-spin 35s linear infinite', transformOrigin: '120px 120px' }}>
              <ellipse cx="120" cy="92"  rx="60" ry="4" fill="#c4b5fd" />
              <ellipse cx="120" cy="105" rx="58" ry="3" fill="#ddd6fe" />
              <ellipse cx="120" cy="118" rx="56" ry="5" fill="#a78bfa" />
              <ellipse cx="120" cy="132" rx="54" ry="3.5" fill="#c4b5fd" />
              <ellipse cx="120" cy="145" rx="50" ry="4" fill="#8b5cf6" />
              <ellipse cx="120" cy="156" rx="44" ry="3" fill="#ddd6fe" />
            </g>

            {/* Atmosphere rim light */}
            <circle cx="120" cy="120" r="56" fill="url(#hb-rim)" />

            {/* Shadow terminator overlay */}
            <circle cx="120" cy="120" r="56" fill="url(#hb-shadow)" />

            {/* Specular highlight (glass-like reflection) */}
            <circle cx="120" cy="120" r="56" fill="url(#hb-spec)" />

            {/* Tiny bright spot */}
            <circle cx="105" cy="102" r="6" fill="white" opacity="0.15" />
          </g>

          {/* ── Front half of ring ── */}
          <g style={{ animation: 'hero-ring-shimmer 3s ease-in-out infinite' }}>
            {/* Ring shadow strip (planet casts shadow on ring) */}
            <ellipse cx="120" cy="120" rx="95" ry="24"
              fill="none" stroke="url(#hb-ringShadow)" strokeWidth="9"
              transform="rotate(-18 120 120)"
              strokeDasharray="155 300" strokeDashoffset="0"
              opacity="0.35" />

            {/* Main visible front arc */}
            <ellipse cx="120" cy="120" rx="95" ry="24"
              fill="none" stroke="url(#hb-ringG)" strokeWidth="7"
              transform="rotate(-18 120 120)"
              strokeDasharray="155 300" strokeDashoffset="0" />

            {/* Thin bright inner edge */}
            <ellipse cx="120" cy="120" rx="82" ry="20"
              fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
              transform="rotate(-18 120 120)"
              strokeDasharray="130 300" strokeDashoffset="0" />
          </g>
        </svg>
      </div>

      {/* Decorative Sparkle */}
      <div className="absolute right-48 top-6 pointer-events-none hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#fbbf24" />
        </svg>
      </div>

      {/* Decorative Orb */}
      <div className="absolute right-56 bottom-12 pointer-events-none hidden md:block">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="8" fill="#d8b4fe" fillOpacity="0.8" />
        </svg>
      </div>

      {/* Mountain Silhouette Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-40">
        <svg preserveAspectRatio="none" viewBox="0 0 1440 100" fill="none" width="100%" height="100%">
          <path d="M0,100 L0,40 C150,80 300,10 450,50 C600,90 750,20 900,60 C1050,100 1200,30 1440,70 L1440,100 Z" fill="#c084fc" />
          <path d="M0,100 L0,70 C200,30 400,90 600,40 C800,-10 1000,80 1200,50 C1350,30 1440,80 1440,80 L1440,100 Z" fill="#e879f9" opacity="0.5"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-800 font-medium text-[17px]">
            Good to see you, {firstName}!
          </span>
          <div className="w-[28px] h-[28px] rounded-full bg-yellow-100/80 flex items-center justify-center text-sm shadow-sm">
            👋
          </div>
        </div>
        
        <h1 className="text-[40px] leading-tight font-bold mb-2 tracking-tight">
          <span className="text-slate-900">Build Skills. </span>
          <span style={{
            background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Unlock Opportunities.
          </span>
        </h1>
        
        <p className="text-[15px] text-slate-500 font-medium max-w-md">
          Your personalized roadmap to become a future-ready tech professional.
        </p>
      </div>
    </div>
  );
}
