import React from 'react';
import { Trophy, Medal, Star, Flame, Crown } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';

const Leaderboard = () => {
  const users = [
    { rank: 1, name: 'Alice Chen', xp: 12500, streak: 45, level: 32 },
    { rank: 2, name: 'Bob Smith', xp: 11200, streak: 12, level: 30 },
    { rank: 3, name: 'Charlie Liu', xp: 10800, streak: 28, level: 29 },
    { rank: 4, name: 'Diana Prince', xp: 9500, streak: 5, level: 25 },
    { rank: 5, name: 'Eve Carter', xp: 9100, streak: 1, level: 24 },
  ];

  return (
    <div className="page-container p-6 md:p-8">
      <div className="page-header mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 shimmer-title mb-2">Global Hall of Fame</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Compete with learners worldwide. Earn XP by completing quests, skill tests, and coding challenges!</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {users.map(u => (
          <TiltCard key={u.rank} tiltMax={3} className="bento-card !p-2 sm:p-2 rounded-2xl row-hover flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-black w-10 text-center">
                {u.rank === 1 ? <Trophy className="w-8 h-8 text-amber-500 mx-auto animate-float drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" /> :
                 u.rank === 2 ? <Medal className="w-7 h-7 text-slate-400 mx-auto" /> :
                 u.rank === 3 ? <Medal className="w-7 h-7 text-amber-600 mx-auto" /> :
                 <span className="text-slate-400 font-bold">#{u.rank}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform group-hover:scale-105 ${u.rank === 1 ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/30' : u.rank <= 3 ? 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-500 shadow-indigo-500/25' : 'bg-gradient-to-tr from-slate-400 to-slate-500 shadow-slate-400/20'}`}>
                  {u.name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight text-slate-900 text-lg">{u.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Level {u.level}</span>
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Flame className="w-3 h-3" /> {u.streak} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                {u.xp.toLocaleString()} XP
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
};
export default Leaderboard;
