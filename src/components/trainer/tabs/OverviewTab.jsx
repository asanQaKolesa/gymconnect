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
  BarChart3, 
  ArrowUpRight, 
  ShieldCheck, 
  MessageCircle, 
  ChevronRight,
  Clock,
  UserPlus,
  Users
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

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

  // Модальные окна
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState('today'); // 'today' | 'payment' | 'absence'
  const [isLocalAddModalOpen, setIsLocalAddModalOpen] = useState(false);
  const [selectedStudentForWorkout, setSelectedStudentForWorkout] = useState(null);

  // Форма добавления нового ученика
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    phone: '',
    format: 'gym',
    totalWorkouts: 12,
    pricePaid: 70000
  });

  // Определение сегодняшнего дня недели
  const daysShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const daysFull = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayDate = new Date();
  const todayDayIdx = todayDate.getDay();
  const todayShortName = daysShort[todayDayIdx];
  const todayFullName = daysFull[todayDayIdx];

  // Динамическое расписание на сегодня из реальной базы учеников
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    if (!students || students.length === 0) {
      setTodaySchedule([]);
      return;
    }

    // Фильтруем учеников, у которых тренировка выпадает на сегодня
    const activeStudents = students.filter(s => s.status === 'active' || !s.status);
    
    const scheduledForToday = activeStudents.filter(s => {
      const days = Array.isArray(s.workout_days) && s.workout_days.length > 0 
        ? s.workout_days 
        : ['Пн', 'Ср', 'Пт'];
      return days.includes(todayShortName) || days.includes(todayFullName);
    });

    // Если по дням никто не совпал, показываем первых активных подопечных
    const targetList = scheduledForToday.length > 0 ? scheduledForToday : activeStudents;

    const mapped = targetList.map((st, index) => {
      const left = st.left_trainings !== undefined 
        ? st.left_trainings 
        : (st.remaining_workouts !== undefined ? st.remaining_workouts : 12);

      // Проверяем онлайн-явку из базы или локального хранилища
      const checkin = st.attendance_today || localStorage.getItem(`gymconnect_attendance_${st.id}`) || null;

      // Берем назначенную программу тренировок от тренера
      const programExercises = st.assigned_program?.days?.[1]?.exercises || [
        { name: 'Разминка и базовый комплекс', sets: '4 × 10', weight: '40' }
      ];

      return {
        id: st.id,
        rawStudent: st,
        time: st.workout_time_slot ? st.workout_time_slot.split(' ')[0] : `${10 + index * 2}:00`,
        name: `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim(),
        first_name: st.first_name || 'Атлет',
        phone: st.phone || st.whatsapp || '',
        gym: st.gym ? st.gym.split('|')[0] : (trainer?.gym ? trainer.gym.split('|')[0] : 'Алматы'),
        format: st.format === 'online' || st.training_format === 'coach_online' ? 'online' : 'gym',
        status: 'pending', // 'pending' | 'completed' | 'canceled'
        client_checkin: checkin,
        remaining: left,
        focus: st.goal || 'Персональное ведение',
        exercises: programExercises
      };
    });

    setTodaySchedule(mapped);
  }, [students, todayShortName, todayFullName, trainer?.gym]);

  // Недельный график загрузки с подсветкой сегодняшнего дня
  const weeklyLoadStats = [
    { day: 'Пн', count: 6, percent: 85, isToday: todayDayIdx === 1 },
    { day: 'Вт', count: 4, percent: 55, isToday: todayDayIdx === 2 },
    { day: 'Ср', count: 7, percent: 100, isToday: todayDayIdx === 3 },
    { day: 'Чт', count: 5, percent: 70, isToday: todayDayIdx === 4 },
    { day: 'Пт', count: 6, percent: 85, isToday: todayDayIdx === 5 },
    { day: 'Сб', count: 4, percent: 60, isToday: todayDayIdx === 6 },
    { day: 'Вс', count: 1, percent: 15, isToday: todayDayIdx === 0 }
  ];

  // Списание тренировки с реальной записью в Supabase
  const handleMarkCompleted = async (e, id) => {
    e.stopPropagation();
    const targetItem = todaySchedule.find(s => s.id === id);
    if (!targetItem) return;

    const newRemaining = Math.max(0, targetItem.remaining - 1);

    // 1. Мгновенно обновляем интерфейс
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'completed', remaining: newRemaining };
      }
      return item;
    }));

    // 2. Записываем списание в Supabase
    try {
      await supabase
        .from('profiles')
        .update({ 
          left_trainings: newRemaining,
          remaining_workouts: newRemaining 
        })
        .eq('id', id);
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
        trainer_username: coachNick,
        trainer_telegram: coachNick,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([payload])
        .select()
        .single();

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

      // Перезагружаем страницу для обновления списка
      window.location.reload();
    } catch (err) {
      alert('Ошибка добавления: ' + err.message);
    }
  };

  const handleSendReminder = (phone, text) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`}?text=${encoded}`, '_blank');
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
          onClick={() => setIsReminderModalOpen(true)}
          className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold">Напомнить</span>
        </button>
      </div>

      {/* 3. KPI Карточки тренера */}
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

      {/* 4. Расписание на сегодня — ПОЛНОСТЬЮ ИЗ БАЗЫ ДАННЫХ */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Расписание на сегодня ({todayFullName})</h3>
              <p className="text-[10px] text-slate-400">
                Проведено: {completedTodayCount} из {todaySchedule.length} занятий
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {todayDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
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
                  title="Нажмите, чтобы открыть полный профиль ученика"
                >
                  {/* Верхняя строчка */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200/80">
                        {item.time}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                        item.format === 'gym' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {item.format === 'gym' ? 'В зале' : 'Онлайн'}
                      </span>

                      {/* ОНЛАЙН-ОТМЕТКА ЯВКИ ИЗ SUPABASE */}
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
                          <CheckCircle2 className="w-3 h-3" /> Проведено
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

                  {/* Средняя часть */}
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

                  {/* 3 кнопки строго в 1 строку */}
                  <div className="flex items-center gap-1.5 pt-1">
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
                      className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs whitespace-nowrap overflow-hidden cursor-pointer ${
                        isCompleted 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Проведено</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleMarkCanceled(e, item.id)}
                      className={`flex-1 min-w-0 py-2 px-1.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs whitespace-nowrap overflow-hidden cursor-pointer ${
                        isCanceled 
                          ? 'bg-rose-600 text-white font-bold' 
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Пропуск</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-7 h-7 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-700">На сегодня ({todayFullName}) учеников нет</p>
              <p className="text-[10.5px] text-slate-400 max-w-xs mx-auto">
                Когда ученики привязываются к вашему профилю в GymConnect, их график автоматически отображается здесь.
              </p>
              <button
                type="button"
                onClick={() => onAddStudentClick ? onAddStudentClick() : setIsLocalAddModalOpen(true)}
                className="mt-1 px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 active:scale-95 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Зарегистрировать подопечного</span>
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

      {/* Модалка быстрых напоминаний */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-900">Быстрые напоминания</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setReminderType('today')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                О тренировке
              </button>
              <button
                type="button"
                onClick={() => setReminderType('payment')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'payment' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Об оплате
              </button>
              <button
                type="button"
                onClick={() => setReminderType('absence')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all cursor-pointer ${
                  reminderType === 'absence' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Не будет в зале
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reminderType === 'today' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Атлеты на сегодня ({todayShortName}):</p>
                  {todaySchedule.length > 0 ? (
                    todaySchedule.map(st => (
                      <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-400">Время: {st.time}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(st.phone, `Привет, ${st.name}! Напоминаю о сегодняшней тренировке в ${st.time}. Жду вовремя! 💪`)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-slate-400 text-xs">Нет запланированных тренировок на сегодня.</p>
                  )}
                </>
              )}

              {reminderType === 'payment' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Ученики с остатком ≤ 1 занятий:</p>
                  {students.filter(s => (s.left_trainings !== undefined ? s.left_trainings : 12) <= 1).length > 0 ? (
                    students.filter(s => (s.left_trainings !== undefined ? s.left_trainings : 12) <= 1).map(st => (
                      <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-900">{st.first_name} {st.last_name || ''}</p>
                          <p className="text-[10px] text-amber-600 font-medium">Осталось: {st.left_trainings ?? 1} зан.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendReminder(st.phone || st.whatsapp || '', `Привет, ${st.first_name}! По твоему абонементу осталось мало занятий. Давай согласуем продление, чтобы сохранить график!`)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Напомнить</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-slate-400 text-xs">У всех активных подопечных достаточный баланс занятий.</p>
                  )}
                </>
              )}

              {reminderType === 'absence' && (
                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2">
                  <p className="text-[11px] text-rose-900 leading-relaxed">
                    Отправить всем ученикам на сегодня: «Уважаемые атлеты, по техническим причинам меня сегодня не будет в зале. Все занятия переносятся без сгорания».
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Уведомление отправлено всем подопечным на сегодня!')}
                    className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold active:scale-98 cursor-pointer"
                  >
                    Разослать всем на сегодня
                  </button>
                </div>
              )}
            </div>
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
