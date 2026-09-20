import React, { useState } from 'react';
import { Flame, Sliders, X } from 'lucide-react';

export default function NutritionCalculator({ weight = 75, setWeight }) {
  const [height, setHeight] = useState(178);
  const [age, setAge] = useState(26);
  const [goal, setGoal] = useState('deficit');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const multiplier = goal === 'deficit' ? 1.2 : goal === 'surplus' ? 1.6 : 1.4;
  const targetCalories = Math.round(bmr * multiplier);
  const targetProtein = Math.round(weight * 2);
  const targetFat = Math.round(weight * 0.9);
  const targetCarbs = Math.round((targetCalories - (targetProtein * 4 + targetFat * 9)) / 4);

  const goalText = goal === 'deficit' ? 'Похудение' : goal === 'surplus' ? 'Набор массы' : 'Поддержание';

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Flame className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Калькулятор КБЖУ</h2>
              <p className="text-xs text-slate-400">Цель: {goalText} • Вес: {weight} кг</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Параметры</span>
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-4 gap-1 text-center">
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">Ккал</div>
            <div className="text-xs font-bold text-slate-900">{targetCalories}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">Белки</div>
            <div className="text-xs font-bold text-blue-600">{targetProtein}г</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">Жиры</div>
            <div className="text-xs font-bold text-amber-600">{targetFat}г</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 mb-0.5">Углеводы</div>
            <div className="text-xs font-bold text-emerald-600">{targetCarbs}г</div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Параметры КБЖУ</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Вес (кг)</label>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Рост (см)</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Возраст</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-center focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Ваша цель</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button 
                    onClick={() => setGoal('deficit')}
                    className={`py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'deficit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Похудение
                  </button>
                  <button 
                    onClick={() => setGoal('maintain')}
                    className={`py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'maintain' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Баланс
                  </button>
                  <button 
                    onClick={() => setGoal('surplus')}
                    className={`py-2 text-xs font-medium rounded-xl transition-colors ${goal === 'surplus' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Масса
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Сохранить и рассчитать
            </button>
          </div>
        </div>
      )}
    </>
  );
}
