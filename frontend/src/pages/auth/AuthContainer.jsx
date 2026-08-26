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
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      
      <ParticleCanvas />
      
      {/* GRID LAYOUT: Solves overlap permanently by strictly dividing space */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT: Showcase Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 border-r border-white/5 bg-black/40 backdrop-blur-sm">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">DevAstra</h1>
              <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Intelligence OS</p>
            </div>
          </div>

          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
                Bridge the gap to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
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
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50 text-orange-400 text-xl drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">🔥</div>
                <div>
                  <p className="text-white font-medium">12-Day Streak</p>
                  <p className="text-sm text-slate-400">Consistency multiplier active</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl ml-8 hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 text-cyan-400 text-xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">🎯</div>
                <div>
                  <p className="text-white font-medium">84% Match Rate</p>
                  <p className="text-sm text-slate-400">Top quartile of candidates</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 text-purple-400 text-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">⭐</div>
                <div>
                  <p className="text-white font-medium">Level 4 Ready</p>
                  <p className="text-sm text-slate-400">Frontend Architecture</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="font-mono text-xs text-cyan-500/70 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
            <TerminalSquare className="w-4 h-4" />
            <span>v2.4.0-stable // Secure Connection Established</span>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 w-full max-w-2xl mx-auto">
          
          <div className="w-full relative z-10">
            <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">DevAstra</h1>
            </div>

            <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
              
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
