import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Flame, Target, Trophy, ArrowUpRight, CheckCircle2, ChevronRight, Activity, Sparkles, X, MessageCircle, Send, Plus, ArrowRight, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease: [0.16, 1, 0.3, 1] }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Card = ({ children, className = '', span = 1 }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ y: -4, scale: 1.01, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] shadow-2xl shadow-black/30 rounded-3xl p-6 relative overflow-hidden ${className}`}
    style={{ gridColumn: `span ${span} / span ${span}` }}
  >
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    readiness: 0,
    skillLevel: 1,
    activityMap: {},
    dailyTargets: [],
    completedTargets: 0,
    totalTargets: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch dashboard data
  useEffect(() => {
    if (user?.id) {
      dashboardService.getDashboardData(user.id)
        .then(data => {
          setDashboardData(data);
          setLoadingData(false);
        })
        .catch(err => {
          console.error('[Dashboard] Failed to load data:', err);
          setError(err?.message || 'Failed to load dashboard data');
          setLoadingData(false);
        });
    }
  }, [user]);

  // Extract user data
  const firstName = (user?.full_name || user?.name || user?.user_metadata?.full_name || 'Explorer').split(' ')[0];
  const skillScore = dashboardData.readiness || user?.skill_score_percent || user?.skill_score || 0;

  // Target role from user profile (if set during onboarding)
  const targetRole = user?.target_role || user?.career_goal || '';

  // Skills from user profile (these are the skills they're working on)
  const userSkills = user?.skills || [];
  const roadmapSkills = userSkills.length > 0
    ? userSkills.slice(0, 2).map((skill, idx) => ({
        name: typeof skill === 'string' ? skill : skill.name || skill,
        percent: typeof skill === 'object' ? (skill.progress || 0) : 0,
        icon: idx === 0 ? 'Code' : 'Layout',
        color: idx === 0 ? 'teal' : 'purple'
      }))
    : [];

  // Build tasks from dailyTargets
  const tasks = (dashboardData.dailyTargets || []).map(t => ({
    id: t.id,
    title: t.title,
    done: t.done
  }));

  // Calculate total hours from time data
  const totalSeconds = Object.values(timeData).reduce((sum, s) => sum + s, 0);
  const totalHours = Math.floor(totalSeconds / 3600);

  // Calculate completed assessments count
  const completedAssessments = dashboardData.activityMap
    ? Object.values(dashboardData.activityMap).reduce((sum, v) => sum + v, 0)
    : 0;

  // Skeleton loading state
  if (loadingData) {
    return (
      <div className="cc-page" style={{ padding: 0 }}>
        <div className="cc-hero">
          <div className="cc-skeleton" style={{ height: 174, borderRadius: 22 }} />
        </div>
        <div className="cc-right-rail" style={{ gap: 16 }}>
          <div className="cc-skeleton" style={{ height: 90, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 369, borderRadius: 22 }} />
        </div>
        <div className="cc-skeleton" style={{ height: 267, borderRadius: 22 }} />
        <div className="cc-middle-row">
          <div className="cc-skeleton" style={{ height: 262, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 261, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 264, borderRadius: 22 }} />
        </div>
        <div className="cc-bottom-row">
          <div className="cc-skeleton" style={{ height: 155, borderRadius: 22 }} />
          <div className="cc-skeleton" style={{ height: 155, borderRadius: 22 }} />
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 pb-24 font-sans text-slate-200">
      
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
                <span className="text-xs font-bold text-amber-400/90 tracking-wider uppercase">CURRENT ROADMAP SPRINT</span>
                <span className="bg-amber-500/10 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/20">
                  Week 1 of 8
                </span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-2">{user?.career_goal || 'Full-Stack Architecture'}</h1>
              <p className="text-slate-400">Master the required skills to achieve your target role.</p>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-neutral-900/60 border border-white/[0.08] rounded-lg px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-white">{user?.skills?.[0] || 'Machine Learning'}</span>
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  48% <ArrowRight className="w-3 h-3" /> 55%
                </span>
              </div>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-white">{user?.skills?.[1] || 'System Design'}</span>
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  20% <ArrowRight className="w-3 h-3" /> 35%
                </span>
              </div>
            </div>
          </div>

          <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold w-fit px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(217,175,103,0.3)] hover:shadow-[0_0_30px_rgba(217,175,103,0.5)] flex items-center gap-2 group-hover:scale-[1.02]">
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
              <circle cx="96" cy="96" r="80" className="stroke-neutral-800/40" strokeWidth="16" fill="none" />
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
              <span className="block text-4xl font-bold text-white font-mono">{readinessVal}%</span>
              <span className="block text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Skill Score</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-white mb-4">Vector Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: 'Technical Skills', score: 85, color: 'bg-cyan-500' },
                { name: 'Problem Solving', score: 70, color: 'bg-indigo-500' },
                { name: 'Interview Ready', score: 45, color: 'bg-emerald-500' },
              ].map(vec => (
                <div key={vec.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{vec.name}</span>
                    <span className="text-white font-mono">{vec.score}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${vec.color}`} style={{ width: `${vec.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors">
              View full analysis <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* E. Daily Planner / "Today's Mission" Widget */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Today's Mission
            </h2>
            <button className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData.dailyTargets.map((task, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${task.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-[#0B101B]' : 'border-slate-600 hover:border-slate-400'}`}>
                  {task.done && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">{task.time}</span>
                    <span className="text-[10px] text-slate-500">{task.duration}</span>
                  </div>
                </div>
                {task.done && <span className="text-xs font-bold text-emerald-400">+50 XP</span>}
              </div>
            ))}
          </div>
        </Card>

        {/* F. Opportunity Match & Explainable Skill Gap Card */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Top Opportunity Match
              </h2>
              <p className="text-sm text-slate-400">Google • {user?.career_goal || 'Frontend Engineer (L4)'}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-center">
              <span className="block text-xl font-bold text-amber-400 font-mono leading-none">72%</span>
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Match</span>
            </div>
          </div>

          <div className="bg-black/20 border border-white/[0.06] rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Skill</th>
                  <th className="px-4 py-2 font-medium">Required</th>
                  <th className="px-4 py-2 font-medium">You</th>
                  <th className="px-4 py-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-4 py-2 text-slate-200">React.js</td>
                  <td className="px-4 py-2 text-slate-400">80</td>
                  <td className="px-4 py-2 text-white">82</td>
                  <td className="px-4 py-2 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-200">TypeScript</td>
                  <td className="px-4 py-2 text-slate-400">75</td>
                  <td className="px-4 py-2 text-white">78</td>
                  <td className="px-4 py-2 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-200">System Design</td>
                  <td className="px-4 py-2 text-slate-400">70</td>
                  <td className="px-4 py-2 text-amber-400">48</td>
                  <td className="px-4 py-2 text-center text-amber-400">⚠</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Improve missing skills
          </button>
        </Card>

        {/* D. Activity Contribution Heatmap */}
        <Card span={6} className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Activity Heatmap
            </h2>
            <div className="flex gap-2 items-center text-xs text-slate-400">
              Less
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-black/20"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-900/50"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
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
                    
                    let color = 'bg-black/20'; // This converts to light gray in light mode
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
        </Card>

      </motion.div>


    </div>
  );
}
