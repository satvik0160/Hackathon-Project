import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Star, Award, Zap, Shield, Target, Book, Briefcase,
  CheckCircle, Lock, Unlock, Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TiltCard } from '../../components/common/TiltCard';
import { assessmentService, jobService, learningService } from '../../services/api';

// Mirrors the backend XP rules in submit_assessment_secure().
const xpForDifficulty = (difficulty) => {
  const d = String(difficulty || '').toUpperCase();
  if (d === 'BEGINNER' || d === 'EASY') return 15;
  if (d === 'INTERMEDIATE' || d === 'MEDIUM') return 25;
  if (d === 'ADVANCED' || d === 'HARD') return 35;
  return 15;
};

const LEVEL_NAMES = ['Beginner', 'Explorer', 'Achiever', 'Expert', 'Master'];

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Achievements = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [completedResources, setCompletedResources] = useState(0);
  const [applications, setApplications] = useState([]);
  const [topMatch, setTopMatch] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const { data } = await assessmentService.getHistory();
        if (!cancelled) setHistory(data || []);
      } catch (e) { console.warn('[Achievements] history unavailable', e?.message); }

      try {
        const { data } = await learningService.getCompletedResourceCount();
        if (!cancelled) setCompletedResources(data || 0);
      } catch (e) { console.warn('[Achievements] resources unavailable', e?.message); }

      try {
        const { data } = await jobService.getApplications();
        if (!cancelled) setApplications(data?.applications || []);
      } catch (e) { console.warn('[Achievements] applications unavailable', e?.message); }

      try {
        const { data } = await jobService.getMatches();
        const matches = data?.matches || [];
        if (!cancelled) setTopMatch(matches.length ? (matches[0].match_score || 0) : 0);
      } catch (e) { console.warn('[Achievements] matches unavailable', e?.message); }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  // Real XP / level / streak from public.users (written by the scoring RPCs).
  const currentXP = Number(user?.total_points) || 0;
  const streak = Number(user?.streak_count) || 0;
  const skillLevel = Number(user?.skill_level) || 1;
  const levelIndex = Math.min(skillLevel - 1, LEVEL_NAMES.length - 1);
  const currentLevel = { name: LEVEL_NAMES[levelIndex], max: skillLevel * 500 };
  const xpInCurrentLevel = currentXP % 500;
  const xpNeededForNext = 500;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  const firstVerified = history.find((h) => h.score_percentage >= 80);
  const earliest = history.length
    ? history[history.length - 1]
    : null;

  const achievements = [
    { id: 1, title: 'First Steps', desc: 'Complete your first assessment', icon: <Target size={24} />, unlocked: history.length > 0, date: earliest ? new Date(earliest.completed_at).toLocaleDateString() : null },
    { id: 2, title: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: <Flame size={24} />, unlocked: streak >= 7, date: null },
    { id: 3, title: 'Skill Verified', desc: 'Score 80%+ on any skill assessment', icon: <Shield size={24} />, unlocked: !!firstVerified, date: firstVerified ? new Date(firstVerified.completed_at).toLocaleDateString() : null },
    { id: 4, title: 'Bookworm', desc: 'Complete 10 learning resources', icon: <Book size={24} />, unlocked: completedResources >= 10, date: null },
    { id: 5, title: 'Job Hunter', desc: 'Apply to your first job', icon: <Briefcase size={24} />, unlocked: applications.length > 0, date: applications.length ? new Date(applications[0].created_at).toLocaleDateString() : null },
    { id: 6, title: 'Perfect Match', desc: 'Achieve 90%+ match with a job listing', icon: <Star size={24} />, unlocked: topMatch >= 90, date: null },
  ];

  // Real XP history: one entry per completed assessment.
  const historyItems = history.slice(0, 8).map((h) => ({
    id: h.id,
    action: `Completed ${h.assessment?.title || 'Assessment'}`,
    xp: h.score_percentage >= 80 ? xpForDifficulty(h.assessment?.difficulty) : 0,
    time: timeAgo(h.completed_at),
    icon: <CheckCircle size={16} />,
  }));

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold"><span className="gradient-animated-text">Achievements & XP</span></h1>
        <p className="text-muted">Track your progress, earn badges, and level up.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Level Progress */}
        <motion.div
          className="card md:col-span-2 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 text-primary pointer-events-none">
            <Award size={120} />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 rainbow-ring flex-shrink-0">
              <span className="text-3xl font-bold text-white relative z-10">
                Lvl {skillLevel}
              </span>
            </div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-xl font-bold">{currentLevel.name}</h2>
                  <p className="text-sm text-muted">{currentXP.toLocaleString()} Total XP</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-primary">
                    {xpInCurrentLevel} / {xpNeededForNext} XP
                  </span>
                </div>
              </div>

              <div className="h-4 w-full bg-bg-secondary rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              <p className="text-xs text-muted text-right">
                {xpNeededForNext - xpInCurrentLevel} XP to next level
              </p>
            </div>
          </div>
        </motion.div>

        {/* Streak Component */}
        <motion.div
          className="card flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-amber-600 flex items-center justify-center mb-3 animate-float-y shadow-lg shadow-amber-200/50">
            <Flame size={40} className="text-orange-500 fill-amber-200" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{streak} <span className="text-lg font-normal text-muted">Days</span></h3>
          <p className="text-sm font-medium mb-3">Current Streak</p>

          <div className="flex gap-2 justify-center w-full">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < Math.min(streak, 7) ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                }`}>
                  {i < Math.min(streak, 7) ? <CheckCircle size={12} /> : null}
                </div>
                <span className="text-[10px] text-muted">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Achievements Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="text-primary" /> Badges & Achievements
          </h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {achievements.map((acc) => (
              <TiltCard
                key={acc.id}
                variants={itemVariant}
                className={`card p-4 flex gap-4 ${!acc.unlocked ? 'opacity-60 grayscale' : 'border-l-4 border-indigo-500 gradient-border'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6 ${
                  acc.unlocked ? 'bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 text-indigo-600 border border-indigo-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {acc.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm mb-1">{acc.title}</h4>
                    {acc.unlocked ? <Unlock size={14} className="text-success" /> : <Lock size={14} className="text-muted" />}
                  </div>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{acc.desc}</p>
                  {acc.unlocked && acc.date && (
                    <span className="text-[10px] bg-bg-secondary px-2 py-1 rounded text-muted">
                      Earned {acc.date}
                    </span>
                  )}
                </div>
              </TiltCard>
            ))}
          </motion.div>
        </div>

        {/* XP History */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="text-accent" /> XP History
          </h2>
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <p className="text-sm text-muted py-6 text-center">Loading your XP history…</p>
            ) : historyItems.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">Complete an assessment to start earning XP.</p>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0 relative">
                    {idx !== historyItems.length - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-[-16px] w-[2px] bg-border"></div>
                    )}
                    <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 z-10">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar size={12} /> {item.time}
                        </span>
                        <span className={`text-xs font-bold ${item.xp > 0 ? 'text-success' : 'text-muted'}`}>+{item.xp} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
