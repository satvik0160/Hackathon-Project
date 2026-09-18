import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Star, Search, Bell, Menu, Zap, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onMenuClick, onDesktopMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="app-header sticky top-0 z-50 w-full px-4 md:px-6 h-16 flex items-center justify-between transition-all">

      {/* Mobile Menu & Logo */}
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
          className="dv-icon-btn hidden md:inline-flex p-2"
          title="Toggle Navigation Bar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="dv-brand-mark w-9 h-9 overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <img src="/devlogo.jpg" alt="DevAstra Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 hidden sm:block">
            DevAstra
          </span>
        </div>
      </div>

      {/* Center Navigation Pills (Desktop Only) */}
      <div className="dv-navbar hidden lg:flex mx-4">
        {[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Learning Path', path: '/roadmap' },
          { name: 'Skill Tests', path: '/assessments' },
          { name: 'Jobs & Match', path: '/jobs' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `dv-nav-pill ${isActive ? 'dv-nav-pill--active' : ''}`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Right Action Deck */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tier Badge */}
        <div className="dv-streak-badge hidden sm:inline-flex transition-transform duration-200 hover:-translate-y-0.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Student Pro</span>
        </div>

        {/* Search Trigger */}
        <button className="dv-search-pill">
          <Search className="w-4 h-4" />
          <span className="text-sm hidden sm:inline-block">Search...</span>
          <kbd className="hidden md:inline-block ml-1">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="dv-icon-btn relative p-2">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white pulse-badge"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 py-1 pl-1 pr-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:border-indigo-300 hover:bg-white transition-all"
          >
            <div className="relative">
              <div className="dv-avatar">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {getInitials(user?.user_metadata?.full_name || user?.email)}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <NavLink 
                to="/profile" 
                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 rounded-xl mx-1 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                Profile Settings
              </NavLink>                <button 
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
