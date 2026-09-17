import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AthleteStats({ user }) {
  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  const today = new Date();
  const currentYear = 2026;
  const currentMonth = today.getMonth(); // 8 = Сентябрь
  const todayDate = today.getDate();

  // Режим просмотра: 'month' (текущий месяц) | 'year' (годовой сезон 2026)
  const [viewMode, setViewMode] = useState('month');

  // Месячная цель (дефолт 16 тренировок)
  const [monthlyTarget, setMonthlyTarget] = useState(16);
  const [isSettingTarget, setIsSettingTarget] = useState(false);

  // Годовая цель (дефолт 190 тренировок в 2026 году)
  const [yearlyTarget, setYearlyTarget] = useState(190);

  // Дни тренировок текущего месяца
  const [loggedDays, setLoggedDays] = useState([]);

  // История по месяцам за 2026 год (для годового обзора)
  const [yearlyHistory, setYearlyHistory] = useState({
    0: 15, // Янв
    1: 14, // Фев
    2: 17, // Мар
    3: 16, // Апр
    4: 18, // Май
    5: 16, // Июн
    6: 15, // Июл
    7: 17, // Авг
    8: 0,  // Сен (динамический из loggedDays)
    9: 0, 10: 0, 11: 0
  });

  useEffect(() => {
    const storageKey = `gym_workouts_${myTgId}_${currentYear}_${currentMonth}`;
    const localSaved = localStorage.getItem(storageKey);

    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        setLoggedDays(parsed.days || []);
        if (parsed.target) setMonthlyTarget(parsed.target);
      } catch (e) {}
    } else {
      // Стартовые дни для сентября
      const initialDays = [2, 4, 7, 9, 11, 14, 16].filter(d => d <= todayDate);
      setLoggedDays(initialDays);
    }
  }, [myTgId, currentMonth, todayDate]);

  function saveMonthDays(newDays, newTarget = monthlyTarget) {
    setLoggedDays(newDays);
    const storageKey = `gym_workouts_${myTgId}_${currentYear}_${currentMonth}`;
    localStorage.setItem(storageKey, JSON.stringify({ days: newDays, target: newTarget }));
  }

  function toggleDay(dayNum) {
    if (dayNum > todayDate) {
      alert('Нельзя отметить будущий день! Режим куётся сегодня 💪');
      return;
    }
    let updated;
    if (loggedDays.includes(dayNum)) {
      updated = loggedDays.filter(d => d !== dayNum);
    } else {
      updated = [...loggedDays, dayNum].sort((a, b) => a - b);
    }
    saveMonthDays(updated);
  }

  // Расчет календаря
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const currentMonthCount = loggedDays.length;
  const monthProgress = Math.min(100, Math.round((currentMonthCount / monthlyTarget) * 100));

  // Суммарные тренировки за весь 2026 год
  const pastMonthsSum = Object.entries(yearlyHistory)
    .filter(([m]) => Number(m) < currentMonth)
    .reduce((acc, [, val]) => acc + val, 0);

  const totalYearWorkouts = pastMonthsSum + currentMonthCount;
  const yearProgress = Math.min(100, Math.round((totalYearWorkouts / yearlyTarget) * 100));

  return (
    <div className="space-y-3 pb-8">
      {/* 1. ПЕРЕКЛЮЧАТЕЛЬ: МЕСЯЦ / СЕЗОН 2026 */}
      <div className="p-1 rounded-2xl bg-black/50 border border-white/[0.08] grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setViewMode('month')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'month'
              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📅</span>
          <span>{MONTH_NAMES[currentMonth]}</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('year')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'year'
              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🏆</span>
          <span>Сезон 2026 (Год)</span>
        </button>
      </div>

      {/* ================= РЕЖИМ 1: СТАТИСТИКА ЗА МЕСЯЦ ================= */}
      {viewMode === 'month' && (
        <div className="space-y-3">
          {/* Плашка цели на месяц */}
          <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Таргет на {MONTH_NAMES[currentMonth]}
                </span>
                <h3 className="text-sm font-black text-white tracking-tight mt-0.5">
                  План: {monthlyTarget} тренировок
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingTarget(!isSettingTarget)}
                className="text-[10px] font-bold text-[#FF8C38] px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
              >
                {isSettingTarget ? 'Готово' : '⚙️ План'}
              </button>
            </div>

            {isSettingTarget && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">Сплит в месяц:</span>
                <div className="flex gap-1.5">
                  {[12, 16, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setMonthlyTarget(val);
                        saveMonthDays(loggedDays, val);
                        setIsSettingTarget(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        monthlyTarget === val
                          ? 'bg-[#FF5A1F] text-white'
                          : 'bg-white/[0.05] text-slate-400 hover:text-white'
                      }`}
                    >
                      {val} ({val / 4}/нед)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Прогресс-бар */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Закрыто <strong className="text-white font-black">{currentMonthCount}</strong> из {monthlyTarget}
                </span>
                <span className="font-bold text-[#FF8C38]">{monthProgress}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#FF5A1F] rounded-full transition-all duration-300"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Интерактивный календарь */}
          <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>📅</span> {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <span className="text-[10px] text-slate-400">тапни по числу для отметки</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEK_DAYS.map(day => (
                <span key={day} className="text-[10px] font-bold text-slate-500 uppercase py-0.5">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 rounded-xl bg-transparent" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isDone = loggedDays.includes(dayNum);
                const isToday = dayNum === todayDate;
                const isFuture = dayNum > todayDate;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isFuture}
                    onClick={() => toggleDay(dayNum)}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition active:scale-95 cursor-pointer relative ${
                      isDone
                        ? 'bg-gradient-to-b from-[#FF5A1F] to-[#e04812] text-white shadow-md shadow-[#FF5A1F]/20'
                        : isToday
                        ? 'bg-white/[0.08] border border-[#FF5A1F]/60 text-white'
                        : isFuture
                        ? 'bg-white/[0.01] text-slate-600 opacity-30 cursor-not-allowed'
                        : 'bg-white/[0.02] border border-white/[0.04] text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {isDone && <span className="text-[8px] leading-none mt-0.5">🔥</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-md bg-[#FF5A1F] inline-block" />
                <span>Тренировка</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-md border border-[#FF5A1F]/60 inline-block" />
                <span>Сегодня</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-md bg-white/[0.04] inline-block" />
                <span>Отдых</span>
              </div>
            </div>
          </div>

          {/* Итоги за месяц */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Всего за месяц</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {currentMonthCount} <span className="text-xs font-normal text-slate-400">тренировок</span>
              </span>
              <p className="text-[9px] text-emerald-400 font-medium mt-0.5">
                {currentMonthCount >= 12 ? '🔥 Железный режим' : 'В процессе выполнения'}
              </p>
            </div>

            <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">До цели месяца</span>
              <span className="text-xl font-black text-[#FF8C38] mt-0.5 block">
                {Math.max(0, monthlyTarget - currentMonthCount)} <span className="text-xs font-normal text-slate-400">сессий</span>
              </span>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                осталось в сентябре
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= РЕЖИМ 2: СТАТИСТИКА ЗА ВЕСЬ ГОД 2026 ================= */}
      {viewMode === 'year' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Годовой прогресс */}
          <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Сезон {currentYear}
                </span>
                <h3 className="text-sm font-black text-white tracking-tight mt-0.5">
                  Годовая цель: {yearlyTarget} сессий
                </h3>
              </div>

              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                В графике ⚡️
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Выполнено за 2026: <strong className="text-white font-black">{totalYearWorkouts}</strong> из {yearlyTarget}
                </span>
                <span className="font-bold text-[#FF8C38]">{yearProgress}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-[#FF5A1F] to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${yearProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Сетка активности по 12 месяцам года */}
          <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>📊</span> Активность по месяцам (2026)
            </span>

            <div className="grid grid-cols-3 gap-2">
              {MONTH_SHORT.map((mName, idx) => {
                const count = idx === currentMonth ? currentMonthCount : (yearlyHistory[idx] || 0);
                const isPast = idx <= currentMonth;
                const isCurrent = idx === currentMonth;

                return (
                  <div
                    key={mName}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      isCurrent
                        ? 'bg-[#FF5A1F]/15 border-[#FF5A1F]/40 shadow-sm'
                        : isPast
                        ? 'bg-white/[0.02] border-white/[0.05]'
                        : 'bg-white/[0.01] border-white/[0.02] opacity-40'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block">{mName}</span>
                    <span className={`text-base font-black mt-0.5 block ${isCurrent ? 'text-[#FF8C38]' : 'text-white'}`}>
                      {isPast ? count : '—'}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {isCurrent ? 'текущий' : isPast ? 'тренировок' : 'впереди'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Итоговые годовые показатели */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Средний темп</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                3.8 <span className="text-xs font-normal text-slate-400">тренировок / нед</span>
              </span>
              <p className="text-[9px] text-emerald-400 font-medium mt-0.5">
                Высокая дисциплина
              </p>
            </div>

            <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">Осталось на 2026</span>
              <span className="text-xl font-black text-[#FF8C38] mt-0.5 block">
                {Math.max(0, yearlyTarget - totalYearWorkouts)} <span className="text-xs font-normal text-slate-400">сессий</span>
              </span>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                до закрытия годового плана
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
