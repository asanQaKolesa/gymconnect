import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ReviewsHeader() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">GymConnect Reviews</h1>
          <p className="text-xs text-slate-400 mt-0.5">Реальные мнения атлетов без накрутки</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-emerald-100/50 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>100% честно</span>
        </div>
      </div>
    </div>
  );
}
