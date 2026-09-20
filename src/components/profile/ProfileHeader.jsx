import React from 'react';
import { Award } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-3 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Управление подпиской, профилем и целями</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-emerald-100/50 shrink-0">
          <Award className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>PRO Атлет</span>
        </div>
      </div>
    </div>
  );
}
