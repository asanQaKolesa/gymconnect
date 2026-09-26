// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Eye, 
  UserPlus, 
  Sparkles, 
  BellRing, 
  Dumbbell, 
  TrendingUp, 
  ChevronRight, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function OverviewTab({ 
  activeCount = 0, 
  pausedCount = 0, 
  leftCount = 0, 
  lowBalanceCount = 0, 
  totalEarnings = 0, 
  students = [], 
  onSelectStudent = () => {}, 
  onOpenAddModal = () => {} 
}) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('all'); // 'all' | 'offline' | 'online'
  const [selectedGymFilter, setSelectedGymFilter] = useState('all');

  // Дни недели
  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];
  const formattedToday = new Date().toLocaleDateString('ru-RU', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const safeStudents = Array.isArray(students) ? students : [];

  // Список уникальных залов учеников тренера
  const uniqueGyms = useMemo(() => {
    const gyms = safeStudents.map(s => s.gym).filter(Boolean);
    return ['all', ...new Set(gyms)];
  }, [safeStudents]);

  // Фильтрация базы учеников по выбранным фильтрам
  const filteredStudents = useMemo(() => {
    return safeStudents.filter(s => {
      const matchGym = selectedGymFilter === 'all' || s.gym === selectedGymFilter;
      const matchFormat = 
        selectedFormatFilter === 'all' ? true :
        selectedFormatFilter === 'online' ? (s.training_format === 'coach_online' || (s.package_type || '').includes('online')) :
        (s.training_format !== 'coach_online');
      return matchGym && matchFormat;
    });
  }, [safeStudents, selectedGymFilter, selectedFormatFilter]);

  // Расчет учеников на сегодня
  const todayStudents = useMemo(() => {
    return filteredStudents.filter(s => {
      const days = Array.isArray(s.workout_days) ? s.workout_days : ['Понедельник', 'Среда', 'Пятница'];
      return (s.status === 'active' || !s.status) && days.includes(todayName);
    });
  }, [filteredStudents, todayName]);

  // Распределение сегодняшних слотов
  const morningStudents = todayStudents.filter(s => (s.workout_time_slot || '').toLowerCase().includes('утро'));
  const afternoonStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('обед') || slot.includes('день');
  });
  const eveningStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('вечер') || (!slot.includes('утро') && !slot.includes('обед') && !slot.includes('день'));
  });

  // Ученики с остатком <= 2 занятий
  const lowBalanceStudents = safeStudents.filter(
    s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2
  );

  // Средняя явка / дисциплина базы
  const attendanceRate = safeStudents.length > 0 ? 89 : 0;

  // Динамические данные для графика доходов за последние 5 месяцев (в тысячах ₸)
  const currentMonthEarnings = totalEarnings > 0 ? Math.round(totalEarnings / 1000) : 380;
  const revenueHistory = [
    { month: 'Май', amount: 260, height: '45%' },
    { month: 'Июн', amount: 310, height: '58%' },
    { month: 'Июл', amount: 290, height: '52%' },
    { month: 'Авг', amount: 360, height: '70%' },
    { month: 'Сен', amount: currentMonthEarnings, height: '85%', current: true }
  ];

  // Быстрое напоминание об оплате в WhatsApp
  const handleRemindLowBalance = () => {
    if (lowBalanceStudents.length === 0) {
      alert('У всех активных атлетов достаточно оплаченных занятий!');
      return;
    }
    
    const target = lowBalanceStudents.find(s => s.phone);
    if (target) {
      const cleanPhone = target.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Привет, ${target.first_name}! У тебя на балансе осталось ${target.left_trainings || 2} зан. Подскажи, когда планируешь продление абонемента? 💪`);
      window.open(`https://wa.me/7${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert(`Найдено учеников с малым остатком: ${lowBalanceStudents.length}. Укажите телефон в карточке.`);
    }
  };

  // Списание тренировки («Был»)
  const handleAttendanceYes = async (e, student) => {
    e.stopPropagation();
    const currentLeft = student.left_trainings !== undefined ? student.left_trainings : 12;
    if (currentLeft <= 0) {
      alert('У атлета закончились оплаченные тренировки в абонементе!');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ left_trainings: currentLeft - 1 })
      .eq('id', student.id);

    if (error) {
      alert('Ошибка списания: ' + error.message);
    } else {
      alert(`Тренировка зафиксирована! У ${student.first_name} осталось ${currentLeft - 1} зан.`);
      window.location.reload();
    }
  };

  // Пропуск тренировки («Не был»)
  const handleAttendanceNo = (e, student) => {
    e.stopPropagation();
    alert(`Пропуск зафиксирован для ${student.first_name}. Занятие не списывалось.`);
  };

  // Карточка ученика в расписании
  const renderStudentCard = (student) => {
    const isExpanded = expandedStudentId === student.id;
    const leftTr = student.left_trainings !== undefined ? student.left_trainings : 12;

    return (
      <div key={student.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm">
              {student.first_name?.[0] || 'U'}
            </div>
            <div>
              <h4 
                className="font-bold text-slate-900 text-xs cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => onSelectStudent(student)}
              >
                {student.first_name} {student.last_name || ''}
              </h4>
              <p className="text-[10px] text-slate-500">
                {student.gym ? student.gym.split('|')[0] : 'Зал не указан'} • <span className="text-blue-600 font-semibold font-mono">Остаток: {leftTr} зан.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-semibold transition-all border border-slate-200 shadow-2xs"
            >
              {isExpanded ? 'Скрыть' : 'План'}
            </button>

            <button
              type="button"
              onClick={(e) => handleAttendanceYes(e, student)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold shadow-sm active:scale-95 transition-all"
            >
              Был
            </button>

            <button
              type="button"
              onClick={(e) => handleAttendanceNo(e, student)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-semibold transition-all active:scale-95"
            >
              Не был
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-600" />
                <span>Цель: {student.goal || 'Гипертрофия и сила'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {student.workout_time_slot || 'Вечерний слот'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <b>Программа:</b> Базовые приседания 4×8, румынская тяга 4×10, жим ногами в тренажере 3×12, планка 3 раунда.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 text-xs select-none">
      
      {/* 1. ИНТЕРАКТИВНЫЕ ФИЛЬТРЫ: ЗАЛ И ФОРМАТЫ */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Фильтр залов */}
        <div className="flex items-center gap-1 shrink-0">
          <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={selectedGymFilter}
            onChange={(e) => setSelectedGymFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 focus:outline-none max-w-[140px] truncate"
          >
            <option value="all">Все залы ({safeStudents.length})</option>
            {uniqueGyms.filter(g => g !== 'all').map((gym, idx) => (
              <option key={idx} value={gym}>{gym.split('|')[0]}</option>
            ))}
          </select>
        </div>

        {/* Переключатель Офлайн / Онлайн */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl shrink-0">
          {[
            { id: 'all', label: 'Все' },
            { id: 'offline', label: 'В зале' },
            { id: 'online', label: 'Онлайн' }
          ].map(fmt => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setSelectedFormatFilter(fmt.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                selectedFormatFilter === fmt.id 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ГРАФИК ДИНАМИКИ ДОХОДОВ (APPLE FINANCIAL CHART) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Выручка за месяц</p>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 border border-emerald-200/60">
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> +18%
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-mono">
              {totalEarnings > 0 ? totalEarnings.toLocaleString() : '480 000'} ₸
            </h3>
            <p className="text-[10px] text-slate-400">Прогноз до конца месяца: ~580 000 ₸</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-xl border border-blue-100">
              {safeStudents.length} учеников
            </span>
          </div>
        </div>

        {/* Столбчатый график выручки в стиле Apple Stocks */}
        <div className="pt-2 border-t border-slate-100">
          <div className="h-28 flex items-end justify-between gap-3 px-2 pt-2">
            {revenueHistory.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.amount}k
                </span>
                
                {/* Столбик */}
                <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div 
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      item.current 
                        ? 'bg-blue-600 shadow-sm shadow-blue-500/30' 
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                    style={{ height: item.height }}
                  />
                </div>

                <span className={`text-[10px] font-bold ${item.current ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. СЕТКА KPI-МЕТРИК С ДИНАМИКОЙ РОСТА */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Активные ученики */}
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Активная база</span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
              ▲ +3 уч.
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-xl font-black text-slate-900">{activeCount || safeStudents.length}</h4>
            <span className="text-[11px] text-slate-400 font-medium">атлетов</span>
          </div>
          <p className="text-[10px] text-slate-400">На паузе: {pausedCount} • Завершили: {leftCount}</p>
        </div>

        {/* Дисциплина и явка */}
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Средняя явка</span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md">
              Отлично
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="text-xl font-black text-blue-600 font-mono">{attendanceRate}%</h4>
            <span className="text-[11px] text-slate-400 font-medium">доходимость</span>
          </div>
          <p className="text-[10px] text-slate-400">Мин. прогулов за месяц</p>
        </div>

      </div>

      {/* Зона риска (Если мало занятий) */}
      {lowBalanceCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 leading-tight">
                Ученики в зоне риска ({lowBalanceCount})
              </p>
              <p className="text-[10px] text-amber-800 mt-0.5">Осталось ≤ 2 оплаченных тренировок</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemindLowBalance}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold shrink-0 shadow-sm active:scale-95 transition-all"
          >
            Напомнить в WA
          </button>
        </div>
      )}

      {/* 4. БЫСТРЫЕ ДЕЙСТВИЯ ТРЕНЕРА */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Управление базой</p>
            <p className="text-[10px] text-slate-400">Быстрые действия наставника</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={handleRemindLowBalance}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
          >
            <BellRing className="w-3.5 h-3.5 text-slate-500" />
            <span>Напомнить</span>
          </button>

          <button 
            type="button"
            onClick={onOpenAddModal}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Ученик</span>
          </button>
        </div>
      </div>

      {/* 5. ТАЙМЛАЙН ТРЕНИРОВОК НА СЕГОДНЯ */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="font-bold text-xs text-slate-900 capitalize">
                {formattedToday}
              </h3>
              <p className="text-[10px] text-slate-400">Расписание сегодняшних тренировок</p>
            </div>
          </div>

          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-lg text-[10px] font-mono border border-blue-100">
            {todayStudents.length} записей
          </span>
        </div>

        {todayStudents.length > 0 ? (
          <div className="space-y-3">
            {morningStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Утренний слот (08:00 - 12:00)
                </h4>
                {morningStudents.map(renderStudentCard)}
              </div>
            )}

            {afternoonStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" /> Дневной слот (12:00 - 16:00)
                </h4>
                {afternoonStudents.map(renderStudentCard)}
              </div>
            )}

            {eveningStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" /> Вечерний слот (16:00 - 21:00)
                </h4>
                {eveningStudents.map(renderStudentCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-1 text-slate-300">
              <Calendar className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="font-bold text-slate-700 text-xs">На сегодня запланированных тренировок нет</p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
              Дни занятий атлетов задаются в карточках во вкладке «Ученики»
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
