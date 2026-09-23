import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { leaderboardService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function LeaderboardPreviewCard() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await leaderboardService.getLeaderboard(10);
        const allUsers = res.data || [];
        
        // Get top 2
        const top2 = allUsers.slice(0, 2).map((u, idx) => ({
          rank: idx + 1,
          name: u.display_name || 'Anonymous',
          xp: u.total_points || 0,
          profile_picture: u.profile_picture,
          isCurrentUser: u.user_id === user?.id
        }));
        
        // Find current user's position
        const currentUserIdx = allUsers.findIndex(u => u.user_id === user?.id);
        if (currentUserIdx >= 2) {
          top2.push({
            rank: currentUserIdx + 1,
            name: allUsers[currentUserIdx].display_name || 'You',
            xp: allUsers[currentUserIdx].total_points || 0,
            profile_picture: allUsers[currentUserIdx].profile_picture,
            isCurrentUser: true
          });
        } else if (currentUserIdx === -1) {
          // User not in leaderboard at all, show them with 0
          top2.push({
            rank: allUsers.length + 1,
            name: user?.full_name || user?.name || user?.user_metadata?.full_name || 'You',
            xp: 0,
            isCurrentUser: true
          });
        }
        
        setTopUsers(top2);
      } catch (err) {
        console.error('Failed to load preview leaderboard:', err);
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [user?.id]);

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : topUsers.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No ranking data yet</p>
        ) : (
          topUsers.map((u, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-3 rounded-xl border ${
                u.isCurrentUser 
                  ? 'bg-amber-50 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.15)]' 
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-4 text-center ${
                  u.rank === 1 ? 'text-amber-500' : 
                  u.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                }`}>
                  #{u.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                  {u.profile_picture ? (
                    <img src={u.profile_picture} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{u.name.charAt(0)}</span>
                  )}
                </div>
                <span className={`text-sm font-semibold ${u.isCurrentUser ? 'text-amber-800' : 'text-slate-700'}`}>
                  {u.isCurrentUser ? 'You' : u.name}
                </span>
              </div>
              <span className={`text-xs font-bold ${u.isCurrentUser ? 'text-amber-600' : 'text-slate-500'}`}>
                {u.xp.toLocaleString()} XP
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <a href="/leaderboard" className="text-[12px] font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
          View full standings <ChevronRight size={14} />
        </a>
      </div>
    </div>
  );
}
