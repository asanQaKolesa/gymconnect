import React, { useState } from 'react';

export default function DietPlan({ weight = 75, calories = 2600, protein = 160 }) {
  const [selectedDay, setSelectedDay] = useState(1);

  // Динамические граммовки под вес
  const poultryPerMeal = Math.round(weight * 1.8); // 130-150г за прием
  const dryCarbsPerMeal = Math.round((calories / 20)); // ~100-130г за прием

  const days = [
    { day: 1, name: 'Понедельник (Силовой день)' },
    { day: 2, name: 'Вторник (Базовый сплит)' },
    { day: 3, name: 'Среда (Восстановление)' },
    { day: 4, name: 'Четверг (Ноги / Спина)' },
    { day: 5, name: 'Пятница (Плечи / Руки)' },
    { day: 6, name: 'Суббота (Кардио / Мобильность)' },
    { day: 7, name: 'Воскресенье (Отдых и Рефид)' },
  ];

  return (
    <div className="space-y-4">
      {/* Выбор дня недели */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {days.map(d => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition ${
              selectedDay === d.day
                ? 'bg-amber-500 text-slate-950 border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {d.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {days[selectedDay - 1].name}
            </h3>
            <p className="text-[11px] text-slate-400">Цель: ~{calories} ккал • {protein}г белка</p>
          </div>
          <span className="text-xl">📋</span>
        </div>

        {/* 4 приема пищи */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🍳 Завтрак (Энергия + Белок)</span>
            <p className="text-slate-300">
              • Яичница из 3 яиц (C0) + 50г легкого сыра или зелень.<br/>
              • Овсяная каша долгой варки: {Math.round(dryCarbsPerMeal * 0.7)}г (в сухом весе) с ягодами.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🍗 Обед (Основная загрузка перед залом)</span>
            <p className="text-slate-300">
              • Филе курицы или индейки в аэрогриле: ~{poultryPerMeal}г.<br/>
              • Зеленая чечевица или пропаренный рис: ~{dryCarbsPerMeal}г (сухой вес).<br/>
              • Салат из свежих огурцов и помидоров с 1 ч.л. оливкового масла.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">⚡ Перекус / После зала</span>
            <p className="text-slate-300">
              • 1 скуп сывороточного протеина (30г белка) с водой или бананом.<br/>
              • Горсть миндаля или грецких орехов (25г).
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🥗 Ужин (Легкое усвоение)</span>
            <p className="text-slate-300">
              • Запеченное филе судака / минтая или постная говядина: ~{poultryPerMeal}г.<br/>
              • Тушеные овощи (брокколи, стручковая фасоль, кабачки): 200г.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
