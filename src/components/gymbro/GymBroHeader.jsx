import React from 'react';
import { Users } from 'lucide-react';

export default function GymBroHeader() {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-2.5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">GymBro Matching</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Больше не тренируйся один • Напарники по базе</p>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-blue-100/50 shrink-0">
          <Users className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Живой поиск</span>
        </div>
      </div>
    </div>
  );
}
