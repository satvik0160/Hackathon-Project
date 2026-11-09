import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gamepad2, Code2, Database, Layout, Terminal, Play, Trophy, Star, Zap, Leaf, Lightbulb } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';

const CodeArcade = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userSkills = typeof user?.skills === 'string' ? JSON.parse(user.skills) : (user?.skills || []);
  const aim = user?.career_goal || 'Software Engineering';

  const getBestScore = (key) => localStorage.getItem(key) || 0;

  const games = [
    {
      id: 'css-battle',
      title: 'CSS Battle Royale',
      description: 'Test your CSS skills by matching target designs using code.',
      icon: Layout,
      color: 'from-pink-500 to-purple-500',
      xp: '1000',
      tags: ['CSS3', 'Layout', 'Styling'],
      path: '/arcade/css-battle',
      bestScoreKey: 'cssBattleBestScore',
      type: 'Frontend',
      time: '10m'
    },
    {
      id: 'algo-speedrun',
      title: 'Algorithm Speedrun',
      description: 'Solve algorithmic challenges against the clock.',
      icon: Code2,
      color: 'from-green-400 to-emerald-600',
      xp: '1600',
      tags: ['JavaScript', 'Algorithms', 'Logic'],
      path: '/arcade/algorithm-speedrun',
      bestScoreKey: 'algoSpeedrunBestScore',
      type: 'Backend',
      time: '15m'
    },
    {
      id: 'sql-mystery',
      title: 'SQL Murder Mystery',
      description: 'Use SQL queries to solve a crime investigation.',
      icon: Database,
      color: 'from-blue-400 to-indigo-600',
      xp: '1200',
      tags: ['SQL', 'Databases', 'Problem Solving'],
      path: '/arcade/sql-mystery',
      bestScoreKey: 'sqlMysteryBestScore',
      type: 'Database',
      time: '30m'
    },
    {
      id: 'flexbox-froggy',
      title: 'Flexbox Froggy',
      description: 'Help frogs reach their lilypads by mastering CSS Flexbox.',
      icon: Leaf,
      color: 'from-green-500 to-teal-600',
      xp: '1000',
      tags: ['CSS3', 'Flexbox', 'Layout'],
      path: '/arcade/flexbox-froggy',
      bestScoreKey: 'flexboxFroggyBestScore',
      type: 'Frontend',
      time: '20m'
    },
    {
      id: 'regex-golf',
      title: 'Regex Golf',
      description: 'Master regular expressions by matching patterns in text.',
      icon: Lightbulb,
      color: 'from-purple-500 to-indigo-600',
      xp: '1000',
      tags: ['Regex', 'Pattern Matching', 'JavaScript'],
      path: '/arcade/regex-golf',
      bestScoreKey: 'regexGolfBestScore',
      type: 'Backend',
      time: '25m'
    }
  ];

  return (
    <div className="page-container p-6">
      <div className="page-header mb-8 text-center flex flex-col items-center">
        <Gamepad2 className="w-16 h-16 mb-4 text-blue-600 animate-float" />
        <h1 className="text-4xl font-extrabold text-slate-900 shimmer-title mb-2">Code Arcade</h1>
        <p className="text-slate-500 max-w-xl mx-auto mb-4">Play games curated for your {aim} journey and sharpen your skills in {userSkills.length > 0 ? userSkills.slice(0, 3).join(', ') : 'coding'}.</p>
        
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-xl flex items-center gap-4 shadow-sm inline-flex mx-auto">
          <div className="text-slate-500 font-medium">Total Arcade XP</div>
          <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {(Number(getBestScore('cssBattleBestScore')) + Number(getBestScore('algoSpeedrunBestScore')) + Number(getBestScore('sqlMysteryBestScore')) + Number(getBestScore('flexboxFroggyBestScore')) + Number(getBestScore('regexGolfBestScore')))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {games.map((g, i) => {
          const userBest = Number(getBestScore(g.bestScoreKey));
          const maxXP = Number(g.xp);
          const isCompleted = userBest >= maxXP;

          return (
            <TiltCard 
              key={i} 
              onClick={() => navigate(g.path)}
              className="h-72 rounded-3xl overflow-hidden group border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 relative cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-90 transition-opacity group-hover:opacity-100 group-hover:scale-[1.01]`}></div>
              <div className="absolute inset-0 p-6 flex flex-col text-white z-10">
                <div className="flex justify-between items-start mb-4 text-white">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{g.type}</span>
                  <div className="flex items-center gap-1.5">
                    {isCompleted && (
                      <span className="bg-emerald-500/80 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        ✓ Done
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-sm text-white">
                      <Zap className="w-4 h-4 text-yellow-300" /> {g.xp} XP
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mt-auto mb-1 drop-shadow-md text-white">{g.title}</h3>
                <p className="text-white/80 text-xs line-clamp-2 mb-3">{g.description}</p>

                <div className="pt-2 border-t border-white/20 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center text-white/90">
                    <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Time:</span>
                    <span className="font-semibold">{g.time}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/90">
                    <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-yellow-300" /> Best:</span>
                    <span className="font-bold text-yellow-300">{userBest} / {maxXP} XP</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm bg-black/20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(g.path);
                  }}
                  className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-black px-6 py-2.5 rounded-full shadow-2xl shadow-indigo-500/40 transform scale-90 group-hover:scale-100 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  PLAY NOW <Play className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
};

export default CodeArcade;
