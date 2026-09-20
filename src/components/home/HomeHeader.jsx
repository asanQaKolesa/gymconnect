import React from 'react';
import { ArrowRight, Bell } from 'lucide-react';

export default function HomeHeader({ onOpenSub, onOpenNotif }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <button 
        onClick={onOpenSub}
        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold shadow-sm shadow-emerald-500/20 flex items-center justify-between transition-all"
      >
        <span>Оформить подписку GymConnect PRO</span>
        <ArrowRight className="w-4 h-4 stroke-[1.5]" />
      </button>
      <button 
        onClick={onOpenNotif}
        className="w-12 h-12 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-700 shadow-sm transition-colors relative"
      >
        <Bell className="w-5 h-5 stroke-[1.5]" />
        <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full"></span>
      </button>
    </div>
  );
}
