import React from 'react';
import { Pill, ChevronRight } from 'lucide-react';

export default function NutritionSupplements() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Добавки
      </div>
      <button 
        onClick={() => alert('Открытие рекомендаций по спортпиту')}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
            <Pill className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">Спортпит и БАДы</div>
            <div className="text-xs text-slate-400">Креатин, протеин, витамины и тайминги</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </button>
    </div>
  );
}
