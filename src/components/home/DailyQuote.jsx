import React from 'react';
import { Zap } from 'lucide-react';

export default function DailyQuote() {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm mb-3 relative overflow-hidden flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
        <Zap className="w-5 h-5 stroke-[1.5]" />
      </div>
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Цитата дня</div>
        <p className="text-xs text-slate-100 leading-sn0ug font-medium">
          «Дисциплина побеждает мотивацию, когда мотивация уходит в зал к другим.»
        </p>
      </div>
    </div>
  );
}
