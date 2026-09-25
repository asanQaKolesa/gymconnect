// src/components/profile/ProfileHeader.jsx
import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between select-none">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Личный кабинет</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <p className="text-[11px] text-slate-400 font-normal">
          Управление подпиской, целями и анкетой
        </p>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/70 rounded-full text-slate-600">
        <UserCheck className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] font-medium tracking-wide">Атлет</span>
      </div>
    </div>
  );
}
