// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Send, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  ClipboardList,
  UserPlus,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Dumbbell,
  Clock,
  Activity,
  Plus,
  MessageSquare
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
  onOpenPublicProfile,
  onNavigateToCalendar,
  onNavigateToBroadcasts,
  onOpenAddScheduleModal,
  onRefresh 
}) {
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Форматирование даты: строго цифрами, крупно и аккуратно
  const formattedDate = useMemo(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  const currentDayName = useMemo(() => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[new Date().getDay()];
  }, []);

  const currentDayShort = useMemo(() => {
    const map = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return map[new Date().getDay()];
  }, []);

  const [selectedDayFilter, setSelectedDayFilter] = useState(currentDayShort);
  const [processedMap, setProcessedMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [expandedProgramId, setExpandedProgramId] = useState(null);

  // Модалка рассылки
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    customMessage: 'Привет! Напоминаю о сегодняшней тренировке по графику. Жду в зале вовремя! 💪'
  });
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendSuccessText, setSendSuccessText] = useState(null);

  // Модалка диплинка приглашения атлета
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const botUsername = 'gymconnect_ala_bot'; 
  const inviteLink = `https://t.me/${botUsername}?start=trainer_${trainer?.id || 'ref'}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

  // Сегментация базы подопечных
  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const st = (s.status || '').toLowerCase().trim();
      return st !== 'left' && st !== 'archived' && st !== 'paused';
    });
  }, [students]);

  const pausedStudents = useMemo(() => {
    return students.filter(s => (s.status || '').toLowerCase().trim() === 'paused');
  }, [students]);

  const leftStudents = useMemo(() => {
    return students.filter(s => {
      const st = (s.status || '').toLowerCase().trim();
      return st === 'left' || st === 'archived';
    });
  }, [students]);

  // Финансы: выручка, аренда зала, чистый доход
  const totalRevenue = useMemo(() => {
    return activeStudents.reduce((acc, s) => {
      let price = 70000;
      if (s.monthly_price !== undefined && s.monthly_price !== null && String(s.monthly_price).trim() !== '' && String(s.monthly_price).trim() !== 'null') {
        const parsed = Number(String(s.monthly_price).replace(/\D/g, ''));
        if (Number.isFinite(parsed) && parsed > 0) price = parsed;
      }
      return acc + price;
    }, 0);
  }, [activeStudents]);

  const monthlyRent = Number(trainer?.monthly_rent || 90000);
  const netProfit = Math.max(0, totalRevenue - monthlyRent);

  // Нагрузка недели
  const weekLoadStats = useMemo(() => {
    const counts = {};
    daysOfWeek.forEach(d => counts[d] = 0);

    activeStudents.forEach(s => {
      const sDays = parseDays(s.workout_days);
      daysOfWeek.forEach(d => {
        if (sDays.includes(d)) counts[d] += 1;
      });
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount };
  }, [activeStudents]);

  // Явка за сегодня
  const todayStudents = useMemo(() => {
    return activeStudents.filter(s => parseDays(s.workout_days).includes(currentDayShort));
  }, [activeStudents, currentDayShort]);

  const todayCompletedCount = useMemo(() => {
    return todayStudents.filter(s => processedMap[s.id]).length;
  }, [todayStudents, processedMap]);

  const todayAttendancePercent = todayStudents.length > 0 
    ? Math.round((todayCompletedCount / todayStudents.length) * 100) 
    : 0;

  // Сортировка тренировок строго по времени
  const displayedStudents = useMemo(() => {
    let list = selectedDayFilter === 'all' 
      ? activeStudents 
      : activeStudents.filter(s => parseDays(s.workout_days).includes(selectedDayFilter));
    
    return [...list].sort((a, b) => {
      const timeA = (a.workout_time_slot || '18:00').substring(0, 5);
      const timeB = (b.workout_time_slot || '18:00').substring(0, 5);
      return timeA.localeCompare(timeB);
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
    const isDone = Boolean(processedMap[s.id]);
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
        const trainerName = trainer?.full_name || trainer?.first_name || 'Наставник';
        const pushText = !isDone
          ? `✅ <b>Занятие проведено!</b>\n\nСписано: <b>1 занятие</b>.\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.\n\n<i>Тренер: ${escapeHtml(trainerName)}</i>`
          : `↩️️ <b>Списание занятия отменено</b>\n\nЗанятие возвращено на баланс (+1).\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.`;

        sendTelegramMessage(targetTelegramId, pushText).catch(() => {});
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Ошибка списания занятия:', err);
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

      setSendSuccessText(`Напоминание отправлено: ${count}`);
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

  const getFormatLabel = (s) => {
    const f = (s.training_format || s.package_type || 'coach_gym').toLowerCase();
    if (f.includes('online')) return 'Онлайн';
    if (f.includes('split')) return 'Сплит';
    if (f.includes('group')) return 'Мини-группа';
    return 'Индивидуально';
  };

  return (
    <div className="space-y-3.5 pb-28 select-none">
      
      {/* 1. ШАПКА: ЧИСТАЯ КРУПНАЯ ДАТА + ПАРНЫЕ САПФИРОВЫЕ КНОПКИ */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold font-mono tracking-tight text-slate-900 leading-none">
              {formattedDate}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              {currentDayName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAddScheduleModal ? onOpenAddScheduleModal() : onNavigateToCalendar && onNavigateToCalendar()}
            className="h-9 px-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 active:scale-95 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            title="Добавить слот"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Слот</span>
          </button>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="h-9 px-3 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Пригласить</span>
          </button>
        </div>
      </div>

      {/* 2. ПУБЛИЧНАЯ ВИЗИТКА ТРЕНЕРА */}
      <div 
        onClick={() => onOpenPublicProfile && onOpenPublicProfile()}
        className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
            {trainer?.avatar_url ? (
              <img src={trainer.avatar_url} alt="Аватар тренера" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-700">
                {trainer?.full_name ? trainer.full_name.charAt(0).toUpperCase() : 'Т'}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {trainer?.full_name || trainer?.first_name || 'Персональный наставник'}
            </h3>
            
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 truncate">
              <span className="truncate">{trainer?.club_name || 'Фитнес-клуб (Алматы)'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 shrink-0 text-slate-700 font-medium">
                <Eye className="w-3 h-3 text-slate-400" />
                <span>{trainer?.profile_views || 148} просмотров</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#1E60D5] shrink-0 font-semibold text-[11px]">
          <span>Визитка</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 3. ОПЕРАТИВНОЕ ПРЕДУПРЕЖДЕНИЕ */}
      {urgentAlerts.length > 0 && (
        <div className="p-3 bg-white border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 leading-snug">
            <span className="font-bold text-slate-900 block">
              Внимание по подопечным
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              У {urgentAlerts.length} атлетов заканчивается блок занятий или требуется оплата.
            </span>
          </div>
        </div>
      )}

      {/* 4. ФИНАНСЫ И ПОДОПЕЧНЫЕ (МОНОХРОМНАЯ СЕТКА 2 КОЛОНКИ) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">Финансы</span>
            <span className="text-[10px] font-medium text-slate-400">Месяц</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10.5px] text-slate-500 block">Общая выручка</span>
              <p className="text-[15px] font-mono font-bold text-slate-900">
                {totalRevenue.toLocaleString()} ₸
              </p>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Аренда зала:</span>
              <span className="font-mono font-medium text-slate-700">-{monthlyRent.toLocaleString()} ₸</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-900 font-semibold">Чистый доход:</span>
              <span className="font-mono font-bold text-slate-900">{netProfit.toLocaleString()} ₸</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">Подопечные</span>
            <span className="text-[10px] font-mono font-bold text-slate-900">{students.length} всего</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10.5px] text-slate-500 block">Активная база</span>
              <p className="text-[15px] font-mono font-bold text-slate-900">
                {activeStudents.length} <span className="text-xs font-normal text-slate-500">атлетов</span>
              </p>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">На паузе:</span>
              <span className="font-mono font-medium text-slate-700">{pausedStudents.length}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">В архиве:</span>
              <span className="font-mono font-medium text-slate-400">{leftStudents.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. НОВАЯ ДИАГРАММА ЭФФЕКТИВНОСТИ И РЕТЕНШНА (KPI НАСТАВНИКА) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#1E60D5]" />
            <h3 className="text-xs font-bold text-slate-900">
              Эффективность наставника
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">Текущий цикл</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 block truncate">Ретеншн базы</span>
            <p className="text-sm font-mono font-bold text-slate-900">86%</p>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-[#1E60D5] h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 block truncate">Явка атлетов</span>
            <p className="text-sm font-mono font-bold text-slate-900">92%</p>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-slate-700 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 block truncate">Пиковый слот</span>
            <p className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5">18:00–21:00</p>
            <span className="text-[9px] text-slate-400 block truncate">Основная плотность</span>
          </div>
        </div>
      </div>

      {/* 6. ГРАФИК НАГРУЗКИ НЕДЕЛИ */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900">
              График недели
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {todayStudents.length > 0 && (
              <span className="text-[10.5px] font-medium text-slate-500">
                Явка: {todayAttendancePercent}% ({todayCompletedCount}/{todayStudents.length})
              </span>
            )}
            <button
              type="button"
              onClick={() => onNavigateToCalendar ? onNavigateToCalendar() : setSelectedDayFilter('all')}
              className="text-[10.5px] font-semibold text-[#1E60D5] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Все дни</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 items-end h-16 pt-1">
          {daysOfWeek.map((day) => {
            const count = weekLoadStats.counts[day] || 0;
            const isToday = day === currentDayShort;
            const isSelected = selectedDayFilter === day;
            const heightPercent = count === 0 ? 12 : Math.max(22, Math.round((count / weekLoadStats.maxCount) * 100));

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayFilter(day)}
                className="flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
              >
                <span className={`text-[9px] font-mono font-bold ${
                  isSelected ? 'text-[#1E60D5]' : count > 0 ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {count}
                </span>

                <div className="w-full max-w-[26px] bg-slate-100 rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-md transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#1E60D5]' 
                        : isToday 
                          ? 'bg-blue-300' 
                          : count > 0 
                            ? 'bg-slate-300' 
                            : 'bg-slate-200/50'
                    }`}
                  />
                </div>

                <span className={`text-[9.5px] font-semibold ${
                  isSelected ? 'text-[#1E60D5]' : isToday ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. ТРЕНИРОВКИ НА СЕГОДНЯ (С ИКОНКОЙ И ПЕРЕХОДОМ В РАСПИСАНИЕ) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-[#1E60D5]" />
            <h3 className="text-xs font-bold text-slate-900">
              {selectedDayFilter === 'all' 
                ? 'Все подопечные' 
                : selectedDayFilter === currentDayShort 
                  ? 'Тренировки на сегодня' 
                  : `План на ${selectedDayFilter}`}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">({displayedStudents.length})</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToCalendar && onNavigateToCalendar()}
            className="text-[11px] font-semibold text-[#1E60D5] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
          >
            <span>В расписание</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedStudents.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Clock className="w-6 h-6 text-slate-300 mx-auto stroke-[1.5]" />
              <p className="text-xs text-slate-500">На этот день тренировок не запланировано</p>
            </div>
          ) : (
            displayedStudents.map((s) => {
              const leftWorkouts = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
              const isDone = Boolean(processedMap[s.id]);
              const isCurrentProcessing = processingId === s.id;
              const exactTime = s.workout_time_slot ? s.workout_time_slot.substring(0, 5) : '18:00';
              const formatLabel = getFormatLabel(s);

              return (
                <div key={s.id} className="p-3.5 space-y-2.5">
                  <div 
                    onClick={() => onSelectStudent && onSelectStudent(s)}
                    className="flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {s.avatar_url ? (
                          <img src={s.avatar_url} alt="Атлет" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700">
                            {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'A'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {s.full_name || 'Без имени'}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            Остаток: {leftWorkouts}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="truncate">{formatLabel}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-800 shrink-0">
                            {exactTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>

                  {/* Кнопки управления: синий активный Sapphire */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setExpandedProgramId(expandedProgramId === s.id ? null : s.id)}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        expandedProgramId === s.id 
                          ? 'bg-[#1E60D5] text-white border-[#1E60D5]' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>План тренировки</span>
                    </button>

                    {isDone ? (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Отменить явку</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="flex-1 h-9 rounded-xl bg-[#1E60D5] hover:bg-blue-600 active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Был на занятии</span>
                      </button>
                    )}
                  </div>

                  {expandedProgramId === s.id && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-2 animate-in fade-in">
                      <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                        <span>{s.assigned_program?.days?.[Object.keys(s.assigned_program?.days || {})[0]]?.title || 'Программа'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {s.assigned_program?.days?.[Object.keys(s.assigned_program?.days || {})[0]]?.exercises?.length || 0} упр.
                        </span>
                      </div>
                      <div className="space-y-1">
                        {(s.assigned_program?.days?.[Object.keys(s.assigned_program?.days || {})[0]]?.exercises || []).map((ex, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px] text-slate-600">
                            <span className="truncate pr-2">{i + 1}. {ex.name}</span>
                            <span className="font-mono shrink-0">{ex.sets}x{ex.reps} • {ex.weight}кг</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 8. СВЯЗЬ С АТЛЕТАМИ: ИКОНКА СЕКЦИИ И САПФИРОВАЯ КНОПКА */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#1E60D5]" />
          <span className="text-xs font-bold text-slate-900 block">
            Коммуникация
          </span>
        </div>

        {sendSuccessText ? (
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800 text-xs font-medium text-center">
            {sendSuccessText}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRemindModal(prev => ({ ...prev, isOpen: true }))}
              className="flex-1 h-10 px-3 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Напомнить о тренировке</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToBroadcasts && onNavigateToBroadcasts()}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 active:scale-95 text-slate-700 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs"
              title="Все шаблоны и рассылки"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {/* МОДАЛКА ПРИГЛАШЕНИЯ АТЛЕТА */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-md p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Ссылка для подопечного</h3>
              <button 
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Закрыть
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Отправьте ссылку атлету. При переходе он автоматически свяжется с вашей CRM в боте @{botUsername}.
            </p>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-700 truncate">{inviteLink}</span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="px-3 py-1 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                {copiedLink ? 'Готово' : 'Копировать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА НАПОМИНАНИЯ */}
      {remindModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 w-full max-w-md p-4 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-900">
              Напоминание для группы ({displayedStudents.length} атл.)
            </h4>
            <textarea
              rows={3}
              value={remindModal.customMessage}
              onChange={e => setRemindModal(prev => ({ ...prev, customMessage: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none focus:outline-none focus:border-[#1E60D5]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRemindModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isSendingBatch}
                onClick={handleSendReminder}
                className="flex-1 py-2 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
