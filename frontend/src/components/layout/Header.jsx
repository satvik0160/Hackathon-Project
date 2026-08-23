import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Search, Bell, Menu, Zap, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B101B]/80 border-b border-white/[0.08] px-4 md:px-6 h-16 flex items-center justify-between shadow-lg shadow-black/20">
      
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 hidden sm:block">
            DevAstra
          </span>
        </div>
      </div>

      {/* Center Navigation Pills (Desktop Only) */}
      <div className="hidden lg:flex items-center bg-black/20 border border-white/5 rounded-full p-1 mx-4">
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
              `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Right Action Deck */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Tier Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 tracking-wide">Student Pro</span>
        </div>

        {/* Search Trigger */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-sm hidden sm:inline-block">Search...</span>
          <kbd className="hidden md:inline-block text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 ml-2 border border-white/5">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#0B101B]"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-300">
                {getInitials(user?.user_metadata?.full_name || user?.email)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B101B]"></span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <NavLink 
                to="/profile" 
                className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                onClick={() => setProfileOpen(false)}
              >
                Profile Settings
              </NavLink>
              <button 
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
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
