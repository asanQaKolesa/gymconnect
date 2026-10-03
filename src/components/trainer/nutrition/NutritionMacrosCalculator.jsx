// src/components/trainer/nutrition/NutritionMacrosCalculator.jsx
import React, { useMemo } from 'react';
import { Flame, Droplet, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function NutritionMacrosCalculator({ 
  student, 
  calories, 
  setCalories, 
  protein, 
  setProtein, 
  fat, 
  setFat, 
  carbs, 
  setCarbs, 
  waterMl, 
  setWaterMl 
}) {
  const weight = Number(student?.current_weight || student?.weight) || 75;
  const height = Number(student?.height) || 178;
  const age = Number(student?.age) || 25;
  const gender = student?.gender || 'male';
  const goal = (student?.goal || 'Набор массы').toLowerCase();

  // Автоматический пересчёт по научной формуле Миффлина-Сан Жеора
  const handleRecalculateByFormula = () => {
    // Базовый обмен веществ (BMR)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'female' ? bmr - 161 : bmr + 5;

    // Коэффициент активности + цели
    let multiplier = 1.4; // тренировки 3-4 раза в неделю
    if (goal.includes('похуд') || goal.includes('сушк')) {
      multiplier = 1.25; // дефицит калорий
    } else if (goal.includes('набор')) {
      multiplier = 1.6; // профицит калорий
    }

    const calculatedCalories = Math.round(bmr * multiplier);
    
    // Белки: 2.0 г на 1 кг при наборе/сушке, 1.6 г при поддержании
    const calculatedProtein = Math.round(weight * 2.0);
    // Жиры: 0.9-1.0 г на 1 кг
    const calculatedFat = Math.round(weight * 0.9);
    // Углеводы: остаток калорий делим на 4
    const remainingCals = calculatedCalories - (calculatedProtein * 4 + calculatedFat * 9);
    const calculatedCarbs = Math.max(80, Math.round(remainingCals / 4));

    // Вода: оптимальный клинический норматив 35 мл на 1 кг массы
    const calculatedWater = Math.round(weight * 35);

    setCalories(calculatedCalories);
    setProtein(calculatedProtein);
    setFat(calculatedFat);
    setCarbs(calculatedCarbs);
    setWaterMl(calculatedWater);
  };

  const glassesCount = Math.round(waterMl / 250);

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 select-none">
      
      {/* Шапка блока с кнопкой сброса по формуле */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Целевые макронутриенты (КБЖУ)</h3>
        </div>

        <button
          type="button"
          onClick={handleRecalculateByFormula}
          className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
          title="Рассчитать базовые значения по формуле Миффлина-Сан Жеора"
        >
          <RefreshCw className="w-3 h-3" />
          <span>По формуле</span>
        </button>
      </div>

      {/* СТРОГО ОДНА СТРОКА ДЛЯ 4 МАКРОНУТРИЕНТОВ (БЕЗ ПЕРЕНОСОВ) */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
        
        {/* Калории */}
        <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 font-sans block truncate uppercase">
            Ккал
          </span>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full text-center font-bold text-xs text-slate-900 bg-transparent outline-none mt-0.5"
          />
          <span className="text-[8.5px] font-sans text-slate-400 block truncate">норма</span>
        </div>

        {/* Белки */}
        <div className="p-2 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-blue-700 font-sans block truncate uppercase">
            Белки
          </span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              className="w-8 text-center font-bold text-xs text-blue-700 bg-transparent outline-none"
            />
            <span className="text-[10px] font-bold text-blue-700">г</span>
          </div>
          <span className="text-[8.5px] font-sans text-blue-500 block truncate">{(protein / weight).toFixed(1)}г/кг</span>
        </div>

        {/* Жиры */}
        <div className="p-2 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-amber-700 font-sans block truncate uppercase">
            Жиры
          </span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              className="w-8 text-center font-bold text-xs text-amber-700 bg-transparent outline-none"
            />
            <span className="text-[10px] font-bold text-amber-700">г</span>
          </div>
          <span className="text-[8.5px] font-sans text-amber-500 block truncate">{(fat / weight).toFixed(1)}г/кг</span>
        </div>

        {/* Углеводы */}
        <div className="p-2 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-emerald-700 font-sans block truncate uppercase">
            Углеводы
          </span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-8 text-center font-bold text-xs text-emerald-700 bg-transparent outline-none"
            />
            <span className="text-[10px] font-bold text-emerald-700">г</span>
          </div>
          <span className="text-[8.5px] font-sans text-emerald-500 block truncate">{(carbs / weight).toFixed(1)}г/кг</span>
        </div>

      </div>

      {/* Оптимальный расчёт водного баланса (35 мл на 1 кг) */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">Водный баланс</span>
              <span className="text-[10px] text-slate-400 font-normal">35 мл / кг</span>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-0.5">
              Около {glassesCount} стаканов чистой воды в течение дня
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 font-mono">
          <input
            type="number"
            step="100"
            value={waterMl}
            onChange={(e) => setWaterMl(Number(e.target.value))}
            className="w-16 p-1.5 bg-white border border-slate-200 rounded-xl text-center font-bold text-xs text-slate-900 outline-none focus:border-blue-600"
          />
          <span className="text-xs font-bold text-slate-600">мл</span>
        </div>
      </div>

    </div>
  );
}
