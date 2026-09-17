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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 font-sans selection:bg-indigo-100 flex overflow-hidden antialiased tracking-tight relative">
      
      {/* Background Ambience & Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Background Particles */}
        <div className="absolute inset-0 opacity-[0.04]">
          <ParticleCanvas />
        </div>

        {/* Animated aurora blobs — vibrant multi-color mesh */}
        <motion.div
          className="aurora-blob absolute top-[-15%] right-[-10%] w-[45vw] h-[45vw] bg-indigo-400/40"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="aurora-blob absolute bottom-[-15%] left-[-10%] w-[40vw] h-[40vw] bg-fuchsia-400/35"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="aurora-blob absolute top-[30%] left-[35%] w-[30vw] h-[30vw] bg-sky-400/35"
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.65, 0.3] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="aurora-blob absolute top-[10%] left-[5%] w-[22vw] h-[22vw] bg-pink-400/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="aurora-blob absolute bottom-[15%] right-[25%] w-[20vw] h-[20vw] bg-emerald-400/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="aurora-blob absolute top-[40%] right-[5%] w-[24vw] h-[24vw] bg-amber-300/30"
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />

        {/* Rotating conic rainbow orb */}
        <div className="conic-orb absolute top-[20%] left-[10%] w-[26vw] h-[26vw]"></div>

        {/* Rising colorful bubbles */}
        <div className="bubbles">
          {[
            { left: '8%', size: 22, color: 'rgba(99,102,241,0.30)', dur: '16s', delay: '0s', drift: '40px' },
            { left: '22%', size: 14, color: 'rgba(236,72,153,0.28)', dur: '12s', delay: '3s', drift: '-30px' },
            { left: '38%', size: 30, color: 'rgba(139,92,246,0.25)', dur: '19s', delay: '1s', drift: '50px' },
            { left: '55%', size: 16, color: 'rgba(6,182,212,0.28)', dur: '14s', delay: '5s', drift: '-45px' },
            { left: '70%', size: 24, color: 'rgba(244,114,182,0.25)', dur: '17s', delay: '2s', drift: '35px' },
            { left: '84%', size: 18, color: 'rgba(16,185,129,0.28)', dur: '13s', delay: '6s', drift: '-38px' },
            { left: '92%', size: 12, color: 'rgba(251,191,36,0.30)', dur: '15s', delay: '4s', drift: '28px' },
          ].map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: b.left,
                width: b.size,
                height: b.size,
                '--bubble-color': b.color,
                '--bubble-duration': b.dur,
                '--bubble-drift': b.drift,
                animationDelay: b.delay,
              }}
            />
          ))}
        </div>

        {/* Confetti dot drift */}
        <div className="absolute inset-0 confetti-dots opacity-40" />

        {/* Spotlight following cursor */}
        <motion.div 
          className="absolute w-[800px] h-[800px] bg-fuchsia-200/[0.10] rounded-full blur-[100px] transition-opacity duration-300 ease-in-out"
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
