import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Flame, Crown, Users } from 'lucide-react';
import { TiltCard } from '../../components/common/TiltCard';
import { leaderboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await leaderboardService.getLeaderboard(50);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container p-6 md:p-8">
      <div className="page-header mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2"><span className="gradient-animated-text">Global Hall of Fame</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Compete with learners worldwide. Earn XP by completing quests, skill tests, and coding challenges!</p>
      </div>

      {users.length === 0 ? (
        <div className="max-w-lg mx-auto text-center py-16">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No Contenders Yet</h3>
          <p className="text-slate-400">Complete skill tests and coding challenges to claim your spot on the leaderboard!</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {users.map((u, idx) => {
            const rank = idx + 1;
            const isCurrentUser = u.user_id === user?.id;
            return (
              <TiltCard key={u.user_id} tiltMax={3} className={`bento-card !p-2 sm:p-2 rounded-2xl row-hover flex items-center justify-between group ${rank === 1 ? 'ring-2 ring-amber-400/70 shadow-lg shadow-amber-300/60' : rank <= 3 ? 'ring-1 ring-fuchsia-300/60' : ''} ${isCurrentUser ? 'ring-2 ring-indigo-400/70 bg-indigo-50/30' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-black w-10 text-center">
                    {rank === 1 ? <Trophy className="w-8 h-8 text-amber-500 mx-auto animate-float drop-shadow-[0_0_14px_rgba(245,158,11,0.65)]" /> :
                     rank === 2 ? <Medal className="w-7 h-7 text-slate-400 mx-auto animate-float-y-delayed" /> :
                     rank === 3 ? <Medal className="w-7 h-7 text-amber-600 mx-auto animate-float-y" /> :
                     <span className="text-slate-400 font-bold">#{rank}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform group-hover:scale-110 overflow-hidden ${rank === 1 ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/40' : rank <= 3 ? 'bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-blue-500 shadow-fuchsia-500/35' : 'bg-gradient-to-tr from-slate-400 to-slate-500 shadow-slate-400/20'} ${rank <= 3 ? 'rainbow-ring' : ''}`}>
                      {u.profile_picture ? (
                        <img src={u.profile_picture} alt={u.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="relative z-10">{getInitial(u.display_name)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold tracking-tight text-slate-900 text-lg">
                        {u.display_name || 'Anonymous'}
                        {isCurrentUser && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">YOU</span>}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2.5 py-0.5 rounded-full shadow-sm shadow-emerald-500/30">Level {u.skill_level || 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-500 group-hover:from-rose-500 group-hover:via-fuchsia-500 group-hover:to-indigo-500 transition-all">
                    {(u.total_points || 0).toLocaleString()} XP
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Leaderboard;
