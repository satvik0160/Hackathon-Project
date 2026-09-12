import re

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Insert state and logic
logic_to_insert = """
  const [timeData, setTimeData] = useState({});
  useEffect(() => {
    import('../../utils/timeTracker').then(({ getTimeData }) => {
      setTimeData(getTimeData());
      const handleUpdate = () => setTimeData(getTimeData());
      window.addEventListener('timeTrackerUpdate', handleUpdate);
      return () => window.removeEventListener('timeTrackerUpdate', handleUpdate);
    });
  }, []);

  const totalWeeks = 40;
  const todayDate = new Date();
  const heatmapDays = [];
  for (let i = (totalWeeks * 7) - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    heatmapDays.push(d);
  }
  
  const heatmapWeeks = [];
  for (let i = 0; i < totalWeeks; i++) {
    heatmapWeeks.push(heatmapDays.slice(i * 7, (i + 1) * 7));
  }
  
  const heatmapMonths = [];
  let lastMonthStr = '';
  heatmapWeeks.forEach((week, weekIdx) => {
    const mStr = week[0].toLocaleString('default', { month: 'short' });
    if (mStr !== lastMonthStr) {
      heatmapMonths.push({ weekIdx, label: mStr });
      lastMonthStr = mStr;
    }
  });

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    if (loadingData) return;", logic_to_insert + "    if (loadingData) return;")

# 2. Replace Heatmap JSX
old_heatmap_pattern = r'<div className="w-full overflow-x-auto custom-scrollbar pb-2">.*?</div>\s*</div>\s*</Card>'

new_heatmap = """<div className="w-full overflow-x-auto custom-scrollbar pb-2">
            
            {/* Months Header */}
            <div className="flex mb-2 min-w-[600px] relative h-5">
              {heatmapMonths.map((m, i) => (
                <span 
                  key={i} 
                  className="absolute text-xs text-slate-400 font-medium" 
                  style={{ left: `${m.weekIdx * (14 + 4)}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-1 min-w-[600px]">
              {heatmapWeeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((dateObj, dayIdx) => {
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const seconds = timeData[dateStr] || 0;
                    const minutes = Math.floor(seconds / 60);
                    
                    let color = 'bg-slate-800/40 dark:bg-slate-800/40 bg-gray-200';
                    if (minutes >= 20) color = 'bg-emerald-400';
                    else if (minutes >= 10) color = 'bg-emerald-500';
                    else if (minutes > 0) color = 'bg-emerald-800';
                    else {
                      // fallback to random for history visual if it's not today, so it doesn't look totally empty
                      // Actually, if it's functional, let's keep it empty unless they have data, 
                      // but it's a demo, so maybe we leave some fake data?
                      // The user said: "make it functional as if the user opens the website and spends 20 mins... green on that day".
                      // I will just make it strictly functional! No fake data.
                    }
                    
                    // Display nice tooltip
                    const displayDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    const tooltipText = minutes > 0 
                      ? `${displayDate} — Active for ${minutes} mins` 
                      : `${displayDate} — No activity`;

                    return (
                      <div 
                        key={dateStr} 
                        className={`w-3.5 h-3.5 rounded-[2px] ${color} hover:ring-2 hover:ring-slate-400/50 transition-all cursor-pointer`}
                        title={tooltipText}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>"""

content = re.sub(old_heatmap_pattern, new_heatmap, content, flags=re.DOTALL)

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)
