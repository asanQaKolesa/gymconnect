// src/components/trainer/tabs/AnalyticsTab.jsx
import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  ShieldAlert, 
  MessageCircle, 
  ChevronRight,
  Users
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';

export default function AnalyticsTab({ students = [], onUpdate }) {
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Расчет ключевых аналитических показателей
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active' || !s.status);
  const pausedStudents = students.filter(s => s.status === 'paused');
  const leftStudents = students.filter(s => s.status === 'left');

  // Кандидаты на выбывание (остаток <= 2 занятий)
  const riskStudents = activeStudents.filter(s => {
    const left = s.left_trainings !== undefined ? s.left_trainings : (s.remaining_workouts !== undefined ? s.remaining_workouts : 12);
    return left <= 2;
  });

  // Расчет процента удержания клиентов
  const retentionRate = totalStudents > 0 
    ? Math.round((activeStudents.length / totalStudents) * 100) 
    : 100;

  const handleWhatsAppRemind = (e, phone, name, leftCount) => {
    e.stopPropagation();
    if (!phone) {
      alert('У ученика не указан номер WhatsApp');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Привет, ${name}! Напоминаю, что по твоему абонементу осталось ${leftCount} зан. Давай запланируем продление, чтобы сохранить за тобой удобное время в графике! 💪`
    );
    window.open(`https://wa.me/7${cleanPhone.startsWith('7') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-3.5 select-none pb-12 text-xs">
      
      {/* 1. Сводные карточки аналитики */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-slate-400 font-medium">Удержание (Retention)</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">{retentionRate}%</p>
          <span className="text-[10px] text-slate-400 block font-normal">
            {activeStudents.length} из {totalStudents} продолжают
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-3.5 rounded-3xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-slate-400 font-medium">Зона риска (≤ 2 зан.)</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className={`text-xl font-bold font-mono mt-0.5 ${
            riskStudents.length > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {riskStudents.length} уч.
          </p>
          <span className="text-[10px] text-slate-400 block font-normal">
            Требуют звонка или сообщения
          </span>
        </div>
      </div>

      {/* 2. Детальная сегментация базы */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Структура базы подопечных</h3>
              <p className="text-[10px] text-slate-400">Состояние клиентов в CRM</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            Всего: {totalStudents}
          </span>
        </div>

        <div className="space-y-2">
          {/* Активные */}
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-semibold text-slate-800">Активно тренируются</span>
            </div>
            <span className="text-xs font-bold font-mono text-slate-900">{activeStudents.length} чел.</span>
          </div>

          {/* На паузе */}
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-800">Заморозка / отпуск</span>
            </div>
            <span className="text-xs font-bold font-mono text-slate-900">{pausedStudents.length} чел.</span>
          </div>

          {/* Завершили */}
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-semibold text-slate-800">Не продлили абонемент</span>
            </div>
            <span className="text-xs font-bold font-mono text-slate-900">{leftStudents.length} чел.</span>
          </div>
        </div>
      </div>

      {/* 3. Список учеников, требующих продления (Зона риска) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="font-bold text-xs text-slate-900">Кандидаты на продление (≤ 2 зан.)</h3>
              <p className="text-[10px] text-slate-400">Нажмите на карточку для перехода в профиль</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
            {riskStudents.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {riskStudents.length > 0 ? (
            riskStudents.map(student => {
              const left = student.left_trainings !== undefined 
                ? student.left_trainings 
                : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
              
              return (
                <div 
                  key={student.id} 
                  onClick={() => setSelectedStudentForModal(student)}
                  className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      {student.first_name} {student.last_name || ''}
                    </h4>
                    <p className="text-[10.5px] text-slate-500">
                      {student.gym ? student.gym.split('|')[0] : 'Зал не указан'}
                    </p>
                    <span className="text-[10px] font-semibold text-rose-600 font-mono block">
                      Осталось всего: {left} зан.
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {student.phone && (
                      <button
                        type="button"
                        onClick={(e) => handleWhatsAppRemind(e, student.phone, student.first_name, left)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-[10.5px] flex items-center gap-1 border border-emerald-200/80 active:scale-95 transition-all cursor-pointer"
                        title="Напомнить в WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Напомнить</span>
                      </button>
                    )}

                    <div className="p-1 text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
              <p className="font-semibold text-slate-700">Отличный показатель дисциплины!</p>
              <p className="text-[10.5px] text-slate-400">У всех активных подопечных достаточный запас оплаченных занятий.</p>
            </div>
          )}
        </div>
      </div>

      {/* Полноэкранный профиль ученика */}
      <StudentDetailModal 
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        student={selectedStudentForModal}
        onUpdate={onUpdate}
      />

    </div>
  );
}
