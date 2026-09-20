import React, { useState } from 'react';
import { Droplet } from 'lucide-react';

export default function WaterTracker({ weight = 75 }) {
  const [glasses, setGlasses] = useState(4);
  
  // Автоматический расчет нормы воды на основе веса (35 мл на 1 кг)
  const targetMl = Math.round(weight * 35);
  const targetGlasses = Math.max(4, Math.round(targetMl / 250));
  const currentMl = glasses * 250;
  const percentage = Math.min(100, Math.round((currentMl / targetMl) * 100));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
            <Droplet className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">Водный баланс</div>
            <div className="text-xs text-slate-400">Цель: {targetMl} мл ({targetGlasses} стак.) по вашему весу</div>
          </div>
        </div>
        <div className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">
          {percentage}%
        </div>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
        <div 
          className="bg-sky-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Выпито: {currentMl} мл ({glasses} из {targetGlasses} стак.)</span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => setGlasses(Math.max(0, glasses - 1))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
          >
            - 250 мл
          </button>
          <button 
            onClick={() => setGlasses(glasses + 1)}
            className="px-3 py-1.5 rounded-xl bg-sky-500 text-white hover:bg-sky-600 font-medium transition-colors shadow-sm"
          >
            + 250 мл
          </button>
        </div>
      </div>
    </div>
  );
}
