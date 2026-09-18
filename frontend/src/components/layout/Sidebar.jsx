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

      <aside className={`dv-sidebar fixed md:sticky top-0 left-0 z-50 h-screen w-64 ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-64'} overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Branding Logo Area */}
        <div className="dv-sidebar-brand h-20 flex items-center justify-between px-5 shrink-0 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/60 to-sky-200/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="dv-brand-mark w-10 h-10 flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[1.05rem] font-extrabold tracking-tight text-slate-900 flex items-center">
                DEV<span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">ASTRA</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-slate-400">Career Command</span>
            </div>
          </div>

          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 md:hidden transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-7 custom-scrollbar">

          {/* Main Group */}
          <div className="space-y-1.5">
            <div className="px-2 mb-2">
              <span className="dv-nav-group-label">Navigation</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `dv-nav-item ${isActive ? 'dv-nav-item--active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNav" className="dv-nav-accent" />
                      )}
                      <item.icon className="dv-nav-icon" />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Tools Group */}
          <div className="space-y-1.5">
            <div className="px-2 mb-2">
              <span className="dv-nav-group-label">Intelligence</span>
            </div>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `dv-nav-item ${isActive ? 'dv-nav-item--active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNavTools" className="dv-nav-accent" />
                      )}
                      <item.icon className="dv-nav-icon" />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        {/* User Mini Profile Placeholder / Footer */}
        <div className="dv-sidebar-footer p-4">
          <div className="dv-user-card">
            <div className="dv-avatar">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">Student Profile</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">DevAstra Orbit</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
