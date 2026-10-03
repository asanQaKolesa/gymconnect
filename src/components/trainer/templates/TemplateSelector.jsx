// src/components/trainer/templates/TemplateSelector.jsx
import React from 'react';
import { 
  Dumbbell, 
  Scale, 
  AlertCircle, 
  Coffee, 
  Utensils, 
  Sparkles,
  Check
} from 'lucide-react';

export default function TemplateSelector({ 
  templates = [], 
  selectedIndex, 
  onSelectIndex 
}) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Готовые шаблоны сообщений</h3>
          <p className="text-[10.5px] text-slate-400 font-medium">Выберите тему уведомления (1 строка — 1 сценарий)</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          {templates.length} тем
        </span>
      </div>

      {/* ОДНА СТРОКА — ОДНА КНОПКА (БЕЗ РАЗНОЦВЕТНЫХ КВАДРАТОВ И СИРОТСКИХ КНОПОК) */}
      <div className="space-y-2">
        {templates.map((tpl, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={tpl.id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected 
                  ? 'bg-blue-50/80 border-blue-400 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Монохромная серая иконка */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  isSelected 
                    ? 'bg-white text-blue-600 border-blue-200 shadow-2xs' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {tpl.id === 'today_workout' && <Dumbbell className="w-4 h-4 stroke-[2]" />}
                  {tpl.id === 'coach_day_off' && <Coffee className="w-4 h-4 stroke-[2]" />}
                  {tpl.id === 'body_measurement' && <Scale className="w-4 h-4 stroke-[2]" />}
                  {tpl.id === 'membership_ending' && <AlertCircle className="w-4 h-4 stroke-[2]" />}
                  {tpl.id === 'nutrition_check' && <Utensils className="w-4 h-4 stroke-[2]" />}
                  {tpl.id === 'trial_intro' && <Sparkles className="w-4 h-4 stroke-[2]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <span className={`text-xs font-bold leading-tight block truncate ${
                    isSelected ? 'text-blue-900' : 'text-slate-800'
                  }`}>
                    {tpl.title}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-medium block truncate mt-0.5">
                    {tpl.category} • Авто-подстановка имени атлета
                  </span>
                </div>
              </div>

              {/* Радио-индикатор выбора */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
