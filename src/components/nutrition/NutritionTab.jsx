import React, { useState } from 'react';
import { Utensils, ShieldAlert, Droplet, Plus, Check } from 'lucide-react';

export default function NutritionTab() {
  const [water, setWater] = useState(1000);
  const targetWater = 2625;

  const handleAddWater = (amount) => {
    setWater(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="p-3 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      
      {/* Шапка раздела Питание */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-3 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Питание & КБЖУ</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Баланс нутриентов и воды под ваши цели</p>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-blue-100/50 shrink-0">
            <Utensils className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Точный расчет</span>
          </div>
        </div>
      </div>

      {/* Калькулятор КБЖУ */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Калькулятор КБЖУ</h2>
          <span className="text-[11px] text-blue-600 font-medium">Цель: Похудение</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl">
          <div>
            <div className="text-[10px] text-slate-400">Ккал</div>
            <div className="text-sm font-bold text-slate-900">2085</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Белки</div>
            <div className="text-sm font-bold text-blue-600">150г</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Жиры</div>
            <div className="text-sm font-bold text-amber-600">68г</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Углеводы</div>
            <div className="text-sm font-bold text-emerald-600">218г</div>
          </div>
        </div>
      </div>

      {/* Водный баланс */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Водный баланс</h2>
              <p className="text-[10px] text-slate-400">Цель: {targetWater} мл</p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600">{Math.round((water / targetWater) * 100)}%</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
          <div 
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (water / targetWater) * 100)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Выпито: {water} мл</span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleAddWater(-250)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              -250 мл
            </button>
            <button 
              onClick={() => handleAddWater(250)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              +250 мл
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
