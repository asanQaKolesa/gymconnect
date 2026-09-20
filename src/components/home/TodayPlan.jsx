import React from 'react';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function TodayPlan() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/60 mb-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Dumbbell className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className="text-xs font-bold text-blue-900">Сегодня по плану (Понедельник)</span>
        </div>
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-lg">День ног и базы</span>
      </div>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        Приседания со штангой, жим ногами в платформе, румынская тяга. КБЖУ на сегодня: 2450 ккал.
      </p>
      <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
        <span>Открыть детальный план тренировки</span>
        <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
    </div>
  );
}
