// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Send, 
  Check, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ClipboardList,
  MessageCircle,
  Users,
  ChevronRight,
  ArrowRight
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
  onRefresh 
}) {
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Форматирование красивой даты "Сегодня, 1 октября"
  const formattedToday = useMemo(() => {
    const date = new Date();
    const dayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][date.getDay()];
    const day = date.getDate();
    const month = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'][date.getMonth()];
    return `Сегодня, ${day} ${month}`;
  }, []);

  const currentDayShort = useMemo(() => {
    const map = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return map[new Date().getDay()];
  }, []);

  const [selectedDayFilter, setSelectedDayFilter] = useState(currentDayShort);
  const [processedMap, setProcessedMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [expandedProgramId, setExpandedProgramId] = useState(null);

  // Модалка отправки сообщения о тренировке
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    customMessage: 'Привет! Напоминаю о сегодняшней тренировке по графику. Жду в зале вовремя! 💪'
  });
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendSuccessText, setSendSuccessText] = useState(null);

  const monthlyIncomeGoal = trainer?.income_target || 1200000;

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

  const activeStudents = useMemo(() => {
    return students.filter(isStudentActive);
  }, [students]);

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

  const incomeGoalPercent = Math.min(100, Math.round((currentMonthlyRevenue / monthlyIncomeGoal) * 100));

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

  const displayedStudents = useMemo(() => {
    if (selectedDayFilter === 'all') return activeStudents;
    return activeStudents.filter(s => {
      const sDays = parseDays(s.workout_days);
      return sDays.includes(selectedDayFilter);
    });
  }, [activeStudents, selectedDayFilter]);

  const urgentAlerts = useMemo(() => {
    return activeStudents.filter(s => {
      const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
      return left <= 2 || s.payment_status === 'pending';
    });
  }, [activeStudents]);

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

  const handleSendReminder = async () => {
    if (!remindModal.customMessage.trim() || displayedStudents.length === 0) return;
    setIsSendingBatch(true);

    try {
      let count = 0;
      for (const s of displayedStudents) {
        const chatId = s.telegram_id || s.chat_id;
        if (chatId) {
          const msg = `🔔 <b>Напоминание о тренировке</b>\n\n${remindModal.customMessage}`;
          const ok = await sendTelegramMessage(chatId, msg);
          if (ok) count++;
        }
      }

      setSendSuccessText(`Напоминание отправлено ${count} атлетам`);
      setTimeout(() => {
        setSendSuccessText(null);
        setRemindModal(prev => ({ ...prev, isOpen: false }));
      }, 2500);
    } catch (e) {
      console.warn('Ошибка рассылки:', e);
    } finally {
      setIsSendingBatch(false);
    }
  };

  const getFormatBadge = (s) => {
    const f = (s.training_format || s.package_type || 'coach_gym').toLowerCase();
    if (f.includes('online')) return { text: 'Онлайн', color: 'bg-indigo-50 text-indigo-700' };
    if (f.includes('split')) return { text: 'Сплит', color: 'bg-purple-50 text-purple-700' };
    if (f.includes('group')) return { text: 'Мини-группа', color: 'bg-amber-50 text-amber-700' };
    return { text: 'Индивидуально', color: 'bg-blue-50 text-[#1E60D5]' };
  };

  const renderProgramPreview = (student) => {
    const prog = student.assigned_program;
    if (!prog || !prog.days) {
      return (
        <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-center text-slate-400">
          Программа пока не назначена
        </div>
      );
    }
    
    const firstDayKey = Object.keys(prog.days)[0];
    const dayData = prog.days[firstDayKey];
    
    if (!dayData) return null;
    
    return (
      <div className="mt-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="font-bold text-slate-800 mb-2 border-b border-slate-200/60 pb-1.5 flex items-center justify-between">
          <span>{dayData.title || 'План тренировки'}</span>
          <span className="text-[10px] text-slate-500 font-medium">{dayData.exercises?.length || 0} упр.</span>
        </div>
        <div className="space-y-1.5">
          {(dayData.exercises || []).map((ex, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="text-slate-700 truncate pr-2 font-medium">{i + 1}. {ex.name}</span>
              <span className="text-slate-500 font-mono font-bold shrink-0">{ex.sets}x{ex.reps} • {ex.weight}кг</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-28 select-none">
      
      {/* 1. ДИНАМИЧЕСКАЯ ШАПКА */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight leading-tight">
            {formattedToday}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Продуктивного дня, {trainer?.first_name || 'Наставник'}
          </p>
        </div>
      </div>

      {/* 2. СМАРТ-ФОКУС (ПРЕДУПРЕЖДЕНИЯ CRM) */}
      {urgentAlerts.length > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900 block mb-0.5">
              Фокус внимания:
            </span>
            <span className="text-[11px] text-amber-800">
              У {urgentAlerts.length} подопечных заканчивается абонемент или есть неоплаченный долг.
            </span>
          </div>
        </div>
      )}

      {/* 3. АНАЛИТИЧЕСКИЕ ДАШБОРДЫ */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Касса месяца</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold font-mono text-slate-900 tracking-tight">
              {currentMonthlyRevenue.toLocaleString()} ₸
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600">+12% к прошлому</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Активная база</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold font-mono text-slate-900 tracking-tight">
              {activeStudents.length} <span className="text-[11px] text-slate-500 font-medium font-sans">атлетов</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600">+2 новых за месяц</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ГРАФИК НЕДЕЛЬНОЙ НАГРУЗКИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1E60D5]" />
            <h3 className="text-xs font-bold text-slate-900">
              График нагрузки
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedDayFilter === 'all' 
                ? 'bg-[#1E60D5] text-white' 
                : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Все дни
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-2 px-1">
          {daysOfWeek.map((day) => {
            const count = weekLoadStats.counts[day] || 0;
            const isToday = day === currentDayShort;
            const isSelected = selectedDayFilter === day;
            const heightPercent = count === 0 ? 12 : Math.max(20, Math.round((count / weekLoadStats.maxCount) * 100));

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayFilter(day)}
                className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
              >
                <span className={`text-[10px] font-mono font-bold transition-colors ${
                  isSelected ? 'text-[#1E60D5]' : count > 0 ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {count}
                </span>

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

                <div className="flex flex-col items-center">
                  <span className={`text-[10.5px] font-bold ${
                    isSelected ? 'text-[#1E60D5]' : isToday ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {day}
                  </span>
                  {isToday && <span className="w-1 h-1 rounded-full bg-[#1E60D5] mt-0.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ТРЕНИРОВКИ НА СЕГОДНЯ (СПИСОК) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold text-slate-900">
              {selectedDayFilter === 'all' 
                ? 'Все подопечные' 
                : selectedDayFilter === currentDayShort 
                  ? 'Тренировки на сегодня' 
                  : `План на ${selectedDayFilter}`}
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {displayedStudents.length} чел.
          </span>
        </div>

        <div className="divide-y divide-slate-100/80">
          {displayedStudents.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">На этот день тренировок нет</p>
            </div>
          ) : (
            displayedStudents.map((s) => {
              const leftWorkouts = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
              const isDone = Boolean(processedMap[s.id]);
              const isCurrentProcessing = processingId === s.id;
              const badge = getFormatBadge(s);

              return (
                <div key={s.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Левая часть: Имя, теги, время */}
                    <div 
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => onSelectStudent && onSelectStudent(s)}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'A'}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-[13px] font-bold text-slate-900 truncate">
                          {s.full_name || 'Без имени'}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${badge.color}`}>
                            {badge.text}
                          </span>
                          <span>•</span>
                          <span>{s.workout_time_slot ? s.workout_time_slot.split(' ')[0] : 'Вечер'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: Баланс и действия */}
                    <div className="shrink-0 flex items-center gap-2.5">
                      <div className="text-right">
                        <span className={`text-[10px] font-bold block ${leftWorkouts <= 2 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {leftWorkouts} зан.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProgramId(expandedProgramId === s.id ? null : s.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E60D5] flex items-center justify-center transition-colors shadow-2xs"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>

                      {isDone ? (
                        <button
                          type="button"
                          disabled={isCurrentProcessing}
                          onClick={(e) => handleToggleWorkout(e, s)}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isCurrentProcessing}
                          onClick={(e) => handleToggleWorkout(e, s)}
                          className="w-8 h-8 rounded-xl bg-[#1E60D5] hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xs"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Раскрывающийся план */}
                  {expandedProgramId === s.id && renderProgramPreview(s)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. УВЕДОМЛЕНИЯ АТЛЕТАМ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900">Связь с атлетами</span>
        </div>

        {sendSuccessText ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium text-center animate-in fade-in">
            {sendSuccessText}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRemindModal(prev => ({ ...prev, isOpen: true }))}
              className="flex-1 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Напомнить о тренировке
            </button>

            <button
              type="button"
              onClick={() => {
                // В идеале вызывать функцию переключения на вкладку рассылок, 
                // но пока оставим как заглушку, чтобы не усложнять пропсы
                alert('Переход ко всем шаблонам уведомлений');
              }}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-medium transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span>Все рассылки</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения текста рассылки */}
      {remindModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-4 space-y-3 shadow-2xl">
            <h4 className="text-xs font-bold text-slate-900">Текст напоминания</h4>
            <textarea
              rows={3}
              value={remindModal.customMessage}
              onChange={e => setRemindModal(prev => ({ ...prev, customMessage: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none focus:outline-none focus:border-[#1E60D5]"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRemindModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isSendingBatch}
                onClick={handleSendReminder}
                className="flex-1 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить ({displayedStudents.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
