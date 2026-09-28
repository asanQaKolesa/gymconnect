// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function OverviewTab({ 
  trainer, 
  students = [], 
  activeCount = 14, 
  pausedCount = 2, 
  leftCount = 1, 
  totalEarnings = 420000, 
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
    pricePaid: 70000,
    firstSessionDate: '2026-09-26'
  });

  // Расписание на сегодняшний день с упражнениями
  const [todaySchedule, setTodaySchedule] = useState([
    { 
      id: '1', 
      time: '10:00', 
      first_name: 'Данияр',
      last_name: 'Аскаров',
      name: 'Данияр Аскаров', 
      phone: '+77771234567',
      username: 'daniyar_fit',
      age: 27,
      height: 182,
      weight: 84,
      gender: 'male',
      goal: 'Набор массы',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'completed', 
      left_trainings: 6,
      remaining: 6,
      monthly_price: 70000,
      payment_status: 'paid',
      health_notes: 'Протрузия L4-L5, без осевых компрессий со штангой.',
      trainer_notes: 'Хорошо прогрессирует в тягах. Делаем акцент на широчайшие.',
      focus: 'Спина и бицепс (тяговый день)',
      exercises: [
        { name: 'Тяга верхнего блока широким хватом к груди', sets: '4 × 10', weight: '65' },
        { name: 'Тяга Т-грифа с упором грудью в подушку', sets: '4 × 10', weight: '45' },
        { name: 'Тяга горизонтального блока к поясу сидя', sets: '3 × 12', weight: '55' },
        { name: 'Подъем штанги на бицепс стоя (прямой / EZ-гриф)', sets: '3 × 12', weight: '25' }
      ]
    },
    { 
      id: '2', 
      time: '12:00', 
      first_name: 'Анель',
      last_name: 'Мусина',
      name: 'Анель Мусина', 
      phone: '+77017654321',
      username: 'anel_sport',
      age: 24,
      height: 168,
      weight: 56,
      gender: 'female',
      goal: 'Похудение и тонус',
      gym: 'Онлайн ведение (Zoom)', 
      format: 'online', 
      status: 'pending', 
      left_trainings: 3,
      remaining: 3,
      monthly_price: 45000,
      payment_status: 'paid',
      health_notes: 'Без жалоб, давление стабильное.',
      trainer_notes: 'Следить за потреблением белка.',
      focus: 'Ягодицы и кора (акцент на форму)',
      exercises: [
        { name: 'Ягодичный мост со штангой на скамье (Hip Thrust)', sets: '4 × 12', weight: '50' },
        { name: 'Болгарские сплит-приседания с гантелями', sets: '3 × 12', weight: '8' },
        { name: 'Румынская тяга с гантелями стоя', sets: '3 × 15', weight: '10' },
        { name: 'Классическая планка на предплечьях на время', sets: '3 × 45', weight: '0' }
      ]
    },
    { 
      id: '3', 
      time: '15:30', 
      first_name: 'Ерлан',
      last_name: 'Сатыбалдиев',
      name: 'Ерлан Сатыбалдиев', 
      phone: '+77059998877',
      username: 'erlan_power',
      age: 31,
      height: 176,
      weight: 80,
      gender: 'male',
      goal: 'Силовой жим',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'pending', 
      left_trainings: 1,
      remaining: 1,
      monthly_price: 70000,
      payment_status: 'pending',
      health_notes: 'Старая травма правого плеча.',
      trainer_notes: 'Осталась 1 тренировка! Напомнить о продлении блока.',
      focus: 'Грудь и трицепс (жим + гипертрофия)',
      exercises: [
        { name: 'Жим штанги лежа на горизонтальной скамье', sets: '4 × 8', weight: '85' },
        { name: 'Жим гантелей на наклонной скамье (30-45°)', sets: '4 × 10', weight: '26' },
        { name: 'Отжимания на брусьях с акцентом на грудь', sets: '3 × 10', weight: '0' },
        { name: 'Разгибания на трицепс на блоке с канатной рукоятью', sets: '3 × 12', weight: '25' }
      ]
    },
    { 
      id: '4', 
      time: '18:00', 
      first_name: 'Мадина',
      last_name: 'Омарова',
      name: 'Мадина Омарова', 
      phone: '+77473332211',
      username: 'madina_active',
      age: 26,
      height: 172,
      weight: 62,
      gender: 'female',
      goal: 'Рекомпозиция',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'pending', 
      left_trainings: 8,
      remaining: 8,
      monthly_price: 70000,
      payment_status: 'paid',
      health_notes: 'Противопоказаний нет.',
      trainer_notes: 'Отличная дисциплина.',
      focus: 'Full Body функционал и выносливость',
      exercises: [
        { name: 'Кубковые приседания с гантелью / гирей (Goblet)', sets: '4 × 15', weight: '16' },
        { name: 'Махи гирей двумя руками перед собой (Kettlebell Swing)', sets: '4 × 20', weight: '16' },
        { name: 'Гребной тренажер (Concept2 Rowing)', sets: '5 × 500', weight: '0' }
      ]
    }
  ]);

  const [studentsData, setStudentsData] = useState([
    { id: '1', name: 'Данияр Аскаров', phone: '+77771234567', format: 'gym', remaining: 6, status: 'active' },
    { id: '2', name: 'Анель Мусина', phone: '+77017654321', format: 'online', remaining: 3, status: 'active' },
    { id: '3', name: 'Ерлан Сатыбалдиев', phone: '+77059998877', format: 'gym', remaining: 1, status: 'active' },
    { id: '4', name: 'Мадина Омарова', phone: '+77473332211', format: 'gym', remaining: 8, status: 'active' },
    { id: '5', name: 'Азамат Темирханов', phone: '+77025554433', format: 'gym', remaining: 0, status: 'paused' },
    { id: '6', name: 'Камила Жумабаева', phone: '+77784443322', format: 'online', remaining: 0, status: 'finished' }
  ]);

  const weeklyLoadStats = [
    { day: 'Пн', count: 6, percent: 85, isToday: false },
    { day: 'Вт', count: 4, percent: 55, isToday: false },
    { day: 'Ср', count: 7, percent: 100, isToday: false },
    { day: 'Чт', count: 5, percent: 70, isToday: false },
    { day: 'Пт', count: 6, percent: 85, isToday: false },
    { day: 'Сб', count: 4, percent: 60, isToday: true },
    { day: 'Вс', count: 1, percent: 15, isToday: false }
  ];

  const handleMarkCompleted = (e, id) => {
    e.stopPropagation();
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        const wasCompleted = item.status === 'completed';
        const updatedLeft = wasCompleted ? item.remaining : Math.max(0, item.remaining - 1);
        return {
          ...item,
          status: 'completed',
          remaining: updatedLeft,
          left_trainings: updatedLeft
        };
      }
      return item;
    }));
  };

  const handleMarkCanceled = (e, id) => {
    e.stopPropagation();
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        const wasCompleted = item.status === 'completed';
        const updatedLeft = wasCompleted ? item.remaining + 1 : item.remaining;
        return {
          ...item,
          status: 'canceled',
          remaining: updatedLeft,
          left_trainings: updatedLeft
        };
      }
      return item;
    }));
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newStudentForm.name,
      first_name: newStudentForm.name.split(' ')[0],
      last_name: newStudentForm.name.split(' ').slice(1).join(' '),
      phone: newStudentForm.phone,
      format: newStudentForm.format,
      remaining: Number(newStudentForm.totalWorkouts),
      left_trainings: Number(newStudentForm.totalWorkouts),
      status: 'active'
    };

    setStudentsData([newEntry, ...studentsData]);
    setIsLocalAddModalOpen(false);
    setNewStudentForm({
      name: '',
      phone: '',
      format: 'gym',
      totalWorkouts: 12,
      pricePaid: 70000,
      firstSessionDate: '2026-09-26'
    });
    alert('Ученик успешно добавлен в базу!');
  };

  const handleSendReminder = (phone, text) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
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

      {/* 3. KPI Карточки */}
      <div className="space-y-2.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Выручка за месяц</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-semibold text-slate-900 font-mono tracking-tight">
                {totalEarnings.toLocaleString()} ₸
              </span>
              <span className="text-[10.5px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +14%
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
              <p className="text-lg font-semibold text-blue-600 font-mono mt-0.5">92%</p>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
              <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/60 font-medium">
                <span>По графику:</span>
                <span className="font-mono font-bold">46 зан.</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                <span>Переносы:</span>
                <span className="font-mono font-bold">4 зан.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Продление (Retention)</p>
              <p className="text-xs font-bold text-slate-900 font-mono mt-1">87.5% в срок</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Средний чек блока</p>
              <p className="text-xs font-bold text-slate-900 font-mono mt-1">70 000 ₸</p>
            </div>
          </div>
        </div>

        {/* Недельная загрузка */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">Недельная загрузка залов</span>
            <span className="text-[10.5px] font-mono text-slate-400">33 тренировки / нед</span>
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
              <h3 className="text-xs font-bold text-slate-900">Расписание на сегодня</h3>
              <p className="text-[10px] text-slate-400">
                Проведено: {completedTodayCount} из {todaySchedule.length} занятий • Нажмите на карточку для профиля
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            26 сентября
          </span>
        </div>

        <div className="space-y-3">
          {filteredSchedule.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">На сегодня тренировок в этом формате нет</p>
          ) : (
            filteredSchedule.map((item) => {
              const isCompleted = item.status === 'completed';
              const isCanceled = item.status === 'canceled';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectStudent && onSelectStudent(item)}
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
                    <div className="flex items-center gap-2">
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
                    </div>

                    <div className="flex items-center gap-1">
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
                        <h4 className="text-xs font-bold text-slate-900 leading-tight hover:text-blue-600 transition-colors">
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
                      <span className="text-[10px] text-slate-400 block">Остаток</span>
                      <span className="text-xs font-bold font-mono text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 inline-block mt-0.5">
                        {item.remaining} зан.
                      </span>
                    </div>
                  </div>

                  {/* 3 кнопки в 1 строку */}
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
                      {ex.weight ? `${ex.weight} кг` : 'Свой вес'}
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
                  if (onSelectStudent) onSelectStudent(student);
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

      {/* Модалка напоминаний */}
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
                  <p className="text-[10px] text-slate-400 px-1">Атлеты на сегодня:</p>
                  {todaySchedule.map(st => (
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
                  ))}
                </>
              )}

              {reminderType === 'payment' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Ученики с остатком 1 или 0 занятий:</p>
                  {studentsData.filter(s => s.remaining <= 1).map(st => (
                    <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-amber-600 font-medium">Осталось: {st.remaining} зан.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendReminder(st.phone, `Привет, ${st.name}! По твоему абонементу осталось ${st.remaining} зан. Давай запланируем продление, чтобы сохранить график!`)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Напомнить</span>
                      </button>
                    </div>
                  ))}
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

      {/* Модалка быстрого добавления ученика */}
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
