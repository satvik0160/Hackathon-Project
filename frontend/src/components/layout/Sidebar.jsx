import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  Home, BookOpen, Brain, Calendar, Briefcase, Mic, Map, FileText, 
  Bot, Trophy, BarChart3, Settings, Building2, X, Star, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { isInstitution, isIndustry } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: Home },
    { path: '/learning', label: 'Learning Hub', icon: BookOpen },
    { path: '/assessments', label: 'Skill Tests', icon: Brain },
    { path: '/planner', label: 'Timetable', icon: Calendar },
    { path: '/jobs', label: 'Internships', icon: Briefcase },
    { path: '/interview', label: 'Mock Interview', icon: Mic },
    { path: '/roadmap', label: 'Career Map', icon: Map },
  ];

  const toolsItems = [
    { path: '/arcade', label: 'Code Arcade', icon: Bot },
    { path: '/resume', label: 'AI Resume', icon: FileText },
    { path: '/career-guidance', label: 'DevAstra AI', icon: Sparkles },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/leaderboard', label: 'Top Rank', icon: Trophy },
    { path: '/analytics', label: 'Progress', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  if (isInstitution) {
    toolsItems.unshift({ path: '/admin/institution', label: 'Institution Hub', icon: Building2 });
  }
  
  if (isIndustry) {
    toolsItems.unshift({ path: '/admin/industry', label: 'Industry Hub', icon: Building2 });
  }

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-md z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-64'} overflow-hidden bg-white/70 backdrop-blur-xl border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Branding Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-gradient-to-b from-white to-transparent relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl -mr-16 -mt-16 opacity-70"></div>
          
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:animate-none relative overflow-hidden">
              <Sparkles className="w-5 h-5 text-white transition-transform duration-300 hover:scale-125 hover:rotate-12" />
              {/* Sheen sweep on brand chip */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[btn-shine_3.5s_ease-in-out_infinite]"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                DEV<span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">ASTRA</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Career Command</span>
            </div>
          </div>
          
          <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-700 p-2 md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {/* Main Group */}
          <div className="space-y-2">
            <div className="px-3 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive 
                        ? 'text-indigo-700 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm border border-indigo-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNav" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-r-md" />
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 ${isActive ? 'scale-110 text-indigo-600' : 'group-hover:text-indigo-500'}`} />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Tools Group */}
          <div className="space-y-2">
            <div className="px-3 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intelligence</span>
            </div>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive 
                        ? 'text-purple-700 bg-gradient-to-r from-purple-50 to-fuchsia-50 shadow-sm border border-purple-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNavTools" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-violet-600 to-purple-600 rounded-r-md" />
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 ${isActive ? 'scale-110 text-purple-600' : 'group-hover:text-purple-500'}`} />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        {/* User Mini Profile Placeholder / Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-white/60">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25 rainbow-ring">
               <span className="text-white text-xs font-bold relative z-10">U</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">Student Profile</span>
              <span className="text-[10px] text-slate-500 font-medium">DevAstra Orbit</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
