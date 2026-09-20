import React from 'react';

export default function DailyQuote() {
  return (
    <div className="bg-slate-800 text-white rounded-2xl p-4 shadow-sm mb-3 relative overflow-hidden flex items-center gap-3 border border-slate-700">
      <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-xl shrink-0">
        🦈
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Цитата дня Gymshark</div>
        <p className="text-xs text-slate-100 leading-snug font-medium">
          «Дисциплина побеждает мотивацию, когда мотивация уходит в зал к другим.»
        </p>
      </div>
    </div>
  );
}
