import React, { useState } from 'react';
import DailyFuel from '../DailyFuel';
import DietPlan from './DietPlan';

export default function NutritionTab({ myProfile, onUpdateProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('fuel'); // 'fuel' | 'diet'

  return (
    <div className="space-y-4 select-none">
      {/* Переключатель режимов питания */}
      <div className="flex bg-[#121622] p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeSubTab === 'fuel'
              ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🥗 КБЖУ & Баланс
        </button>
        <button
          onClick={() => setActiveSubTab('diet')}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeSubTab === 'diet'
              ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📋 Рацион на 7 дней
        </button>
      </div>

      {/* Отображаем выбранный подраздел */}
      {activeSubTab === 'fuel' ? (
        <DailyFuel myProfile={myProfile} onUpdateProfile={onUpdateProfile} />
      ) : (
        <DietPlan />
      )}
    </div>
  );
} // trigger build
