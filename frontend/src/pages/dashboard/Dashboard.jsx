import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Flame, Target, Trophy, ArrowUpRight, CheckCircle2, ChevronRight, Activity, Sparkles, X, MessageCircle, Send, Plus, ArrowRight, Briefcase, Zap, Rocket, LayoutGrid, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboard.service';

import { TiltCard } from '../../components/common/TiltCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Card = ({ children, className = '', span = 1, hoverEffect = 'glow' }) => {
  // Purely presentational accents — the hover effects stay decorative only.
  const effectStyles = {
    glow: 'dv-card-glow',
    gradient: 'dv-card-gradient',
    gold: 'dv-card-gold',
  };

  return (
    <TiltCard 
      variants={itemVariants}
      tiltMax={8}
      className={`bento-card relative overflow-hidden transition-all duration-300 ${effectStyles[hoverEffect] || effectStyles.glow} ${className}`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
    >
      {children}
    </TiltCard>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [readinessVal, setReadinessVal] = useState(0);
  const [dashboardData, setDashboardData] = useState({ readiness: 0, activityMap: {}, dailyTargets: [] });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user?.id) {
      dashboardService.getDashboardData(user.id).then(data => {
        setDashboardData(data);
        setLoadingData(false);
      });
    }
  }, [user]);

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
    if (loadingData) return;
    const targetVal = dashboardData.readiness || user?.skill_score || 0;
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
  }, [dashboardData.readiness, loadingData]);

  return (
    <div className="space-y-7 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dv-hero"
      >
        {/* Soft planetary / orbital decoration */}
        <div className="absolute right-[10%] -top-10 hidden md:block pointer-events-none" aria-hidden="true">
          <div className="dv-planet w-32 h-32 opacity-60" />
          <div className="dv-planet-ring w-52 h-16 -left-10 top-8 absolute" />
        </div>

        <div className="dv-hero__content p-6 md:p-8">
          <div className="max-w-2xl">
            <h1 className="dv-hero__title">
              Welcome back, <span className="dv-hero__accent">{user?.name || 'Explorer'}</span> 👋
            </h1>
            <p className="dv-hero__sub mt-2 text-[0.95rem]">Here's your career intelligence overview for today.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button className="btn btn-secondary flex items-center gap-2 text-sm">
              <LayoutGrid className="w-4 h-4" />
              Layout
            </button>
            <button
              onClick={() => setCopilotOpen(true)}
              className="btn btn-primary flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Ask Dhruv AI
            </button>
          </div>
        </div>
        <div className="dv-hero__glowline" />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card span={2} hoverEffect="gradient">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="dv-icon-tile dv-icon-tile--violet">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="dv-eyebrow">Career Readiness</span>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{readinessVal}%</div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-500">Overall Skill Index</span>
                <span className="text-indigo-600 font-semibold">{readinessVal}% of goal</span>
              </div>
              <div className="dv-bar h-3 w-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessVal}%` }}
                  className="h-full transition-all duration-1000"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card span={1} hoverEffect="glow">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="dv-icon-tile dv-icon-tile--amber mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">12 Days</div>
              <div className="text-sm text-slate-500 font-medium">Learning Streak</div>
            </div>
          </div>
        </Card>

        <Card span={1} hoverEffect="gold">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="dv-icon-tile dv-icon-tile--pink mb-4">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">8 Badges</div>
              <div className="text-sm text-slate-500 font-medium">Milestones Hit</div>
            </div>
          </div>
        </Card>

        <Card span={2} hoverEffect="gradient">
          <div className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="dv-section-title">
                <Rocket className="w-5 h-5 text-violet-600" />
                Growth Roadmap
              </h2>
              <a href="/roadmap" className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1">
                View Full <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-4">
              {[ 
                { label: 'Advanced System Design', progress: 65, icon: Brain, color: 'text-blue-600' },
                { label: 'Cloud Infrastructure', progress: 40, icon: Briefcase, color: 'text-indigo-600' },
                { label: 'Algorithmic Optimization', progress: 85, icon: Zap, color: 'text-amber-600' },
              ].map((item, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{item.progress}%</span>
                  </div>
                  <div className="dv-bar h-1.5 w-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className="h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card span={2} hoverEffect="glow">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="dv-section-title">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                Dhruv AI Insights
              </h2>
              <div className="badge badge-primary uppercase text-[10px] tracking-wide">
                Real-time
              </div>
            </div>
            <div className="dv-inset p-4 relative group cursor-pointer transition-all">
              <p className="text-sm text-slate-600 italic leading-relaxed">
                "Based on your last mock interview, your system design answers are strong, but we need to work on your architectural trade-off explanations."
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setCopilotOpen(true)}
                  className="dv-icon-btn p-2 bg-white"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card span={4} hoverEffect="glow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="dv-section-title">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h2 className="text-[1.0625rem] font-bold text-slate-900 tracking-tight">Activity Heatmap</h2>
              </div>
              <div className="flex gap-2 items-center text-xs text-slate-500 font-medium">
                Less
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-[3px] bg-slate-100 border border-slate-200"></div>
                  <div className="w-3 h-3 rounded-[3px] bg-sky-300"></div>
                  <div className="w-3 h-3 rounded-[3px] bg-indigo-400"></div>
                  <div className="w-3 h-3 rounded-[3px] bg-gradient-to-r from-indigo-600 to-blue-500"></div>
                </div>
                More
              </div>
            </div>
            <div className="w-full overflow-x-auto custom-scrollbar pb-2">
              <div className="flex mb-2 min-w-[600px] relative h-5">
                {heatmapMonths.map((m, i) => (
                  <span 
                    key={i} 
                    className="absolute text-xs text-slate-400 font-semibold"
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
                      let color = 'bg-slate-100 border border-slate-200/60';
                      if (minutes >= 20) color = 'bg-gradient-to-r from-indigo-600 to-blue-500';
                      else if (minutes >= 10) color = 'bg-indigo-400';
                      else if (minutes > 0) color = 'bg-sky-300';
                      const displayDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                      const tooltipText = minutes > 0 
                        ? `${displayDate} — Active for ${minutes} mins` 
                        : `${displayDate} — No activity`;
                      return (
                        <div 
                          key={dateStr} 
                          className={`w-3.5 h-3.5 rounded-[3px] ${color} hover:ring-2 hover:ring-indigo-300 transition-all cursor-pointer`}
                          title={tooltipText}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
