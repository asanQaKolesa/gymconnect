// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Send, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  TrendingUp,
  ClipboardList,
  Users,
  UserPlus,
  ArrowRight,
  Wallet,
  Globe,
  Dumbbell,
  Clock,
  UserCheck,
  Building2,
  ChevronRight,
  Percent
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

  // Форматирование даты строго цифрами: 01.10.2026
  const formattedDate = useMemo(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  const currentDayShort = useMemo(() => {
    const map = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return map[new Date().getDay()];
  }, []);

  const [selectedDayFilter, setSelectedDayFilter] = useState(currentDayShort);
  const [processedMap, setProcessedMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [expandedProgramId, setExpandedProgramId] = useState(null);

  // Модалка рассылки / напоминаний
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    customMessage: 'Привет! Напоминаю о сегодняшней тренировке по графику. Жду в зале вовремя! 💪'
  });
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendSuccessText, setSendSuccessText] = useState(null);

  // Модалка приглашения атлета (диплинк)
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

  // Категоризация базы клиентов: активные, на паузе, ушедшие
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

  // Финансы: общая выручка, аренда (расходы), чистая прибыль
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

  // Статистика заполняемости и посещаемости за сегодня
  const todayTotalScheduled = activeStudents.filter(s => parseDays(s.workout_days).includes(currentDayShort)).length;
  const todayVisitedCount = Object.keys(processedMap).filter(id => processedMap[id]).length;
  const todayAttendancePercent = todayTotalScheduled > 0 ? Math.min(100, Math.round((todayVisitedCount / Math.max(1, todayTotalScheduled)) * 100)) : 75;

  // Сортировка тренировок на сегодня по времени (ближайшие сверху)
  const displayedStudents = useMemo(() => {
    let list = selectedDayFilter === 'all' ? activeStudents : activeStudents.filter(s => parseDays(s.workout_days).includes(selectedDayFilter));
    
    // Сортируем по времени (сначала те, у кого время ближе к текущему)
    return [...list].sort((a, b) => {
      const timeA = (a.workout_time_slot || '18:00').substring(0, 5);
      const timeB = (b.workout_time_slot || '18:00').substring(0, 5);
      return timeA.localeCompare(timeB);
    });
  }, [activeStudents, selectedDayFilter, currentDayShort]);

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
        const trainerName = trainer?.full_name || trainer?.first_name || 'Наставник';
        const pushText = !isDone
          ? `✅ <b>Занятие подтверждено!</b>\n\nСписано: <b>1 занятие</b>.\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.\n\n<i>Тренер: ${escapeHtml(trainerName)} 💪</i>`
          : `↩️ <b>Отметка отменена!</b>\n\nЗанятие возвращено на баланс (+1).\nОстаток в блоке: <b>${newLeft}</b> ${getWorkoutWord(newLeft)}.`;

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
        <div className="mt-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-center text-slate-400">
          План тренировки пока не назначен
        </div>
      );
    }
    
    const firstDayKey = Object.keys(prog.days)[0];
    const dayData = prog.days[firstDayKey];
    
    if (!dayData) return null;
    
    return (
      <div className="mt-2.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/60 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
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
      
      {/* 1. ШАПКА: ТОЛЬКО ДАТА И КНОПКА ПРИГЛАСИТЬ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight font-mono">
            {formattedDate}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Панель управления тренера
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="px-3.5 py-2 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Пригласить атлета</span>
        </button>
      </div>

      {/* 2. ПЛАШКА ПУБЛИЧНОЙ ВИЗИТКИ ТРЕНЕРА */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {trainer?.avatar_url ? (
              <img src={trainer.avatar_url} alt="Тренер" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-700">
                {trainer?.full_name ? trainer.full_name.charAt(0).toUpperCase() : 'Т'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {trainer?.full_name || trainer?.first_name || 'Персональный тренер'}
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {trainer?.club_name || 'Invictus / Fidelity (Алматы)'} • Стаж {trainer?.experience_years || 5} лет
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold">
            Публичный профиль
          </span>
        </div>
      </div>

      {/* 3. СМАРТ-ФОКУС */}
      {urgentAlerts.length > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-amber-900 block mb-0.5">
              Внимание по абонементам:
            </span>
            <span className="text-[11px] text-amber-800">
              У {urgentAlerts.length} подопечных заканчиваются занятия или требуется продление.
            </span>
          </div>
        </div>
      )}

      {/* 4. БЛОК 6 ДИАГРАММ (ФИНАНСЫ И БАЗА КЛИЕНТОВ) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Выручка */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">Общая выручка</span>
          <p className="text-[13px] font-bold font-mono text-slate-900 truncate">{totalRevenue.toLocaleString()} ₸</p>
          <div className="w-full bg-emerald-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Расходы */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">Расходы (аренда)</span>
          <p className="text-[13px] font-bold font-mono text-rose-600 truncate">{monthlyRent.toLocaleString()} ₸</p>
          <div className="w-full bg-rose-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (monthlyRent / Math.max(1, totalRevenue)) * 100)}%` }} />
          </div>
        </div>

        {/* Чистая прибыль */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">Чистая прибыль</span>
          <p className="text-[13px] font-bold font-mono text-emerald-600 truncate">{netProfit.toLocaleString()} ₸</p>
          <div className="w-full bg-emerald-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.max(10, Math.round((netProfit / Math.max(1, totalRevenue)) * 100))}%` }} />
          </div>
        </div>

        {/* Активная база */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">Активная база</span>
          <p className="text-[13px] font-bold font-mono text-blue-600">{activeStudents.length} <span className="text-[10px] font-sans font-normal text-slate-500">атл.</span></p>
          <div className="w-full bg-blue-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* На паузе */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">На паузе</span>
          <p className="text-[13px] font-bold font-mono text-amber-600">{pausedStudents.length} <span className="text-[10px] font-sans font-normal text-slate-500">атл.</span></p>
          <div className="w-full bg-amber-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.max(15, (pausedStudents.length / Math.max(1, students.length)) * 100)}%` }} />
          </div>
        </div>

        {/* Ушедшая база */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-medium text-slate-500 block truncate">Ушедшая база</span>
          <p className="text-[13px] font-bold font-mono text-slate-400">{leftStudents.length} <span className="text-[10px] font-sans font-normal text-slate-500">атл.</span></p>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
            <div className="bg-slate-400 h-full rounded-full" style={{ width: `${Math.max(10, (leftStudents.length / Math.max(1, students.length)) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 5. КОМПАКТНЫЙ ГРАФИК НАГРУЗКИ С ПРОЦЕНТАЖЕМ */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">
              Заполняемость недели ({todayAttendancePercent}% сегодня)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
              selectedDayFilter === 'all' 
                ? 'bg-[#1E60D5] text-white' 
                : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Все дни
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 items-end h-20 pt-1">
          {daysOfWeek.map((day) => {
            const count = weekLoadStats.counts[day] || 0;
            const isToday = day === currentDayShort;
            const isSelected = selectedDayFilter === day;
            const heightPercent = count === 0 ? 15 : Math.max(25, Math.round((count / weekLoadStats.maxCount) * 100));

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayFilter(day)}
                className="flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
              >
                <span className={`text-[9.5px] font-mono font-bold transition-colors ${
                  isSelected ? 'text-[#1E60D5]' : count > 0 ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {count}
                </span>

                <div className="w-full max-w-[28px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end p-0.5 transition-all group-hover:bg-slate-200">
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isSelected 
                        ? 'bg-[#1E60D5]' 
                        : isToday 
                          ? 'bg-emerald-500' 
                          : count > 0 
                            ? 'bg-slate-300' 
                            : 'bg-slate-200/50'
                    }`}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-bold ${
                    isSelected ? 'text-[#1E60D5]' : isToday ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. ТРЕНИРОВКИ НА СЕГОДНЯ (СОРТИРОВКА ПО ВРЕМЕНИ, С ФОТОГРАФИЯМИ И ОТМЕТКАМИ) */}
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
            {displayedStudents.length} атл.
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
              const exactTime = s.workout_time_slot ? s.workout_time_slot.substring(0, 5) : '18:00';

              return (
                <div key={s.id} className="p-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Левая часть: Фото/аватарка атлета, имя, теги, точное время */}
                    <div 
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => onSelectStudent && onSelectStudent(s)}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {s.avatar_url ? (
                          <img src={s.avatar_url} alt="Атлет" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700">
                            {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'A'}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-[13px] font-bold text-slate-900 truncate">
                          {s.full_name || 'Без имени'}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${badge.color}`}>
                            {badge.text}
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-800">
                            {exactTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: План тренировки и отметка о присутствии */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProgramId(expandedProgramId === s.id ? null : s.id);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs ${
                          expandedProgramId === s.id 
                            ? 'bg-[#1E60D5] text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-[#1E60D5]'
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
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Был на занятии</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isCurrentProcessing}
                          onClick={(e) => handleToggleWorkout(e, s)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Отметить явку</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Раскрывающийся микро-план тренировки */}
                  {expandedProgramId === s.id && renderProgramPreview(s)}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 7. СВЯЗЬ С АТЛЕТАМИ И УПРАВЛЕНИЕ РАССЫЛКАМИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900">Связь с атлетами</span>
        </div>

        {sendSuccessText ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium text-center animate-in fade-in">
            {sendSuccessText}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRemindModal(prev => ({ ...prev, isOpen: true }))}
              className="py-3 px-3 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 text-center"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Напомнить о тренировке</span>
            </button>

            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="py-3 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 text-center"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
              <span className="truncate">Ссылка для атлетов</span>
            </button>
          </div>
        )}
      </div>

      {/* МОДАЛКА ПРИГЛАШЕНИЯ АТЛЕТА (ДИПЛИНК) */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Пригласить подопечного</h3>
              <button 
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Закрыть
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Отправьте эту индивидуальную ссылку вашему атлету в WhatsApp или Telegram. После перехода он автоматически закрепится за вашей CRM в боте @{botUsername}.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-700 truncate">{inviteLink}</span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="px-3 py-1.5 bg-[#1E60D5] text-white rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all"
              >
                {copiedLink ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО РАССЫЛКИ НАПОМИНАНИЙ */}
      {remindModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-3 shadow-2xl">
            <h4 className="text-xs font-bold text-slate-900">Текст напоминания для группы ({displayedStudents.length} чел.)</h4>
            <textarea
              rows={3}
              value={remindModal.customMessage}
              onChange={e => setRemindModal(prev => ({ ...prev, customMessage: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 resize-none focus:outline-none focus:border-[#1E60D5]"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRemindModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isSendingBatch}
                onClick={handleSendReminder}
                className="flex-1 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить всем</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
