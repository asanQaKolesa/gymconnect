// src/components/trainer/analytics/CoachingScorecardWidget.jsx
import React from 'react';
import { Smile, Award, Activity, TrendingUp } from 'lucide-react';

export default function CoachingScorecardWidget({ 
  overallRating = 4.9, 
  totalReviews = 18, 
  attendanceAverage = 92, 
  streakAverage = 7 
}) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-xs font-bold text-slate-900">
          Сводная оценка качества наставничества
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          За 30 дней
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Оценка атлетов</span>
          <span className="text-sm font-bold text-slate-900 font-mono block">{overallRating} / 5.0</span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5">{totalReviews} отзывов</span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Общая явка базы</span>
          <span className="text-sm font-bold text-slate-900 font-mono block">{attendanceAverage}%</span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5">по графику</span>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Средний стрик</span>
          <span className="text-sm font-bold text-slate-900 font-mono block">{streakAverage} нед.</span>
          <span className="text-[9.5px] text-slate-500 block mt-0.5">дисциплина</span>
        </div>
      </div>
    </div>
  );
}
