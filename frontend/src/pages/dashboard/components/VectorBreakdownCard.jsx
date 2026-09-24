import React from 'react';
import { Settings, Brain, User, Info } from 'lucide-react';

export default function VectorBreakdownCard({ 
  technical = 0, 
  problemSolving = 0, 
  interviewReady = 0, 
  analysisLink = '/analytics'
}) {
  return (
    <div 
      className="flex flex-col p-5 shadow-sm rounded-[22px] relative"
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(139,92,246,0.12)',
        minHeight: '261px'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[15px] font-bold text-slate-800">Vector Breakdown</h3>
        <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-slate-400">
          <span className="text-[10px] font-serif italic font-bold">i</span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-6">
        {/* Left: Orbit Diagram */}
        <div className="relative w-[150px] h-[150px] flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full absolute inset-0 orbit-rotate">
            {/* Rings */}
            <circle cx="80" cy="80" r="35" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
            <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
            <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
            
            {/* Nodes */}
            <circle cx="115" cy="80" r="4" fill="#a855f7" /> {/* Inner ring node */}
            <circle cx="50" cy="28" r="4" fill="#3b82f6" /> {/* Middle ring node */}
            <circle cx="27" cy="133" r="4" fill="#22c55e" /> {/* Outer ring node 1 */}
            <circle cx="145" cy="120" r="4" fill="#f97316" /> {/* Outer ring node 2 */}
          </svg>
          
          {/* Center Orb */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.8)] flex items-center justify-center z-10 relative animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="animate-[spin_4s_linear_infinite]">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <MetricRow 
            icon={<Settings size={14} className="text-blue-600" />}
            bgClass="bg-blue-100"
            label="Technical Skills"
            value={technical}
            barColor="bg-blue-500"
            trackColor="bg-blue-100"
            textColor="text-blue-700"
          />
          <MetricRow 
            icon={<Brain size={14} className="text-purple-600" />}
            bgClass="bg-purple-100"
            label="Problem Solving"
            value={problemSolving}
            barColor="bg-purple-500"
            trackColor="bg-purple-100"
            textColor="text-purple-700"
          />
          <MetricRow 
            icon={<User size={14} className="text-teal-600" />}
            bgClass="bg-teal-100"
            label="Interview Ready"
            value={interviewReady}
            barColor="bg-teal-500"
            trackColor="bg-teal-100"
            textColor="text-teal-700"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <a 
          href={analysisLink || '/analytics'} 
          className="text-[11.5px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View full analysis →
        </a>
      </div>
    </div>
  );
}

function MetricRow({ icon, bgClass, label, value, barColor, trackColor, textColor }) {
  const safeValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${bgClass}`}>
          {icon}
        </div>
        <span className="text-[12px] text-slate-700 font-medium flex-1">{label}</span>
        <span className={`text-[12px] font-bold ${textColor}`}>{safeValue}%</span>
      </div>
      <div className={`h-[6px] w-full rounded-full overflow-hidden ${trackColor}`}>
        <div 
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
