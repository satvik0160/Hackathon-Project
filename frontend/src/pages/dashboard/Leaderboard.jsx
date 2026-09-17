import React from 'react';
import { Trophy, Medal, Star, Flame } from 'lucide-react';
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
    <div className="page-container p-6">
      <div className="page-header mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 shimmer-title mb-2">Global Hall of Fame</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Compete with learners worldwide. Earn XP by completing quests, skill tests, and coding challenges!</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {users.map(u => (
          <TiltCard key={u.rank} tiltMax={3} className="bg-white/80 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-blue-50">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-black w-10 text-center">
                {u.rank === 1 ? <Trophy className="w-8 h-8 text-orange-600 mx-auto animate-float" /> :
                 u.rank === 2 ? <Medal className="w-7 h-7 text-slate-500 mx-auto" /> :
                 u.rank === 3 ? <Medal className="w-7 h-7 text-amber-700 mx-auto" /> :
                 <span className="text-slate-500">#{u.rank}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 text-slate-800 flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
                  {u.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{u.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Level {u.level}</span>
                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      <Flame className="w-3 h-3" /> {u.streak} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
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
