import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ParticleCanvas from '../auth/ParticleCanvas';

export default function Layout() {
  const { isAuthenticated, loading, needsOnboarding, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Mouse spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track time spent on the website for heatmap (every 10 seconds)
  useEffect(() => {
    import('../../utils/timeTracker').then(({ addTime }) => {
      const interval = setInterval(() => {
        addTime(10); // add 10 seconds
        // Optionally dispatch an event so the heatmap can update in real-time
        window.dispatchEvent(new Event('timeTrackerUpdate'));
      }, 10000);
      return () => clearInterval(interval);
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-100 flex overflow-hidden antialiased tracking-tight relative">
      
      {/* Background Ambience & Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Background Particles */}
        <div className="absolute inset-0 opacity-[0.03]">
          <ParticleCanvas />
        </div>

        {/* Dynamic mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/40 via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-100/30 via-transparent to-transparent opacity-90" />
        
        {/* Spotlight following cursor */}
        <motion.div 
          className="absolute w-[800px] h-[800px] bg-sky-200/[0.06] rounded-full blur-[100px] transition-opacity duration-300 ease-in-out"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        />
        
        {/* Animated decorative orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-sky-200/[0.04] rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-violet-200/[0.04] rounded-full blur-[150px] mix-blend-screen" 
        />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
        collapsed={desktopSidebarCollapsed} 
        setCollapsed={setDesktopSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full md:w-auto h-screen overflow-hidden">
        {/* Top Header */}
        <Header 
          onMenuClick={() => setMobileMenuOpen(true)} 
          onDesktopMenuClick={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)} 
        />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-50/50">
          <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)', scale: 0.99 }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.99 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || 'STUDENT';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
