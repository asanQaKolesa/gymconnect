import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function NutritionDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/60 mb-4 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldAlert className="w-4 h-4 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-amber-900">Юридический дисклеймер и безопасность</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-amber-700 group-hover:text-amber-900" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-700 group-hover:text-amber-900" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 text-[11px] text-amber-800 leading-relaxed animate-in fade-in duration-200">
          Все расчеты, планы питания и рекомендации по спортпиту носят исключительно информационный характер. Перед началом любой диеты, изменением рациона или приемом добавок обязательно проконсультируйтесь с профильным медицинским специалистом и пройдите обследование организма. Приложение GymConnect не несет ответственности за ваше личное состояние здоровья.
        </div>
      )}
    </div>
  );
}
