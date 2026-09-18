import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

export default function ActivityHeatmapCard({ timeData = {} }) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // Normalize to midnight
    today.setHours(0, 0, 0, 0);
    
    // Total days: 40 weeks * 7 days = 280 days
    const totalDays = 280;
    
    const dates = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime());
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    
    const weeksArr = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeksArr.push(dates.slice(i, i + 7));
    }
    
    // Month labels: map column index to month name if month changes
    const mLabels = [];
    let lastMonth = -1;
    weeksArr.forEach((week, index) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        mLabels.push({ index, label: firstDay.toLocaleString('default', { month: 'short' }) });
        lastMonth = month;
      }
    });

    return { weeks: weeksArr, monthLabels: mLabels };
  }, []);

  const getLevelColor = (minutes) => {
    if (minutes >= 30) return '#4338ca'; // level-4
    if (minutes >= 20) return '#6366f1'; // level-3
    if (minutes >= 10) return '#3b82f6'; // level-2
    if (minutes > 0) return '#a5f3fc';   // level-1
    return 'rgba(139,92,246,0.06)';      // level-0
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-5 min-h-[155px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-[32px] h-[32px] rounded-xl bg-violet-100 flex items-center justify-center">
            <Calendar className="w-4.5 h-4.5 text-violet-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-slate-800">Activity Heatmap</h2>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: 'rgba(139,92,246,0.06)' }} />
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#a5f3fc' }} />
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#3b82f6' }} />
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#6366f1' }} />
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: '#4338ca' }} />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-max relative pt-5">
          {/* Month labels */}
          <div className="absolute top-0 left-0 w-full h-5">
            {monthLabels.map(({ index, label }, i) => (
              <span 
                key={i} 
                className="absolute text-[11px] text-slate-400"
                style={{ left: `${index * 11.5}px` }}
              >
                {label}
              </span>
            ))}
          </div>
          
          {/* Grid */}
          <div className="flex gap-[1.5px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[1.5px]">
                {week.map((date, dIdx) => {
                  const dateStr = formatDate(date);
                  const seconds = timeData[dateStr] || 0;
                  const minutes = Math.floor(seconds / 60);
                  const bgColor = getLevelColor(minutes);
                  
                  return (
                    <div 
                      key={dIdx}
                      className="w-[10px] h-[10px] rounded-[3px] transition-colors hover:ring-1 hover:ring-slate-300 relative group cursor-pointer"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                        {dateStr}: {minutes} min
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
