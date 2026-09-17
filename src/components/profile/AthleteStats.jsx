import React, { useState } from 'react';

export default function AthleteStats({ user }) {
  // Реальная цель атлета: 181 из 220 тренировок
  const [completedWorkouts, setCompletedWorkouts] = useState(181);
  const targetWorkouts = 220;

  // Интерактивный трекер текущей недели
  const [weekDays, setWeekDays] = useState([
    { day: 'ПН', done: true, label: 'Ноги / Спина' },
    { day: 'ВТ', done: true, label: 'Грудь / Руки' },
    { day: 'СР', done: false, label: 'Отдых' },
    { day: 'ЧТ', done: true, label: 'База / Ноги' },
    { day: 'ПТ', done: true, label: 'Спина / Дельты' },
    { day: 'СБ', done: false, label: 'Восстановление' },
    { day: 'ВС', done: false, label: 'Кардио' },
  ]);

  const toggleDay = (index) => {
    const updated = [...weekDays];
    const wasDone = updated[index].done;
    updated[index].done = !wasDone;
    setWeekDays(updated);
    setCompletedWorkouts(prev => wasDone ? prev - 1 : prev + 1);
  };

  const percent = Math.min(100, Math.round((completedWorkouts / targetWorkouts) * 100));
  const remaining = Math.max(0, targetWorkouts - completedWorkouts);

  // Расчет кругового SVG прогресс-бара Apple
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 1. ГЛАВНЫЙ ВИДЖЕТ: ГОДОВАЯ ЦЕЛЬ В СТИЛЕ APPLE FITNESS RINGS */}
      <div className="apple-glass p-5 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A1F]">
              Сезон 2026 • Годовой таргет
            </span>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">
              Силовые тренировки
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            Опережает план
          </span>
        </div>

        {/* Круговой индикатор прогресса */}
        <div className="flex items-center justify-around pt-1">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
              {/* Фоновая дорожка кольца */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-white/[0.06]"
                strokeWidth="11"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Заполненное кольцо прогресса GymConnect */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="url(#gymconnectGradient)"
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <defs>
                <linearGradient id="gymconnectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF7A3D" />
                  <stop offset="100%" stopColor="#FF4500" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white tracking-tight leading-none">
                {percent}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">ВЫПОЛНЕНО</span>
            </div>
          </div>

          {/* Цифры таргета */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Выполнено</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{completedWorkouts}</span>
                <span className="text-xs text-slate-400 font-medium">/ {targetWorkouts}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Осталось закрыть</span>
              <span className="text-lg font-bold text-[#FF8C38]">{remaining} сессий</span>
            </div>
          </div>
        </div>

        {/* Линейный суб-бар с расчетом ритма */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/[0.05] space-y-1 text-xs">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Текущий темп</span>
            <span className="text-emerald-400 font-semibold">4.2 тренировки / нед</span>
          </div>
          <p className="text-[10px] text-slate-500">
            При сохранении темпа цель в 220 тренировок закроется в ноябре.
          </p>
        </div>
      </div>

      {/* 2. НЕДЕЛЬНЫЙ СПЛИТ-ТРЕКЕР (АКТУАЛЬНЫЙ РИТМ) */}
      <div className="apple-glass p-5 space-y-3.5">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Недельный сплит</h3>
            <p className="text-[11px] text-slate-400">Нажми на день, чтобы отметить тренировку</p>
          </div>
          <span className="text-[11px] font-bold text-[#FF8C38]">
            {weekDays.filter(d => d.done).length} / 4 норма
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weekDays.map((item, idx) => (
            <button
              key={item.day}
              type="button"
              onClick={() => toggleDay(idx)}
              className={`py-3 px-1 rounded-xl flex flex-col items-center justify-between min-h-[64px] border transition active:scale-95 cursor-pointer ${
                item.done
                  ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white border-[#FF5A1F] shadow-md shadow-[#FF5A1F]/20'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:border-white/[0.1]'
              }`}
            >
              <span className="text-[10px] font-bold">{item.day}</span>
              <span className="text-xs font-bold">{item.done ? '✓' : '—'}</span>
              <span className={`text-[8px] font-medium leading-none ${item.done ? 'text-white/80' : 'text-slate-500'}`}>
                {item.done ? 'Зал' : 'Отдых'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. КАРТОЧКИ КЛЮЧЕВЫХ МЕТРИК GYMCONNECT */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="apple-glass p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Суммарный объем
          </span>
          <p className="text-xl font-black text-white tracking-tight">284 тонны</p>
          <span className="text-[10px] text-emerald-400 font-semibold block">Базовые сплиты</span>
        </div>

        <div className="apple-glass p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Средняя длительность
          </span>
          <p className="text-xl font-black text-white tracking-tight">72 мин</p>
          <span className="text-[10px] text-slate-400 font-medium block">Высокая плотность</span>
        </div>
      </div>
    </div>
  );
}
