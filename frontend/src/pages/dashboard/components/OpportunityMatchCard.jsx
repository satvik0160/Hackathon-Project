import React from 'react';
import { Target, ChevronRight } from 'lucide-react';

export default function OpportunityMatchCard({ opportunities = [], onViewAll = null }) {
  // Each item: { company, role, matchPercent, logo? }
  const hasData = opportunities && opportunities.length > 0;
  const topMatch = hasData ? Math.round(opportunities[0].matchPercent) : null;
  const rows = hasData ? opportunities.slice(0, 3) : [];

  return (
    <div 
      className="flex flex-col p-5 shadow-sm rounded-[22px] relative"
      style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(139,92,246,0.12)',
        minHeight: '264px'
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <img 
            src="/images/icons/opportunity_v2.jpg" 
            alt="Opportunity" 
            className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
          />
          <h3 className="text-[15px] font-bold text-slate-800">Top Opportunity Match</h3>
        </div>
        
        {/* Match badge */}
        <div className="w-[68px] h-[68px] rounded-full border-[6px] border-teal-400/20 flex items-center justify-center relative">
          <div className="absolute inset-1 rounded-full border border-teal-500/10"></div>
          <span className="relative text-[15px] font-bold text-teal-600">
            {topMatch != null ? `${topMatch}%` : '--'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100 px-2">
          <div className="col-span-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company</div>
          <div className="col-span-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</div>
          <div className="col-span-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Match</div>
        </div>

        {/* Rows: real opportunities when available, placeholders otherwise */}
        <div className="flex-1 flex flex-col mt-2 gap-2">
          {hasData ? (
            rows.map((o, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 py-3 px-2 rounded-lg border border-teal-100 bg-teal-50/40 items-center"
              >
                <div className="col-span-5 text-sm text-slate-700 font-medium truncate" title={o.company}>{o.company || '—'}</div>
                <div className="col-span-5 text-sm text-slate-500 truncate" title={o.role}>{o.role || '—'}</div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <span className="text-sm font-semibold text-teal-600">{Math.round(o.matchPercent)}%</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 py-3 px-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 items-center"
              >
                <div className="col-span-5 text-sm text-slate-400 font-medium">--</div>
                <div className="col-span-5 text-sm text-slate-400">--</div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <span className="text-sm font-semibold text-slate-400">--</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={hasData ? onViewAll : undefined}
          disabled={!hasData || !onViewAll}
          className={`text-[11px] font-medium transition-colors flex items-center gap-1
            ${hasData && onViewAll ? 'text-purple-600 hover:text-purple-700' : 'text-slate-400 cursor-not-allowed'}
          `}
        >
          View more opportunities →
        </button>
      </div>
    </div>
  );
}
