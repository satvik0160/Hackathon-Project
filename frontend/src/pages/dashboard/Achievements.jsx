import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Star, Award, Zap, Shield, Target, Book, Briefcase, 
  CheckCircle, Lock, Unlock, Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Achievements = () => {
  const { user } = useAuth();
  
  // Mock data for XP and achievements
  const currentXP = user?.stats?.xp || 2450;
  
  const levels = [
    { name: 'Beginner', max: 100 },
    { name: 'Explorer', max: 300 },
    { name: 'Achiever', max: 600 },
    { name: 'Expert', max: 1000 },
    { name: 'Master', max: Infinity }
  ];
  
  const currentLevelIndex = levels.findIndex(l => currentXP < l.max);
  const currentLevel = levels[currentLevelIndex !== -1 ? currentLevelIndex : levels.length - 1];
  const nextLevel = levels[currentLevelIndex !== -1 ? currentLevelIndex : levels.length - 1];
  const prevLevelMax = currentLevelIndex > 0 ? levels[currentLevelIndex - 1].max : 0;
  
  const xpInCurrentLevel = currentXP - prevLevelMax;
  const xpNeededForNext = currentLevel.max - prevLevelMax;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  const achievements = [
    { id: 1, title: 'First Steps', desc: 'Complete your first assessment', icon: <Target size={24} />, unlocked: true, date: 'Oct 12, 2023' },
    { id: 2, title: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: <Flame size={24} />, unlocked: true, date: 'Oct 19, 2023' },
    { id: 3, title: 'Skill Verified', desc: 'Score 80%+ on any skill assessment', icon: <Shield size={24} />, unlocked: true, date: 'Nov 02, 2023' },
    { id: 4, title: 'Bookworm', desc: 'Complete 10 learning resources', icon: <Book size={24} />, unlocked: false },
    { id: 5, title: 'Job Hunter', desc: 'Apply to your first job', icon: <Briefcase size={24} />, unlocked: false },
    { id: 6, title: 'Perfect Match', desc: 'Achieve 90%+ match with a job listing', icon: <Star size={24} />, unlocked: false },
  ];

  const history = [
    { id: 1, action: 'Completed React Assessment', xp: 50, time: '2 hours ago', icon: <CheckCircle size={16} /> },
    { id: 2, action: 'Daily Login', xp: 10, time: 'Today', icon: <Zap size={16} /> },
    { id: 3, action: 'Finished "Intro to System Design"', xp: 30, time: 'Yesterday', icon: <Book size={16} /> },
    { id: 4, action: 'Completed Python Assessment', xp: 45, time: '3 days ago', icon: <CheckCircle size={16} /> },
    { id: 5, action: '7-Day Streak Bonus', xp: 100, time: '1 week ago', icon: <Flame size={16} /> },
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold">Achievements & XP</h1>
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <span className="text-3xl font-bold text-white shadow-sm">
                Lvl {currentLevelIndex + 1}
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
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              
              <p className="text-xs text-muted text-right">
                {currentLevel.max - currentXP} XP to {levels[currentLevelIndex + 1]?.name || 'Next Level'}
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
          <div className="w-20 h-20 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-3 animate-pulse">
            <Flame size={40} className="text-warning fill-warning/20" />
          </div>
          <h3 className="text-3xl font-bold mb-1">5 <span className="text-lg font-normal text-muted">Days</span></h3>
          <p className="text-sm font-medium mb-3">Current Streak</p>
          
          <div className="flex gap-2 justify-center w-full">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < 5 ? 'bg-warning text-white' : 'bg-bg-secondary text-muted'
                }`}>
                  {i < 5 ? <CheckCircle size={12} /> : null}
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
              <motion.div 
                key={acc.id} 
                variants={itemVariant}
                className={`card p-4 flex gap-4 ${!acc.unlocked ? 'opacity-60 grayscale' : 'border-l-4 border-primary'}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  acc.unlocked ? 'bg-primary/10 text-primary' : 'bg-bg-secondary text-muted'
                }`}>
                  {acc.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm mb-1">{acc.title}</h4>
                    {acc.unlocked ? <Unlock size={14} className="text-success" /> : <Lock size={14} className="text-muted" />}
                  </div>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{acc.desc}</p>
                  {acc.unlocked && (
                    <span className="text-[10px] bg-bg-secondary px-2 py-1 rounded text-muted">
                      Earned {acc.date}
                    </span>
                  )}
                </div>
              </motion.div>
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
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0 relative">
                  {idx !== history.length - 1 && (
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
                      <span className="text-xs font-bold text-success">+{item.xp} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
