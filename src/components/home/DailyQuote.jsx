// src/components/home/DailyQuote.jsx
import React from 'react';

export default function DailyQuote() {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 mb-3.5 relative overflow-hidden flex items-center gap-3 select-none">
      {/* Монохромный бокс цитаты с аккуратным эмодзи акулы */}
      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-lg shrink-0 shadow-2xs">
        🦈
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Цитата дня Gymshark
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[10px] text-slate-400 font-medium">Дисциплина</span>
        </div>
        <p className="text-xs text-slate-800 leading-snug font-medium">
          «Дисциплина всегда побеждает мотивацию, когда мотивация уходит в зал к другим.»
        </p>
      </div>
    </div>
  );
}
