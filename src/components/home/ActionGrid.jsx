import React from 'react';
import { Search, Users, Ticket, Briefcase } from 'lucide-react';

export default function ActionGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      {/* 1. Найти тренера */}
      <button className="p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left shadow-sm transition-all group flex flex-col justify-between h-24">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Search className="w-4 h-4 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">Найти тренера</div>
          <div className="text-[10px] text-slate-400">Персональный наставник</div>
        </div>
      </button>

      {/* 2. Найти клиентов */}
      <button className="p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left shadow-sm transition-all group flex flex-col justify-between h-24">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Users className="w-4 h-4 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">Найти клиентов</div>
          <div className="text-[10px] text-slate-400">Для фитнес-тренеров</div>
        </div>
      </button>

      {/* 3. Купить абонемент */}
      <button className="p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left shadow-sm transition-all group flex flex-col justify-between h-24">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Ticket className="w-4 h-4 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">Купить абонемент</div>
          <div className="text-[10px] text-slate-400">В любой фитнес-зал</div>
        </div>
      </button>

      {/* 4. Партнерство для залов и тренеров */}
      <button className="p-3.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left shadow-sm transition-all group flex flex-col justify-between h-24">
        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Briefcase className="w-4 h-4 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">Партнерство</div>
          <div className="text-[10px] text-slate-400">Для залов и тренеров</div>
        </div>
      </button>
    </div>
  );
}
