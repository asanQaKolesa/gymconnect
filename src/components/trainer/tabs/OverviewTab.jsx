// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  X, 
  ChevronRight, 
  Phone, 
  AlertTriangle,
  Send,
  MessageCircle,
  Dumbbell,
  Check,
  Eye,
  BarChart3,
  Flame,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function OverviewTab({ 
  trainer, 
  students = [], 
  activeCount = 14, 
  pausedCount = 2, 
  leftCount = 1, 
  totalEarnings = 420000, 
  onAddStudentClick 
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

  // Расписание на сегодняшний день (Суббота) с детальными программами
  const [todaySchedule, setTodaySchedule] = useState([
    { 
      id: '1', 
      time: '10:00', 
      name: 'Данияр Аскаров', 
      phone: '+77771234567',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'completed', 
      remaining: 6,
      focus: 'Спина и бицепс (тяговый день)',
      exercises: [
        { name: 'Тяга верхнего блока широким хватом', sets: '4 × 10', weight: '65 кг' },
        { name: 'Тяга Т-грифа с упором в грудь', sets: '4 × 10', weight: '45 кг' },
        { name: 'Горизонтальная тяга в кроссовере', sets: '3 × 12', weight: '55 кг' },
        { name: 'Подъем гантелей с супинацией', sets: '3 × 12', weight: '14 кг' }
      ]
    },
    { 
      id: '2', 
      time: '12:00', 
      name: 'Анель Мусина', 
      phone: '+77017654321',
      gym: 'Онлайн ведение (Zoom)', 
      format: 'online', 
      status: 'pending', 
      remaining: 3,
      focus: 'Ягодицы и кора (акцент на форму)',
      exercises: [
        { name: 'Ягодичный мост со штангой', sets: '4 × 12', weight: '50 кг' },
        { name: 'Болгарские выпады с гантелями', sets: '3 × 12', weight: '8 кг' },
        { name: 'Румынская тяга на одной ноге', sets: '3 × 15', weight: '10 кг' },
        { name: 'Планка на предплечьях', sets: '3 × 45 сек', weight: 'Свой вес' }
      ]
    },
    { 
      id: '3', 
      time: '15:30', 
      name: 'Ерлан Сатыбалдиев', 
      phone: '+77059998877',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'pending', 
      remaining: 1,
      focus: 'Грудь и трицепс (жим + гипертрофия)',
      exercises: [
        { name: 'Жим штанги лежа на горизонтальной', sets: '4 × 8', weight: '85 кг' },
        { name: 'Жим гантелей на наклонной скамье', sets: '4 × 10', weight: '26 кг' },
        { name: 'Отжимания на брусьях с весом', sets: '3 × 10', weight: '+10 кг' },
        { name: 'Разгибание на трицепс с канатом', sets: '3 × 12', weight: '25 кг' }
      ]
    },
    { 
      id: '4', 
      time: '18:00', 
      name: 'Мадина Омарова', 
      phone: '+77473332211',
      gym: 'Invictus Go (Mega Park)', 
      format: 'gym', 
      status: 'pending', 
      remaining: 8,
      focus: 'Full Body функционал и выносливость',
      exercises: [
        { name: 'Приседания с кубковым хватом', sets: '4 × 15', weight: '16 кг' },
        { name: 'Тяга гантелей в планке (Renegade Row)', sets: '3 × 12', weight: '6 кг' },
        { name: 'Махи гирей двумя руками', sets: '4 × 20', weight: '16 кг' },
        { name: 'Интервальный гребной тренажер', sets: '5 раундов', weight: 'Макс. темп' }
      ]
    }
  ]);

  // Демо-список подопечных для напоминаний
  const [studentsData, setStudentsData] = useState([
    { id: '1', name: 'Данияр Аскаров', phone: '+77771234567', format: 'gym', remaining: 6, status: 'active' },
    { id: '2', name: 'Анель Мусина', phone: '+77017654321', format: 'online', remaining: 3, status: 'active' },
    { id: '3', name: 'Ерлан Сатыбалдиев', phone: '+77059998877', format: 'gym', remaining: 1, status: 'active' },
    { id: '4', name: 'Мадина Омарова', phone: '+77473332211', format: 'gym', remaining: 8, status: 'active' },
    { id: '5', name: 'Азамат Темирханов', phone: '+77025554433', format: 'gym', remaining: 0, status: 'paused' },
    { id: '6', name: 'Камила Жумабаева', phone: '+77784443322', format: 'online', remaining: 0, status: 'finished' }
  ]);

  // Недельный график загрузки смен тренера (Пн - Вс)
  const weeklyLoadStats = [
    { day: 'Пн', count: 6, percent: 85, isToday: false },
    { day: 'Вт', count: 4, percent: 55, isToday: false },
    { day: 'Ср', count: 7, percent: 100, isToday: false },
    { day: 'Чт', count: 5, percent: 70, isToday: false },
    { day: 'Пт', count: 6, percent: 85, isToday: false },
    { day: 'Сб', count: 4, percent: 60, isToday: true },
    { day: 'Вс', count: 1, percent: 15, isToday: false }
  ];

  // Установка статуса «Проведено» (списание занятия)
  const handleMarkCompleted = (id) => {
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        const wasCompleted = item.status === 'completed';
        return {
          ...item,
          status: 'completed',
          remaining: wasCompleted ? item.remaining : Math.max(0, item.remaining - 1)
        };
      }
      return item;
    }));
  };

  // Установка статуса «Не проведено» (без списания / отмена)
  const handleMarkCanceled = (id) => {
    setTodaySchedule(prev => prev.map(item => {
      if (item.id === id) {
        const wasCompleted = item.status === 'completed';
        return {
          ...item,
          status: 'canceled',
          remaining: wasCompleted ? item.remaining + 1 : item.remaining
        };
      }
      return item;
    }));
  };

  // Сохранение нового ученика
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newStudentForm.name,
      phone: newStudentForm.phone,
      format: newStudentForm.format,
      remaining: Number(newStudentForm.totalWorkouts),
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
    alert('Ученик успешно добавлен в вашу базу!');
  };

  const handleSendReminder = (phone, text) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Фильтрация сегодняшнего расписания
  const filteredSchedule = todaySchedule.filter(item => {
    if (filterFormat === 'gym') return item.format === 'gym';
    if (filterFormat === 'online') return item.format === 'online';
    return true;
  });

  const completedTodayCount = todaySchedule.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-3.5 pb-10 select-none">
      
      {/* 1. ФИЛЬТР ФОРМАТА (ВСЕ / В ЗАЛЕ / ОНЛАЙН) */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilterFormat('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterFormat === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Все форматы
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('gym')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterFormat === 'gym' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          В зале (оффлайн)
        </button>
        <button
          type="button"
          onClick={() => setFilterFormat('online')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            filterFormat === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Онлайн
        </button>
      </div>

      {/* 2. КНОПКИ БЫСТРЫХ ДЕЙСТВИЙ */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddStudentClick ? onAddStudentClick() : setIsLocalAddModalOpen(true)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span className="text-xs font-semibold">Добавить ученика</span>
        </button>

        <button
          type="button"
          onClick={() => setIsReminderModalOpen(true)}
          className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <BellRing className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold">Напомнить</span>
        </button>
      </div>

      {/* 3. ОСНОВНЫЕ KPI КАРТОЧКИ С ТОНКИМИ ШРИФТАМИ */}
      <div className="space-y-2.5">
        
        {/* КАРТОЧКА: ВЫРУЧКА ЗА МЕСЯЦ */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Выручка за сентябрь</span>
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

        {/* СЕТКА: АКТИВНАЯ БАЗА И СРЕДНЯЯ ЯВКА */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* АКТИВНАЯ БАЗА */}
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

          {/* ПОСЕЩАЕМОСТЬ И СРЕДНЯЯ ЯВКА */}
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

        {/* ДОПОЛНИТЕЛЬНАЯ ПРОФЕССИОНАЛЬНАЯ АНАЛИТИКА: RETENTION И СРЕДНИЙ ЧЕК */}
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

        {/* ГРАФИК ЗАГРУЗКИ ПО ДНЯМ НЕДЕЛИ */}
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
                      item.isToday 
                        ? 'bg-blue-600 shadow-xs' 
                        : 'bg-slate-300'
                    }`}
                    style={{ height: `${item.percent}%` }}
                  ></div>
                </div>
                <span className={`text-[10px] font-bold ${item.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. РАСПИСАНИЕ НА СЕГОДНЯ (СУББОТА) — АДАПТИВНОЕ, БЕЗ СЪЕЗЖАНИЙ */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Суббота, расписание на сегодня</h3>
              <p className="text-[10px] text-slate-400">
                Проведено: {completedTodayCount} из {todaySchedule.length} занятий
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            26 сентября
          </span>
        </div>

        {/* СПИСОК КАРТОЧЕК РАСПИСАНИЯ — НА ВСЮ ШИРИНУ, НИЧЕГО НЕ ВЫЛЕЗАЕТ */}
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
                  className={`w-full p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    isCompleted 
                      ? 'bg-emerald-50/40 border-emerald-200/80' 
                      : isCanceled
                        ? 'bg-rose-50/40 border-rose-200/70'
                        : 'bg-slate-50/60 border-slate-200/90'
                  }`}
                >
                  {/* Верхний ряд: Время, Формат и статус */}
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
                          <XCircle className="w-3 h-3" /> Не проведено
                        </span>
                      )}
                      {!isCompleted && !isCanceled && (
                        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          Ожидается
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Средний ряд: Имя, Локация и остаток */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-500">
                        {item.gym}
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium">
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

                  {/* Нижний ряд: Кнопки «Программа дня», «Проведено» и «Не проведено» */}
                  <div className="flex items-center gap-1.5 pt-1">
                    
                    {/* Кнопка открытия программы дня */}
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForWorkout(item)}
                      className="flex-1 py-2 px-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs"
                      title="Посмотреть программу на сегодня"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>План дня</span>
                    </button>

                    {/* Кнопка Проведено */}
                    <button
                      type="button"
                      onClick={() => handleMarkCompleted(item.id)}
                      className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs ${
                        isCompleted 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Проведено</span>
                    </button>

                    {/* Кнопка Не проведено */}
                    <button
                      type="button"
                      onClick={() => handleMarkCanceled(item.id)}
                      className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-2xs ${
                        isCanceled 
                          ? 'bg-rose-600 text-white font-bold' 
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Не проведено</span>
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= МОДАЛКА: ПРОСМОТР ПРОГРАММЫ НА ЭТОТ ДЕНЬ ================= */}
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
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Содержимое программы дня */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Целевой фокус сессии:</span>
                <p className="text-xs font-bold text-blue-950 mt-0.5">{selectedStudentForWorkout.focus}</p>
                <p className="text-[10.5px] text-blue-900/80 mt-1">Клуб: {selectedStudentForWorkout.gym}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Упражнения и рабочие веса:</span>
                
                {selectedStudentForWorkout.exercises.map((ex, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{idx + 1}. {ex.name}</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">{ex.sets}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {ex.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudentForWorkout(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-semibold active:scale-98 transition-all"
            >
              Закрыть программу
            </button>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: БЫСТРЫЕ НАПОМИНАНИЯ (3 СЦЕНАРИЯ) ================= */}
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
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Выбор сценария */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setReminderType('today')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                О тренировке
              </button>
              <button
                type="button"
                onClick={() => setReminderType('payment')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'payment' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Об оплате
              </button>
              <button
                type="button"
                onClick={() => setReminderType('absence')}
                className={`py-2 text-[10.5px] font-medium rounded-xl text-center transition-all ${
                  reminderType === 'absence' ? 'bg-white text-rose-600 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Не будет в зале
              </button>
            </div>

            {/* Список учеников по выбранному сценарию */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reminderType === 'today' && (
                <>
                  <p className="text-[10px] text-slate-400 px-1">Атлеты, записанные на сегодня (Суббота):</p>
                  {todaySchedule.map(st => (
                    <div key={st.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-900">{st.name}</p>
                        <p className="text-[10px] text-slate-400">Время: {st.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendReminder(st.phone, `Привет, ${st.name}! Напоминаю о сегодняшней тренировке в ${st.time}. Жду вовремя! 💪`)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95"
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
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 active:scale-95"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Напомнить</span>
                      </button>
                    </div>
                  ))}
                </>
              )}

              {reminderType === 'absence' && (
                <>
                  <p className="text-[10px] text-rose-500 px-1">Предупреждение об отмене или форс-мажоре:</p>
                  <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2">
                    <p className="text-[11px] text-rose-900 leading-relaxed">
                      Отправить всем ученикам на сегодня: «Уважаемые атлеты, по техническим причинам меня сегодня не будет в зале. Все занятия переносятся без сгорания».
                    </p>
                    <button
                      type="button"
                      onClick={() => alert('Уведомление отправлено всем подопечным на сегодня!')}
                      className="w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold active:scale-98"
                    >
                      Разослать всем на сегодня
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: ДОБАВИТЬ УЧЕНИКА ================= */}
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
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
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
                  placeholder="+7 (777) 000-00-00"
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
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs active:scale-98 transition-all mt-2"
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
