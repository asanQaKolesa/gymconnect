import React from 'react';
import { Dumbbell, ArrowRight, Sparkles } from 'lucide-react';

export default function TodayPlan({ hasProgram = false, onOpenSettings }) {
  if (!hasProgram) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 stroke-[1.5]" />
            </div>
            <span className="text-xs font-bold text-slate-900">Сегодня по плану</span>
          </div>
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">Не настроено</span>
        </div>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Создайте персональную программу тренировок в разделе PRO-подписки или профиля, чтобы ваш актуальный план отображался здесь.
        </p>
        <button 
          onClick={onOpenSettings}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Составить программу тренировок</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Сегодня по плану (Понедельник)</h2>
            <p className="text-[10px] text-slate-400">День ног и базы</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
          Активно
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-3 space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-800">1. Приседания со штангой</span>
          <span className="text-slate-400 text-[11px]">4 × 8-10</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-800">2. Жим ногами в платформе</span>
          <span className="text-slate-400 text-[11px]">3 × 12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-800">3. Румынская тяга</span>
          <span className="text-slate-400 text-[11px]">4 × 10</span>
        </div>
      </div>

      <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm">
        <span>Открыть полный разбор тренировки</span>
        <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
    </div>
  );
}
