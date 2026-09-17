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
    { path: '/arcade', label: 'Code Arcade', icon: Bot },
    { path: '/resume', label: 'AI Resume Studio', icon: FileText },
    { path: '/career-guidance', label: 'Dhruv (AI Guide)', icon: Star },
    { path: '/achievements', label: 'Achievements & XP', icon: Trophy },
    { path: '/leaderboard', label: 'Hall of Fame', icon: Trophy },
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
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-64'} overflow-hidden bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 md:hidden shrink-0">
          <span className="text-lg font-bold text-slate-900 whitespace-nowrap">Navigation</span>
          <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-900 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {/* Main Group */}
          <div>
            <div className="flex items-center gap-3 px-3 mb-3">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-2 py-1 rounded-md border border-sky-200 shadow-none whitespace-nowrap">Main</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-sky-200 to-transparent"></div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${\n                      isActive \n                        ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm' \n                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'\n                    }`
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
              <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest bg-violet-50 px-2 py-1 rounded-md border border-violet-200 shadow-none whitespace-nowrap">Tools</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-violet-200 to-transparent"></div>
            </div>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${\n                      isActive \n                        ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm' \n                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'\n                    }`
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
