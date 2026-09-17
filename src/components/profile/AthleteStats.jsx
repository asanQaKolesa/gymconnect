import React, { useState } from 'react';

export default function AthleteStats({ user }) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'

  // Дни текущего месяца с отметками тренировок
  const [trainingDays, setTrainingDays] = useState([2, 4, 7, 9, 10, 12, 14, 16]);

  const toggleDay = (day) => {
    if (trainingDays.includes(day)) {
      setTrainingDays(trainingDays.filter(d => d !== day));
    } else {
      setTrainingDays([...trainingDays, day]);
    }
  };

  // Месячная статистика активности (столбцы для годового графика)
  const yearlyData = [
    { m: 1, val: 14 },
    { m: 2, val: 19 },
    { m: 3, val: 24 },
    { m: 4, val: 15 },
    { m: 5, val: 14 },
    { m: 6, val: 25 },
    { m: 7, val: 31 },
    { m: 8, val: 28 },
    { m: 9, val: trainingDays.length },
    { m: 10, val: 0 },
    { m: 11, val: 0 },
    { m: 12, val: 0 }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Dynamic Streak Badge (Серия активности) */}
      <div className="flex flex-col items-center justify-center pt-1 pb-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
          Недели подряд
        </span>
        <div className="w-20 h-28 rounded-full bg-gradient-to-b from-[#1C2333] to-[#0D111A] border border-white/[0.12] flex flex-col items-center justify-center shadow-2xl shadow-black/80 relative">
          <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">STREAK</span>
          <span className="text-3xl font-black text-white tracking-tight leading-none">42</span>
          <span className="text-amber-400 text-base mt-1 animate-pulse">⚡</span>
        </div>
        <p className="text-[11px] font-semibold text-emerald-400 mt-2.5 tracking-tight">
          🔥 Вы побили свой личный рекорд!
        </p>
      </div>

      {/* 2. Верхние кольца достижений в стиле Apple Rings */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {/* Тренировки */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-inner">
            <span className="text-sm font-black text-white">423</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1.5">Сессии</span>
        </div>

        {/* Часы */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#FF5A1F] bg-[#FF5A1F]/10 flex items-center justify-center">
            <span className="text-sm font-black text-[#FF8C38]">970</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1.5">Часы</span>
        </div>

        {/* Статус ранга */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-300/10 border border-amber-500/40 flex items-center justify-center">
            <span className="text-base">🏆</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold mt-1.5">Gold Pro</span>
        </div>

        {/* Прогресс сплита / PR */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center">
            <span className="text-sm font-black text-emerald-400">96%</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1.5">План</span>
        </div>
      </div>

      {/* 3. Apple Segmented Control: Месяц / Год */}
      <div className="apple-glass p-1 flex gap-1">
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            viewMode === 'month'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Месяц
        </button>
        <button
          onClick={() => setViewMode('year')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            viewMode === 'year'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Год
        </button>
      </div>

      {/* 4. Блок Активности */}
      <div className="apple-glass p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📅</span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Активность</h3>
          </div>
          <span className="text-xs text-slate-300 font-semibold">
            {viewMode === 'month' ? 'Сентябрь 2026' : 'Сезон 2026'}
          </span>
        </div>

        {/* Режим МЕСЯЦ: Календарная сетка Invictus */}
        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 pb-2">
              <span>ПН</span><span>ВТ</span><span>СР</span><span>ЧТ</span><span>ПТ</span><span>СБ</span><span>ВС</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              <div className="h-8" />
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                const isActive = trainingDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      isActive
                        ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20 active:scale-95'
                        : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] border border-white/[0.04]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-3">
              Нажми на день, чтобы отметить тренировку в зале
            </p>
          </div>
        )}

        {/* Режим ГОД: Столбчатая диаграмма Invictus */}
        {viewMode === 'year' && (
          <div className="pt-2">
            <div className="h-40 flex items-end justify-between gap-1.5 px-1 border-b border-white/[0.08] pb-1">
              {yearlyData.map(item => {
                const heightPercent = Math.min(100, Math.round((item.val / 31) * 100));
                return (
                  <div key={item.m} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        item.val > 0
                          ? 'bg-gradient-to-t from-[#10B981] to-[#34D399] shadow-sm shadow-emerald-500/30'
                          : 'bg-white/[0.03]'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 px-1 font-semibold">
              {yearlyData.map(item => (
                <span key={item.m}>{item.m}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Детальные метрики в стиле Apple Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="apple-glass p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <span>🏃</span>
            <span>Посещений</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {viewMode === 'month' ? trainingDays.length : '181'}
          </p>
        </div>

        <div className="apple-glass p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <span>⏱</span>
            <span>Время в зале</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {viewMode === 'month' ? `${trainingDays.length * 1.5} ч` : '410 ч'}
          </p>
        </div>

        <div className="apple-glass p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <span>🔥</span>
            <span>Калории</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {viewMode === 'month' ? (trainingDays.length * 450).toLocaleString() : '35 920'}
          </p>
        </div>

        <div className="apple-glass p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <span>🎯</span>
            <span>Выполнение</span>
          </div>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            {Math.round((trainingDays.length / 16) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
