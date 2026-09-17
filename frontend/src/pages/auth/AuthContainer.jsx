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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-900 font-sans selection:bg-indigo-100 relative overflow-hidden">
      {/* Intense Background Animations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <ParticleCanvas />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.4, 0.15], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-300/[0.18] rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-300/[0.18] rounded-full blur-[120px]"
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
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-20 border-r border-slate-200/80 bg-white/40 backdrop-blur-xl">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">DevAstra</h1>
              <p className="text-xs text-indigo-600 font-mono tracking-widest uppercase mt-0.5">Intelligence OS</p>
            </div>
          </div>

          <div className="my-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Bridge the gap to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                  Industry Readiness
                </span>
              </h2>
              <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                Bridge the gap between your academic journey and industry readiness. Authenticate to sync your skill vector graph.
              </p>
            </motion.div>

            {/* Floating Metric Badges */}
            <div className="mt-12 flex flex-col gap-4 max-w-sm">
              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/50 hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 text-xl">🔥</div>
                <div>
                  <p className="text-slate-900 font-semibold">12-Day Streak</p>
                  <p className="text-sm text-slate-500 font-medium">Consistency multiplier active</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/50 ml-8 hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl">🎯</div>
                <div>
                  <p className="text-slate-900 font-semibold">84% Match Rate</p>
                  <p className="text-sm text-slate-500 font-medium">Top quartile of candidates</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/50 hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xl">⭐</div>
                <div>
                  <p className="text-slate-900 font-semibold">Level 4 Ready</p>
                  <p className="text-sm text-slate-500 font-medium">Frontend Architecture</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="font-mono text-xs text-indigo-500/80 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4" />
            <span>v2.4.0-stable // Secure Connection Established</span>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 w-full max-w-2xl mx-auto">
          
          <div className="w-full relative z-10">
            <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">DevAstra</h1>
            </div>

            <div className="bg-white/85 backdrop-blur-2xl border border-slate-200/90 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative">
              
              {/* Tab Switcher (Framer Motion layoutId) */}
              <div className="flex relative bg-slate-100/80 p-1 rounded-2xl mb-8 border border-slate-200/80">
                <button
                  className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-900'}`}
                  onClick={() => setActiveTab('login')}
                >
                  {activeTab === 'login' && (
                    <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white rounded-xl shadow-lg border border-slate-200/80" />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>
                <button
                  className={`flex-1 relative z-10 py-3 text-sm font-semibold transition-colors ${activeTab === 'register' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-900'}`}
                  onClick={() => setActiveTab('register')}
                >
                  {activeTab === 'register' && (
                    <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white rounded-xl shadow-lg border border-slate-200/80" />
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
