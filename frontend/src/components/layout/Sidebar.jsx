import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, BookOpen, Brain, Calendar, Briefcase, Mic,
  Map, FileText, Bot, MessageCircle, Trophy, BarChart3,
  User, Settings, ChevronLeft, ChevronRight, Sparkles, LogOut,
  Sun, Moon, X
} from 'lucide-react';

const mainNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/learning', label: 'Learning Resources', icon: BookOpen },
  { path: '/assessments', label: 'Skill Tests', icon: Brain },
  { path: '/planner', label: 'Daily Planner', icon: Calendar },
  { path: '/jobs', label: 'Jobs & Internships', icon: Briefcase },
  { path: '/interview', label: 'Mock Interview', icon: Mic },
  { path: '/roadmap', label: 'Personalized Roadmap', icon: Map },
];

const toolsNav = [
  { path: '/resume', label: 'AI Resume', icon: FileText },
  { path: '/career-guidance', label: 'AI Career Guidance', icon: Bot },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout, isInstitution, isIndustry } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Add role-specific nav items
  const getNavItems = () => {
    const items = [...mainNav];
    return items;
  };

  const getToolItems = () => {
    const items = [...toolsNav];
    if (isInstitution) {
      items.unshift({ path: '/admin/institution', label: 'Institution Dashboard', icon: BarChart3 });
    }
    if (isIndustry) {
      items.unshift({ path: '/admin/industry', label: 'Industry Portal', icon: Briefcase });
    }
    return items;
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={onMobileClose} aria-hidden="true" />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Sparkles size={20} />
          </div>
          <span className="sidebar-brand-text text-gradient">SkillMaster</span>
          {mobileOpen && (
            <button className="btn-icon btn-ghost" onClick={onMobileClose} style={{ marginLeft: 'auto' }} aria-label="Close menu">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main</span>
          {getNavItems().map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
            >
              <span className="nav-link-icon">
                <item.icon size={18} />
              </span>
              <span className="nav-link-text">{item.label}</span>
            </NavLink>
          ))}

          <span className="sidebar-section-label" style={{ marginTop: 'var(--space-2)' }}>Tools & Settings</span>
          {getToolItems().map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
            >
              <span className="nav-link-icon">
                <item.icon size={18} />
              </span>
              <span className="nav-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme toggle */}
          <button className="nav-link w-full" onClick={toggleTheme} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <span className="nav-link-icon">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span className="nav-link-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Logout */}
          <button className="nav-link w-full" onClick={logout} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
            <span className="nav-link-icon">
              <LogOut size={18} />
            </span>
            <span className="nav-link-text">Logout</span>
          </button>

          {/* Collapse toggle (desktop only) */}
          <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
