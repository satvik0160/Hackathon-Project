import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, BookOpen, Brain, Calendar, Briefcase, Mic, Map, FileText, 
  Bot, Trophy, BarChart3, Settings, Building2, X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
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
    { path: '/career-guidance', label: 'AI Career Guidance', icon: Bot },
    { path: '/achievements', label: 'Achievements & XP', icon: Trophy },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  if (isInstitution) {
    toolsItems.unshift({ path: '/admin/institution', label: 'Institution Hub', icon: Building2 });
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
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0B101B]/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08] md:hidden">
          <span className="text-lg font-bold text-white">Navigation</span>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          
          {/* Main Group */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Main</h3>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Tools Group */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Tools</h3>
            <nav className="space-y-1">
              {toolsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

        </div>

      </aside>
    </>
  );
}
