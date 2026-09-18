import React from 'react';

export default function HeroBanner({ firstName = 'Guest' }) {
  return (
    <div 
      className="relative w-full rounded-[22px] overflow-hidden min-h-[174px] p-8 flex flex-col justify-center shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #fae8ff 100%)'
      }}
    >
      {/* Decorative Planet SVG */}
      <div className="absolute right-8 top-[-20px] pointer-events-none select-none hidden md:block">
        <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="planetGrad" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#312e81" />
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="50%" stopColor="rgba(196,181,253,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#glow)" />
          {/* Back of ring */}
          <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="url(#ringGrad)" strokeWidth="6" transform="rotate(-20 100 100)" strokeDasharray="250 250" strokeDashoffset="250"/>
          <circle cx="100" cy="100" r="55" fill="url(#planetGrad)" />
          {/* Front of ring */}
          <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="url(#ringGrad)" strokeWidth="6" transform="rotate(-20 100 100)" strokeDasharray="280 280" strokeDashoffset="0"/>
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
