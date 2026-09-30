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
  TrendingUp,
  Copy,
  ClipboardList,
  MessageCircle,
  MoreHorizontal
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
  const [expandedProgramId, setExpandedProgramId] = useState(null);

  // Модалка быстрых сценариев Telegram
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    view: 'menu', // 'menu' | 'compose'
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

  const handleCopyInvite = () => {
    const cleanUsername = trainer?.username ? trainer.username.replace('@', '') : 'coach';
    const link = `https://t.me/gymconnect_ala_bot?start=coach_${cleanUsername}`;
    navigator.clipboard.writeText(link);
    setSendSuccessText('Ссылка-приглашение скопирована!');
    setTimeout(() => setSendSuccessText(null), 2000);
  };

  const getFormatBadge = (s) => {
    const f = (s.training_format || s.package_type || 'coach_gym').toLowerCase();
    if (f.includes('online')) return { text: 'Онлайн', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
    if (f.includes('split')) return { text: 'Сплит', color: 'bg-purple-50 text-purple-700 border-purple-100' };
    if (f.includes('group')) return { text: 'Мини-группа', color: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { text: 'Индивидуально', color: 'bg-blue-50 text-[#1E60D5] border-blue-100' };
  };

  const renderProgramPreview = (student) => {
    const prog = student.assigned_program;
    if (!prog || !prog.days) {
      return (
        <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-center text-slate-400">
          Программа пока не назначена
        </div>
      );
    }
    
    // Берем первый доступный день для превью
    const firstDayKey = Object.keys(prog.days)[0];
    const dayData = prog.days[firstDayKey];
    
    if (!dayData) return null;
    
    return (
      <div className="mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
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

        <button
          type="button"
          onClick={handleCopyInvite}
          className="px-3 py-1.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl shadow-xs text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Пригласить</span>
        </button>
      </div>

      {sendSuccessText && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center animate-in fade-in">
          {sendSuccessText}
        </div>
      )}

      {/* 2. АНАЛИТИЧЕСКИЙ БЛОК: КАССА + АКТИВНАЯ БАЗА */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Карточка 1: Финансовый прогресс */}
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
            {/* Имитация тренда */}
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9.5px] font-bold text-emerald-600">+12% к прошлому</span>
            </div>
          </div>
        </div>

        {/* Карточка 2: Активная база */}
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Активная база</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <p className="text-base font-bold font-mono text-slate-900 tracking-tight">
              {activeStudents.length} <span className="text-[10px] text-slate-400 font-normal font-sans">атлетов</span>
            </p>
            {/* Имитация тренда */}
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9.5px] font-bold text-emerald-600">+2 атлета за месяц</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. ИНТЕРАКТИВНЫЙ ГРАФИК НЕДЕЛЬНОЙ НАГРУЗКИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1E60D5]" />
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
            Вся база
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

      {/* 4. РАСПИСАНИЕ НА ВЫБРАННЫЙ ДЕНЬ С НУМЕРАЦИЕЙ И ПРОГРАММОЙ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Шапка списка */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {selectedDayFilter === 'all' 
                  ? 'Вся активная база' 
                  : selectedDayFilter === currentDayShort 
                    ? 'Кто сегодня придет' 
                    : `Запланировано на ${selectedDayFilter}`}
              </h3>
              <p className="text-[10px] text-slate-400">
                {displayedStudents.length} атлетов в расписании
              </p>
            </div>
          </div>
        </div>

        {/* Список карточек учеников */}
        <div className="divide-y divide-slate-100">
          {displayedStudents.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Нет записей на этот день</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Выберите другой день в графике выше или нажмите «Вся база».
              </p>
            </div>
          ) : (
            displayedStudents.map((s, idx) => {
              const leftWorkouts = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
              const isDone = Boolean(processedMap[s.id]);
              const isCurrentProcessing = processingId === s.id;
              const badge = getFormatBadge(s);

              return (
                <div key={s.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    
                    {/* Левая часть: номер, имя, бейдж формата */}
                    <div 
                      className="flex items-start gap-2.5 min-w-0 flex-1 cursor-pointer"
                      onClick={() => onSelectStudent && onSelectStudent(s)}
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {s.full_name || 'Без имени'}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge.color} whitespace-nowrap`}>
                            {badge.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-700">
                            {leftWorkouts} зан.
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[100px]">
                            {s.workout_time_slot ? s.workout_time_slot.split(' ')[0] : 'Вечер'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: кнопки действий */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {isDone ? (
                        <button
                          type="button"
                          disabled={isCurrentProcessing}
                          onClick={(e) => handleToggleWorkout(e, s)}
                          className="py-1.5 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-[10px] font-bold border border-slate-200/80 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                          <span>Вернуть</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isCurrentProcessing}
                          onClick={(e) => handleToggleWorkout(e, s)}
                          className="py-1.5 px-3 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-xs"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Проведено</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProgramId(expandedProgramId === s.id ? null : s.id);
                        }}
                        className="text-[10px] font-bold text-[#1E60D5] flex items-center gap-1 p-1"
                      >
                        <ClipboardList className="w-3 h-3" />
                        <span>План</span>
                      </button>
                    </div>

                  </div>

                  {/* Раскрывающийся план тренировки */}
                  {expandedProgramId === s.id && renderProgramPreview(s)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. УВЕДОМЛЕНИЯ И СВЯЗЬ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-[#1E60D5]" />
            <span>Уведомления и связь</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">Telegram Bot</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRemindModal({
              isOpen: true,
              view: 'compose',
              title: 'Напоминание о тренировке',
              customMessage: 'Привет! Напоминаю о сегодняшней тренировке по графику. Жду в зале вовремя! 💪',
              selectedIds: displayedStudents.map(s => s.id)
            })}
            className="p-3 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-center transition-all cursor-pointer shadow-sm shadow-blue-600/25 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">О тренировке</span>
          </button>

          <button
            type="button"
            onClick={() => setRemindModal({ isOpen: true, view: 'menu', selectedIds: [], customMessage: '', title: '' })}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-center transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 text-slate-700"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-xs font-bold">Другие сценарии</span>
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ПАКЕТНОЙ ОТПРАВКИ СООБЩЕНИЙ */}
      {remindModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-4 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900">
                {remindModal.view === 'menu' ? 'Другие уведомления' : remindModal.title}
              </h4>
              <button
                type="button"
                onClick={() => setRemindModal(prev => ({ ...prev, isOpen: false }))}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {remindModal.view === 'menu' ? (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRemindModal(prev => ({
                    ...prev,
                    view: 'compose',
                    title: 'Продление абонемента',
                    customMessage: 'Привет! Твой текущий блок тренировок подходит к концу. Давай запланируем продление, чтобы сохранить за тобой удобное время!',
                    selectedIds: activeStudents.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 0) <= 2).map(s => s.id)
                  }))}
                  className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11.5px] font-bold text-amber-950">Напомнить об оплате</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Ученикам с остатком ≤ 2 зан.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setRemindModal(prev => ({
                    ...prev,
                    view: 'compose',
                    title: 'Возврат к тренировкам',
                    customMessage: 'Привет! Давно не виделись в зале. Всё в порядке? Давай согласуем день и продолжим тренировочный режим!',
                    selectedIds: activeStudents.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 0) === 0).map(s => s.id)
                  }))}
                  className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11.5px] font-bold text-rose-950">Вернуть в зал</p>
                    <p className="text-[10px] text-rose-700 mt-0.5">Тем, у кого закончился абонемент</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setRemindModal(prev => ({
                    ...prev,
                    view: 'compose',
                    title: 'Своё сообщение',
                    customMessage: '',
                    selectedIds: []
                  }))}
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11.5px] font-bold text-slate-900">Написать свое сообщение</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ручной выбор текста и получателей</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ) : (
              <>
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

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRemindModal(prev => ({ ...prev, view: 'menu' }))}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
                      >
                        Назад
                      </button>
                      <button
                        type="button"
                        disabled={isSendingBatch || remindModal.selectedIds.length === 0}
                        onClick={handleSendBatch}
                        className="flex-1 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingBatch ? 'Отправка...' : `Отправить (${remindModal.selectedIds.length})`}</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
