// src/components/trainer/nutrition/NutritionDietBuilder.jsx
import React, { useState } from 'react';
import { Utensils, Plus, Trash2, Clock, Sparkles, Check, ChevronRight } from 'lucide-react';

export default function NutritionDietBuilder({ meals = [], setMeals }) {
  const [dietMode, setDietMode] = useState('detailed'); // 'simple' | 'detailed'

  const [newMeal, setNewMeal] = useState({
    name: 'Завтрак',
    time: '08:30',
    desc: 'Овсяные хлопья 80г, 3 яйца вареных, свежие ягоды 50г',
    protein: 28,
    fat: 18,
    carbs: 65,
    calories: 520
  });

  const availableMealTypes = ['Завтрак', 'Второй завтрак', 'Обед', 'Полдник', 'Ужин', 'Перекус перед сном'];

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newMeal.desc.trim()) return;

    const item = {
      id: Date.now(),
      ...newMeal
    };

    setMeals([...meals, item]);
    setNewMeal({
      name: 'Обед',
      time: '13:30',
      desc: '',
      protein: 35,
      fat: 15,
      carbs: 70,
      calories: 550
    });
  };

  const handleRemoveMeal = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  // Шаблон быстрого базового рациона из доступных продуктов
  const handleLoadBaseRecommendedPlan = () => {
    setMeals([
      {
        id: 1,
        name: 'Завтрак',
        time: '08:00',
        desc: 'Овсяная каша долгой варки 80г + 3 яйца (2 целых, 1 белок) + банан',
        protein: 28,
        fat: 16,
        carbs: 68,
        calories: 525
      },
      {
        id: 2,
        name: 'Обед',
        time: '13:00',
        desc: 'Куриное филе или индейка 180г + гречка или бурый рис 80г (сухой вес) + свежие огурцы и зелень',
        protein: 46,
        fat: 12,
        carbs: 58,
        calories: 530
      },
      {
        id: 3,
        name: 'Полдник',
        time: '16:30',
        desc: 'Порция изолята протеина 30г + горсть миндаля 25г или зелёное яблоко',
        protein: 27,
        fat: 14,
        carbs: 18,
        calories: 310
      },
      {
        id: 4,
        name: 'Ужин',
        time: '19:30',
        desc: 'Филе белой рыбы (минтай/судак) 200г + стручковая фасоль/брокколи на пару + 1 ч.л. оливкового масла',
        protein: 42,
        fat: 10,
        carbs: 16,
        calories: 320
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка блока и переключатель режимов */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Рацион приёмов пищи дня</h3>
          <p className="text-[10px] text-slate-400 font-medium">Конструктор меню и продуктов</p>
        </div>

        {/* Переключатель: Базовый vs Детальный */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={handleLoadBaseRecommendedPlan}
            className="py-1 px-2.5 rounded-lg text-[10.5px] font-bold text-blue-600 hover:bg-white transition-all cursor-pointer flex items-center gap-1"
            title="Загрузить готовый сбалансированный шаблон"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Базовый шаблон</span>
          </button>
        </div>
      </div>

      {/* Список составленных приёмов пищи */}
      <div className="space-y-2.5">
        {meals.map((meal, idx) => (
          <div 
            key={meal.id || idx}
            className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900">{meal.name}</span>
                {meal.time && (
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {meal.time}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveMeal(meal.id)}
                className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                title="Удалить приём пищи"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {meal.desc}
            </p>

            {/* Микро-показатели БЖУ по приёму */}
            {(meal.calories || meal.protein) && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
                {meal.calories && <span>~{meal.calories} ккал</span>}
                <span>•</span>
                <span>Б: {meal.protein}г</span>
                <span>•</span>
                <span>Ж: {meal.fat}г</span>
                <span>•</span>
                <span>У: {meal.carbs}г</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Форма добавления приёма пищи */}
      <form onSubmit={handleAddMeal} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
        <span className="text-[11px] font-bold text-slate-900 block">
          + Назначить новый приём пищи
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-medium block mb-1">Приём пищи:</label>
            <select
              value={newMeal.name}
              onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
            >
              {availableMealTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-medium block mb-1">Время приёма:</label>
            <input
              type="text"
              value={newMeal.time}
              onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
              placeholder="08:30"
              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-medium block mb-1">
            Продукты и граммовки (детально):
          </label>
          <textarea
            rows={2}
            required
            value={newMeal.desc}
            onChange={(e) => setNewMeal({ ...newMeal, desc: e.target.value })}
            placeholder="Например: Грудка индейки 170г + рис басмати 70г (сухой вес) + салат из помидоров с зеленью"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          Добавить в план дня
        </button>
      </form>

    </div>
  );
}
