import React from 'react';

export default function HomeTab() {
  const quickStats = [
    { label: 'Тренировок в неделю', value: '4 раза', icon: '⚡' },
    { label: 'Любимый зал', value: 'Invictus Go', icon: '📍' },
    { label: 'Текущая цель', value: 'Набор массы', icon: '🎯' },
  ];

  return (
    <div className="space-y-5 max-w-md mx-auto pb-10">
      {/* Приветственный блок в стиле Google Material Card */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200/60">
            Алматы • Весна 2026
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Добро пожаловать, Асанәли! 👋
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Твоя экосистема для тренировок и поиска напарников в залах города.
          </p>
        </div>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-3 gap-3">
        {quickStats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-lg">{stat.icon}</span>
            <div className="mt-3">
              <div className="text-[11px] text-zinc-400 font-medium">{stat.label}</div>
              <div className="text-sm font-semibold text-zinc-900 mt-0.5">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Карточка быстрого действия (GymBro) */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-emerald-400 font-mono font-medium uppercase tracking-wider">GymBro AI Match</span>
          <h3 className="text-lg font-semibold tracking-tight">Ищи напарников поблизости</h3>
          <p className="text-xs text-zinc-300">Алгоритмы подберут атлетов с похожим графиком и целями в твоем зале.</p>
        </div>
        <button 
          onClick={() => alert('Перейдите во вкладку GymBro для поиска!')}
          className="w-full bg-white text-zinc-950 font-medium text-sm py-3 rounded-2xl hover:bg-zinc-100 transition-all shadow-sm"
        >
          Начать поиск напарника
        </button>
      </div>
    </div>
  );
}
