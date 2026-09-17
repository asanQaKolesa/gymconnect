import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function GymBroEditProfile({ onBack }) {
  const [gym, setGym] = useState('Invictus Go (Навои)');
  const [goal, setGoal] = useState('Качаю массу, ищу напарника на базу.');

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#007AFF] hover:opacity-80 transition-all"
        >
          ← Назад к поиску
        </button>
        <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider">Моя анкета</span>
      </div>

      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Основной фитнес-зал</label>
            <input 
              type="text" 
              value={gym} 
              onChange={(e) => setGym(e.target.value)} 
              className="w-full mt-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-[14px] text-sm font-medium focus:outline-none focus:border-[#007AFF]" 
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Цель и описание</label>
            <textarea 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)} 
              className="w-full mt-1.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-[14px] text-sm font-medium h-28 focus:outline-none focus:border-[#007AFF]" 
            />
          </div>
          <button 
            onClick={() => { alert('Анкета успешно сохранена!'); onBack(); }} 
            className={appleTheme.styles.buttonPrimary}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
