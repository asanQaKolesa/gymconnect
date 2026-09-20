import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ReviewsHeader() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">GymConnect Reviews</h1>
        <p className="text-[11px] text-slate-400">Реальные мнения атлетов без накрутки</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 text-[11px] font-semibold">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
        <span>100% честно</span>
      </div>
    </div>
  );
}
