import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, BookOpen, Brain, Calendar, Briefcase, Mic, Map, FileText, 
  Bot, Trophy, BarChart3, Settings, Building2, X, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) {
  const { isInstitution, isIndustry } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/learning', label: 'Learning Resources', icon: BookOpen },
    { path: '/assessments', label: 'Skill Tests', icon: Brain },
    { path: '/planner', label: 'Daily Planner', icon: Calendar },
    { path: '/jobs', label: 'Jobs & Internships', icon: Briefcase },
    { path: '/interview', label: 'Mock Interview', icon: Mic },
    { path: '/roadmap', label: 'Personalized Roadmap', icon: Map },
  ];

  const toolsItems = [
    { path: '/resume', label: 'AI Resume Studio', icon: FileText },
    { path: '/career-guidance', label: 'Dhruv (AI Guide)', icon: Star },
    { path: '/achievements', label: 'Achievements & XP', icon: Trophy },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
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
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-64'} overflow-hidden bg-neutral-950/80 backdrop-blur-2xl border-r border-white/[0.06] shadow-2xl shadow-black/40 flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] md:hidden shrink-0">
          <span className="text-lg font-bold text-white whitespace-nowrap">Navigation</span>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {/* Main Group */}
          <div>
            <div className="flex items-center gap-3 px-3 mb-3">
              <span className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-[0_0_10px_rgba(217,175,103,0.1)] whitespace-nowrap">Main</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-amber-500/20 to-transparent"></div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-amber-500/[0.08] text-amber-300 border border-amber-400/20 shadow-[inset_0_0_12px_rgba(217,175,103,0.08)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Tools Group */}
          <div>
            <div className="flex items-center gap-3 px-3 mb-3">
              <span className="text-[10px] font-bold text-indigo-400/90 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] whitespace-nowrap">Tools</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
            </div>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-amber-500/[0.08] text-amber-300 border border-amber-400/20 shadow-[inset_0_0_12px_rgba(217,175,103,0.08)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

        </div>

      </aside>
    </>
  );
}
