import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';

export default function GrowthCard() {
  return (
    <div className="flex items-center justify-between bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-4 h-[90px]">
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
          <TrendingUp className="text-emerald-500 w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-slate-800">Your Growth</h3>
          <p className="text-[12.5px] text-slate-500">Keep going! You're doing great.</p>
        </div>
      </div>
      <div className="text-slate-400">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
