// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Send, 
  Check, 
  X,
  AlertCircle, 
  ClipboardList, 
  UserPlus, 
  ChevronRight, 
  Eye, 
  Dumbbell, 
  Clock, 
  Activity, 
  MessageSquare,
  Star,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Scale
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
  onNavigateToFinance,
  onRefresh 
}) {
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
  const [statusMap, setStatusMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [expandedProgramId, setExpandedProgramId] = useState(null);
  const [activeWorkMode, setActiveWorkMode] = useState('gym'); // 'gym' | 'break' | 'day_off'

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

  // Финансы и ожидающие оплаты (дебиторка)
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

  const unpaidStudents = useMemo(() => {
    return activeStudents.filter(s => s.payment_status === 'pending' || Number(s.left_trainings ?? s.remaining_workouts ?? 0) <= 1);
  }, [activeStudents]);

  const unpaidTotal = useMemo(() => {
    return unpaidStudents.reduce((acc, s) => {
      const price = Number(String(s.monthly_price || 70000).replace(/\D/g, '')) || 70000;
      return acc + price;
    }, 0);
  }, [unpaidStudents]);

  const monthlyRent = Number(trainer?.monthly_rent || 90000);
  const netProfit = Math.max(0, totalRevenue - monthlyRent);

  const weekLoadStats = useMemo(() => {
    const counts = {};
    daysOfWeek.forEach(d => { counts[d] = 0; });

    activeStudents.forEach(s => {
      const sDays = parseDays(s.workout_days);
      daysOfWeek.forEach(d => {
        if (sDays.includes(d)) counts[d] += 1;
      });
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount };
  }, [activeStudents]);

  const todayStudents = useMemo(() => {
    return activeStudents.filter(s => parseDays(s.workout_days).includes(currentDayShort));
  }, [activeStudents, currentDayShort]);

  const todayCompletedCount = useMemo(() => {
    return todayStudents.filter(s => statusMap[s.id] === 'attended').length;
  }, [todayStudents, statusMap]);

  const todayAttendancePercent = todayStudents.length > 0 
    ? Math.round((todayCompletedCount / todayStudents.length) * 100) 
    : 0;

  const getStartTime = (slot) => {
    if (!slot) return '18:00';
    const clean = slot.trim();
    if (clean.includes('-')) return clean.split('-')[0].trim().substring(0, 5);
    if (clean.includes('—')) return clean.split('—')[0].trim().substring(0, 5);
    return clean.substring(0, 5);
  };

  const displayedStudents = useMemo(() => {
    let list = selectedDayFilter === 'all' 
      ? activeStudents 
      : activeStudents.filter(s => parseDays(s.workout_days).includes(selectedDayFilter));
    
    return [...list].sort((a, b) => {
      const timeA = getStartTime(a.workout_time_slot);
      const timeB = getStartTime(b.workout_time_slot);
      return timeA.localeCompare(timeB);
    });
  }, [activeStudents, selectedDayFilter]);

  const handleSetAttendance = async (e, student, newStatus) => {
    e.stopPropagation();
    const prevStatus = statusMap[student.id];
    setProcessingId(student.id);

    const currentLeft = Number(student.left_trainings ?? student.remaining_workouts ?? 12);
    let updatedLeft = currentLeft;

    if (prevStatus !== 'attended' && newStatus === 'attended') {
      updatedLeft = Math.max(0, currentLeft - 1);
    } else if (prevStatus === 'attended' && newStatus !== 'attended') {
      updatedLeft = currentLeft + 1;
    }

    try {
      student.left_trainings = updatedLeft;
      student.remaining_workouts = updatedLeft;

      await supabase
        .from('profiles')
        .update({
          left_trainings: updatedLeft,
          remaining_workouts: updatedLeft
        })
        .eq('id', student.id);

      setStatusMap(prev => ({
        ...prev,
        [student.id]: prev[student.id] === newStatus ? null : newStatus
      }));

      const targetTelegramId = student.telegram_id || student.chat_id;
      if (targetTelegramId) {
        const trainerName = trainer?.full_name || trainer?.first_name || 'Наставник';
        let pushText = '';
        if (newStatus === 'attended') {
          pushText = `✅ <b>Занятие проведено!</b>\n\nСписано: <b>1 занятие</b>.\nОстаток на балансе: <b>${updatedLeft}</b> ${getWorkoutWord(updatedLeft)}.\n\n<i>Тренер: ${escapeHtml(trainerName)}</i>`;
        } else if (newStatus === 'missed') {
          pushText = `⚠️ <b>Пропуск тренировки зафиксирован</b>\n\nТренер отметил отсутствие на запланированном занятии.\nОстаток в блоке: <b>${updatedLeft}</b> ${getWorkoutWord(updatedLeft)}.`;
        }
        if (pushText) sendTelegramMessage(targetTelegramId, pushText).catch(() => {});
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Ошибка фиксации явки:', err);
    } finally {
      setProcessingId(null);
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
      
      {/* 1. ШАПКА: ПОЛНОТЕЛЫЕ УВЕРЕННЫЕ КНОПКИ И ДАТА */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[19px] font-bold font-mono tracking-tight text-slate-900 leading-none">
          {formattedDate}
        </h2>

        <div className="flex items-center gap-2">
          {/* Режим работы тренера */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveWorkMode('gym')}
              className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeWorkMode === 'gym' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              В зале
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkMode('day_off')}
              className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeWorkMode === 'day_off' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Выходной
            </button>
          </div>

          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="h-10 px-4 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
            <span>Пригласить</span>
          </button>
        </div>
      </div>

      {/* 2. ВХОДЯЩИЕ ЛИДЫ И ПРОБНЫЕ ИЗ КАТАЛОГА */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Новые заявки</span>
              <span className="w-2 h-2 rounded-full bg-[#1E60D5]" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              2 запроса на пробное • Азамат, Дана
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPublicProfile && onOpenPublicProfile()}
          className="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          Открыть
        </button>
      </div>

      {/* 3. КОМПАКТНЫЙ ПРОФИЛЬ ТРЕНЕРА СО СТАТИСТИКОЙ */}
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

          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="text-xs font-bold text-slate-900 truncate">
              {trainer?.full_name || trainer?.first_name || 'Персональный наставник'}
            </h3>
            
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{trainer?.profile_views || 148} просмотров</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>5.0</span>
              </span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-[#1E60D5] shrink-0 font-semibold text-xs">
          <span>Визитка</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 4. ФИНАНСЫ И ПОДОПЕЧНЫЕ + ОЖИДАЮТ ОПЛАТЫ */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-xs font-bold text-slate-900">Финансы</span>
            <span className="text-[10.5px] font-medium text-slate-400">Месяц</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10.5px] font-medium text-slate-500 block">Выручка</span>
              <p className="text-[15px] font-mono font-bold text-slate-900 leading-tight">
                {totalRevenue.toLocaleString()} ₸
              </p>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Аренда зала:</span>
              <span className="font-mono font-medium text-slate-700">-{monthlyRent.toLocaleString()} ₸</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-900 font-semibold">Чистый доход:</span>
              <span className="font-mono font-bold text-slate-900">{netProfit.toLocaleString()} ₸</span>
            </div>

            {/* Ожидают оплаты */}
            <div 
              onClick={() => onNavigateToFinance && onNavigateToFinance()}
              className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] cursor-pointer"
            >
              <span className="text-rose-600 font-medium inline-flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-rose-500" />
                <span>Долги:</span>
              </span>
              <span className="font-mono font-bold text-rose-600">
                {unpaidTotal.toLocaleString()} ₸ ({unpaidStudents.length})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-xs font-bold text-slate-900">Подопечные</span>
            <span className="text-[10.5px] font-mono font-bold text-slate-900">{students.length} всего</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10.5px] font-medium text-slate-500 block">Активная база</span>
              <p className="text-[15px] font-mono font-bold text-slate-900 leading-tight">
                {activeStudents.length} <span className="text-xs font-normal text-slate-500 font-sans">атлетов</span>
              </p>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">На паузе:</span>
              <span className="font-mono font-medium text-slate-700">{pausedStudents.length}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">В архиве:</span>
              <span className="font-mono font-medium text-slate-400">{leftStudents.length}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Заканчивают:</span>
              <span className="font-mono font-bold text-amber-600">
                {unpaidStudents.length} атл.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ЭФФЕКТИВНОСТЬ НАСТАВНИКА */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Эффективность наставника
            </h3>
          </div>
          <span className="text-[10.5px] font-medium text-slate-400">За 30 дней</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block truncate">Продления</span>
            <p className="text-sm font-mono font-bold text-slate-900">86%</p>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-[#1E60D5] h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block truncate">Посещаемость</span>
            <p className="text-sm font-mono font-bold text-slate-900">92%</p>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-slate-700 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block truncate">Загрузка графика</span>
            <p className="text-sm font-mono font-bold text-slate-900">74%</p>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div className="bg-slate-500 h-full rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 6. ГРАФИК НЕДЕЛИ */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
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
              className="text-[10.5px] font-semibold text-[#1E60D5] hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
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

      {/* 7. ТРЕНИРОВКИ НА СЕГОДНЯ: ВЕС, PAR-Q, БЫЛ / НЕ БЫЛ */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-slate-600" />
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
            className="text-[11px] font-semibold text-[#1E60D5] hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>В расписание</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedStudents.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <Clock className="w-5 h-5 text-slate-300 mx-auto stroke-[1.5]" />
              <p className="text-xs text-slate-500">На этот день тренировок не запланировано</p>
            </div>
          ) : (
            displayedStudents.map((s) => {
              const currentStatus = statusMap[s.id];
              const isCurrentProcessing = processingId === s.id;
              const startTime = getStartTime(s.workout_time_slot);
              const formatLabel = getFormatLabel(s);
              const hasHealthWarning = Boolean(s.injury_notes || s.parq_notes || s.has_injuries);

              return (
                <div key={s.id} className="p-3.5 space-y-3">
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

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {s.full_name || 'Без имени'}
                          </h4>
                          {hasHealthWarning && (
                            <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-200 text-rose-600 rounded text-[9px] font-bold shrink-0">
                              PAR-Q
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {formatLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E60D5] text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {startTime}
                          </span>
                          {s.current_weight && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-mono inline-flex items-center gap-1">
                              <Scale className="w-2.5 h-2.5 text-slate-400" />
                              {s.current_weight} кг
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>

                  {/* Нижняя панель действий: План + Был + Не был */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedProgramId(expandedProgramId === s.id ? null : s.id)}
                      className={`h-10 px-3.5 rounded-xl text-xs font-semibold border inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        expandedProgramId === s.id 
                          ? 'bg-[#1E60D5] text-white border-[#1E60D5]' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>План</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCurrentProcessing}
                      onClick={(e) => handleSetAttendance(e, s, 'attended')}
                      className={`flex-1 h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer ${
                        currentStatus === 'attended'
                          ? 'bg-[#16A34A] text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200/80'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Был</span>
                    </button>

                    <button
                      type="button"
                      disabled={isCurrentProcessing}
                      onClick={(e) => handleSetAttendance(e, s, 'missed')}
                      className={`h-10 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer ${
                        currentStatus === 'missed'
                          ? 'bg-[#E11D48] text-white shadow-xs'
                          : 'bg-rose-50 hover:bg-rose-100 text-[#E11D48] border border-rose-200/80'
                      }`}
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Не был</span>
                    </button>
                  </div>

                  {expandedProgramId === s.id && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1.5 animate-in fade-in">
                      <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200/60 pb-1">
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

      {/* 8. КОММУНИКАЦИЯ: ПРЯМАЯ ССЫЛКА НА ШАБЛОНЫ И КОМПАКТНАЯ КНОПКА */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-xs font-bold text-slate-900 leading-none">
              Коммуникация
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToBroadcasts && onNavigateToBroadcasts({ filter: 'all_templates' })}
            className="text-[11px] font-semibold text-[#1E60D5] hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>Все шаблоны</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToBroadcasts && onNavigateToBroadcasts({ filter: 'today' })}
          className="w-full h-11 px-4 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4 shrink-0" />
          <span>Напомнить сегодняшней группе</span>
        </button>
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
              Отправьте ссылку атлету. При переходе он автоматически закрепится за вашей CRM в боте @{botUsername}.
            </p>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-700 truncate">{inviteLink}</span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="h-9 px-3.5 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                {copiedLink ? 'Готово' : 'Копировать'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
