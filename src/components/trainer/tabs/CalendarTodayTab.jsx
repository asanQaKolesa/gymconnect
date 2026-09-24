// src/components/trainer/tabs/CalendarTodayTab.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Calendar, CheckCircle2, XCircle, Clock, User, Sparkles } from 'lucide-react';

export default function CalendarTodayTab({ students, onUpdate }) {
  const [loadingId, setLoadingId] = useState(null);

  // Определяем день недели на сегодня по-русски
  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];

  // Фильтруем учеников, у которых тренировка запланирована на сегодня
  const todayStudents = students.filter(s => {
    const days = s.workout_days || ['Понедельник', 'Среда', 'Пятница'];
    return (s.status === 'active' || !s.status) && days.includes(todayName);
  });

  const handleAttendTraining = async (student) => {
    const currentLeft = student.left_trainings !== undefined ? student.left_trainings : 12;
    if (currentLeft <= 0) {
      alert('У ученика закончились тренировки в абонементе!');
      return;
    }

    setLoadingId(student.id);
    const newLeft = currentLeft - 1;

    const { error } = await supabase
      .from('profiles')
      .update({ left_trainings: newLeft })
      .eq('id', student.id);

    setLoadingId(null);
    if (error) {
      alert('Ошибка списания тренировки: ' + error.message);
    } else {
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Расписание на сегодня ({todayName})</h3>
              <p className="text-[10px] text-slate-500">Отмечайте посещения атлетов в один клик для списания занятий</p>
            </div>
          </div>
          <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-xl border border-blue-100 text-xs font-mono">
            {todayStudents.length} тренировок сегодня
          </span>
        </div>

        <div className="space-y-2.5">
          {todayStudents.length > 0 ? (
            todayStudents.map((student) => {
              const left = student.left_trainings !== undefined ? student.left_trainings : 12;
              const total = student.total_trainings || 12;

              return (
                <div key={student.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{student.first_name} {student.last_name}</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                        {student.workout_time_slot || 'Вечер'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Цель: <span className="text-slate-700 font-medium">{student.goal || 'Не указана'}</span> | Зал: {student.gym || 'Не указан'}
                    </p>
                    <p className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 pt-0.5">
                      <Clock className="w-3.5 h-3.5" /> Остаток в абонементе: {left} / {total} занятий
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                    <button
                      type="button"
                      disabled={loadingId === student.id}
                      onClick={() => handleAttendTraining(student)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{loadingId === student.id ? 'Списание...' : 'Был (Списать 1 зан.)'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">На сегодня по графику нет запланированных тренировок.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Дни недели для каждого ученика настраиваются в их карточках во вкладке «Ученики».</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
