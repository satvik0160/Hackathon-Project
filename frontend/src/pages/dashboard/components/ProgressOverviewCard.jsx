import React from 'react';
import { BarChart3, CheckSquare, ClipboardList, ShieldCheck, Clock } from 'lucide-react';

export default function ProgressOverviewCard({
  skillsCompleted, skillsTotal,
  projectsBuilt, projectsTotal,
  quizzesPassed, quizzesTotal,
  hoursLearned, hoursTotal
}) {
  const renderCard = (title, val, total, unit, Icon, colorClass, bgClass, barClass) => {
    const displayVal = val !== undefined ? val : 0;
    const displayTotal = total !== undefined ? total : '--';
    const hasTotal = typeof total === 'number' && total > 0;
    const percentage = hasTotal ? Math.min(100, Math.max(0, (displayVal / total) * 100)) : 0;
    
    return (
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/40 border border-white/50">
        <div className="flex items-center gap-2">
          <div className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center ${bgClass}`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
          <span className="text-[11.5px] text-slate-500 font-medium">{title}</span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-[17px] font-bold text-slate-800">{displayVal}{unit}</span>
          <span className="text-[12px] text-slate-400">/ {displayTotal}{unit}</span>
        </div>
        <div className="h-[6px] w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-5 min-h-[155px]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-[34px] h-[34px] rounded-xl bg-violet-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-violet-500" />
        </div>
        <h2 className="text-[15px] font-semibold text-slate-800">Progress Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderCard(
          "Skills Completed", skillsCompleted, skillsTotal, "", 
          CheckSquare, "text-violet-500", "bg-violet-100", "bg-violet-500"
        )}
        {renderCard(
          "Projects Built", projectsBuilt, projectsTotal, "", 
          ClipboardList, "text-blue-500", "bg-blue-100", "bg-blue-500"
        )}
        {renderCard(
          "Quizzes Passed", quizzesPassed, quizzesTotal, "", 
          ShieldCheck, "text-emerald-500", "bg-emerald-100", "bg-emerald-500"
        )}
        {renderCard(
          "Hours Learned", hoursLearned, hoursTotal, "h", 
          Clock, "text-orange-500", "bg-orange-100", "bg-orange-500"
        )}
      </div>
    </div>
  );
}
