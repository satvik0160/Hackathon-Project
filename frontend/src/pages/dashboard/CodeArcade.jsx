import React from 'react';
import { Gamepad2, Code2, Zap } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';

const CodeArcade = () => {
  const games = [
    { title: 'CSS Battle Royale', type: 'Frontend', xp: 500, time: '10m', color: 'from-pink-500 to-rose-400' },
    { title: 'Algorithm Speedrun', type: 'Backend', xp: 800, time: '15m', color: 'from-violet-500 to-purple-400' },
    { title: 'SQL Murder Mystery', type: 'Database', xp: 1200, time: '30m', color: 'from-emerald-500 to-teal-400' },
  ];

  return (
    <div className="page-container p-6">
      <div className="page-header mb-8 text-center">
        <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-indigo-600 animate-float" />
        <h1 className="text-4xl font-extrabold text-slate-900 shimmer-title mb-2">Code Arcade</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Sharpen your skills with bite-sized, gamified coding challenges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {games.map((g, i) => (
          <TiltCard key={i} className="h-64 rounded-3xl overflow-hidden group border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 relative cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-90 transition-opacity group-hover:opacity-100 group-hover:scale-[1.01]`}></div>
            <div className="absolute inset-0 p-6 flex flex-col text-slate-800 z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{g.type}</span>
                <span className="flex items-center gap-1 font-black bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-sm">
                  <Zap className="w-4 h-4 text-yellow-300" /> {g.xp} XP
                </span>
              </div>
              <h3 className="text-2xl font-black mt-auto mb-2 drop-shadow-md">{g.title}</h3>
              <p className="text-slate-800/80 text-sm font-medium flex items-center gap-2">
                <Code2 className="w-4 h-4" /> Challenge time: {g.time}
              </p>
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm bg-white/10">
              <button className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-black px-8 py-3 rounded-full shadow-2xl shadow-indigo-500/30 transform scale-90 group-hover:scale-100 transition-all active:scale-95">
                PLAY NOW
              </button>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
};
export default CodeArcade;
