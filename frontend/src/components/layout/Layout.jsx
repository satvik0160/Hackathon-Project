import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ParticleCanvas from '../auth/ParticleCanvas';
import InteractiveMesh from '../common/InteractiveMesh';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-indigo-100 flex overflow-hidden antialiased tracking-tight relative">
      
      {/* Background Ambience & Spotlight — soft pastel cosmic atmosphere */}
      <div className="dv-atmosphere">
        {/* Subtle background particles */}
        <div className="absolute inset-0 opacity-[0.05]">
          <ParticleCanvas />
        </div>

        {/* Soft blurred pastel blobs */}
        <motion.div
          className="dv-blob dv-blob--violet absolute top-[-18%] right-[-12%] w-[46vw] h-[46vw]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="dv-blob dv-blob--blue absolute bottom-[-20%] left-[-12%] w-[42vw] h-[42vw]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.95, 0.7] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="dv-blob dv-blob--pink absolute top-[34%] left-[38%] w-[30vw] h-[30vw]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="dv-blob dv-blob--mint absolute bottom-[12%] right-[22%] w-[24vw] h-[24vw]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* Abstract flowing curves */}
        <svg
          className="dv-ribbon absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dvRibbonA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9A6BFA" stopOpacity="0.30" />
              <stop offset="55%" stopColor="#4F8EF7" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#22BDDC" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="dvRibbonB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E86FD6" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#9A6BFA" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#2BC49A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-100 620 C 260 470, 460 760, 820 560 C 1120 392, 1300 520, 1560 380"
            fill="none"
            stroke="url(#dvRibbonA)"
            strokeWidth="120"
            strokeLinecap="round"
          />
          <path
            d="M-80 250 C 300 120, 620 340, 960 180 C 1220 58, 1360 170, 1540 90"
            fill="none"
            stroke="url(#dvRibbonB)"
            strokeWidth="90"
            strokeLinecap="round"
          />
        </svg>

        {/* Soft planetary / orbital decorative element */}
        <motion.div
          className="absolute top-[8%] right-[14%] w-[280px] h-[280px] opacity-70 hidden lg:block"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="dv-planet inset-0 absolute" />
          <div className="dv-planet-ring absolute -inset-x-16 top-1/2 h-[110px] -translate-y-1/2" />
        </motion.div>

        {/* Tiny decorative particles */}
        {[
          { top: '18%', left: '12%', delay: '0s' },
          { top: '62%', left: '26%', delay: '1.4s' },
          { top: '30%', left: '68%', delay: '2.6s' },
          { top: '78%', left: '82%', delay: '0.8s' },
          { top: '46%', left: '92%', delay: '3.4s' },
        ].map((spark, i) => (
          <motion.span
            key={i}
            className="dv-spark"
            style={{ top: spark.top, left: spark.left }}
            animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: parseFloat(spark.delay) }}
          />
        ))}

        {/* Spotlight following cursor */}
        <motion.div
          className="absolute w-[800px] h-[800px] bg-violet-300/[0.07] rounded-full blur-[110px] transition-opacity duration-300 ease-in-out"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-transparent">
          <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
