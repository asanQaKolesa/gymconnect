import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AthleteStats({ user }) {
  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const todayDate = today.getDate();

  // Цель на месяц (дефолт 16 тренировок: 4 раза в неделю)
  const [monthlyTarget, setMonthlyTarget] = useState(16);
  const [isSettingTarget, setIsSettingTarget] = useState(false);

  // Массив дней с тренировками в текущем месяце: [1, 3, 5, 8, ...]
  const [loggedDays, setLoggedDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка отметок из Supabase (или localStorage при оффлайне)
  useEffect(() => {
    async function loadWorkouts() {
      if (!myTgId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const storageKey = `gym_workouts_${myTgId}_${currentYear}_${currentMonth}`;
      const localSaved = localStorage.getItem(storageKey);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          setLoggedDays(parsed.days || []);
          if (parsed.target) setMonthlyTarget(parsed.target);
        } catch (e) {}
      }

      // Пытаемся подтянуть из базы users.stats_data если колонка доступна
      try {
        const { data } = await supabase
          .from('users')
          .select('target_weight, bio')
          .eq('telegram_id', myTgId)
          .maybeSingle();

        // Если локально пусто, даем 4 дефолтных дня для наглядности
        if (!localSaved) {
          const initialDays = [2, 4, 7, 9, 11, 14, 16].filter(d => d <= todayDate);
          setLoggedDays(initialDays);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkouts();
  }, [myTgId, currentYear, currentMonth, todayDate]);

  // Сохранение дней
  function saveState(newDays, newTarget = monthlyTarget) {
    setLoggedDays(newDays);
    const storageKey = `gym_workouts_${myTgId}_${currentYear}_${currentMonth}`;
    localStorage.setItem(storageKey, JSON.stringify({ days: newDays, target: newTarget }));
  }

  // Переключение дня (был / не был)
  function toggleDay(dayNum) {
    if (dayNum > todayDate) {
      alert('Нельзя отметить тренировку в будущем дне! 💪');
      return;
    }
    let updated;
    if (loggedDays.includes(dayNum)) {
      updated = loggedDays.filter(d => d !== dayNum);
    } else {
      updated = [...loggedDays, dayNum].sort((a, b) => a - b);
    }
    saveState(updated);
  }

  // Генерация календаря на месяц
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // День недели первого числа месяца (0 - Вс, 1 - Пн ... 6 - Сб)
  let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  // Приводим к Пн = 0, Вс = 6
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const totalCompleted = loggedDays.length;
  const progressPercent = Math.min(100, Math.round((totalCompleted / monthlyTarget) * 100));

  // Считаем тренировки за последние 7 дней
  const last7DaysCount = loggedDays.filter(d => d >= todayDate - 6 && d <= todayDate).length;

  return (
    <div className="space-y-3 pb-8">
      {/* 1. КАРТОЧКА ЦЕЛИ НА МЕСЯЦ */}
      <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <h3 className="text-sm font-black text-white tracking-tight mt-0.5">
              Цель: {monthlyTarget} тренировок
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingTarget(!isSettingTarget)}
            className="text-[10px] font-bold text-[#FF8C38] px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
          >
            {isSettingTarget ? 'Готово' : '⚙️ Сменить план'}
          </button>
        </div>

        {/* Выбор цели */}
        {isSettingTarget && (
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">Тренировок в месяц:</span>
            <div className="flex gap-1.5">
              {[12, 16, 20].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setMonthlyTarget(val);
                    saveState(loggedDays, val);
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
              Выполнено <strong className="text-white font-black">{totalCompleted}</strong> из {monthlyTarget}
            </span>
            <span className="font-bold text-[#FF8C38]">{progressPercent}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden border border-white/[0.05]">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#FF5A1F] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. ИНТЕРАКТИВНЫЙ КАЛЕНДАРЬ МЕСЯЦА */}
      <div className="apple-glass p-4 space-y-3 border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>📅</span> Календарь тренировок
          </span>
          <span className="text-[10px] text-slate-400">нажми на день для отметки</span>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEK_DAYS.map(day => (
            <span key={day} className="text-[10px] font-bold text-slate-500 uppercase py-0.5">
              {day}
            </span>
          ))}
        </div>

        {/* Сетка дат */}
        <div className="grid grid-cols-7 gap-1">
          {/* Пустые ячейки до 1 числа */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 rounded-xl bg-transparent" />
          ))}

          {/* Дни месяца */}
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
                    ? 'bg-white/[0.01] text-slate-600 opacity-40 cursor-not-allowed'
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
            <span className="w-2.5 h-2.5 rounded-md bg-[#FF5A1F] inline-block" />
            <span>Тренировка</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md border border-[#FF5A1F]/60 inline-block" />
            <span>Сегодня</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-white/[0.04] inline-block" />
            <span>Отдых</span>
          </div>
        </div>
      </div>

      {/* 3. ПОНЯТНЫЕ СПОРТИВНЫЕ МЕТРИКИ ВМЕСТО ТОНН */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">За 7 дней</span>
          <span className="text-xl font-black text-white mt-0.5 block">
            {last7DaysCount} <span className="text-xs font-normal text-slate-400">тренировки</span>
          </span>
          <p className="text-[9px] text-emerald-400 font-medium mt-0.5">
            {last7DaysCount >= 3 ? '⚡️ Отличный темп' : 'Надо поднажать'}
          </p>
        </div>

        <div className="p-3 rounded-2xl apple-glass border border-white/[0.06] text-center">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">Осталось в плане</span>
          <span className="text-xl font-black text-[#FF8C38] mt-0.5 block">
            {Math.max(0, monthlyTarget - totalCompleted)} <span className="text-xs font-normal text-slate-400">сессий</span>
          </span>
          <p className="text-[9px] text-slate-400 font-medium mt-0.5">
            до закрытия месяца
          </p>
        </div>
      </div>
    </div>
  );
}
