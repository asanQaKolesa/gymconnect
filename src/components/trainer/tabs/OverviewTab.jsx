// src/components/trainer/tabs/OverviewTab.jsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  Eye, 
  UserPlus, 
  Sparkles, 
  BellRing, 
  Dumbbell 
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

  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];

  // Безопасная фильтрация с защитой от undefined
  const safeStudents = Array.isArray(students) ? students : [];

  const todayStudents = safeStudents.filter(s => {
    const days = Array.isArray(s.workout_days) ? s.workout_days : ['Понедельник', 'Среда', 'Пятница'];
    return (s.status === 'active' || !s.status) && days.includes(todayName);
  });

  const morningStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('утро');
  });

  const afternoonStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('обед') || slot.includes('день');
  });

  const eveningStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('вечер') || (!slot.includes('утро') && !slot.includes('обед') && !slot.includes('день'));
  });

  const handleRemindLowBalance = () => {
    const lowStudents = safeStudents.filter(s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);
    if (lowStudents.length === 0) {
      alert('У всех активных учеников достаточно оплаченных занятий!');
      return;
    }
    
    const target = lowStudents.find(s => s.phone);
    if (target) {
      const cleanPhone = target.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Привет, ${target.first_name}! У тебя осталось мало оплаченных занятий (${target.left_trainings || 2} зан.). Напомни, когда сможешь закинуть оплату за следующий блок? 💪`);
      window.open(`https://wa.me/7${cleanPhone}?text=${message}`, '_blank');
    } else {
      alert(`Найдено учеников с низким балансом: ${lowStudents.length}`);
    }
  };

  const handleAttendanceYes = async (e, student) => {
    e.stopPropagation();
    const currentLeft = student.left_trainings !== undefined ? student.left_trainings : 12;
    if (currentLeft <= 0) {
      alert('У ученика закончились оплаченные тренировки!');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ left_trainings: currentLeft - 1 })
      .eq('id', student.id);

    if (error) {
      alert('Ошибка списания: ' + error.message);
    } else {
      alert(`Занятие списано! У ${student.first_name} осталось ${currentLeft - 1} зан.`);
      window.location.reload();
    }
  };

  const renderStudentCard = (student) => {
    const isExpanded = expandedStudentId === student.id;
    const leftTr = student.left_trainings !== undefined ? student.left_trainings : 12;

    return (
      <div key={student.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm">
              {student.first_name?.[0] || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs cursor-pointer hover:text-blue-600" onClick={() => onSelectStudent(student)}>
                {student.first_name} {student.last_name || ''}
              </h4>
              <p className="text-[10px] text-slate-500">
                Зал: {student.gym || 'Не указан'} • <span className="text-blue-600 font-semibold">Остаток: {leftTr} зан.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-semibold transition-all border border-slate-200"
            >
              {isExpanded ? 'Скрыть' : 'План'}
            </button>

            <button
              onClick={(e) => handleAttendanceYes(e, student)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow-sm"
            >
              Был
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-800 text-[11px]">Фокус программы</span>
              <span className="text-[10px] text-slate-400 font-mono">{student.workout_time_slot || 'Вечер'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Базовая гипертрофия: 4 подхода тяги, 4 подхода приседаний, пресс 3 подхода.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3.5 text-xs select-none">
      
      {/* Сетка показателей KPI */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных атлетов</p>
          <h3 className="text-xl font-black text-blue-600 mt-0.5">{activeCount}</h3>
        </div>
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Мало занятий (≤2)</p>
          <h3 className={`text-xl font-black mt-0.5 ${lowBalanceCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {lowBalanceCount}
          </h3>
        </div>
        <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-sm col-span-2">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Доход за месяц</p>
          <h3 className="text-xl font-black text-emerald-600 mt-0.5">{totalEarnings.toLocaleString()} ₸</h3>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Ученики</p>
            <p className="text-[10px] text-slate-400">Быстрое действие</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleRemindLowBalance}
            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Напомнить</span>
          </button>
          <button 
            onClick={onOpenAddModal}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Ученик</span>
          </button>
        </div>
      </div>

      {/* Сегодняшние тренировки */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Тренировки на сегодня ({todayName})</h3>
          </div>
          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] font-mono">
            {todayStudents.length} атлетов
          </span>
        </div>

        {todayStudents.length > 0 ? (
          <div className="space-y-3">
            {morningStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Утро
                </h4>
                {morningStudents.map(renderStudentCard)}
              </div>
            )}

            {afternoonStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" /> День
                </h4>
                {afternoonStudents.map(renderStudentCard)}
              </div>
            )}

            {eveningStudents.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-500" /> Вечер
                </h4>
                {eveningStudents.map(renderStudentCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <p className="font-medium text-slate-600 text-xs">На сегодня запланированных тренировок нет</p>
            <p className="text-[10px]">Дни тренировок задаются в карточках учеников</p>
          </div>
        )}
      </div>

    </div>
  );
}
