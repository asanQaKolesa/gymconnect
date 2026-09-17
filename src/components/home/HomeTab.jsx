import React from 'react';

export default function HomeTab() {
  const quickStats = [
    { label: 'Тренировки', value: '4 в неделю', icon: '⚡' },
    { label: 'Локация', value: 'Invictus Go', icon: '📍' },
    { label: 'Цель', value: 'Масса', icon: '🎯' },
  ];

  return (
    <div className="space-y-6 max-w-md mx-auto pb-24 px-1">
      {/* Шапка в стиле iOS (Заголовок + круглые кнопки опций как на референсе) */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Алматы • Весна 2026</span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">Главная</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-all">
            <span className="text-sm">?</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-white border border-zinc-200/80 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-all">
            <span className="text-sm">•••</span>
          </button>
        </div>
      </div>

      {/* Секция: Активный прогресс (как блоки на референсе) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
          <span>АКТИВНЫЙ ПРОФИЛЬ</span>
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Online</span>
        </div>

        <div className="bg-white border border-zinc-200/70 rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-xl shadow-md">
                💪
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 text-base">Асанәли Ерікұлы</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Digital Marketer & GymBro Creator</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-zinc-50/80 rounded-2xl p-3 text-center border border-zinc-100">
                <div className="text-[10px] font-medium text-zinc-400 uppercase">{stat.label}</div>
                <div className="text-xs font-semibold text-zinc-800 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Секция: Быстрые действия (в стиле карточки блокировки/сессий) */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-400 px-1">БЫСТРЫЙ ДОСТУП</div>
        
        <div className="bg-white border border-zinc-200/70 rounded-[28px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 text-sm">GymBro Matchmaking</h4>
                <p className="text-xs text-zinc-400">Поиск напарника по залам Алматы</p>
              </div>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Активно</span>
          </div>
        </div>
      </div>

      {/* Большая акцентная кнопка внизу (как на референсе Start blocking) */}
      <div className="pt-2">
        <button 
          onClick={() => alert('Функция в разработке!')}
          className="w-full py-4 rounded-[22px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-base shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:opacity-95 transition-all active:scale-[0.99]"
        >
          + Начать новую тренировку
        </button>
      </div>
    </div>
  );
}
