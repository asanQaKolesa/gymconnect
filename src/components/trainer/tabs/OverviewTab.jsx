// src/components/trainer/tabs/OverviewTab.jsx
import React from 'react';
import { Users, DollarSign, Calendar, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OverviewTab({ activeCount, pausedCount, leftCount, lowBalanceCount, totalEarnings, students, onSelectStudent, onOpenAddModal }) {
  
  // Определяем день недели на сегодня
  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];

  // Ученики с тренировкой сегодня
  const todayStudents = students.filter(s => {
    const days = s.workout_days || ['Понедельник', 'Среда', 'Пятница'];
    return (s.status === 'active' || !s.status) && days.includes(todayName);
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Сетка KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{activeCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">На паузе</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{pausedCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Ушли</p>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{leftCount}</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Продление</p>
          <h3 className={`text-2xl font-black mt-1 ${lowBalanceCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {lowBalanceCount}
          </h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Доход / мес</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1">{totalEarnings.toLocaleString()} ₸</h3>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-base font-bold">Добро пожаловать в рабочую зону!</h2>
          <p className="text-blue-100 text-xs">Управляйте расписанием, кассой и программой тренировок подопечных в один клик.</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-bold shadow-md transition-all text-xs shrink-0"
        >
          + Добавить ученика
        </button>
      </div>

      {/* Ближайшие тренировки на сегодня */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Тренировки на сегодня ({todayName})</h3>
          </div>
          <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-xl text-[11px] font-mono">
            {todayStudents.length} атлетов
          </span>
        </div>

        <div className="space-y-2">
          {todayStudents.length > 0 ? (
            todayStudents.map((student) => (
              <div 
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{student.first_name} {student.last_name}</h4>
                  <p className="text-[10px] text-slate-500">Зал: {student.gym || 'Не указан'} • Слот: {student.workout_time_slot || 'Вечер'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    Остаток: {student.left_trainings !== undefined ? student.left_trainings : 12} зан.
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-6">На сегодня запланированных тренировок нет.</p>
          )}
        </div>
      </div>
    </div>
  );
}
