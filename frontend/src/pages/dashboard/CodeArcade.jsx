import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Code2, Database, Layout, Terminal, Play, Trophy, Star, Zap } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';

const CodeArcade = () => {
  const navigate = useNavigate();

  const getBestScore = (key) => localStorage.getItem(key) || 0;

  const games = [
    {
      id: 'css-battle',
      title: 'CSS Battle Royale',
      description: 'Test your CSS skills by matching target designs using code.',
      icon: Layout,
      color: 'from-pink-500 to-purple-500',
      xp: '500',
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
      xp: '800',
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
    }
  ];

  return (
    <div className="page-container p-6">
      <div className="page-header mb-8 text-center flex flex-col items-center">
        <Gamepad2 className="w-16 h-16 mb-4 text-blue-600 animate-float" />
        <h1 className="text-4xl font-extrabold text-slate-900 shimmer-title mb-2">Code Arcade</h1>
        <p className="text-slate-500 max-w-xl mx-auto mb-4">Play games, improve your skills, and earn XP.</p>
        
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-xl flex items-center gap-4 shadow-sm inline-flex mx-auto">
          <div className="text-slate-500 font-medium">Total Arcade XP</div>
          <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {(Number(getBestScore('cssBattleBestScore')) + Number(getBestScore('algoSpeedrunBestScore')) + Number(getBestScore('sqlMysteryBestScore')))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((g, i) => (
          <TiltCard 
            key={i} 
            className="h-64 rounded-3xl overflow-hidden group border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 relative cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-90 transition-opacity group-hover:opacity-100 group-hover:scale-[1.01]`}></div>
            <div className="absolute inset-0 p-6 flex flex-col text-white z-10">
              <div className="flex justify-between items-start mb-4 text-white">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{g.type}</span>
                <span className="flex items-center gap-1 font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-sm text-white">
                  <Zap className="w-4 h-4 text-yellow-300" /> {g.xp} XP
                </span>
              </div>
              <h3 className="text-2xl font-black mt-auto mb-2 drop-shadow-md text-white">{g.title}</h3>
              <p className="text-white/90 text-sm font-medium flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Challenge time: {g.time}
              </p>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm bg-white/10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(g.path);
                }}
                className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-full shadow-2xl shadow-indigo-500/30 transform scale-90 group-hover:scale-100 transition-all active:scale-95 flex items-center gap-2"
              >
                PLAY NOW <Play className="w-4 h-4" />
              </button>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
};

export default CodeArcade;
