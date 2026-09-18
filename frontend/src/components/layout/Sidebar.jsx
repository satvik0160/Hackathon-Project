import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  Home, BookOpen, Brain, Calendar, Briefcase, Mic, Map, FileText, 
  Bot, Trophy, BarChart3, Settings, Building2, X, Sparkles, Gamepad2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { isInstitution, isIndustry, user } = useAuth();

  // Single flat nav list matching the mockup order
  const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: Home },
    { path: '/learning', label: 'Learning Hub', icon: BookOpen },
    { path: '/assessments', label: 'Skill Tests', icon: Brain },
    { path: '/planner', label: 'Timetable', icon: Calendar },
    { path: '/jobs', label: 'Internships', icon: Briefcase },
    { path: '/interview', label: 'Mock Interview', icon: Mic },
    { path: '/roadmap', label: 'Career Map', icon: Map },
    { path: '/arcade', label: 'Code Arcade', icon: Gamepad2 },
    { path: '/resume', label: 'AI Resume', icon: FileText },
    { path: '/career-guidance', label: 'DevAstra AI', icon: Sparkles },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/leaderboard', label: 'Top Rank', icon: Trophy },
    { path: '/analytics', label: 'Progress', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  if (isInstitution) {
    navItems.push({ path: '/admin/institution', label: 'Institution Hub', icon: Building2 });
  }
  
  if (isIndustry) {
    navItems.push({ path: '/admin/industry', label: 'Industry Hub', icon: Building2 });
  }

  // User initial for the profile card
  const getInitial = () => {
    const name = user?.full_name || user?.name || user?.user_metadata?.full_name || '';
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-md z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`dv-sidebar fixed md:sticky top-0 left-0 z-50 h-screen ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-[227px]'} w-[227px] overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Branding Logo Area */}
        <div className="dv-sidebar-brand h-[72px] flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/60 to-sky-200/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-70"></div>

          <div className="flex items-center gap-3 relative z-10">
            {/* Four-pointed star logo */}
            <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[18px] font-extrabold tracking-tight text-slate-900 flex items-center">
                DEV<span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">ASTRA</span>
              </span>
              <span className="text-[11px] uppercase font-bold tracking-[0.16em] text-slate-400">Career Command</span>
            </div>
          </div>

          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 md:hidden transition-colors" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area — single flat list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 custom-scrollbar">
          <nav className="space-y-0.5">
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
        
        {/* User Mini Profile Card */}
        <div className="dv-sidebar-footer p-3">
          <NavLink to="/profile" className="dv-user-card" onClick={() => setMobileOpen(false)}>
            <div className="dv-avatar">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{getInitial()}</span>
              </div>
            </div>
            <div className="flex flex-col leading-tight min-w-0 flex-1">
              <span className="text-[13px] font-bold text-slate-800 truncate">Student Profile</span>
              <span className="text-[10px] font-medium truncate" style={{ color: '#7c3aed' }}>DevAstra Orbit</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
