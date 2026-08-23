import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Flame, Target, Trophy, ArrowUpRight, Code2, LineChart, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Card = ({ children, className = '', span = 1 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-[#0F172A]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden ${className}`}
    style={{ gridColumn: `span ${span} / span ${span}` }}
  >
    {children}
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">{user?.user_metadata?.full_name?.split(' ')[0] || 'Developer'}</span>
          </h1>
          <p className="text-slate-400">Here is your daily skill vector intelligence.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20 w-fit">
          <Brain className="w-5 h-5" />
          Start Assessment
        </button>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Telemetry Counters */}
        <Card className="lg:col-span-3 hover:bg-[#0F172A]/90 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <Flame className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +2
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Current Streak</h3>
          <p className="text-3xl font-bold text-white font-mono">12 Days</p>
        </Card>

        <Card className="lg:col-span-3 hover:bg-[#0F172A]/90 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> 8%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Industry Match</h3>
          <p className="text-3xl font-bold text-white font-mono">84.2%</p>
        </Card>

        <Card className="lg:col-span-3 hover:bg-[#0F172A]/90 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Modules Completed</h3>
          <p className="text-3xl font-bold text-white font-mono">47</p>
        </Card>

        <Card className="lg:col-span-3 hover:bg-[#0F172A]/90 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Experience Points</h3>
          <p className="text-3xl font-bold text-white font-mono">14,250</p>
        </Card>

        {/* Circular Gauges / Skills Radar */}
        <Card className="lg:col-span-8 lg:row-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              Skill Vector Mapping
            </h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View Detailed Analytics</button>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Mock Circular Gauge 1 */}
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" className="stroke-indigo-500" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-bold text-white font-mono">90%</span>
                <span className="block text-xs text-slate-400 mt-1">Frontend</span>
              </div>
            </div>

            {/* Mock Circular Gauge 2 */}
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" className="stroke-cyan-500" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="110" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-bold text-white font-mono">75%</span>
                <span className="block text-xs text-slate-400 mt-1">Backend</span>
              </div>
            </div>

            {/* Mock Circular Gauge 3 */}
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="70" className="stroke-amber-500" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="220" strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="block text-3xl font-bold text-white font-mono">50%</span>
                <span className="block text-xs text-slate-400 mt-1">DevOps</span>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Interactive Widget */}
        <Card className="lg:col-span-4 lg:row-span-2 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Copilot
          </h2>
          
          <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Based on your recent React assessment, I recommend exploring <span className="text-indigo-400 font-medium">Server Components</span> to boost your match rate for the Senior Frontend role at Vercel.
            </p>
          </div>

          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors mb-2">
            Generate Learning Path
          </button>
          <button className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Start Mock Interview
          </button>
        </Card>

        {/* Activity Heatmap Mock */}
        <Card className="lg:col-span-12">
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
            <div className="flex gap-1 min-w-[800px]">
              {Array.from({ length: 52 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const intensity = Math.random();
                    let color = 'bg-slate-800/50';
                    if (intensity > 0.8) color = 'bg-emerald-400';
                    else if (intensity > 0.5) color = 'bg-emerald-600';
                    else if (intensity > 0.2) color = 'bg-emerald-900/50';
                    
                    return (
                      <div 
                        key={`${weekIdx}-${dayIdx}`} 
                        className={`w-4 h-4 rounded-sm ${color} hover:ring-2 hover:ring-white/30 transition-all cursor-pointer`}
                        title={`Activity: ${Math.floor(intensity * 10)} contributions`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
