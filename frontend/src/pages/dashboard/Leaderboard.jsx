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
        <h1 className="text-4xl font-extrabold tracking-tight mb-2"><span className="gradient-animated-text">Global Hall of Fame</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Compete with learners worldwide. Earn XP by completing quests, skill tests, and coding challenges!</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {users.map(u => (
          <TiltCard key={u.rank} tiltMax={3} className={`bento-card !p-2 sm:p-2 rounded-2xl row-hover flex items-center justify-between group ${u.rank === 1 ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-300/60' : u.rank <= 3 ? 'ring-1 ring-fuchsia-300/60' : ''}`}>
            <div className="flex items-center gap-6">
              <div className="text-2xl font-black w-10 text-center">
                {u.rank === 1 ? <Trophy className="w-8 h-8 text-amber-500 mx-auto animate-float drop-shadow-[0_0_14px_rgba(245,158,11,0.65)]" /> :
                 u.rank === 2 ? <Medal className="w-7 h-7 text-slate-400 mx-auto animate-float-y-delayed" /> :
                 u.rank === 3 ? <Medal className="w-7 h-7 text-amber-600 mx-auto animate-float-y" /> :
                 <span className="text-slate-400 font-bold">#{u.rank}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform group-hover:scale-110 ${u.rank === 1 ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/40' : u.rank <= 3 ? 'bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-blue-500 shadow-fuchsia-500/35' : 'bg-gradient-to-tr from-slate-400 to-slate-500 shadow-slate-400/20'} ${u.rank <= 3 ? 'rainbow-ring' : ''}`}>
                  <span className="relative z-10">{u.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight text-slate-900 text-lg">{u.name}</h3>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/30">Level {u.level}</span>
                    <span className="flex items-center gap-1 text-white bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 rounded-full shadow-sm shadow-orange-500/30">
                      <Flame className="w-3 h-3" /> {u.streak} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-500 group-hover:from-rose-500 group-hover:via-fuchsia-500 group-hover:to-indigo-500 transition-all">
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
