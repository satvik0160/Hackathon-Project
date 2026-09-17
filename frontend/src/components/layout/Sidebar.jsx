import React from 'react';
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

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 ${collapsed ? 'md:w-0 md:px-0 md:-ml-px md:border-transparent md:opacity-0' : 'md:w-64'} overflow-hidden bg-white/80 backdrop-blur-xl border-r border-blue-50/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Branding Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-gradient-to-b from-white to-transparent relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -mr-16 -mt-16 opacity-60"></div>
          
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-slate-800" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                DEV<span className="text-blue-600">ASTRA</span>
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
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
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
                        ? 'text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100/50' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-[#f8faff]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNav" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-md" />
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-blue-600' : 'group-hover:text-blue-500'}`} />
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
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
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
                        ? 'text-purple-700 bg-purple-50/80 shadow-sm border border-purple-100/50' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-[#f8faff]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div layoutId="activeNavTools" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-purple-600 rounded-r-md" />
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-purple-600' : 'group-hover:text-purple-500'}`} />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        
        {/* User Mini Profile Placeholder / Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#f8faff]/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-300">
               <div className="w-4 h-4 bg-slate-400 rounded-full mt-2"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">Student Profile</span>
              <span className="text-[10px] text-slate-500">DevAstra Orbit</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
