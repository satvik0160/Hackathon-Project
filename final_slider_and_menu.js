const fs = require('fs');

let content = `import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell, Menu, PanelLeftClose, Sun, Moon, LogOut, Home, BookOpen, Brain, Briefcase, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

export default function Header({ onMenuClick, onDesktopMenuClick, sidebarCollapsed }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const displayName = user?.full_name || user?.name || user?.user_metadata?.full_name || user?.username;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Learning Hub', path: '/learning', icon: BookOpen },
    { name: 'Skill Tests', path: '/assessments', icon: Brain },
    { name: 'Jobs & Match', path: '/jobs', icon: Briefcase },
  ];

  const streakCount = user?.streak_count || 0;

  return (
    <header className="app-header sticky top-0 z-50 w-full px-4 md:px-6 h-[72px] flex items-center justify-between transition-all border-b border-slate-200/80 bg-white/80 backdrop-blur-md">

      {/* Menu Toggle (Left) - STRICTLY ONE BUTTON */}
      <div className="flex items-center gap-3">
        <button
          onClick={isMobile ? onMenuClick : onDesktopMenuClick}
          className="flex items-center justify-center p-2 w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:bg-violet-50/50 transition-all"
          title="Toggle Menu"
        >
          {(!isMobile && !sidebarCollapsed) ? 
            <PanelLeftClose className="w-5 h-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" /> : 
            <Menu className="w-5 h-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
          }
        </button>
      </div>

      {/* Center Navigation Pills */}
      <div className="hidden lg:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="flex items-center bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full p-1 shadow-sm pointer-events-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              \`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all \${isActive ? 'shadow-sm' : '!text-slate-800 hover:!text-slate-900 hover:bg-slate-100/50'}\`
            }
            style={({ isActive }) =>
              isActive ? { background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)', color: '#ffffff' } : {}
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4 h-4" style={isActive ? { color: '#ffffff' } : { color: '#1e293b' }} />
                <span style={isActive ? { color: '#ffffff' } : {}}>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        </div>
      </div>

      {/* Right Action Deck */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm cursor-default">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
          <span className="text-[13px] font-bold text-slate-700">{streakCount} Day Streak</span>
        </div>

        {/* Search Trigger */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm hover:border-purple-300 transition-colors group">
          <Search className="w-4 h-4 text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] group-hover:text-sky-400" />
          <span className="text-sm text-slate-400 mr-2">Search...</span>
          <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-500">⌘K</kbd>
        </button>

        {/* Theme Toggle (Proper Slider with Icons on both sides) */}
        <button 
          onClick={toggleTheme} 
          className="relative flex items-center w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors shadow-inner border border-slate-300/50 hover:ring-2 hover:ring-purple-300"
          title="Toggle Theme"
        >
          <div className="absolute left-1.5 flex items-center justify-center">
            <Moon className="w-4 h-4 text-slate-400 dark:text-indigo-300" />
          </div>
          <div className="absolute right-1.5 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-500 dark:text-slate-500" />
          </div>
          <div 
            className={\`absolute w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 z-10 \${isDarkMode ? 'translate-x-1' : 'translate-x-9'}\`} 
          />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-white shadow-sm border-2 border-white hover:scale-105 transition-transform"
          >
            <span className="text-sm font-bold">{getInitials(displayName || user?.email)}</span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {displayName || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <NavLink 
                to="/profile" 
                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 rounded-xl mx-1 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                Profile Settings
              </NavLink>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2 rounded-xl mx-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
`;

fs.writeFileSync('frontend/src/components/layout/Header.jsx', content);
