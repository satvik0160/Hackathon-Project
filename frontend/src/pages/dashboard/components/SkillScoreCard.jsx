import React, { useEffect, useState } from 'react';

export default function SkillScoreCard({ score = 0, level = 1 }) {
  const [offset, setOffset] = useState(0);
  const [readinessVal, setReadinessVal] = useState(0);
  
  const radius = 78; // ~170px diameter with 14px stroke
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  useEffect(() => {
    // Trigger animation after mount
    setOffset(strokeDashoffset);
  }, [strokeDashoffset]);

  useEffect(() => {
    const targetVal = clampedScore;
    if (targetVal === 0) {
      setReadinessVal(0);
      return;
    }
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= targetVal) {
          setReadinessVal(targetVal);
          clearInterval(interval);
          return;
        }
        current += Math.max(1, Math.floor(targetVal / 30));
        setReadinessVal(current);
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [clampedScore]);

  const getMessage = (s) => {
    if (s === 0) return "Take your first assessment!";
    if (s < 30) return "You're just getting started! Keep going.";
    if (s < 60) return "Making good progress!";
    if (s < 80) return "You're doing great!";
    return "Outstanding performance!";
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center w-full shadow-sm rounded-[22px] p-6"
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(139,92,246,0.12)',
        minHeight: '262px'
      }}
    >
      {/* Decorative Dots */}
      <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-pink-400 opacity-60"></div>
      <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-blue-400 opacity-60"></div>
      
      {/* Gold Sparkle */}
      <div className="absolute top-8 left-8 text-amber-500 opacity-90 animate-[spin_6s_linear_infinite]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="relative w-[170px] h-[170px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 170 170">
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" /> {/* purple-500 */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
            </linearGradient>
          </defs>
          
          {/* Track */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="transparent"
            stroke="rgba(139,92,246,0.1)"
            strokeWidth="14"
          />
          
          {/* Arc */}
          <circle
            cx="85"
            cy="85"
            r={radius}
            fill="transparent"
            stroke="url(#score-gradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference} /* start hidden for animation */
            style={{
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[42px] font-bold text-slate-800 leading-none">{readinessVal}%</span>
          <span className="text-[11px] font-semibold text-slate-500 tracking-widest mt-1">
            SKILL SCORE
          </span>
          <div className="mt-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-700 tracking-wider">LEVEL {level}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600 font-medium text-center">
        {getMessage(clampedScore)}
      </p>
    </div>
  );
}
