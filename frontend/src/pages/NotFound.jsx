import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, BookOpen, Brain, Compass, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = '404 - Page Not Found | DevAstra';
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F22] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience / Glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] sm:w-[45rem] h-[30rem] sm:h-[45rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(217, 175, 103, 0.12) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Error 404 · Signal Lost
        </motion.div>

        {/* 404 Big Display */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl sm:text-9xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-indigo-300 to-violet-400 bg-clip-text text-transparent select-none drop-shadow-lg"
        >
          404
        </motion.h1>

        {/* Headline & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 mb-3">
            Lost in the Skill Constellation?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
            The coordinates you navigated to don't exist, were relocated, or the link might be broken. Let's get you back on track.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-8 w-full"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg hover:shadow-amber-500/25"
          >
            <Home className="w-4 h-4" />
            {isAuthenticated ? 'Go to Dashboard' : 'Return to Home'}
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-slate-800/80 w-full"
        >
          <p className="text-xs uppercase font-mono tracking-wider text-slate-500 mb-4">
            Popular Destinations
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
            <Link
              to="/learning"
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Learning Hub
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/assessments"
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <Brain className="w-4 h-4 text-sky-400" />
              Skill Assessments
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/developer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              Meet the Team
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
