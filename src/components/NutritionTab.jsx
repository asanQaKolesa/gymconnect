import React, { useState } from 'react';
import KbjuCalculator from './nutrition/KbjuCalculator';
import DietPlan from './nutrition/DietPlan';
import GroceryBasket from './nutrition/GroceryBasket';
import SupplementsAdvisor from './nutrition/SupplementsAdvisor';

const TABS = [
  { id: 'kbju', label: 'КБЖУ' },
  { id: 'diet', label: 'Рацион на 7 дней' },
  { id: 'grocery', label: 'Корзина' },
  { id: 'supps', label: 'Спортпит' }
];

export default function NutritionTab({ myProfile, onUpdateProfile, onOpenDoc }) {
  const [subTab, setSubTab] = useState('kbju');

  return (
    <div className="space-y-4">
      {/* Apple Segmented Bar скроллируемый */}
      <div className="apple-glass p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition ${
              subTab === tab.id
                ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'kbju' && (
        <KbjuCalculator profile={myProfile} onSave={onUpdateProfile} />
      )}
      {subTab === 'diet' && (
        <DietPlan profile={myProfile} />
      )}
      {subTab === 'grocery' && (
        <GroceryBasket />
      )}
      {subTab === 'supps' && (
        <SupplementsAdvisor />
      )}
    </div>
  );
}
