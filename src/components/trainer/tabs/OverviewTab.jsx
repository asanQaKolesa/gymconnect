// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Plus, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  X, 
  Dumbbell, 
  Check, 
  Eye, 
  ArrowUpRight, 
  ChevronRight, 
  Users, 
  Send, 
  AlertTriangle, 
  RotateCcw, 
  ArrowLeft, 
  Search, 
  MessageCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendStudentNotification } from '../../../utils/telegramNotifications';

export default function OverviewTab({ 
  trainer, 
  students = [], 
  activeCount = 0, 
  pausedCount = 0, 
  leftCount = 0, 
  totalEarnings = 0, 
  onAddStudentClick, 
  onSelectStudent 
}) {
  const [filterFormat, setFilterFormat] = useState('all'); // 'all' | 'gym' | 'online'
  const [scheduleViewMode, setScheduleViewMode] = useState('scheduled'); // 'scheduled' | 'all_active'

  // Модальные окна
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState('today'); // 'today' | 'payment' | 'absence'
  const [reminderAudience, setReminderAudience] = useState('all'); // 'all' | 'scheduled'
  const [reminderSearchQuery, setReminderSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [customReminderText, setCustomReminderText] = useState('');
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);

  const [isLocalAddModalOpen, setIsLocalAddModalOpen] = useState(false);
  const [selectedStudentForWorkout, setSelectedStudentForWorkout] = useState(null);
  const [reminderFeedback, setReminderFeedback] = useState(null);

  // Форма добавления нового ученика
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    format: 'gym',
    totalWorkouts: 12,
    pricePaid: 70000
  });

  // Определение дня недели
  const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const daysFull = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayDate = new Date();
  const todayDateStr = todayDate.toISOString().split('T')[0];
  const todayDayIdx = todayDate.getDay();
  const todayShortName = daysShort[todayDayIdx];
  const todayFullName = daysFull[todayDayIdx];

  // Динамическое расписание на сегодня
  const [todaySchedule, setTodaySchedule] = useState([]);

  // Вспомогательный парсер дней ученика
  const parseStudentWorkoutDays = (s) => {
    try {
      const local = localStorage.getItem(`gymconnect_schedule_${s.id || s.telegram_id}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed.workout_days) && parsed.workout_days.length > 0) {
          return parsed.workout_days;
        }
      }
    } catch (e) {}

    if (Array.isArray(s.workout_days) && s.workout_days.length > 0) return s.workout_days;
    if (typeof s.workout_days === 'string') {
      try {
        const parsed = JSON.parse(s.workout_days);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        if (s.workout_days.includes(',')) return s.workout_days.split(',').map(d => d.trim());
      }
    }
    return ['Пн', 'Ср', 'Пт'];
  };

  const isStudentActive = (s) => {
    if (!s) return false;
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  };

  useEffect(() => {
    if (!students || students.length === 0) {
      setTodaySchedule([]);
      return;
    }

    const activeStudents = students.filter(isStudentActive);

    const savedCompletedIds = (() => {
      try {
        const val = localStorage.getItem(`gymconnect_completed_today_${todayDateStr}`);
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    })();

    const scheduledForToday = activeStudents.filter(s => {
      const days = parseStudentWorkoutDays(s);
      return days.includes(todayShortName) || days.includes(todayFullName) || days.length === 7;
    });

    let targetList;
    if (scheduleViewMode === 'all_active') {
      targetList = activeStudents;
    } else {
      targetList = scheduledForToday.length > 0 ? scheduledForToday : activeStudents;
    }

    const mapped = targetList.map((st, index) => {
      const left = st.left_trainings !== undefined 
        ? st.left_trainings 
        : (st.remaining_workouts !== undefined ? st.remaining_workouts : 12);

      const checkin = st.attendance_today || localStorage.getItem(`gymconnect_attendance_${st.id}`) || null;

      const programExercises = st.assigned_program?.days?.[1]?.exercises || [
        { name: 'Разминка и базовый комплекс', sets: '4 × 10', weight: '40' }
      ];

      const isAlreadyCompleted = savedCompletedIds.includes(st.id);

      return {
        id: st.id,
        rawStudent: st,
        time: st.workout_time_slot ? st.workout_time_slot.split(' ')[0] : `${10 + index * 2}:00`,
        name: `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim(),
        first_name: st.first_name || 'Атлет',
        phone: st.phone || st.whatsapp || '',
        username: st.username || st.telegram_username || '',
        telegram_id: st.telegram_id || null,
        gym: st.gym ? st.gym.split('|')[0] : (trainer?.gym ? trainer.gym.split('|')[0] : 'Алматы'),
        format: st.format === 'online' || st.training_format === 'coach_online' ? 'online' : 'gym',
        status: isAlreadyCompleted ? 'completed' : 'pending',
        client_checkin: checkin,
        remaining: left,
        monthly_price: st.monthly_price || 70000,
        focus: st.goal || 'Персональное ведение',
        exercises: programExercises
      };
    });

    setTodaySchedule(mapped);
  }, [students, todayShortName, todayFullName, trainer?.gym, todayDateStr, scheduleViewMode]);

  // Установка дефолтного текста напоминаний при смене сценария
  useEffect(() => {
    if (reminderType === 'today') {
      setCustomReminderText('Привет! Напоминаю о нашей персональной тренировке. Жду вовремя в зале! 💪');
    } else if (reminderType === 'payment') {
      setCustomReminderText('Привет! По твоему абонементу заканчиваются оплаченные занятия. Давай забронируем график на следующий период!');
    } else if (reminderType === 'absence') {
      setCustomReminderText('Уважаемый атлет! По уважительной причине тренировка переносится без сгорания. Согласуем удобное время в личных сообщениях!');
    }
  }, [reminderType]);

  // Недельная загрузка
  const weeklyLoadStats = [
    { day: 'Пн', count: 6, percent: 85, isToday: todayDayIdx === 1 },
    { day: 'Вт', count: 4, percent: 55, isToday: todayDayIdx === 2 },
    { day: 'Ср', count: 7, percent: 100, isToday: todayDayIdx === 3 },
    { day: 'Чт', count: 5, percent: 70, isToday: todayDayIdx === 4 },
    { day: 'Пт', count: 6, percent: 85, isToday: todayDayIdx === 5 },
    { day: 'Сб', count: 4, percent: 60, isToday: todayDayIdx === 6 },
    { day: 'Вс', count: 1, percent: 15, isToday: todayDayIdx === 0 }
  ];

  // Списание тренировки
  const handleMarkCompleted = async (e, id) => {
    e.stopPropagation();
    const targetItem = todaySchedule.find(s => s.id === id);
    if (!targetItem) return;

    const newRemaining = Math.max(0, targetItem.remaining - 1);

    try {
      const key = `gymconnect_completed_today_${todayDateStr}`;
      const saved = localStorage.getItem(key);
      const list = saved ? JSON.parse(saved) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (err) {}

    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'completed', remaining: newRemaining };
      }
      return item;
    }));

    try {
      await supabase
        .from('profiles')
        .update({ 
          left_trainings: newRemaining,
          remaining_workouts: newRemaining 
        })
        .eq('id', id);

      sendStudentNotification({
        studentTelegramId: targetItem.telegram_id,
        studentUsername: targetItem.username,
        studentId: id,
        title: 'Тренировка проведена',
        message: `Тренировка успешно зачтена тренером! Списано 1 занятие. Ваш текущий остаток: ${newRemaining} занятий.`
      });
    } catch (err) {
      console.warn('Ошибка списания занятия в Supabase:', err);
    }
  };

  const handleMarkCanceled = (e, id) => {
    e.stopPropagation();
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'canceled' };
      }
      return item;
    }));
  };

  const handleRestoreCompletedSession = async (e, id) => {
    e.stopPropagation();
    const targetItem = todaySchedule.find(s => s.id === id);
    if (!targetItem) return;

    const restoredRemaining = targetItem.remaining + 1;

    try {
      const key = `gymconnect_completed_today_${todayDateStr}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const list = JSON.parse(saved).filter(itemId => itemId !== id);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (err) {}

    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'pending', remaining: restoredRemaining };
      }
      return item;
    }));

    try {
      await supabase
        .from('profiles')
        .update({ 
          left_trainings: restoredRemaining,
          remaining_workouts: restoredRemaining 
        })
        .eq('id', id);
    } catch (err) {}
  };

  // Переключение выбора одного ученика
  const toggleStudentSelection = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Список доступных учеников для напоминаний
  const reminderStudentsList = (() => {
    let list = reminderAudience === 'all' 
      ? students.filter(isStudentActive)
      : todaySchedule.map(s => s.rawStudent || s);

    if (reminderSearchQuery.trim()) {
      const q = reminderSearchQuery.toLowerCase();
      list = list.filter(st => {
        const fullName = `${st.first_name || ''} ${st.last_name || ''} ${st.username || ''}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    return list;
  })();

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === reminderStudentsList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(reminderStudentsList.map(s => s.id));
    }
  };

  // Единичная отправка
  const handleSendTelegramReminder = async (student, type) => {
    const studentTgId = student.telegram_id || student.rawStudent?.telegram_id;
    const studentUsername = student.username || student.rawStudent?.username;

    let title = 'Напоминание от тренера';
    if (type === 'workout') title = 'Напоминание о тренировке';
    if (type === 'payment') title = 'Продление абонемента';
    if (type === 'absence') title = 'Перенос тренировки';

    setReminderFeedback('Отправка через Telegram бот...');

    try {
      const res = await sendStudentNotification({
        studentTelegramId: studentTgId,
        studentUsername: studentUsername,
        studentId: student.id,
        title,
        message: customReminderText || 'Напоминание от вашего тренера в GymConnect.'
      });

      if (res && res.ok) {
        setReminderFeedback(`✅ Уведомление доставлено в Telegram атлету!`);
      } else {
        setReminderFeedback(`⚠️ ${res?.error || 'Атлет должен нажать /start в @gymconnect_ala_bot'}`);
      }
    } catch (err) {
      setReminderFeedback(`⚠️ Ошибка: ${err.message}`);
    }

    setTimeout(() => setReminderFeedback(null), 5000);
  };

  const handleSendWhatsAppReminder = (phone, text) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`}?text=${encoded}`, '_blank');
  };

  // МАССОВАЯ ОТПРАВКА ТОЛЬКО ВЫБРАННЫМ УЧЕНИКАМ
  const handleSendBatchToSelected = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Пожалуйста, выберите галочками хотя бы одного ученика для отправки!');
      return;
    }

    const recipients = students.filter(s => selectedStudentIds.includes(s.id));
    setIsSendingBatch(true);
    setBatchProgress({ current: 0, total: recipients.length });

    let successCount = 0;
    let failCount = 0;

    let title = 'Напоминание от тренера';
    if (reminderType === 'today') title = 'Напоминание о тренировке';
    if (reminderType === 'payment') title = 'Продление абонемента';
    if (reminderType === 'absence') title = 'Перенос тренировки';

    for (let i = 0; i < recipients.length; i++) {
      const st = recipients[i];
      try {
        const res = await sendStudentNotification({
          studentTelegramId: st.telegram_id,
          studentUsername: st.username,
          studentId: st.id,
          title,
          message: customReminderText
        });
        if (res && res.ok) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }

      setBatchProgress({ current: i + 1, total: recipients.length });
      await new Promise(r => setTimeout(r, 60)); // пауза против флуд-лимитов
    }

    setIsSendingBatch(false);
    setBatchProgress(null);
    setReminderFeedback(`✅ Разослано: ${successCount} доставлено, ${failCount} ошибок (требуется /start в боте).`);
    setTimeout(() => setReminderFeedback(null), 6000);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    const coachNick = (trainer?.username || '').replace('@', '').trim().toLowerCase();
    const cleanPhone = newStudentForm.phone.replace(/\D/g, '');

    try {
      const payload = {
        first_name: newStudentForm.name.split(' ')[0],
        last_name: newStudentForm.name.split(' ').slice(1).join(' ') || '',
        phone: cleanPhone,
        whatsapp: cleanPhone,
        monthly_price: Number(newStudentForm.pricePaid) || 70000,
        total_trainings: Number(newStudentForm.totalWorkouts) || 12,
        left_trainings: Number(newStudentForm.totalWorkouts) || 12,
        remaining_workouts: Number(newStudentForm.totalWorkouts) || 12,
        gym: trainer?.gym || 'Алматы',
        workout_days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        workout_time_slot: 'Вечер (16:00 - 21:00)',
        trainer_username: coachNick,
        trainer_telegram: coachNick,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .insert([payload]);

      if (error) throw error;

      alert('Ученик успешно добавлен в базу!');
      setIsLocalAddModalOpen(false);
      setNewStudentForm({
        name: '',
        phone: '',
        format: 'gym',
        totalWorkouts: 12,
        pricePaid: 70000
      });

      window.location.reload();
    } catch (err) {
      alert('Ошибка добавления: ' + err.message);
    }
  };

  const filteredSchedule = todaySchedule.filter(item => {
    if (filterFormat === 'gym') return item.format === 'gym';
    if (filterFormat === 'online') return item.format === 'online';
    return true;
  });

  const completedTodayCount = todaySchedule.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-3.5 pb-10 select-none">
      
      {/* 1. Фильтр формата */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilterFormat('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterFormat === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Все форматы
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('gym')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterFormat === 'gym' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          В зале
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('online')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterFormat === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Онлайн
        </button>
      </div>

      {/* 2. Быстрые кнопки */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddStudentClick ? onAddStudentClick() : setIsLocalAddModalOpen(true)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span className="text-xs font-semibold">Добавить ученика</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStudentIds([]);
            setIsReminderModalOpen(true);
          }}
          className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold">Напомнить</span>
        </button>
      </div>

      {/* 3. KPI Карточки */}
      <div className="space-y-2.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Выручка за месяц</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-semibold text-slate-900 font-mono tracking-tight">
                {Number(totalEarnings || 0).toLocaleString()} ₸
              </span>
              <span className="text-[10.5px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> В кассе
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Активная база</span>
              <p className="text-lg font-semibold text-slate-900 font-mono mt-0.5">{activeCount} атлетов</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
              <div className="flex justify-between items-center text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/60 font-medium">
                <span>На паузе:</span>
                <span className="font-mono font-bold">{pausedCount}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                <span>Завершили:</span>
                <span className="font-mono font-bold">{leftCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Средняя явка</span>
              <p className="text-lg font-semibold text-blue-600 font-mono mt-0.5">94%</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
              <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/60 font-medium">
                <span>По графику:</span>
                <span className="font-mono font-bold">{todaySchedule.length} зан.</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                <span>Проведено:</span>
                <span className="font-mono font-bold">{completedTodayCount} зан.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Недельная загрузка */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">Загрузка смен по дням</span>
            <span className="text-[10.5px] font-mono text-blue-600 font-bold">Сегодня: {todayShortName}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-2">
            {weeklyLoadStats.map(item => (
              <div key={item.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9.5px] font-mono font-bold text-slate-600">{item.count}</span>
                <div className="w-full bg-slate-100 rounded-lg h-12 flex items-end p-0.5">
                  <div 
                    className={`w-full rounded-md transition-all ${
                      item.isToday ? 'bg-blue-600 shadow-xs' : 'bg-slate-300'
                    }`}
                    style={{ height: `${item.percent}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Расписание на сегодня */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {scheduleViewMode === 'all_active' ? 'Все активные ученики' : `Расписание на сегодня (${todayFullName})`}
              </h3>
              <p className="text-[10px] text-slate-400">
                Проведено: {completedTodayCount} из {todaySchedule.length} занятий
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setScheduleViewMode('scheduled')}
              className={`px-2 py-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                scheduleViewMode === 'scheduled' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => setScheduleViewMode('all_active')}
              className={`px-2 py-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                scheduleViewMode === 'all_active' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
              }`}
              title="Показать всех учеников для тестирования списаний"
            >
              Все ({students.filter(isStudentActive).length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSchedule.length > 0 ? (
            filteredSchedule.map((item) => {
              const isCompleted = item.status === 'completed';
              const isCanceled = item.status === 'canceled';
              const checkinStatus = item.client_checkin;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectStudent && onSelectStudent(item.rawStudent || item)}
                  className={`w-full p-3.5 rounded-2xl border transition-all space-y-2.5 cursor-pointer active:scale-[0.99] hover:border-blue-300 ${
                    isCompleted 
                      ? 'bg-emerald-50/40 border-emerald-200/80' 
                      : isCanceled
                        ? 'bg-rose-50/40 border-rose-200/70'
                        : 'bg-slate-50/60 border-slate-200/90'
                  }`}
                  title="Открыть профиль ученика"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200/80">
                        {item.time}
                      </span>

                      {item.format === 'online' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Онлайн 🌐
                        </span>
                      )}

                      {checkinStatus === 'attending' && (
                        <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Будет 👍
                        </span>
                      )}
                      {checkinStatus === 'missed' && (
                        <span className="text-[9.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                          <X className="w-3 h-3 text-rose-600 stroke-[3]" /> Не придет ✕
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Списано
                        </span>
                      )}
                      {isCanceled && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Пропуск
                        </span>
                      )}
                      {!isCompleted && !isCanceled && (
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          Ожидается
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight hover:text-blue-600 transition-colors truncate">
                          {item.name}
                        </h4>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate">
                        {item.gym}
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium truncate">
                        Фокус: {item.focus}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-normal">Остаток</span>
                      <span className="text-xs font-bold font-mono text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 inline-block mt-0.5">
                        {item.remaining} зан.
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {isCompleted ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Занятие списано</span>
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForWorkout(item);
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:underline px-1.5 py-0.5"
                          >
                            План дня
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => handleRestoreCompletedSession(e, item.id)}
                            className="px-2 py-1 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                            title="Вернуть тренировку на баланс ученика"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Вернуть (+1)</span>
                          </button>
                        </div>
                      </div>
                    ) : isCanceled ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-800 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Пропуск занятия</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRestoreCompletedSession(e, item.id)}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Сбросить</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForWorkout(item);
                          }}
                          className="flex-1 min-w-0 py-2 px-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs whitespace-nowrap overflow-hidden cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">План дня</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleMarkCompleted(e, item.id)}
                          className="flex-1 min-w-0 py-2 px-1.5 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs whitespace-nowrap overflow-hidden cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                          <span className="truncate">Проведено</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleMarkCanceled(e, item.id)}
                          className="flex-1 min-w-0 py-2 px-1.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs whitespace-nowrap overflow-hidden cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80"
                        >
                          <X className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Пропуск</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-7 h-7 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-700">На сегодня ({todayFullName}) запланированных тренировок нет</p>
              <button
                type="button"
                onClick={() => setScheduleViewMode('all_active')}
                className="mt-1 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Показать всех учеников базы</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Быстрое модальное окно плана тренировки дня */}
      {selectedStudentForWorkout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Dumbbell className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{selectedStudentForWorkout.name}</h3>
                  <p className="text-[10.5px] text-slate-400">Тренировочный план на сегодня ({selectedStudentForWorkout.time})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForWorkout(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Целевой фокус сессии:</span>
                <p className="text-xs font-bold text-blue-950 mt-0.5">{selectedStudentForWorkout.focus}</p>
                <p className="text-[10.5px] text-blue-900/80 mt-1">Клуб: {selectedStudentForWorkout.gym}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Упражнения:</span>
                {selectedStudentForWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{idx + 1}. {ex.name}</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">{ex.sets}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {ex.isBodyweight || ex.weight === '0' || ex.weight === 0 ? 'Свой вес' : `${ex.weight} кг`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const student = selectedStudentForWorkout;
                  setSelectedStudentForWorkout(null);
                  if (onSelectStudent) onSelectStudent(student.rawStudent || student);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold active:scale-98 transition-all cursor-pointer"
              >
                Открыть профиль ученика
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentForWorkout(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold active:scale-98 transition-all cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ПОЛНОЭКРАННЫЙ РЕЖИМ БЫСТРЫХ НАПОМИНАНИЙ С ВЫБОРОМ УЧЕНИКОВ ================= */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-[120] bg-[#F2F2F7] flex flex-col min-h-screen w-full overflow-y-auto select-none animate-in fade-in duration-150">
          
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
            <div className="max-w-md mx-auto flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Назад в Обзор KPI</span>
              </button>

              <h2 className="text-xs font-bold text-slate-900 truncate">
                Центр напоминаний
              </h2>

              <div className="w-12" />
            </div>
          </header>

          <main className="p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-32">
            
            {/* Статус ответа отправки */}
            {reminderFeedback && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs font-semibold text-center animate-in fade-in">
                {reminderFeedback}
              </div>
            )}

            {/* 3 Сценария */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setReminderType('today')}
                className={`py-2 text-[10.5px] font-bold rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                О тренировке
              </button>
              <button
                type="button"
                onClick={() => setReminderType('payment')}
                className={`py-2 text-[10.5px] font-bold rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'payment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Об оплате
              </button>
              <button
                type="button"
                onClick={() => setReminderType('absence')}
                className={`py-2 text-[10.5px] font-bold rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'absence' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Не будет в зале
              </button>
            </div>

            {/* Редактируемый текст напоминания */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Текст уведомления в Telegram:
              </label>
              <textarea
                rows={3}
                value={customReminderText}
                onChange={e => setCustomReminderText(e.target.value)}
                placeholder="Введите текст сообщения..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed resize-none focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Фильтр аудитории, поиск и кнопка «Выбрать всех» */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Аудитория для отправки:
                </span>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setReminderAudience('all');
                      setSelectedStudentIds([]);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      reminderAudience === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Все ({students.filter(isStudentActive).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderAudience('scheduled');
                      setSelectedStudentIds([]);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      reminderAudience === 'scheduled' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    По графику ({todaySchedule.length})
                  </button>
                </div>
              </div>

              {/* Поиск и кнопка выбрать всех */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={reminderSearchQuery}
                    onChange={e => setReminderSearchQuery(e.target.value)}
                    placeholder="Поиск по имени или никнейму..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10.5px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer"
                >
                  {selectedStudentIds.length === reminderStudentsList.length && reminderStudentsList.length > 0 ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>Снять</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Выбрать всех</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500">Доступно: {reminderStudentsList.length} атлетов</span>
                <span className="font-bold text-blue-600">
                  Выбрано: {selectedStudentIds.length} чел.
                </span>
              </div>
            </div>

            {/* СПИСОК УЧЕНИКОВ С ЧЕКБОКСАМИ ВЫБОРА */}
            <div className="space-y-2.5">
              {reminderStudentsList.length > 0 ? (
                reminderStudentsList.map(st => {
                  const isSelected = selectedStudentIds.includes(st.id);
                  const left = st.remaining !== undefined 
                    ? st.remaining 
                    : (st.left_trainings !== undefined ? st.left_trainings : (st.remaining_workouts !== undefined ? st.remaining_workouts : 12));
                  const price = Number(st.monthly_price || 70000).toLocaleString();

                  return (
                    <div 
                      key={st.id}
                      onClick={() => toggleStudentSelection(st.id)}
                      className={`p-3.5 rounded-3xl border transition-all cursor-pointer shadow-2xs space-y-2.5 ${
                        isSelected 
                          ? 'bg-blue-50/60 border-blue-400' 
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Интерактивный чекбокс */}
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="overflow-hidden space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {st.name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`}
                            </p>
                            <p className="text-[10.5px] text-slate-500 truncate">
                              {st.time ? `Слот: ${st.time}` : (st.workout_time_slot || 'По договоренности')} • {st.gym ? st.gym.split('|')[0] : 'Алматы'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            left <= 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {left} зан.
                          </span>
                        </div>
                      </div>

                      {/* Быстрые одиночные кнопки отправки (по клику не триггерят выбор) */}
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendTelegramReminder(st, reminderType === 'absence' ? 'absence' : reminderType === 'payment' ? 'payment' : 'workout');
                          }}
                          className="flex-1 py-1.5 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#229ED9]/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Telegram</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWhatsAppReminder(st.phone || st.whatsapp, customReminderText);
                          }}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-emerald-200 active:scale-95 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
                  Ученики не найдены по заданным критериям.
                </div>
              )}
            </div>

          </main>

          {/* НИЖНЯЯ ПАНЕЛЬ ПАКЕТНОЙ ОТПРАВКИ ВЫБРАННЫМ */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-md mx-auto shadow-xl">
            <button
              type="button"
              disabled={isSendingBatch || selectedStudentIds.length === 0}
              onClick={handleSendBatchToSelected}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md cursor-pointer ${
                selectedStudentIds.length > 0 && !isSendingBatch
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isSendingBatch && batchProgress
                  ? `Рассылка ${batchProgress.current} из ${batchProgress.total}...`
                  : selectedStudentIds.length > 0
                    ? `Отправить выбранным (${selectedStudentIds.length}) в Telegram`
                    : 'Выберите галочками, кому отправить'}
              </span>
            </button>
          </div>

        </div>
      )}

      {/* Модалка добавления ученика */}
      {isLocalAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-900">Добавить нового ученика</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLocalAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">ФИО подопечного *</label>
                <input
                  type="text"
                  required
                  placeholder="Имя Фамилия"
                  value={newStudentForm.name}
                  onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">WhatsApp номер (+7) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (701) 000-00-00"
                  value={newStudentForm.phone}
                  onChange={e => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Формат занятий</label>
                  <select
                    value={newStudentForm.format}
                    onChange={e => setNewStudentForm({ ...newStudentForm, format: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="gym">В зале</option>
                    <option value="online">Онлайн</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Кол-во занятий</label>
                  <input
                    type="number"
                    value={newStudentForm.totalWorkouts}
                    onChange={e => setNewStudentForm({ ...newStudentForm, totalWorkouts: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Сумма оплаты (₸)</label>
                <input
                  type="number"
                  value={newStudentForm.pricePaid}
                  onChange={e => setNewStudentForm({ ...newStudentForm, pricePaid: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold text-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs active:scale-98 transition-all mt-2 cursor-pointer"
              >
                Сохранить в базу
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
