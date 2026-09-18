import React from 'react';
import { CalendarCheck, Check, ChevronRight } from 'lucide-react';

export default function MissionCard({ tasks = [], onAddTask = null }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const progress = total > 0 ? (done / total) * 100 : 0;
  
  const displayTasks = tasks.slice(0, 4);

  return (
    <div className="flex flex-col bg-white/85 backdrop-blur-md rounded-[22px] border border-gray-100 shadow-sm p-5 h-[369px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-lg bg-violet-100 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-violet-500" />
          </div>
          <h2 className="text-[17px] font-bold text-slate-800">Today's Mission</h2>
        </div>
        <button 
          onClick={onAddTask ? onAddTask : undefined}
          disabled={!onAddTask}
          className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${onAddTask ? 'bg-violet-100 text-violet-600 hover:bg-violet-200 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-default'}`}
        >
          Add Task
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[13px] text-slate-500">{done} / {total} completed</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)'
            }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {total === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No tasks yet
          </div>
        ) : (
          <div className="flex flex-col">
            {displayTasks.map((task, idx) => (
              <div key={task.id || idx} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  {task.done ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                  )}
                  <span className={`text-[13px] line-clamp-1 ${task.done ? 'line-through text-emerald-600/70' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="mt-auto pt-3">
        <div className="relative bg-gradient-to-r from-pink-50 to-violet-50 rounded-xl p-3 flex items-center gap-3 overflow-hidden">
          <svg className="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <p className="text-[12px] italic text-slate-600/90 relative z-10 pr-6">
            "Small steps every day create big results."
          </p>
          <div className="absolute -right-2 -bottom-4 text-6xl text-violet-200/50 font-serif leading-none select-none">
            "
          </div>
        </div>
      </div>
    </div>
  );
}
