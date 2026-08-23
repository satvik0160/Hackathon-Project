import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/api';
import {
  Search, Bell, Menu, Command,
  X, Clock, CheckCircle
} from 'lucide-react';

export default function Header({ onMobileMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        const data = res.data.results || res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch {
        // Silently fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd+K for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <>
      <header className="app-header" role="banner">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {getGreeting()}, <strong style={{ color: 'var(--text-primary)' }}>{user?.username || 'Student'}</strong>
          </span>
        </div>

        <div className="header-right">
          {/* Search trigger */}
          <button
            className="header-search"
            onClick={() => setShowSearch(true)}
            aria-label="Search"
          >
            <Search size={14} />
            <span>Search...</span>
            <kbd>⌘K</kbd>
          </button>

          {/* Notifications */}
          <div className="dropdown" ref={notifRef}>
            <button
              className="header-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge-dot" />}
            </button>

            {showNotifications && (
              <div className="notification-panel">
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary">{unreadCount} new</span>
                  )}
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{notif.title}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>{notif.message}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={10} />
                            {new Date(notif.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {!notif.is_read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            className="header-avatar"
            onClick={() => navigate('/profile')}
            role="button"
            aria-label="Profile"
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Command Palette / Search Modal */}
      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}
    </>
  );
}

function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const quickLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Skill Tests', path: '/assessments', icon: '🧠' },
    { label: 'Learning Resources', path: '/learning', icon: '📚' },
    { label: 'Daily Planner', path: '/planner', icon: '📅' },
    { label: 'Jobs & Internships', path: '/jobs', icon: '💼' },
    { label: 'Mock Interview', path: '/interview', icon: '🎤' },
    { label: 'AI Resume', path: '/resume', icon: '📄' },
    { label: 'Career Guidance', path: '/career-guidance', icon: '🤖' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Roadmap', path: '/roadmap', icon: '🗺️' },
    { label: 'Achievements', path: '/achievements', icon: '🏆' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const filtered = query
    ? quickLinks.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, skills, resources..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn-ghost btn-sm" onClick={onClose}>
            <kbd style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>ESC</kbd>
          </button>
        </div>
        <div className="search-results">
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No results found
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.path}
                className="search-result-item"
                onClick={() => handleSelect(item.path)}
              >
                <span style={{ fontSize: 'var(--text-lg)' }}>{item.icon}</span>
                <span style={{ fontSize: 'var(--text-sm)' }}>{item.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
