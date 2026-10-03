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
  onSelectIndex,
  gymName = 'клуб' 
}) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Готовые шаблоны сообщений</h3>
          <p className="text-[10px] text-slate-400 font-medium">Выберите готовый сценарий для отправки</p>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
          {templates.length} тем
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((tpl, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={tpl.id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected 
                  ? 'bg-blue-50/80 border-blue-500 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className={`text-[11px] font-bold leading-tight line-clamp-2 ${
                  isSelected ? 'text-blue-900' : 'text-slate-800'
                }`}>
                  {tpl.title}
                </span>

                <div className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 mt-0.5 ${
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              <span className={`text-[9.5px] font-medium truncate block ${
                isSelected ? 'text-blue-700' : 'text-slate-400'
              }`}>
                {tpl.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
