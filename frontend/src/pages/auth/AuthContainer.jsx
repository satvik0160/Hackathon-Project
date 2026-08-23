import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TerminalSquare } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login');

  // Keep URL in sync with tab changes
  useEffect(() => {
    if (activeTab === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (activeTab === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0F1D] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* LEFT: Showcase Panel (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 lg:p-20 overflow-hidden border-r border-white/5 bg-[#050811]">
        
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgbW9kZT0icGFzc3Rocm91Z2giPjxwYXRoIGQ9Ik02MCAwTDAgMEwwIDYwTDYwIDYwTDYwIDBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvZz48L3N2Zz4=')] opacity-20" />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">DevAstra</h1>
            <p className="text-xs text-indigo-200/60 font-mono tracking-widest uppercase mt-0.5">Intelligence OS</p>
          </div>
        </div>

        <div className="relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
              Academia–Industry <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Skill Intelligence
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Bridge the gap between your academic journey and industry readiness. Authenticate to sync your skill vector graph.
            </p>
          </motion.div>

          {/* Floating Metric Badges */}
          <div className="mt-12 flex flex-col gap-4 max-w-sm relative">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-xl">🔥</div>
              <div>
                <p className="text-white font-medium">12-Day Streak</p>
                <p className="text-sm text-slate-400">Consistency multiplier active</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl ml-8"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 text-xl">🎯</div>
              <div>
                <p className="text-white font-medium">84% Match Rate</p>
                <p className="text-sm text-slate-400">Top quartile of candidates</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400 text-xl">⭐</div>
              <div>
                <p className="text-white font-medium">Level 4 Ready</p>
                <p className="text-sm text-slate-400">Frontend Architecture</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 font-mono text-xs text-slate-500 flex items-center gap-2">
          <TerminalSquare className="w-4 h-4" />
          <span>v2.4.0-stable // Secure Connection Established</span>
        </div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1D] to-[#050811] md:hidden" />
        
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">DevAstra</h1>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Animated Tab Switcher */}
            <div className="flex relative bg-black/20 p-1 rounded-xl mb-8 border border-white/5">
              <div 
                className="absolute inset-y-1 bg-white/10 rounded-lg shadow-sm transition-all duration-300 ease-out"
                style={{
                  width: 'calc(50% - 4px)',
                  left: activeTab === 'login' ? '4px' : 'calc(50%)'
                }}
              />
              <button
                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${activeTab === 'login' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('login')}
              >
                Sign In
              </button>
              <button
                className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setActiveTab('register')}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
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
  );
}
