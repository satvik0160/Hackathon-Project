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

const Card = ({ children, className = '', span = 1, interactiveStyle = 'default' }) => {
  const interactiveStyles = {
    default: 'bg-white border-slate-200 shadow-lg hover:shadow-2xl',
    elevated: 'bg-white border-slate-200 shadow-xl hover:shadow-3xl',
    glass: 'bg-white/95 backdrop-blur-md border-slate-200/50 shadow-lg hover:shadow-2xl',
    neumorphic: 'bg-white border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',
  };

  const selectedStyle = interactiveStyles[interactiveStyle] || interactiveStyles.default;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ 
        y: -8, 
        scale: 1.02, 
        rotateX: 2,
        rotateY: 2,
        boxShadow: "0 20px 40px -5px rgba(0,0,0,0.15), 0 10px 20px -5px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`${selectedStyle} rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all duration-300 ${className}`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
    >
      {/* Interactive shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-100 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-bl-3xl" />
      
      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {children}
    </motion.div>
  );
};

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
    <div className="space-y-6 pb-24 font-sans text-slate-900 bg-slate-50 min-h-screen">
      
      {/* 12-Column Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
      >
        
        {/* A. Main Hero Sprint Card (Top Left) */}
        <Card span={12} interactiveStyle="elevated" className="lg:col-span-12 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">CURRENT ROADMAP SPRINT</span>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                  Week 1 of 8
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{user?.career_goal || 'Full-Stack Architecture'}</h1>
              <p className="text-slate-600">Master the required skills to achieve your target role.</p>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <span className="text-xs text-slate-500 block mb-1 font-semibold">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-slate-900">{user?.skills?.[0] || 'Machine Learning'}</span>
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  48% <ArrowRight className="w-3 h-3" /> 55%
                </span>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:bg-slate-100 transition-colors">
              <span className="text-xs text-slate-500 block mb-1 font-semibold">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-slate-900">{user?.skills?.[1] || 'System Design'}</span>
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  20% <ArrowRight className="w-3 h-3" /> 35%
                </span>
              </div>
            </div>
          </div>

          <button className="bg-white border-2 border-indigo-500 hover:bg-indigo-50 text-indigo-600 font-bold w-fit px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 group-hover:scale-[1.02]">
            Launch Next Module <ArrowUpRight className="w-4 h-4" />
          </button>
        </Card>

        {/* C. Career Readiness Interactive Gauge */}
        <Card span={6} interactiveStyle="glass" className="lg:col-span-6 flex flex-col md:flex-row items-center gap-8">
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
              <span className="block text-4xl font-bold text-slate-900 font-mono">{readinessVal}%</span>
              <span className="block text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Skill Score</span>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Vector Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: 'Technical Skills', score: 85, color: 'from-cyan-500 to-blue-600', textColor: 'text-slate-700' },
                { name: 'Problem Solving', score: 70, color: 'from-indigo-500 to-purple-600', textColor: 'text-slate-700' },
                { name: 'Interview Ready', score: 45, color: 'from-emerald-500 to-green-600', textColor: 'text-slate-700' },
              ].map(vec => (
                <div key={vec.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={vec.textColor}>{vec.name}</span>
                    <span className="text-slate-900 font-mono">{vec.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 border border-slate-300">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${vec.color} shadow-md`} style={{ width: `${vec.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium transition-colors">
              View full analysis <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* E. Daily Planner / "Today's Mission" Widget */}
        <Card span={6} interactiveStyle="neumorphic" className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Today's Mission
            </h2>
            <button className="text-xs bg-white border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm hover:shadow-md">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {(dashboardData.dailyTargets || []).map((task, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${task.done ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}>
                  {task.done && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{task.time}</span>
                    <span className="text-[10px] text-slate-500">{task.duration}</span>
                  </div>
                </div>
                {task.done && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">+50 XP</span>}
              </div>
            ))}
          </div>
        </Card>

        {/* F. Opportunity Match & Explainable Skill Gap Card */}
        <Card span={6} interactiveStyle="elevated" className="lg:col-span-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-amber-600" />
                Top Opportunity Match
              </h2>
              <p className="text-sm text-slate-600">Google • {user?.career_goal || 'Frontend Engineer (L4)'}</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg px-3 py-1.5 text-center">
              <span className="block text-xl font-bold text-amber-600 font-mono leading-none">72%</span>
              <span className="text-[10px] text-amber-700 uppercase font-semibold">Match</span>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-2 font-bold">Skill</th>
                  <th className="px-4 py-2 font-bold">Required</th>
                  <th className="px-4 py-2 font-bold">You</th>
                  <th className="px-4 py-2 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-slate-900 font-medium">React.js</td>
                  <td className="px-4 py-2 text-slate-600">80</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">82</td>
                  <td className="px-4 py-2 text-center text-emerald-600">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-slate-900 font-medium">TypeScript</td>
                  <td className="px-4 py-2 text-slate-600">75</td>
                  <td className="px-4 py-2 text-emerald-600 font-bold">78</td>
                  <td className="px-4 py-2 text-center text-emerald-600">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-slate-900 font-medium">System Design</td>
                  <td className="px-4 py-2 text-slate-600">70</td>
                  <td className="px-4 py-2 text-amber-600 font-bold">48</td>
                  <td className="px-4 py-2 text-center text-amber-600">⚠</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="w-full bg-white border-2 border-amber-500 hover:bg-amber-50 text-amber-600 font-bold py-2.5 rounded-lg text-sm transition-all shadow-md hover:shadow-lg">
            Improve missing skills
          </button>
        </Card>

        {/* D. Activity Contribution Heatmap */}
        <Card span={6} interactiveStyle="glass" className="lg:col-span-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Activity Heatmap
            </h2>
            <div className="flex gap-2 items-center text-xs text-slate-600">
              Less
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-200 border border-blue-300"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-400 border border-blue-500"></div>
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-500 border border-blue-600 shadow-sm"></div>
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
                  className="absolute text-xs text-slate-600 font-medium"
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
                    
                    let color = 'bg-slate-200 border border-slate-300'; // This converts to light gray in light mode
                    if (minutes >= 20) color = 'bg-gradient-to-br from-blue-500 to-cyan-500 border border-blue-600 shadow-sm';
                    else if (minutes >= 10) color = 'bg-blue-400 border border-blue-500';
                    else if (minutes > 0) color = 'bg-blue-300 border border-blue-400';
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
                        className={`w-3.5 h-3.5 rounded-[2px] ${color} hover:ring-2 hover:ring-blue-400/50 hover:scale-110 transition-all cursor-pointer`}
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
