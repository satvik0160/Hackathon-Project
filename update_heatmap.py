import re
from datetime import datetime, timedelta

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

heatmap_script = """{Array.from({ length: 40 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    // Calculate date for this cell (assuming it ends on today)
                    const totalDays = 40 * 7;
                    const daysAgo = totalDays - (weekIdx * 7 + dayIdx) - 1;
                    const d = new Date();
                    d.setDate(d.getDate() - daysAgo);
                    const dateStr = d.toISOString().split('T')[0];
                    
                    const count = dashboardData.activityMap[dateStr] || 0;
                    
                    let color = 'bg-slate-800/40';
                    if (count > 3) color = 'bg-emerald-400';
                    else if (count > 1) color = 'bg-emerald-500';
                    else if (count > 0) color = 'bg-emerald-800';
                    
                    return (
                      <div 
                        key={`${weekIdx}-${dayIdx}`} 
                        className={`w-3.5 h-3.5 rounded-[2px] ${color} hover:ring-2 hover:ring-white/30 transition-all cursor-pointer`}
                        title={`${d.toLocaleDateString()} — ${count} targets completed`}
                      />
                    );
                  })}
                </div>
              ))}"""

content = re.sub(r'\{Array\.from\(\{ length: 40 \}\)\.map\(\(_, weekIdx\) => \(.*?\}\)\)\}', heatmap_script, content, flags=re.DOTALL)

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)
