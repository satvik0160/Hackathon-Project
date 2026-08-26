import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  const { isAuthenticated, loading, needsOnboarding, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mouse spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log('Layout check - needsOnboarding:', needsOnboarding, 'user:', JSON.stringify(user));
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-200 font-sans selection:bg-indigo-500/30 flex overflow-hidden antialiased tracking-tight">
      {/* Background Ambience & Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dynamic mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050811]/0 to-[#050811] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#050811]/0 to-[#050811] opacity-70" />
        
        {/* Spotlight following cursor */}
        <div 
          className="absolute w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px] transition-opacity duration-300 ease-in-out"
          style={{
            top: mousePosition.y - 400,
            left: mousePosition.x - 400,
            opacity: 1
          }}
        />
        
        {/* Static decorative orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-cyan-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full md:w-auto h-screen overflow-hidden">
        {/* Top Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
            <Outlet />
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
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
