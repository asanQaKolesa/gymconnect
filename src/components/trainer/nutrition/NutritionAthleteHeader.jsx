// src/components/trainer/nutrition/NutritionAthleteHeader.jsx
import React from 'react';
import { User, Target, Scale, ShieldAlert, ChevronDown } from 'lucide-react';

export default function NutritionAthleteHeader({ 
  students = [], 
  selectedStudentId, 
  onSelectStudent, 
  currentStudent,
  onGoalChange 
}) {
  const goalsList = [
    { id: 'Набор массы', label: 'Набор массы' },
    { id: 'Снижение веса', label: 'Снижение веса / Сушка' },
    { id: 'Поддержание формы', label: 'Поддержание тонуса' }
  ];

  const studentWeight = Number(currentStudent?.current_weight || currentStudent?.weight) || 75;
  const currentGoal = currentStudent?.goal || 'Набор массы';
  const allergens = currentStudent?.allergies || currentStudent?.excluded_foods || ['Лактоза (молочка)', 'Орехи'];

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 select-none">
      {/* 1. Селектор атлета */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Подопечный атлет
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {students.length} активных
          </span>
        </div>

        <div className="relative">
          <select
            value={selectedStudentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all truncate"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name || `${s.first_name || 'Атлет'} ${s.last_name || ''}`.trim()} • {s.gym ? s.gym.split('|')[0] : 'Зал'}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 2. Три независимые плашки параметров */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-0.5">
        
        {/* Вес тела */}
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium block">Текущий вес</span>
          <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
            {studentWeight} кг
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
            Рост: {currentStudent?.height || 178} см
          </span>
        </div>

        {/* Цель атлета */}
        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col justify-between col-span-2 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 font-medium block">Цель питания</span>
            <Target className="w-3 h-3 text-blue-600" />
          </div>

          <div className="grid grid-cols-3 gap-1">
            {goalsList.map(g => {
              const isSelected = currentGoal.toLowerCase().includes(g.id.toLowerCase());
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onGoalChange(g.id)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all truncate text-center cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-2xs font-bold' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {g.label.split('/')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Плашка аллергий и пищевых исключений */}
      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-500 block">Аллергии и непереносимость:</span>
            <p className="text-[11px] font-bold text-slate-800 truncate">
              {Array.isArray(allergens) && allergens.length > 0 ? allergens.join(', ') : 'Исключений нет'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
          Учтено
        </span>
      </div>
    </div>
  );
}
