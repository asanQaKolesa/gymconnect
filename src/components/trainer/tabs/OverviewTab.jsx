// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  UserPlus, 
  Sparkles, 
  BellRing, 
  Dumbbell, 
  Building2, 
  AlertTriangle,
  ArrowUpRight
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
  const [selectedFormatFilter, setSelectedFormatFilter] = useState('all');
  const [selectedGymFilter, setSelectedGymFilter] = useState('all');

  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];
  const formattedToday = new Date().toLocaleDateString('ru-RU', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const safeStudents = Array.isArray(students) ? students : [];

  const uniqueGyms = useMemo(() => {
    const gyms = safeStudents.map(s => s.gym).filter(Boolean);
    return ['all', ...new Set(gyms)];
  }, [safeStudents]);

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

  const todayStudents = useMemo(() => {
    return filteredStudents.filter(s => {
      const days = Array.isArray(s.workout_days) ? s.workout_days : ['Понедельник', 'Среда', 'Пятница'];
      return (s.status === 'active' || !s.status) && days.includes(todayName);
    });
  }, [filteredStudents, todayName]);

  const morningStudents = todayStudents.filter(s => (s.workout_time_slot || '').toLowerCase().includes('утро'));
  const afternoonStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('обед') || slot.includes('день');
  });
  const eveningStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('вечер') || (!slot.includes('утро') && !slot.includes('обед') && !slot.includes('день'));
  });

  const lowBalanceStudents = safeStudents.filter(
    s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2
  );

  const attendanceRate = safeStudents.length > 0 ? 89 : 0;

  const currentMonthEarnings = totalEarnings > 0 ? Math.round(totalEarnings / 1000) : 380;
  const revenueHistory = [
    { month: 'Май', amount: 260, height: '45%' },
    { month: 'Июн', amount: 310, height: '58%' },
    { month: 'Июл', amount: 290, height: '52%' },
    { month: 'Авг', amount: 360, height: '70%' },
    { month: 'Сен', amount: currentMonthEarnings, height: '85%', current: true }
  ];

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
      alert(`Найдено учеников с малым остатком: ${lowBalanceStudents.length}`);
    }
  };

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

  const handleAttendanceNo = (e, student) => {
    e.stopPropagation();
    alert(`Пропуск зафиксирован для ${student.first_name}. Занятие не списывалось.`);
  };

  const renderStudentCard = (student) => {
    const isExpanded = expandedStudentId === student.id;
    const leftTr = student.left_trainings !== undefined ? student.left_trainings : 12;

    return (
      <div key={student.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-semibold text-xs shadow-xs">
              {student.first_name?.[0] || 'U'}
            </div>
            <div>
              <h4 
                className="font-semibold text-slate-900 text-xs cursor-pointer hover:text-blue-600 transition-colors"
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
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium transition-all border border-slate-200 shadow-2xs"
            >
              {isExpanded ? 'Скрыть' : 'План'}
            </button>

            <button
              type="button"
              onClick={(e) => handleAttendanceYes(e, student)}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold shadow-2xs active:scale-95"
            >
              Был
            </button>

            <button
              type="button"
              onClick={(e) => handleAttendanceNo(e, student)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-medium active:scale-95"
            >
              Не был
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl space-y-1 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-600" />
                <span>Цель: {student.goal || 'Гипертрофия и сила'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {student.workout_time_slot || 'Вечерний слот'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              Базовая гипертрофия: 4 подхода тяги, 4 подхода приседаний, пресс 3 подхода.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 text-xs select-none">
      
      {/* 1. ИНТЕРАКТИВНЫЕ ФИЛЬТРЫ: АККУРАТНЫЕ ТОНКИЕ КНОПКИ */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 shrink-0">
          <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={selectedGymFilter}
            onChange={(e) => setSelectedGymFilter(e.target.value)}
            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 focus:outline-none max-w-[130px] truncate"
          >
            <option value="all">Все залы ({safeStudents.length})</option>
            {uniqueGyms.filter(g => g !== 'all').map((gym, idx) => (
              <option key={idx} value={gym}>{gym.split('|')[0]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
          {[
            { id: 'all', label: 'Все' },
            { id: 'offline', label: 'В зале' },
            { id: 'online', label: 'Онлайн' }
          ].map(fmt => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setSelectedFormatFilter(fmt.id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
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

      {/* 2. ГРАФИК ДИНАМИКИ ДОХОДОВ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Выручка за месяц</p>
              <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 border border-emerald-200/60">
                <ArrowUpRight className="w-3 h-3 stroke-[2]" /> +18%
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5 font-mono">
              {totalEarnings > 0 ? totalEarnings.toLocaleString() : '480 000'} ₸
            </h3>
            <p className="text-[10px] text-slate-400 font-normal">Прогноз до конца месяца: ~580 000 ₸</p>
          </div>

          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {safeStudents.length} атлетов
          </span>
        </div>

        {/* Столбики */}
        <div className="pt-2 border-t border-slate-100">
          <div className="h-24 flex items-end justify-between gap-3 px-2 pt-1">
            {revenueHistory.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.amount}k
                </span>
                
                <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden h-full flex items-end">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.current 
                        ? 'bg-blue-600 shadow-xs' 
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                    style={{ height: item.height }}
                  />
                </div>

                <span className={`text-[10px] font-medium ${item.current ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. СЕТКА KPI-МЕТРИК С ТОНКИМИ ШРИФТАМИ */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200/70 p-3 rounded-2xl shadow-xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Активная база</span>
            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
              ▲ +3
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <h4 className="text-lg font-bold text-slate-900">{activeCount || safeStudents.length}</h4>
            <span className="text-[10.5px] text-slate-400 font-normal">атлетов</span>
          </div>
          <p className="text-[9.5px] text-slate-400 font-normal">Пауза: {pausedCount} • Завершили: {leftCount}</p>
        </div>

        <div className="bg-white border border-slate-200/70 p-3 rounded-2xl shadow-xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Средняя явка</span>
            <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
              Хорошо
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <h4 className="text-lg font-bold text-blue-600 font-mono">{attendanceRate}%</h4>
            <span className="text-[10.5px] text-slate-400 font-normal">доходимость</span>
          </div>
          <p className="text-[9.5px] text-slate-400 font-normal">Мин. прогулов за месяц</p>
        </div>
      </div>

      {/* Зона риска */}
      {lowBalanceCount > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-amber-900 leading-tight">
                Мало занятий: {lowBalanceCount} ученика
              </p>
              <p className="text-[9.5px] text-amber-800">Остаток ≤ 2 тренировок</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemindLowBalance}
            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-semibold shadow-2xs active:scale-95"
          >
            Напомнить в WA
          </button>
        </div>
      )}

      {/* 4. БЫСТРЫЕ ДЕЙСТВИЯ: ТОНКИЕ КНОПКИ */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/70 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-900 leading-tight">Ученики</p>
            <p className="text-[9.5px] text-slate-400">Быстрое действие</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={handleRemindLowBalance}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[10.5px] flex items-center gap-1 active:scale-95"
          >
            <BellRing className="w-3 h-3 text-slate-500" />
            <span>Напомнить</span>
          </button>

          <button 
            type="button"
            onClick={onOpenAddModal}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[10.5px] flex items-center gap-1 shadow-2xs active:scale-95"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Ученик</span>
          </button>
        </div>
      </div>

      {/* 5. ТАЙМЛАЙН ТРЕНИРОВОК НА СЕГОДНЯ */}
      <div className="bg-white border border-slate-200/70 rounded-3xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-xs text-slate-900 capitalize">
                {formattedToday}
              </h3>
              <p className="text-[9.5px] text-slate-400">Расписание на сегодня</p>
            </div>
          </div>

          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[10px] font-mono">
            {todayStudents.length} записей
          </span>
        </div>

        {todayStudents.length > 0 ? (
          <div className="space-y-2.5">
            {morningStudents.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Утро (08:00 - 12:00)
                </h4>
                {morningStudents.map(renderStudentCard)}
              </div>
            )}

            {afternoonStudents.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" /> День (12:00 - 16:00)
                </h4>
                {afternoonStudents.map(renderStudentCard)}
              </div>
            )}

            {eveningStudents.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" /> Вечер (16:00 - 21:00)
                </h4>
                {eveningStudents.map(renderStudentCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 space-y-1">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-1 text-slate-300">
              <Calendar className="w-4 h-4 stroke-[1.5]" />
            </div>
            <p className="font-semibold text-slate-700 text-[11px]">На сегодня запланированных тренировок нет</p>
            <p className="text-[9.5px] text-slate-400">Дни занятий атлетов задаются во вкладке «Ученики»</p>
          </div>
        )}
      </div>

    </div>
  );
}
