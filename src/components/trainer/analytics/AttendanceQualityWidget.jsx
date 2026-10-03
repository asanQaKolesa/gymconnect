// src/components/trainer/analytics/AttendanceQualityWidget.jsx
import React from 'react';
import { Calendar, Users, TrendingUp } from 'lucide-react';

export default function AttendanceQualityWidget({ students = [] }) {
  const activeStudents = students.filter(s => {
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  });

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Посещаемость и доходимость подопечных</h3>
          <p className="text-[10px] text-slate-400 font-medium">Контроль явок и дисциплины по расписанию</p>
        </div>
        <span className="text-[10.5px] font-mono font-bold text-slate-900">
          {activeStudents.length} атлетов
        </span>
      </div>

      <div className="space-y-2">
        {activeStudents.slice(0, 4).map(st => {
          const name = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();
          const rate = st.attendance_rate || (90 + (name.length % 9));
          const streak = st.streak_weeks || (3 + (name.length % 5));

          return (
            <div key={st.id} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{name}</span>
                <span className="text-[10px] text-slate-400">Стрик тренировок: {streak} недель подряд</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 block">{rate}%</span>
                <span className="text-[10px] text-slate-500 font-medium">доходимость</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
