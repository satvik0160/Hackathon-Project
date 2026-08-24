import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Flame, Target, Trophy, ArrowUpRight, CheckCircle2, ChevronRight, Activity, Sparkles, X, MessageCircle, Send, Plus, ArrowRight, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    className={`bg-[#0B101B]/60 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-3xl p-6 relative overflow-hidden ${className}`}
    style={{ gridColumn: `span ${span} / span ${span}` }}
  >
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [readinessVal, setReadinessVal] = useState(0);

  // Animate gauge on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current >= 68) {
          clearInterval(interval);
          return;
        }
        current += 2;
        setReadinessVal(current);
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
        <Card span={8} className="lg:col-span-8 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">CURRENT ROADMAP SPRINT</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Week 1 of 8
                </span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent mb-2">Full-Stack Architecture</h1>
              <p className="text-slate-400">Master scalable component design and RESTful APIs.</p>
            </div>
            
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">Active</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-white">Machine Learning</span>
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  48% <ArrowRight className="w-3 h-3" /> 55%
                </span>
              </div>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Target Skill</span>
              <div className="flex items-end justify-between">
                <span className="text-lg font-semibold text-white">System Design</span>
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                  20% <ArrowRight className="w-3 h-3" /> 35%
                </span>
              </div>
            </div>
          </div>

          <button className="bg-indigo-500 hover:bg-indigo-400 text-white w-fit px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center gap-2 group-hover:scale-[1.02]">
            Launch Next Module <ArrowUpRight className="w-4 h-4" />
          </button>
        </Card>

        {/* B. Career Copilot AI Widget (Top Right) */}
        <Card span={4} className="lg:col-span-4 bg-gradient-to-br from-[#1E1B4B]/80 to-[#0F172A]/80 border-indigo-500/30 flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 relative">
            <Sparkles className="w-8 h-8 text-white" />
            <div className="absolute -top-2 -right-2 bg-[#0B101B] rounded-full p-1 border border-white/10">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Career Copilot</h2>
          <p className="text-sm text-indigo-200/70 mb-6">Your personal AI mentor is online. Ready to analyze your vector graph.</p>

          <div className="flex gap-2 justify-center mb-6">
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-emerald-400 flex items-center gap-1">
              <Flame className="w-3 h-3" /> 12-Day Streak
            </span>
          </div>

          <button 
            onClick={() => setCopilotOpen(true)}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Open Drawer
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
              <circle cx="96" cy="96" r="80" className="stroke-slate-800/50" strokeWidth="16" fill="none" />
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
              <span className="block text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Readiness</span>
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
            <button className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors">
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
            {[
              { time: '09:00', duration: '45m', title: 'Complete React Context Quiz', done: true },
              { time: '11:30', duration: '1h 30m', title: 'Build JWT Auth Flow', done: false },
              { time: '14:00', duration: '30m', title: 'Review System Design Principles', done: false },
            ].map((task, i) => (
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
              <p className="text-sm text-slate-400">Google • Frontend Engineer (L4)</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-center">
              <span className="block text-xl font-bold text-amber-400 font-mono leading-none">72%</span>
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Match</span>
            </div>
          </div>

          <div className="bg-[#050811]/50 border border-white/5 rounded-xl overflow-hidden mb-4">
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
                <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-900/50"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
              </div>
              More
            </div>
          </div>
          
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="flex gap-1 min-w-[600px]">
              {Array.from({ length: 40 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const intensity = Math.random();
                    let color = 'bg-slate-800/40';
                    if (intensity > 0.85) color = 'bg-emerald-400';
                    else if (intensity > 0.6) color = 'bg-emerald-500';
                    else if (intensity > 0.3) color = 'bg-emerald-800';
                    
                    return (
                      <div 
                        key={`${weekIdx}-${dayIdx}`} 
                        className={`w-3.5 h-3.5 rounded-[2px] ${color} hover:ring-2 hover:ring-white/30 transition-all cursor-pointer`}
                        title={`August ${dayIdx + 1} — ${Math.floor(intensity * 10)} targets completed`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

      </motion.div>

      {/* Floating Copilot Drawer */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 bg-[#0F172A] border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 z-50 overflow-hidden flex flex-col h-[500px]"
          >
            <div className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Career Copilot</span>
              </div>
              <button onClick={() => setCopilotOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/10 text-sm text-slate-300 w-[85%]">
                Hello! I'm your Career Copilot. I've analyzed your skill vectors and identified a gap in System Design. Would you like a learning path for this?
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-[#0B101B]">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                <button className="whitespace-nowrap text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors">
                  What should I learn next?
                </button>
                <button className="whitespace-nowrap text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full hover:bg-indigo-500/20 transition-colors">
                  Analyze my readiness score
                </button>
              </div>
              <div className="relative mt-2">
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
