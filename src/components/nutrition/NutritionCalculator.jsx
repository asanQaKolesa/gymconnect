import React, { useState } from 'react';
import { Flame } from 'lucide-react';

export default function NutritionCalculator() {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(178);
  const [age, setAge] = useState(26);
  const [goal, setGoal] = useState('deficit');

  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const multiplier = goal === 'deficit' ? 1.2 : goal === 'surplus' ? 1.6 : 1.4;
  const targetCalories = Math.round(bmr * multiplier);
  const targetProtein = Math.round(weight * 2);
  const targetFat = Math.round(weight * 0.9);
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Flame className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Калькулятор КБЖУ</h2>
          <p className="text-xs text-slate-400">Ваша суточная норма</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 mb-4 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Ккал</div>
          <div className="text-sm font-bold text-slate-900">{targetCalories}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Белки</div>
          <div className="text-sm font-bold text-blue-600">{targetProtein}г</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Жиры</div>
          <div className="text-sm font-bold text-amber-600">{targetFat}г</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-0.5">Углеводы</div>
          <div className="text-sm font-bold text-emerald-600">{targetCarbs}г</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-400 block mb-1">Вес (кг)</span>
          <input 
            type="number" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Рост (см)</span>
          <input 
            type="number" 
            value={height} 
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600"
          />
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Возраст</span>
          <input 
            type="number" 
            value={age} 
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => setGoal('deficit')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'deficit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Похудение
        </button>
        <button 
          onClick={() => setGoal('maintain')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'maintain' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Поддержание
        </button>
        <button 
          onClick={() => setGoal('surplus')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'surplus' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Набор массы
        </button>
      </div>
    </div>
  );
}
