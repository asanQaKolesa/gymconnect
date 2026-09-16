import React, { useState } from 'react';

export default function DietPlan({ weight = 75, calories = 2600, protein = 160 }) {
  const [selectedDay, setSelectedDay] = useState(1);

  const poultryPerMeal = Math.round(weight * 1.8);
  const dryCarbsPerMeal = Math.round(calories / 20);

  const days = [
    { day: 1, short: 'ПН', name: 'Понедельник (Грудь / Плечи)' },
    { day: 2, short: 'ВТ', name: 'Вторник (Спина / Бицепс)' },
    { day: 3, short: 'СР', name: 'Среда (Восстановление)' },
    { day: 4, short: 'ЧТ', name: 'Четверг (Тяжелые ноги)' },
    { day: 5, short: 'ПТ', name: 'Пятница (Руки / Кор)' },
    { day: 6, short: 'СБ', name: 'Суббота (Full Body / Кардио)' },
    { day: 7, short: 'ВС', name: 'Воскресенье (Отдых и Рефид)' },
  ];

  return (
    <div className="space-y-4">
      {/* Сетка переключения всех 7 дней недели */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              className={`py-2 text-[11px] font-black rounded-xl border transition flex flex-col items-center justify-center ${
                selectedDay === d.day
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{d.short}</span>
              <span className="text-[8px] font-normal opacity-70">д.{d.day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Меню выбранного дня */}
      <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {days[selectedDay - 1].name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Ориентир: ~{calories} ккал • {protein}г белка
            </p>
          </div>
          <span className="text-xl">📋</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🍳 Завтрак (Энергия + Белок)</span>
            <p className="text-slate-300">
              • Яичница из 3 яиц (C0) + 40г брынзы / сыра и зелень.<br/>
              • Овсяная каша долгой варки: {Math.round(dryCarbsPerMeal * 0.7)}г (сухой вес) с ягодами.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🍗 Обед (Перед залом)</span>
            <p className="text-slate-300">
              • Филе курицы / индейки в аэрогриле: ~{poultryPerMeal}г.<br/>
              • Зеленая чечевица или пропаренный рис: ~{dryCarbsPerMeal}г (сухой вес).<br/>
              • Овощной салат с 1 ч.л. оливкового масла.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">⚡ Полдник / После зала</span>
            <p className="text-slate-300">
              • 1 скуп сывороточного протеина (30г белка) с водой или бананом.<br/>
              • Горсть сырого миндаля (25г).
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">🥗 Ужин (Восстановление)</span>
            <p className="text-slate-300">
              • Запеченная рыба (судак, минтай) или постная говядина: ~{poultryPerMeal}г.<br/>
              • Тушеные овощи (брокколи, кабачки, фасоль): 200г.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
