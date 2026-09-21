import React from 'react';
import { Atom, ArrowRight, Layers, Code, Layout } from 'lucide-react';

export default function RoadmapSprintCard({ 
  targetRole = '--', 
  roleDescription = '', 
  weekNumber = 1, 
  totalWeeks = 12, 
  skills = [], 
  onLaunchModule 
}) {
  
  if (!targetRole || targetRole === '--') {
    return (
      <div className="w-full rounded-[22px] border border-purple-500/10 p-6 flex flex-col items-center justify-center shadow-sm min-h-[300px]"
           style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
        <p className="text-slate-500 font-medium text-lg">Pick a target role to start your sprint</p>
      </div>
    );
  }

  const displaySkills = skills.slice(0, 2);

  return (
    <div className="w-full rounded-[22px] border p-6 flex flex-col shadow-sm relative overflow-hidden"
         style={{ 
           backgroundColor: 'rgba(255,255,255,0.85)', 
           borderColor: 'rgba(139,92,246,0.12)',
           backdropFilter: 'blur(12px)'
         }}>
      
      {/* Top Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full tracking-wide">
            CURRENT ROADMAP SPRINT
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full tracking-wide">
            Week {weekNumber} of {totalWeeks}
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-700 text-xs font-bold tracking-wide">Active</span>
        </div>
      </div>

      {/* Role Section */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-[69px] h-[69px] rounded-full flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
          <img src="/images/icons/target_role_v2.jpg" alt="Target Role" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-[13px] text-slate-500 font-medium uppercase tracking-wider mb-1">Target Role</p>
          <h2 className="text-[24px] font-bold text-slate-900 leading-tight mb-1">{targetRole}</h2>
          {roleDescription && (
            <p className="text-[13.5px] text-slate-500 max-w-lg">{roleDescription}</p>
          )}
        </div>
      </div>

      {/* Skills Row */}
      {displaySkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {displaySkills.map((skill, index) => {
            const isFirst = index === 0;
            const bgClass = isFirst ? 'bg-teal-50' : 'bg-purple-50';
            const iconColor = isFirst ? 'text-teal-600' : 'text-purple-600';
            const trackColor = isFirst ? 'bg-teal-100' : 'bg-purple-100';
            const fillColor = isFirst ? 'linear-gradient(90deg, #14b8a6, #3b82f6)' : 'linear-gradient(90deg, #a855f7, #ec4899)';
            const textColor = isFirst ? 'text-teal-600' : 'text-purple-600';
            
            const Icon = skill.icon === 'Layers' ? Layers : (isFirst ? Code : Layout);

            return (
              <div key={index} className="bg-white rounded-[18px] border border-slate-100 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                    <Icon className={iconColor} size={20} />
                  </div>
                  <span className="text-[15px] font-semibold text-slate-800">{skill.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex-1 h-[8px] rounded-full ${trackColor} overflow-hidden`}>
                    <div className="h-full rounded-full" 
                         style={{ width: `${skill.percent}%`, background: fillColor }}></div>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{skill.percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 rounded-[18px] border border-slate-100 text-center text-slate-500 text-sm">
          No skills data available for this sprint.
        </div>
      )}

      {/* Launch Button */}
      <button 
        onClick={onLaunchModule}
        className="self-start px-6 py-3 rounded-full flex items-center gap-2 text-white font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg"
        style={{ 
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
          boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)'
        }}
      >
        Launch Next Module <ArrowRight size={18} />
      </button>

    </div>
  );
}
