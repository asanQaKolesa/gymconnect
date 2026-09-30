// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Send, 
  Dumbbell, 
  Check, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  CheckSquare, 
  Square,
  Sparkles,
  TrendingUp,
  UserCheck,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

function getWorkoutWord(count) {
  const rem10 = count % 10;
  const rem100 = count % 100;
  if (rem100 >= 11 && rem100 <= 19) return 'тренировок';
  if (rem10 === 1) return 'тренировка';
  if (rem10 >= 2 && rem10 <= 4) return 'тренировки';
  return 'тренировок';
}

export default function OverviewTab({ 
  trainer, 
  students = [], 
  onSelectStudent, 
  onAddStudentClick,
  onRefresh 
}) {
  // Дни недели для графика (Пн - Вс)
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Определение текущего дня недели
  const currentDayShort = useMemo(() => {
    const map = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return map[new Date().getDay()];
  }, []);

  // Выбранный день в графике: по умолчанию сегодняшний день
  const [selectedDayFilter, setSelectedDayFilter] = useState(currentDayShort);
  const [processedMap, setProcessedMap] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Модалка быстрых сценариев Telegram
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    type: null,
    title: '',
    selectedIds: [],
    customMessage: ''
  });
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendSuccessText, setSendSuccessText] = useState(null);

  // Цель по доходу в месяц (по умолчанию 1 200 000 ₸)
  const monthlyIncomeGoal = trainer?.income_target || 1200000;

  // Вспомогательный парсер дней ученика
  const parseDays = (raw) => {
    if (Array.isArray(raw) && raw.length > 0) return raw;
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      } catch (e) {
        if (raw.includes(',')) return raw.split(',').map(s => s.trim());
      }
    }
    return ['Пн', 'Ср', 'Пт'];
  };

  const isStudentActive = (s) => {
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  };

  // Активная база
  const activeStudents = useMemo(() => {
    return students.filter(isStudentActive);
  }, [students]);

  // Расчет кассы за месяц с защитой от null
  const currentMonthlyRevenue = useMemo(() => {
    return activeStudents.reduce((acc, s) => {
      let price = 70000;
      if (s.monthly_price !== undefined && s.monthly_price !== null && String(s.monthly_price).trim() !== '' && String(s.monthly_price).trim() !== 'null') {
        const parsed = Number(String(s.monthly_price).replace(/\D/g, ''));
        if (Number.isFinite(parsed) && parsed > 0) price = parsed;
      }
      return acc + price;
    }, 0);
  }, [activeStudents]);

  // Процент выполнения финансового плана
  const incomeGoalPercent = Math.min(100, Math.round((currentMonthlyRevenue / monthlyIncomeGoal) * 100));

  // Анализ распределения базы (Пульс абонементов)
  const healthDistribution = useMemo(() => {
    let safeCount = 0; // > 2 занятий
    let warningCount = 0; // 1-2 занятия
    let dangerCount = 0; // 0 занятий или ожидает оплаты

    activeStudents.forEach(s => {
      const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
      const isPending = s.payment_status === 'pending';

      if (left <= 0 || isPending) {
        dangerCount++;
      } else if (left <= 2) {
        warningCount++;
      } else {
        safeCount++;
      }
    });

    const total = activeStudents.length || 1;
    return {
      safeCount,
      warningCount,
      dangerCount,
      safePercent: Math.round((safeCount / total) * 100),
      warningPercent: Math.round((warningCount / total) * 100),
      dangerPercent: Math.round((dangerCount / total) * 100)
    };
  }, [activeStudents]);

  // Расчет загрузки по дням недели для построения графика
  const weekLoadStats = useMemo(() => {
    const counts = {};
    daysOfWeek.forEach(d => counts[d] = 0);

    activeStudents.forEach(s => {
      const sDays = parseDays(s.workout_days);
      daysOfWeek.forEach(d => {
        if (sDays.includes(d)) {
          counts[d] += 1;
        }
      });
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount };
  }, [activeStudents]);

  // Список учеников на выбранный в графике день
  const displayedStudents = useMemo(() => {
    if (selectedDayFilter === 'all') return activeStudents;
    return activeStudents.filter(s => {
      const sDays = parseDays(s.workout_days);
      return sDays.includes(selectedDayFilter);
    });
  }, [activeStudents, selectedDayFilter]);

  // Ученики, требующие срочного внимания сегодня
  const urgentAlerts = useMemo(() => {
    return displayedStudents.filter(s => {
      const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
      return left <= 2 || s.payment_status === 'pending';
    });
  }, [displayedStudents]);

  // Списание / возврат занятия в 1 клик с моментальным пушем в Telegram
  const handleToggleWorkout = async (e, s) => {
    e.stopPropagation();
    const isDone = processedMap[s.id];
    setProcessingId(s.id);

    const currentLeft = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
    const newLeft = isDone ? currentLeft + 1 : Math.max(0, currentLeft - 1);

    try {
      s.left_trainings = newLeft;
      s.remaining_workouts = newLeft;

      await supabase
        .from('profiles')
        .update({
          left_trainings: newLeft,
          remaining_workouts: newLeft
        })
        .eq('id', s.id);

      setProcessedMap(prev => ({ ...prev, [s.id]: !isDone }));

      const targetTelegramId = s.telegram_id || s.chat_id;
      if (targetTelegramId) {
        const trainerName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
        const pushText = !isDone
          ? `✅ <b>Тренировка проведена!</b>\n\nСписано: <b>1 занятие</b>.\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.\n\n<i>Тренер: ${escapeHtml(trainerName)} 💪</i>`
          : `↩️ <b>Списание занятия отменено!</b>\n\nЗанятие возвращено на баланс (+1).\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.`;

        sendTelegramMessage(targetTelegramId, pushText).catch(() => {});
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Ошибка списания:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Пакетная отправка сценариев напоминаний
  const handleSendBatch = async () => {
    if (remindModal.selectedIds.length === 0 || !remindModal.customMessage.trim()) return;
    setIsSendingBatch(true);

    try {
      const targets = students.filter(s => remindModal.selectedIds.includes(s.id));
      let count = 0;
      for (const s of targets) {
        const chatId = s.telegram_id || s.chat_id;
        if (chatId) {
          const msg = `🔔 <b>${escapeHtml(remindModal.title)}</b>\n\n${remindModal.customMessage}`;
          const ok = await sendTelegramMessage(chatId, msg);
          if (ok) count++;
        }
      }

      setSendSuccessText(`Отправлено: ${count} из ${targets.length} атлетов`);
      setTimeout(() => {
        setSendSuccessText(null);
        setRemindModal(prev => ({ ...prev, isOpen: false }));
      }, 2000);
    } catch (e) {
      console.warn('Ошибка рассылки:', e);
    } finally {
      setIsSendingBatch(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 select-none">
      
      {/* 1. ШАПКА ОБЗОРА ДНЯ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Главный обзор
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Сегодня {currentDayShort}, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>

        {onAddStudentClick && (
          <button
            type="button"
            onClick={onAddStudentClick}
            className="px-3 py-1.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl shadow-xs text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>+ Добавить</span>
          </button>
        )}
      </div>

      {/* 2. АНАЛИТИЧЕСКИЙ БЛОК: КАССА С ПРОГРЕССОМ + АКТИВНАЯ БАЗА */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Карточка 1: Финансовый прогресс к цели */}
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Касса месяца</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <p className="text-base font-bold font-mono text-slate-900 tracking-tight">
              {currentMonthlyRevenue.toLocaleString()} ₸
            </p>
            <div className="flex items-center justify-between text-[9.5px] text-slate-400 mt-1 font-medium">
              <span>Цель: {(monthlyIncomeGoal / 1000).toFixed(0)}k ₸</span>
              <span className="font-mono text-emerald-600 font-bold">{incomeGoalPercent}%</span>
            </div>
            
            {/* Горизонтальный микро-график выполнения финансового плана */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${incomeGoalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Карточка 2: Активная база + пульс абонементов */}
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Активная база</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <p className="text-base font-bold font-mono text-slate-900 tracking-tight">
              {activeStudents.length} <span className="text-[10px] text-slate-400 font-normal">атлетов</span>
            </p>

            {/* «Пульс базы»: полоса здоровья абонементов */}
            <div className="space-y-1 mt-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div style={{ width: `${healthDistribution.safePercent}%` }} className="bg-emerald-500 h-full" title="Стабильный запас" />
                <div style={{ width: `${healthDistribution.warningPercent}%` }} className="bg-amber-400 h-full" title="≤ 2 занятий" />
                <div style={{ width: `${healthDistribution.dangerPercent}%` }} className="bg-rose-500 h-full" title="Долг / 0 занятий" />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span className="text-emerald-600 font-bold">{healthDistribution.safeCount} норм</span>
                <span className="text-amber-600 font-bold">{healthDistribution.warningCount} продлить</span>
                <span className="text-rose-600 font-bold">{healthDistribution.dangerCount} долг</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. ИНТЕРАКТИВНЫЙ ГРАФИК НЕДЕЛЬНОЙ НАГРУЗКИ (WEEKLY LOAD CHART) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#1E60D5]" />
            <h3 className="text-xs font-bold text-slate-900">
              График нагрузки на неделю
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              selectedDayFilter === 'all' 
                ? 'bg-[#1E60D5] text-white' 
                : 'text-[#1E60D5] hover:bg-blue-50'
            }`}
          >
            Все дни ({activeStudents.length})
          </button>
        </div>

        {/* Столбики Пн - Вс */}
        <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-2 px-1">
          {daysOfWeek.map((day) => {
            const count = weekLoadStats.counts[day] || 0;
            const isToday = day === currentDayShort;
            const isSelected = selectedDayFilter === day;
            // Процент высоты столбика от 15% до 100%
            const heightPercent = count === 0 ? 12 : Math.max(20, Math.round((count / weekLoadStats.maxCount) * 100));

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayFilter(day)}
                className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
              >
                {/* Цифра количества тренировок над столбиком */}
                <span className={`text-[10px] font-mono font-bold transition-colors ${
                  isSelected ? 'text-[#1E60D5]' : count > 0 ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {count}
                </span>

                {/* Сам столбик */}
                <div className="w-full max-w-[32px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end p-0.5 transition-all group-hover:bg-slate-200">
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isSelected 
                        ? 'bg-[#1E60D5] shadow-sm' 
                        : isToday 
                          ? 'bg-blue-400' 
                          : count > 0 
                            ? 'bg-slate-300' 
                            : 'bg-slate-200/50'
                    }`}
                  />
                </div>

                {/* Подпись дня недели */}
                <div className="flex flex-col items-center">
                  <span className={`text-[10.5px] font-bold ${
                    isSelected ? 'text-[#1E60D5]' : isToday ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-[#1E60D5] mt-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. СМАРТ-ФОКУС ДНЯ (ПРЕДУПРЕЖДЕНИЕ, ЕСЛИ ЕСТЬ ВАЖНЫЕ ТРИГГЕРЫ) */}
      {urgentAlerts.length > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900 block">
              Внимание по расписанию ({urgentAlerts.length} атл.):
            </span>
            <span className="text-[11px] text-amber-800">
              У {urgentAlerts.map(s => s.first_name).join(', ')} заканчивается блок занятий или требуется подтверждение оплаты.
            </span>
          </div>
        </div>
      )}

      {/* 5. РАСПИСАНИЕ НА ВЫБРАННЫЙ ДЕНЬ С БЫСТРЫМ СПИСАНИЕМ В 1 КЛИК */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Шапка списка */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {selectedDayFilter === 'all' 
                  ? 'Все подопечные на ведении' 
                  : selectedDayFilter === currentDayShort 
                    ? `Тренировки на сегодня (${currentDayShort})` 
                    : `Запланировано на ${selectedDayFilter}`}
              </h3>
              <p className="text-[10px] text-slate-400">
                {displayedStudents.length} атлетов в расписании
              </p>
            </div>
          </div>

          <span className="text-[10.5px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
            {displayedStudents.length} зан.
          </span>
        </div>

        {/* Список карточек учеников */}
        <div className="divide-y divide-slate-100">
          {displayedStudents.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">На этот день тренировок нет</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Выберите другой день в графике выше или нажмите «Все дни», чтобы увидеть всю активную базу.
              </p>
            </div>
          ) : (
            displayedStudents.map((s) => {
              const leftWorkouts = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
              const isDone = Boolean(processedMap[s.id]);
              const isCurrentProcessing = processingId === s.id;
              const hasLowBalance = leftWorkouts <= 2;
              const isPendingPayment = s.payment_status === 'pending';

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent && onSelectStudent(s)}
                  className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors cursor-pointer group active:bg-slate-100/60"
                >
                  {/* Левая часть: аватарка + имя + слот */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50 flex items-center justify-center font-bold text-[#1E60D5] text-xs shrink-0 shadow-2xs">
                      {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'A'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {s.full_name || 'Без имени'}
                        </span>
                        {isPendingPayment && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Ожидает оплаты" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5 whitespace-nowrap">
                        <span className={`font-mono font-bold ${hasLowBalance ? 'text-rose-600' : 'text-slate-600'}`}>
                          {leftWorkouts} {getWorkoutWord(leftWorkouts)}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px] text-slate-500">
                          {s.workout_time_slot ? s.workout_time_slot.split(' ')[0] : 'Вечер'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Правая часть: кнопка списания занятия в 1 клик */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isDone ? (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-[10.5px] font-bold border border-slate-200/80 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
                        title="Отменить списание"
                      >
                        <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                        <span>Вернуть (+1)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="py-1.5 px-3 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-xs"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Проведено</span>
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. ЦЕНТР БЫСТРЫХ ДЕЙСТВИЙ TELEGRAM */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#1E60D5]" />
            <span>Сценарии уведомлений</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Telegram Bot</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRemindModal({
              isOpen: true,
              type: 'workout',
              title: 'Напоминание о тренировке',
              customMessage: 'Привет! Напоминаю о сегодняшней тренировке по графику. Жду в зале вовремя! 💪',
              selectedIds: displayedStudents.map(s => s.id)
            })}
            className="p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold text-slate-900 leading-snug">О тренировке</p>
            <p className="text-[9.5px] text-slate-400 mt-0.5">{displayedStudents.length} атлетов</p>
          </button>

          <button
            type="button"
            onClick={() => setRemindModal({
              isOpen: true,
              type: 'payment',
              title: 'Продление абонемента',
              customMessage: 'Привет! Твой текущий блок тренировок подходит к концу. Давай запланируем продление, чтобы сохранить за тобой удобное время!',
              selectedIds: activeStudents.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 0) <= 2).map(s => s.id)
            })}
            className="p-2.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold text-amber-950 leading-snug">Об оплате</p>
            <p className="text-[9.5px] text-amber-700 mt-0.5">Остаток ≤ 2 зан.</p>
          </button>

          <button
            type="button"
            onClick={() => setRemindModal({
              isOpen: true,
              type: 'absent',
              title: 'Возврат к тренировкам',
              customMessage: 'Привет! Давно не виделись в зале. Всё в порядке? Давай согласуем день и продолжим тренировочный режим!',
              selectedIds: activeStudents.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 0) === 0).map(s => s.id)
            })}
            className="p-2.5 bg-slate-50 hover:bg-rose-50/80 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer"
          >
            <p className="text-[11px] font-bold text-rose-950 leading-snug">Вернуть в зал</p>
            <p className="text-[9.5px] text-rose-700 mt-0.5">Закончились</p>
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПАКЕТНОЙ ОТПРАВКИ СООБЩЕНИЙ В TELEGRAM */}
      {remindModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-4 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">{remindModal.title}</h4>
              <button
                type="button"
                onClick={() => setRemindModal(prev => ({ ...prev, isOpen: false }))}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sendSuccessText ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center animate-in fade-in">
                {sendSuccessText}
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Текст сообщения в Telegram:
                  </label>
                  <textarea
                    rows={3}
                    value={remindModal.customMessage}
                    onChange={e => setRemindModal(prev => ({ ...prev, customMessage: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 resize-none focus:outline-none focus:border-[#1E60D5]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 min-h-[140px] max-h-[220px]">
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 px-1 mb-1">
                    <span>Получатели ({remindModal.selectedIds.length}):</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (remindModal.selectedIds.length === activeStudents.length) {
                          setRemindModal(prev => ({ ...prev, selectedIds: [] }));
                        } else {
                          setRemindModal(prev => ({ ...prev, selectedIds: activeStudents.map(s => s.id) }));
                        }
                      }}
                      className="text-[#1E60D5] hover:underline cursor-pointer"
                    >
                      {remindModal.selectedIds.length === activeStudents.length ? 'Снять все' : 'Выбрать всех'}
                    </button>
                  </div>

                  {activeStudents.map(s => {
                    const isChecked = remindModal.selectedIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setRemindModal(prev => ({
                            ...prev,
                            selectedIds: isChecked
                              ? prev.selectedIds.filter(id => id !== s.id)
                              : [...prev.selectedIds, s.id]
                          }));
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked ? 'bg-blue-50/70 border-blue-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {s.full_name || 'Без имени'}
                        </span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#1E60D5] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={isSendingBatch || remindModal.selectedIds.length === 0}
                  onClick={handleSendBatch}
                  className="w-full py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingBatch ? 'Отправка...' : `Отправить (${remindModal.selectedIds.length})`}</span>
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
