import React, { useState } from 'react';
import { Calendar, Clock, Eye, UserCheck, UserX, Dumbbell } from 'lucide-react';
import { supabase } from '../../../../supabaseClient';

export default function TodayScheduleWidget({ students, onSelectStudent }) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const daysMap = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const todayName = daysMap[new Date().getDay()];
  const formattedDate = "Пятница, 25 сентября";

  const todayStudents = students.filter(s => {
    const days = s.workout_days || ['Понедельник', 'Среда', 'Пятница'];
    return (s.status === 'active' || !s.status) && days.includes(todayName);
  });

  const morningStudents = todayStudents.filter(s => (s.workout_time_slot || '').toLowerCase().includes('утро'));
  const afternoonStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('обед') || slot.includes('день');
  });
  const eveningStudents = todayStudents.filter(s => {
    const slot = (s.workout_time_slot || '').toLowerCase();
    return slot.includes('вечер') || (!slot.includes('утро') && !slot.includes('обед') && !slot.includes('день'));
  });

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
      alert(`Занятие засчитано! У ${student.first_name} осталось ${currentLeft - 1} зан.`);
      window.location.reload();
    }
  };

  const handleAttendanceNo = (e, student) => {
    e.stopPropagation();
    alert(`Пропуск зафиксирован. Занятие для ${student.first_name} отмечено как прогул.`);
  };

  const formatPackageType = (pkg) => {
    if (!pkg) return 'Индивидуальный';
    const p = pkg.toLowerCase();
    if (p.includes('individual') || p.includes('индивидуальный')) return 'Индивидуальный';
    if (p.includes('group') || p.includes('группа')) return 'Мини-группа';
    if (p.includes('split') || p.includes('сплит')) return 'Сплит (вдвоем)';
    return pkg;
  };

  const renderStudentCard = (student) => {
    const isExpanded = expandedStudentId === student.id;
    const leftTr = student.left_trainings !== undefined ? student.left_trainings : 12;

    return (
      <div key={student.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 transition-all space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm">
              {student.first_name?.[0] || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs cursor-pointer hover:text-blue-600" onClick={() => onSelectStudent(student)}>
                {student.first_name} {student.last_name}
              </h4>
              <p className="text-[10px] text-slate-500">
                Зал: {student.gym || 'Не указан'} • <span className="text-blue-600 font-semibold">Остаток: {leftTr} зан.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 border border-blue-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isExpanded ? 'Скрыть план' : 'План тренировки'}</span>
            </button>

            <button
              onClick={(e) => handleAttendanceYes(e, student)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Был</span>
            </button>

            <button
              onClick={(e) => handleAttendanceNo(e, student)}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 border border-rose-200"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Не был</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 p-3 bg-white border border-blue-100 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-blue-600" /> Тариф: {formatPackageType(student.package_type)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Слот: {student.workout_time_slot || 'Вечер'}</span>
            </div>
            
            <div className="text-slate-600 space-y-1">
              <p><b>Сегодняшний фокус программы:</b> Базовая гипертрофия (Спина / Бицепс)</p>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1 text-slate-700">
                <p>1. Тяга верхнего блока — 4 подхода по 10 раз (Вес: 50 кг)</p>
                <p>2. Тяга штанги к поясу — 4 подхода по 10 раз (Вес: 60 кг)</p>
                <p>3. Подъем гантелей на бицепс — 3 подхода по 12 раз (Вес: 14 кг)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Тренировки на сегодня ({formattedDate})</h3>
        </div>
        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-xl text-xs font-mono">
          Всего: {todayStudents.length} атлетов
        </span>
      </div>

      {todayStudents.length > 0 ? (
        <div className="space-y-4">
          {morningStudents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Утро (08:00 - 12:00)
              </h4>
              {morningStudents.map(renderStudentCard)}
            </div>
          )}

          {afternoonStudents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Обед / День (12:00 - 16:00)
              </h4>
              {afternoonStudents.map(renderStudentCard)}
            </div>
          )}

          {eveningStudents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Вечер (16:00 - 21:00)
              </h4>
              {eveningStudents.map(renderStudentCard)}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 space-y-1">
          <p className="font-medium text-slate-600 text-sm">На сегодня запланированных тренировок нет.</p>
          <p className="text-[11px]">Убедитесь, что в карточках учеников проставлены дни недели и тайм-слоты.</p>
        </div>
      )}
    </div>
  );
}
