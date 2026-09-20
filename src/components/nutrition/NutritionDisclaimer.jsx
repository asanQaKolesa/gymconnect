import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function NutritionDisclaimer() {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 mb-6 flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
        <ShieldAlert className="w-4 h-4 stroke-[1.5]" />
      </div>
      <div className="text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700 block mb-1">Важная информация</span>
        Все расчеты, планы питания и рекомендации по спортпиту носят исключительно информационный характер. Перед началом любой диеты, изменением рациона или приемом добавок обязательно проконсультируйтесь с профильным медицинским специалистом и пройдите обследование организма. Приложение GymConnect не несет ответственности за ваше личное состояние здоровья.
      </div>
    </div>
  );
}
