import React from 'react';
import { Flame } from 'lucide-react';

export default function WorkoutStreak() {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
          <Flame className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900">Серия тренировок (Streak)</div>
          <div className="text-[11px] text-slate-400">5 дней подряд в режиме • Отличная дисциплина</div>
        </div>
      </div>
      <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl">
        5 дней 🔥
      </div>
    </div>
  );
}
