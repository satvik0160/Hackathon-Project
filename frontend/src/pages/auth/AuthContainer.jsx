import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, TerminalSquare } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import ParticleCanvas from '../../components/auth/ParticleCanvas';

export default function AuthContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login');

  useEffect(() => {
    if (activeTab === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (activeTab === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-200 font-sans selection:bg-amber-500/20 relative overflow-hidden">
      {/* Intense Background Animations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <ParticleCanvas />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-amber-600/[0.08] rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.6, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-600/[0.08] rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] bg-white/[0.03] rounded-full blur-[80px]"
        />
      </div>
      {/* GRID LAYOUT: Solves overlap permanently by strictly dividing space */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT: Showcase Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(217,175,103,0.5)]">DevAstra</h1>
              <p className="text-xs text-amber-400 font-mono tracking-widest uppercase mt-0.5 drop-shadow-[0_0_5px_rgba(217,175,103,0.6)]">Intelligence OS</p>
            </div>
          </div>

          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
                Bridge the gap to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_20px_rgba(217,175,103,0.2)]">
                  Industry Readiness
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                Bridge the gap between your academic journey and industry readiness. Authenticate to sync your skill vector graph.
              </p>
            </motion.div>

            {/* Floating Metric Badges */}
            <div className="mt-12 flex flex-col gap-4 max-w-sm">
              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:border-amber-500/40 hover:shadow-amber-500/15 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/40 text-amber-400 text-xl drop-shadow-[0_0_10px_rgba(217,175,103,0.6)]">🔥</div>
                <div>
                  <p className="text-white font-medium">12-Day Streak</p>
                  <p className="text-sm text-slate-400">Consistency multiplier active</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl ml-8 hover:border-amber-500/40 hover:shadow-amber-500/15 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/40 text-amber-400 text-xl drop-shadow-[0_0_10px_rgba(217,175,103,0.6)]">🎯</div>
                <div>
                  <p className="text-white font-medium">84% Match Rate</p>
                  <p className="text-sm text-slate-400">Top quartile of candidates</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:border-amber-500/40 hover:shadow-amber-500/15 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-amber-600/15 flex items-center justify-center border border-amber-600/40 text-amber-300 text-xl drop-shadow-[0_0_10px_rgba(217,175,103,0.6)]">⭐</div>
                <div>
                  <p className="text-white font-medium">Level 4 Ready</p>
                  <p className="text-sm text-slate-400">Frontend Architecture</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="font-mono text-xs text-amber-500/60 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(217,175,103,0.4)]">
            <TerminalSquare className="w-4 h-4" />
            <span>v2.4.0-stable // Secure Connection Established</span>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 w-full max-w-2xl mx-auto">
          
          <div className="w-full relative z-10">
            <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(217,175,103,0.4)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(217,175,103,0.5)]">DevAstra</h1>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.07] rounded-[2rem] p-8 shadow-[0_0_50px_rgba(217,175,103,0.05)] relative">
              
              {/* Tab Switcher (Framer Motion layoutId) */}
              <div className="flex relative bg-black/40 p-1 rounded-2xl mb-8 border border-white/5">
                <button
                  className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('login')}
                >
                  {activeTab === 'login' && (
                    <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white/10 rounded-xl shadow-lg border border-white/5" />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>
                <button
                  className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors ${activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setActiveTab('register')}
                >
                  {activeTab === 'register' && (
                    <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white/10 rounded-xl shadow-lg border border-white/5" />
                  )}
                  <span className="relative z-10">Create Account</span>
                </button>
              </div>

              {/* Form Render */}
              <div className="relative min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
