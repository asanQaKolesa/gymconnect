import React from 'react';

export default function HomeTab() {
  const quickStats = [
    { label: 'Тренировки', value: '4 в неделю', icon: '⚡' },
    { label: 'Локация', value: 'Invictus Go', icon: '📍' },
    { label: 'Цель', value: 'Масса', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] px-4 py-6 space-y-6 max-w-md mx-auto pb-28 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','Helvetica_Neue',sans-serif]">
      
      {/* Шапка в стиле iOS (крупный заголовок + иконки действий) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Алматы • Весна 2026</span>
          <h1 className="text-[32px] font-bold tracking-tight text-[#1D1D1F] mt-0.5">Главная</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all">
            <span className="text-sm font-semibold">?</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all">
            <span className="text-sm font-semibold">•••</span>
          </button>
        </div>
      </div>

      {/* Карточка активного профиля в стиле Apple Widget */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-400 px-1 uppercase">
          <span>Активный профиль</span>
          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">Online</span>
        </div>

        <div className="bg-white border border-black/[0.04] rounded-[28px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xl shadow-sm">
                💪
              </div>
              <div>
                <h3 className="font-semibold text-[#1D1D1F] text-base tracking-tight">Асанәли Ерікұлы</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Digital Marketer & GymBro</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100/80">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-[#F8F9FA] rounded-2xl p-3 text-center border border-black/[0.02]">
                <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight">{stat.label}</div>
                <div className="text-xs font-semibold text-[#1D1D1F] mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Карточка быстрого доступа */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-400 px-1 uppercase">Инструменты</div>
        <div className="bg-white border border-black/[0.04] rounded-[28px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-[#1D1D1F] text-sm tracking-tight">GymBro Matchmaking</h4>
              <p className="text-xs text-zinc-400">Поиск напарников в Алматы</p>
            </div>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Активно</span>
        </div>
      </div>

      {/* Кнопка действия в стиле iOS */}
      <div className="pt-2">
        <button 
          onClick={() => alert('Функция в разработке!')}
          className="w-full py-4 rounded-[22px] bg-[#007AFF] text-white font-semibold text-base shadow-[0_10px_25px_rgba(0,122,255,0.25)] hover:bg-[#0062CC] active:scale-[0.99] transition-all"
        >
          + Начать новую тренировку
        </button>
      </div>

    </div>
  );
}
