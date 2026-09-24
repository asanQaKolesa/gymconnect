// src/components/trainer/tabs/StudentsListTab.jsx
import React from 'react';
import { ChevronRight, DollarSign, MessageCircle, Calendar } from 'lucide-react';

export default function StudentsListTab({ students, formatGoal, onSelectStudent, onOpenAddModal }) {

  const handleWhatsAppClick = (e, phone) => {
    e.stopPropagation();
    if (!phone) {
      alert('У ученика не указан номер WhatsApp');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/7${cleanPhone}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Мои подопечные</h3>
          <p className="text-[10px] text-slate-500">Управление тренировками, абонементами и связью</p>
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
          students.map((student) => {
            const leftTrainings = student.left_trainings !== undefined ? student.left_trainings : 12;
            const totalTrainings = student.total_trainings || 12;

            return (
              <div 
                key={student.id} 
                onClick={() => onSelectStudent(student)}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
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
                    Цель: <span className="text-blue-600 font-medium">{formatGoal ? formatGoal(student.goal) : student.goal}</span> | Зал: {student.gym || 'Не указан'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                      @{student.username || 'Без Telegram'}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {student.monthly_price ? `${student.monthly_price} ₸` : '0 ₸'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${
                      leftTrainings <= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      <Calendar className="w-3 h-3" /> Остаток: {leftTrainings} / {totalTrainings} зан.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {student.phone && (
                    <button
                      onClick={(e) => handleWhatsAppClick(e, student.phone)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200"
                      title="Написать в WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  <span className="text-xs font-semibold text-blue-600 hidden md:inline">Профиль</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            У вас пока нет привязанных учеников. Нажмите кнопку «Добавить ученика» выше.
          </div>
        )}
      </div>
    </div>
  );
}
