import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Star, Search, Bell, Menu, Zap, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const themes = [
  { id: 'pastel-dream', name: 'Pastel Dream', color: 'linear-gradient(135deg, #ffdde1, #a1c4fd)' },
  { id: 'sunset-bliss', name: 'Sunset Bliss', color: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { id: 'mint-spring', name: 'Mint Spring', color: 'linear-gradient(135deg, #d4fc79, #96e6a1)' }
];

export default function Header({ onMenuClick, onDesktopMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-slate-200/60 px-4 md:px-6 h-16 flex items-center justify-between shadow-sm transition-all">
      
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-1.5 rounded-lg transition-all"
          title="Open Mobile Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <button 
          onClick={onDesktopMenuClick}
          className="hidden md:flex text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-1.5 rounded-lg transition-all items-center justify-center"
          title="Toggle Navigation Bar"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/devlogo.jpg" alt="DevAstra Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">
            DevAstra
          </span>
        </div>
      </div>

      {/* Center Navigation Pills (Desktop Only) */}
      <div className="hidden lg:flex items-center bg-slate-100 border border-slate-200 rounded-full p-1 mx-4">
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
                  ? 'bg-white text-sky-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Right Action Deck */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => toggleTheme(t.id)}
              className={`w-5 h-5 rounded-full border shadow-sm transition-all ${theme === t.id ? 'ring-2 ring-offset-2 ring-sky-400 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
              style={{ background: t.color, borderColor: 'rgba(0,0,0,0.1)' }}
              title={t.name}
            />
          ))}
        </div>

        {/* Tier Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-sky-50 border border-sky-200">
          <Zap className="w-3.5 h-3.5 text-sky-600 animate-float" />
          <span className="text-xs font-semibold text-sky-700 tracking-wide shimmer-title">Student Pro</span>
        </div>

        {/* Search Trigger */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Search className="w-4 h-4" />
          <span className="text-sm hidden sm:inline-block">Search...</span>
          <kbd className="hidden md:inline-block text-[10px] bg-white px-1.5 py-0.5 rounded text-slate-500 ml-2 border border-slate-200">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white pulse-badge"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sm font-semibold text-sky-700">
                {getInitials(user?.user_metadata?.full_name || user?.email)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white backdrop-blur-xl border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <NavLink 
                to="/profile" 
                className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
