import React from 'react';

export default function DailyQuote() {
  return (
    <div className="px-3.5 py-2.5 rounded-2xl bg-[#121622] border border-white/5 flex items-center gap-2.5">
      <span className="text-base shrink-0">🔥</span>
      <p className="text-[11px] font-medium text-slate-300 leading-snug truncate">
        «Дисциплина бьёт мотивацию в 100% случаев.»
      </p>
    </div>
  );
}
