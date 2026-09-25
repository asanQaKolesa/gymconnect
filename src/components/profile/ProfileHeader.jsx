// src/components/profile/ProfileHeader.jsx
import React from 'react';
import { Award } from 'lucide-react';

export default function ProfileHeader() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between mb-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> PRO Атлет
          </span>
        </div>
        <h2 className="text-sm font-medium text-slate-200">Личный кабинет</h2>
        <p className="text-[11px] text-slate-400">Управление подпиской, профилем и целями</p>
      </div>
    </div>
  );
}
