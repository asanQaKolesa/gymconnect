import React from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function GymBroMatches({ onBack }) {
  const matchesList = [
    { id: 1, name: "Алексей", gym: "Invictus Go (Навои)", time: "Вчера, 19:00", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { id: 2, name: "Дильназ", gym: "Workout (Достык)", time: "3 дня назад", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#007AFF] hover:opacity-80 transition-all">
          ← Назад к поиску
        </button>
        <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider">Взаимные мэтчи</span>
      </div>

      <div className="space-y-3">
        {matchesList.map((item) => (
          <div key={item.id} className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
              <div>
                <h4 className="font-bold text-black text-[15px] tracking-tight">{item.name}</h4>
                <p className="text-[11px] text-[#8E8E93]">📍 {item.gym}</p>
              </div>
            </div>
            <button onClick={() => alert(`Открытие чата с ${item.name}`)} className="px-4 py-2 bg-[#007AFF] text-white rounded-[12px] text-xs font-semibold shadow-sm active:scale-95 transition-all">
              Написать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
