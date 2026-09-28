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
  Filter, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendStudentNotification } from '../../../utils/telegramNotifications';

export default function OverviewTab({ 
  trainer, 
  students = [], 
  onSelectStudent, 
  onOpenNotifications,
  onRefresh
}) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО В НАЧАЛЕ)
  const [scheduleFilter, setScheduleFilter] = useState('today'); // 'today' | 'all'
  const [processedMap, setProcessedMap] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Модалка центра напоминаний
  const [remindModal, setRemindModal] = useState({
    isOpen: false,
    type: null, // 'workout' | 'payment' | 'absent'
    title: '',
    selectedIds: [],
    customMessage: '',
    searchQuery: ''
  });
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendSuccessText, setSendSuccessText] = useState(null);

  // Текущий день недели
  const currentDayShort = useMemo(() => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[new Date().getDay()];
  }, []);

  // Вспомогательный парсер дней тренировок
  const parseStudentDays = (raw) => {
    if (Array.isArray(raw) && raw.length > 0) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        if (raw.includes(',')) return raw.split(',').map(s => s.trim());
      }
    }
    return ['Пн', 'Ср', 'Пт'];
  };

  // Проверка активности подопечного
  const isStudentActive = (s) => {
    const status = (s.status || '').toLowerCase().trim();
    return status !== 'left' && status !== 'archived';
  };

  // Активные подопечные
  const activeStudents = useMemo(() => {
    return students.filter(isStudentActive);
  }, [students]);

  // Подопечные на сегодня
  const todayStudents = useMemo(() => {
    return activeStudents.filter(s => {
      const days = parseStudentDays(s.workout_days);
      return days.includes(currentDayShort);
    });
  }, [activeStudents, currentDayShort]);

  // Итоговый список для расписания
  const displayedSchedule = scheduleFilter === 'today' ? todayStudents : activeStudents;

  // Расчет кассы и долгов с защитой от null
  const monthlyRevenue = useMemo(() => {
    return activeStudents.reduce((acc, s) => {
      let price = 70000;
      if (s.monthly_price !== undefined && s.monthly_price !== null && String(s.monthly_price).trim() !== '' && String(s.monthly_price).trim() !== 'null') {
        const parsed = Number(String(s.monthly_price).replace(/\D/g, ''));
        if (Number.isFinite(parsed) && parsed > 0) price = parsed;
      }
      return acc + price;
    }, 0);
  }, [activeStudents]);

  const debtCount = useMemo(() => {
    return students.filter(s => {
      const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
      return isStudentActive(s) && (s.payment_status === 'pending' || left <= 1);
    }).length;
  }, [students]);

  // Списание / возврат занятия в 1 клик
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

      setProcessedMap(prev => ({
        ...prev,
        [s.id]: !isDone
      }));

      if (!isDone) {
        sendStudentNotification({
          studentTelegramId: s.telegram_id,
          studentUsername: s.username,
          studentId: s.id,
          title: 'Тренировка зачтена',
          message: `Тренер провел тренировку! Списано 1 занятие. Ваш остаток: ${newLeft} зан.`
        }).catch(() => {});
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Ошибка списания занятия:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Открытие диалога напоминаний
  const openRemindDialog = (type) => {
    let title = '';
    let defaultMsg = '';
    let targetStudents = [];

    if (type === 'workout') {
      title = 'Напоминание о тренировке';
      defaultMsg = 'Привет! Жду тебя сегодня на тренировке по графику. Не опаздывай!';
      targetStudents = displayedSchedule.length > 0 ? displayedSchedule : activeStudents;
    } else if (type === 'payment') {
      title = 'Напоминание об оплате';
      defaultMsg = 'Привет! Твой блок тренировок подходит к концу. Продли абонемент, чтобы не сбивать тренировочный темп.';
      targetStudents = activeStudents.filter(s => {
        const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
        return s.payment_status === 'pending' || left <= 2;
      });
      if (targetStudents.length === 0) targetStudents = activeStudents;
    } else {
      title = 'Вернуть в зал';
      defaultMsg = 'Привет! Давно не виделись на тренировках. Все в порядке? Давай выберем день и продолжим!';
      targetStudents = activeStudents.filter(s => {
        const left = Number(s.left_trainings ?? s.remaining_workouts ?? 0);
        return left <= 0;
      });
      if (targetStudents.length === 0) targetStudents = activeStudents;
    }

    setRemindModal({
      isOpen: true,
      type,
      title,
      selectedIds: targetStudents.map(s => s.id),
      customMessage: defaultMsg,
      searchQuery: ''
    });
  };

  // Отправка сообщений пакетом
  const handleSendBatch = async () => {
    if (remindModal.selectedIds.length === 0 || !remindModal.customMessage.trim()) return;
    setIsSendingBatch(true);

    try {
      const selectedStudents = students.filter(s => remindModal.selectedIds.includes(s.id));
      let count = 0;

      for (const s of selectedStudents) {
        const res = await sendStudentNotification({
          studentTelegramId: s.telegram_id,
          studentUsername: s.username,
          studentId: s.id,
          title: remindModal.title,
          message: remindModal.customMessage
        });
        if (res && res.ok) count++;
      }

      setSendSuccessText(`Отправлено: ${count} из ${selectedStudents.length} атлетов`);
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
    <div className="space-y-4 pb-28">

      {/* 1. ВЕРХНИЙ БЛОК ПРИВЕТСТВИЯ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Главный обзор</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Сегодня {currentDayShort}, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScheduleFilter(f => f === 'today' ? 'all' : 'today')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs text-[11px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Filter className="w-3 h-3 text-blue-600 shrink-0" />
          <span>{scheduleFilter === 'today' ? 'Сегодня' : 'Все ученики'}</span>
        </button>
      </div>

      {/* 2. ТРИ КАРТОЧКИ KPI — КОМПАКТНО В ОДНУ СТРОКУ */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Касса</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-extrabold text-slate-900 font-mono tracking-tight whitespace-nowrap">
              {monthlyRevenue >= 1000000 
                ? `${(monthlyRevenue / 1000000).toFixed(1)}M ₸` 
                : `${(monthlyRevenue / 1000).toFixed(0)}k ₸`}
            </p>
            <span className="text-[9.5px] text-slate-400 font-medium block whitespace-nowrap">в месяц</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">В строю</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-extrabold text-slate-900 font-mono tracking-tight whitespace-nowrap">
              {activeStudents.length} <span className="text-[10px] font-normal text-slate-400">атл.</span>
            </p>
            <span className="text-[9.5px] text-slate-400 font-medium block whitespace-nowrap">активные</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">План дня</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm font-extrabold text-slate-900 font-mono tracking-tight whitespace-nowrap">
              {todayStudents.length} <span className="text-[10px] font-normal text-slate-400">зан.</span>
            </p>
            <span className="text-[9.5px] text-indigo-600 font-bold block whitespace-nowrap">
              {debtCount > 0 ? `Долги: ${debtCount}` : 'Все в норме'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. РАСПИСАНИЕ И ПЛАН ДНЯ — КНОПКИ СТРОГО В ОДНУ СТРОКУ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Шапка расписания */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900 whitespace-nowrap">
                {scheduleFilter === 'today' ? `Расписание на сегодня (${currentDayShort})` : 'Все активные ученики'}
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {displayedSchedule.length > 0 ? `${displayedSchedule.length} учеников в списке` : 'На сегодня занятий нет'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setScheduleFilter('today')}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                scheduleFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => setScheduleFilter('all')}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                scheduleFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Все
            </button>
          </div>
        </div>

        {/* Список подопечных */}
        <div className="divide-y divide-slate-100">
          {displayedSchedule.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-5 h-5 stroke-[1.8]" />
              </div>
              <p className="text-xs font-bold text-slate-800">Нет тренировок на сегодня</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Нажмите «Все» в правом углу или укажите дни тренировок в анкете ученика.
              </p>
              <button
                type="button"
                onClick={() => setScheduleFilter('all')}
                className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
              >
                Показать всех активных ({activeStudents.length})
              </button>
            </div>
          ) : (
            displayedSchedule.map(s => {
              const leftWorkouts = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
              const isDone = Boolean(processedMap[s.id]);
              const isCurrentProcessing = processingId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStudent && onSelectStudent(s)}
                  className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50/70 transition-all cursor-pointer group active:bg-slate-100/60"
                >
                  {/* Имя и инфо атлета */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0 shadow-2xs">
                      {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'A'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {s.full_name || 'Без имени'}
                        </span>
                        {s.payment_status === 'pending' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Ожидает оплаты" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5 whitespace-nowrap">
                        <span className="font-mono font-medium text-slate-600">
                          {leftWorkouts} зан.
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px] text-slate-500">
                          {s.workout_time_slot ? s.workout_time_slot.split(' ')[0] : 'Вечер'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка списания / возврата — строго в 1 строку без переноса */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isDone ? (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-[10.5px] font-bold border border-slate-200/80 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs"
                        title="Нажмите, чтобы отменить списание"
                      >
                        <RotateCcw className="w-3 h-3 stroke-[2.5]" />
                        <span>Вернуть (+1)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCurrentProcessing}
                        onClick={(e) => handleToggleWorkout(e, s)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 shadow-xs"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Списать</span>
                      </button>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. БЫСТРЫЕ СЦЕНАРИИ НАПОМИНАНИЙ В TELEGRAM */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Центр напоминаний</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">бот @gymconnect_ala_bot</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => openRemindDialog('workout')}
            className="p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <p className="text-[11px] font-bold text-slate-900 leading-snug">О тренировке</p>
            <p className="text-[9.5px] text-slate-400 mt-1">Сегодня ({todayStudents.length})</p>
          </button>

          <button
            type="button"
            onClick={() => openRemindDialog('payment')}
            className="p-2.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-200 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <p className="text-[11px] font-bold text-amber-950 leading-snug">Об оплате</p>
            <p className="text-[9.5px] text-amber-700 mt-1">Остаток ≤ 2 зан.</p>
          </button>

          <button
            type="button"
            onClick={() => openRemindDialog('absent')}
            className="p-2.5 bg-slate-50 hover:bg-rose-50/80 border border-slate-200/80 hover:border-rose-200 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <p className="text-[11px] font-bold text-rose-950 leading-snug">Вернуть в зал</p>
            <p className="text-[9.5px] text-rose-700 mt-1">Закончились</p>
          </button>
        </div>
      </div>

      {/* МОДАЛКА ВЫБОРА УЧЕНИКОВ И ОТПРАВКИ НАПОМИНАНИЙ */}
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 resize-none focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Выбор получателей */}
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
                      className="text-blue-600 hover:underline cursor-pointer"
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
                          <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
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
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
