import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Flame, Target, Trophy, ArrowUpRight, CheckCircle2, ChevronRight, Activity, Sparkles, X, MessageCircle, Send, Plus, ArrowRight, Briefcase } from 'lucide-react';
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

const Card = ({ children, className = '', span = 1 }) => (
  <TiltCard 
    variants={itemVariants}
    tiltMax={5}
    className={`bento-card relative overflow-hidden ${className}`}
    style={{ gridColumn: `span ${span} / span ${span}` }}
  >
    {children}
  </TiltCard>
);

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
    <div className="space-y-6 pb-24 font-sans text-slate-900">
      
      {/* HERO / WELCOME SECTION */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-purple-50/70 border border-indigo-200/70 rounded-3xl p-8 overflow-hidden shadow-xl shadow-slate-200/50 flex items-center justify-between"
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-200/60 rounded-full opacity-60 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 right-32 w-32 h-32 bg-purple-200/60 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Good Morning, {user?.name?.split(' ')[0] || 'Explorer'} 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Continue your journey toward becoming a better developer.
          </p>
        </div>
        
        {/* Educational/Developer Abstract Illustration */}
        <div className="hidden md:flex relative z-10 items-center justify-center bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-4 rounded-2xl">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-purple-600">
              <Brain className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 12-Column Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
      >
        
        {/* A. Main Hero Sprint Card (Top Left) */}
        <Card span={12} className="lg:col-span-12 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-sky-700 tracking-wider uppercase">CURRENT ROADMAP SPRINT</span>
                <span className="bg-sky-50 text-sky-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                  Week 1 of 8
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{user?.career_goal || 'Full-Stack Architecture'}</h1>
              <p className="text-slate-500">Master the required skills to achieve your target role.</p>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white/70 border border-slate-200/80 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-medium block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-slate-900">{user?.skills?.[0] || 'Machine Learning'}</span>
                <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                  48% <ArrowRight className="w-3 h-3" /> 55%
                </span>
              </div>
            </div>
            <div className="flex-1 bg-white/70 border border-slate-200/80 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-medium block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-slate-900">{user?.skills?.[1] || 'System Design'}</span>
                <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                  20% <ArrowRight className="w-3 h-3" /> 35%
                </span>
              </div>
            </div>
          </div>

          <button className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold w-fit px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-95 hover:scale-[1.02] transition-all duration-200 flex items-center gap-2">
            Launch Next Module <ArrowUpRight className="w-4 h-4" />
          </button>
        </Card>

        {/* C. Career Readiness Interactive Gauge */}
        <Card span={6} className="lg:col-span-6 flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <circle cx="96" cy="96" r="80" className="stroke-slate-200" strokeWidth="16" fill="none" />
              <motion.circle 
                cx="96" cy="96" r="80" 
                className="transition-all duration-300 ease-out"
                stroke="url(#gaugeGradient)" 
                strokeWidth="16" 
                fill="none" 
                strokeDasharray="502" 
                strokeDashoffset={502 - (502 * readinessVal) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute text-center">
              <span className="block text-4xl font-bold text-slate-900 font-mono">{readinessVal}%</span>
              <span className="block text-xs text-sky-600 font-bold uppercase mt-0.5">Lv. {dashboardData.skillLevel || 1}</span>
              <span className="block text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Skill Score</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Vector Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: 'Technical Skills', score: 85, color: 'bg-gradient-to-r from-sky-400 to-blue-500' },
                { name: 'Problem Solving', score: 70, color: 'bg-gradient-to-r from-indigo-500 to-violet-500' },
                { name: 'Interview Ready', score: 45, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
              ].map(vec => (
                <div key={vec.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{vec.name}</span>
                    <span className="text-slate-900 font-mono">{vec.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${vec.color}`} style={{ width: `${vec.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-indigo-600 hover:text-purple-600 flex items-center gap-1 font-semibold transition-colors">
              View full analysis <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* E. Daily Planner / "Today's Mission" Widget */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Today's Mission
            </h2>
            <button className="text-xs bg-white/70 hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors font-medium">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData.dailyTargets.map((task, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all row-hover ${task.done ? 'bg-emerald-50/80 border-emerald-200' : 'bg-white/70 border-slate-200/80 hover:border-indigo-300'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'}`}>
                  {task.done && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{task.time}</span>
                    <span className="text-[10px] text-slate-500">{task.duration}</span>
                  </div>
                </div>
                {task.done && <span className="text-xs font-bold text-emerald-600">+50 XP</span>}
              </div>
            ))}
          </div>
        </Card>

        {/* F. Opportunity Match & Explainable Skill Gap Card */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-amber-600" />
                Top Opportunity Match
              </h2>
              <p className="text-sm text-slate-500">Google • {user?.career_goal || 'Frontend Engineer (L4)'}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-center">
              <span className="block text-xl font-bold text-amber-700 font-mono leading-none">72%</span>
              <span className="text-[10px] text-amber-600 uppercase font-semibold">Match</span>
            </div>
          </div>

          <div className="bg-white/70 border border-slate-200/80 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 font-semibold">Skill</th>
                  <th className="px-4 py-2 font-semibold">Required</th>
                  <th className="px-4 py-2 font-semibold">You</th>
                  <th className="px-4 py-2 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-2 text-slate-700">React.js</td>
                  <td className="px-4 py-2 text-slate-500">80</td>
                  <td className="px-4 py-2 text-slate-900 font-semibold">82</td>
                  <td className="px-4 py-2 text-center text-emerald-600">✓</td>
                </tr>
                <tr className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-2 text-slate-700">TypeScript</td>
                  <td className="px-4 py-2 text-slate-500">75</td>
                  <td className="px-4 py-2 text-slate-900 font-semibold">78</td>
                  <td className="px-4 py-2 text-center text-emerald-600">✓</td>
                </tr>
                <tr className="transition-colors hover:bg-slate-50/80">
                  <td className="px-4 py-2 text-slate-700">System Design</td>
                  <td className="px-4 py-2 text-slate-500">70</td>
                  <td className="px-4 py-2 text-amber-700 font-semibold">48</td>
                  <td className="px-4 py-2 text-center text-amber-600">⚠</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Improve missing skills
          </button>
        </Card>

        {/* D. Activity Contribution Heatmap */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Activity Heatmap
            </h2>
            <div className="flex gap-2 items-center text-xs text-slate-500 font-medium">
              Less
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-200"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              </div>
              More
            </div>
          </div>
          
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            
            {/* Months Header */}
            <div className="flex mb-2 min-w-[600px] relative h-5">
              {heatmapMonths.map((m, i) => (
                <span 
                  key={i} 
                  className="absolute text-xs text-slate-500 font-medium" 
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
                    // Heatmap intensity: gradient fill for high activity
                    
                    let color = 'bg-slate-100 border border-slate-200/60'; // Empty day
                    if (minutes >= 20) color = 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500';
                    else if (minutes >= 10) color = 'bg-emerald-400';
                    else if (minutes > 0) color = 'bg-emerald-500';
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
                        className={`w-3.5 h-3.5 rounded-[2px] ${color} hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer`}
                        title={tooltipText}

                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

      </motion.div>


    </div>
  );
}
