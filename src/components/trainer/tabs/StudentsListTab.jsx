// src/components/trainer/tabs/StudentsListTab.jsx
import React from 'react';
import { ChevronRight, DollarSign } from 'lucide-react';

export default function StudentsListTab({ students, onSelectStudent, onOpenAddModal }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Мои подопечные</h3>
          <p className="text-[10px] text-slate-500">Управление тренировками и абонементами</p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          + Добавить ученика
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {students.length > 0 ? (
          students.map((student) => (
            <div 
              key={student.id} 
              onClick={() => onSelectStudent(student)}
              className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div>
                <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <span>{student.first_name} {student.last_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    student.status === 'paused' ? 'bg-amber-100 text-amber-800' :
                    student.status === 'left' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {student.status === 'paused' ? 'На паузе' : student.status === 'left' ? 'Ушел' : 'Активен'}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Цель: <span className="text-blue-600 font-medium">{student.goal}</span> | Зал: {student.gym}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                    {student.username || 'Без Telegram'}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {student.monthly_price ? `${student.monthly_price} ₸` : '0 ₸'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 hidden md:inline">Профиль</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            У вас пока нет привязанных учеников. Нажмите кнопку «Добавить ученика» выше.
          </div>
        )}
      </div>
    </div>
  );
}
