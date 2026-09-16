import React, { useState } from 'react';
import KbjuCalculator from './nutrition/KbjuCalculator';
import DietPlan from './nutrition/DietPlan';
import GroceryBasket from './nutrition/GroceryBasket';
import SupplementsAdvisor from './nutrition/SupplementsAdvisor';

export default function NutritionTab({ myProfile, onUpdateProfile, onOpenDoc }) {
  // Внутренние разделы: 'kbju' | 'diet' | 'basket' | 'supps'
  const [activeSection, setActiveSection] = useState('kbju');
  const [isSaving, setIsSaving] = useState(false);

  // Текущие сохраненные параметры атлета
  const currentWeight = myProfile?.current_weight || 75;
  const currentCalories = myProfile?.target_calories || 2600;
  const currentProtein = myProfile?.target_protein || 150;

  const handleSaveKbju = async (calcData) => {
    setIsSaving(true);
    if (onUpdateProfile) {
      await onUpdateProfile({
        current_weight: calcData.weight,
        nutrition_goal: calcData.goal,
        target_calories: calcData.calories,
        target_protein: calcData.protein,
        target_fat: calcData.fat,
        target_carbs: calcData.carbs
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Шапка раздела */}
      <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 p-3 rounded-2xl border border-amber-500/30 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-amber-400">🥗 Нутрициология & Рацион PRO</p>
          <p className="text-[10px] text-slate-400">Сквозная синхронизация: КБЖУ ➔ Меню ➔ Корзина</p>
        </div>
        <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">PRO Тест</span>
      </div>

      {/* 4 независимых подраздела */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSection('kbju')}
          className={`py-2 text-[10px] font-bold rounded-xl transition ${
            activeSection === 'kbju' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          🧮 КБЖУ
        </button>

        <button
          onClick={() => setActiveSection('diet')}
          className={`py-2 text-[10px] font-bold rounded-xl transition ${
            activeSection === 'diet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          📋 Меню 7д
        </button>

        <button
          onClick={() => setActiveSection('basket')}
          className={`py-2 text-[10px] font-bold rounded-xl transition ${
            activeSection === 'basket' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          🛒 Корзина
        </button>

        <button
          onClick={() => setActiveSection('supps')}
          className={`py-2 text-[10px] font-bold rounded-xl transition ${
            activeSection === 'supps' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          ⚡ Спортпит
        </button>
      </div>

      {/* Отрисовка выбранного независимого модуля */}
      {activeSection === 'kbju' && (
        <KbjuCalculator
          initialWeight={currentWeight}
          initialGoal={myProfile?.nutrition_goal || 'recomp'}
          onSaveKbju={handleSaveKbju}
          isSaving={isSaving}
        />
      )}

      {activeSection === 'diet' && (
        <DietPlan
          weight={currentWeight}
          calories={currentCalories}
          protein={currentProtein}
        />
      )}

      {activeSection === 'basket' && (
        <GroceryBasket weight={currentWeight} />
      )}

      {activeSection === 'supps' && (
        <SupplementsAdvisor onOpenDoc={onOpenDoc} />
      )}
    </div>
  );
}
