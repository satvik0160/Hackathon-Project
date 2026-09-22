import React from 'react';
import { Trophy, ChevronRight } from 'lucide-react';

export default function LeaderboardPreviewCard() {
  const topUsers = [
    { rank: 1, name: "Alex Chen", xp: 12450 },
    { rank: 2, name: "Sarah J.", xp: 11200 },
    { rank: 3, name: "You", xp: 9840, isCurrentUser: true }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-5 min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-[17px] font-bold text-slate-800">Global Leaderboard</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 mt-2">
        {topUsers.map((user, idx) => (
          <div 
            key={idx} 
            className={`flex items-center justify-between p-3 rounded-xl border ${
              user.isCurrentUser 
                ? 'bg-amber-50 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.15)]' 
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold w-4 text-center ${
                user.rank === 1 ? 'text-amber-500' : 
                user.rank === 2 ? 'text-slate-400' : 'text-amber-700'
              }`}>
                #{user.rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">{user.name.charAt(0)}</span>
              </div>
              <span className={`text-sm font-semibold ${user.isCurrentUser ? 'text-amber-800' : 'text-slate-700'}`}>
                {user.name}
              </span>
            </div>
            <span className={`text-xs font-bold ${user.isCurrentUser ? 'text-amber-600' : 'text-slate-500'}`}>
              {user.xp} XP
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <a href="/leaderboard" className="text-[12px] font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
          View full standings <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}
