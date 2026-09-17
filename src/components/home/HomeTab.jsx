import React from 'react';

export default function HomeTab() {
  const quickStats = [
    { label: 'Тренировки', value: '4 в неделю', icon: '⚡' },
    { label: 'Локация', value: 'Invictus Go', icon: '📍' },
    { label: 'Цель', value: 'Масса', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] px-4 py-5 space-y-5 max-w-md mx-auto pb-28 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',sans-serif]">
      
      {/* Шапка */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11px] font-medium text-zinc-400 tracking-tight">Алматы • Весна 2026</p>
          <h1 className="text-[26px] font-bold tracking-tight text-[#1D1D1F] leading-tight">Главная</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center text-zinc-800 hover:bg-zinc-50 active:scale-95 transition-all">
            <span className="text-[13px] font-medium">?</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-white border border-black/[0.08] shadow-sm flex items-center justify-center text-zinc-800 hover:bg-zinc-50 active:scale-95 transition-all">
            <span className="text-[13px] font-medium">•••</span>
          </button>
        </div>
      </div>

      {/* Карточка профиля */}
      <div className="space-y-2">
        <h2 className="text-[12px] font-medium text-zinc-400 px-1 tracking-tight">Активный профиль</h2>

        <div className="bg-white border border-black/[0.04] rounded-[22px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-lg shadow-sm">
                💪
              </div>
              <div>
                <h3 className="font-semibold text-[#1D1D1F] text-[15px] tracking-tight">Асанәли Ерікұлы</h3>
                <p className="text-[12px] text-zinc-400 font-normal">Digital Marketer & GymBro</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-[#F8F9FA] rounded-xl p-2.5 text-center border border-black/[0.02]">
                <div className="text-[10px] font-medium text-zinc-400 tracking-tight">{stat.label}</div>
                <div className="text-[12px] font-semibold text-[#1D1D1F] mt-0.5 tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Блок быстрого доступа */}
      <div className="space-y-2">
        <h2 className="text-[12px] font-medium text-zinc-400 px-1 tracking-tight">Инструменты</h2>
        <div className="bg-white border border-black/[0.04] rounded-[22px] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-[#1D1D1F] text-[14px] tracking-tight">GymBro Matchmaking</h4>
              <p className="text-[12px] text-zinc-400 font-normal">Поиск напарников в Алматы</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Активно</span>
        </div>
      </div>

      {/* Кнопка действия */}
      <div className="pt-1">
        <button 
          onClick={() => alert('Функция в разработке!')}
          className="w-full py-3.5 rounded-[18px] bg-[#007AFF] text-white font-semibold text-[15px] tracking-tight shadow-[0_6px_16px_rgba(0,122,255,0.25)] hover:bg-[#0062CC] active:scale-[0.98] transition-all"
        >
          + Начать новую тренировку
        </button>
      </div>

    </div>
  );
}
