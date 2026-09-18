import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Bell, Menu, ChevronDown, LogOut, Home, BookOpen, Brain, Briefcase, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onMenuClick, onDesktopMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navItems = [
    { name: 'Command Center', path: '/dashboard', icon: Home },
    { name: 'Learning Hub', path: '/learning', icon: BookOpen },
    { name: 'Skill Tests', path: '/assessments', icon: Brain },
    { name: 'Jobs & Match', path: '/jobs', icon: Briefcase },
  ];

  // If a real streak source is added, bind it here. Defaulting to empty state (0)
  const streakCount = user?.streak_count || 0;
  
  // Checking notifications if they exist in user profile/metadata, else false
  const hasNotifications = user?.unread_notifications > 0 || false;

  return (
    <header className="app-header sticky top-0 z-50 w-full px-4 md:px-6 h-[72px] flex items-center justify-between transition-all">

      {/* Mobile Menu & Toggle (Left) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="dv-icon-btn md:hidden p-2"
          title="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onDesktopMenuClick}
          className="dv-icon-btn hidden md:inline-flex p-2 hover:bg-slate-100 rounded-full transition-colors"
          title="Toggle Navigation Bar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Center Navigation Pills (Desktop Only) */}
      <div className="hidden lg:flex items-center bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full p-1 shadow-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
                isActive 
                  ? 'text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`
            }
            style={({ isActive }) => 
              isActive ? { background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' } : {}
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Right Action Deck */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm cursor-default">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-[13px] font-bold text-slate-700">{streakCount} Day Streak</span>
        </div>

        {/* Search Trigger */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm hover:border-purple-300 transition-colors group">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
          <span className="text-sm text-slate-400 mr-2">Search...</span>
          <kbd className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-500">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-colors text-slate-500 hover:text-purple-500">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-white shadow-sm border-2 border-white hover:scale-105 transition-transform"
          >
            <span className="text-sm font-bold">{getInitials(user?.user_metadata?.full_name || user?.name || user?.email)}</span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.user_metadata?.full_name || user?.name || 'User'}
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
