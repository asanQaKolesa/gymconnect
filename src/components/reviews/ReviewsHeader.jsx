import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ReviewsHeader() {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">GymConnect Reviews</h1>
        <p className="text-xs text-slate-400">Реальные мнения атлетов о залах и тренерах</p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60 text-xs font-semibold shadow-sm">
        <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
        <span>100% честно</span>
      </div>
    </div>
  );
}
