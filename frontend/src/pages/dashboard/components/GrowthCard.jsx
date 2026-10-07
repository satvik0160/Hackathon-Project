import React from 'react';
import { TrendingUp, ChevronRight, Flame, CheckCircle2 } from 'lucide-react';

export default function GrowthCard({ todayCompleted = 0, todayTotal = 0, streak = 0 }) {
  // Determine dynamic message based on actual progress
  const getMessage = () => {
    if (todayTotal === 0) return "Set your goals to start tracking!";
    if (todayCompleted === todayTotal && todayTotal > 0) return "All tasks done! You're on fire! 🎉";
    if (todayCompleted > 0) return `${todayCompleted}/${todayTotal} tasks done today. Keep going!`;
    return "Start your first task to build momentum!";
  };

  return (
    <div className="flex items-center justify-between bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-4 h-[90px]">
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
          <img src="/images/icons/growth.jpg" alt="Growth" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-slate-800">Your Growth</h3>
          <p className="text-[12.5px] text-slate-500">{getMessage()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 rounded-full border border-orange-100">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[12px] font-bold text-orange-600">{streak}d</span>
          </div>
        )}
        <div className="text-slate-400">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
