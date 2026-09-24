// src/components/trainer/tabs/StudentsListTab.jsx
import React, { useState } from 'react';
import { ChevronRight, MessageCircle, Calendar, Dumbbell, Eye, AlertCircle, Cake, FileText } from 'lucide-react';

export default function StudentsListTab({ students, formatGoal, onSelectStudent, onOpenAddModal }) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const handleWhatsAppClick = (e, phone) => {
    e.stopPropagation();
    if (!phone) {
      alert('У ученика не указан номер WhatsApp');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/7${cleanPhone}`, '_blank');
  };

  const formatUsername = (username) => {
    if (!username) return 'Без Telegram';
    const clean = username.replace(/^@+/, '');
    return `@${clean}`;
  };

  const getLocalizedGoal = (goal) => {
    if (!goal) return 'Не указана';
    const g = goal.toLowerCase().trim();
    if (g === 'tone' || g.includes('тонус') || g.includes('рекомпозиция')) return 'Тонус и рекомпозиция';
    if (g === 'mass' || g.includes('набор')) return 'Набор массы и гипертрофия';
    if (g === 'cut' || g.includes('сушка') || g.includes('похудение')) return 'Похудение и сушка';
    if (g === 'functional' || g.includes('функционал')) return 'Функциональный тренинг';
    return formatGoal ? formatGoal(goal) : goal;
  };

  // Проверка на день рождения сегодня (формат даты YYYY-MM-DD или DD.MM)
  const isBirthdayToday = (birthDateStr) => {
    if (!birthDateStr) return false;
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    // Парсим строку даты
    const parts = birthDateStr.split(/[-.]/);
    if (parts.length >= 2) {
      // Если формат YYYY-MM-DD
      if (parts[0].length === 4) {
        return Number(parts[1]) === todayMonth && Number(parts[2]) === todayDay;
      }
      // Если формат DD.MM.YYYY
      if (parts[2]?.length === 4 || parts.length === 2) {
        return Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth;
      }
    }
    return false;
  };

  // Считаем учеников с низким балансом
  const lowBalanceStudents = students.filter(s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);
  const birthdayStudents = students.filter(s => isBirthdayToday(s.birth_date));

  return (
    <div className="space-y-4">
      {/* Лента быстрых уведомлений / алертов */}
      {(lowBalanceStudents.length > 0 || birthdayStudents.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-sm flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Важные уведомления по базе учеников</span>
          </div>
          <div className="space-y-1 text-amber-50">
            {lowBalanceStudents.length > 0 && (
              <p>• У <b>{lowBalanceStudents.length}</b> учеников осталось мало оплаченных занятий (≤ 2 зан.). Рекомендуем напомнить об продлении абонемента.</p>
            )}
            {birthdayStudents.length > 0 && (
              <p>• 🎉 Сегодня день рождения у: <b>{birthdayStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ')}</b>! Обязательно поздравьте их.</p>
            )}
          </div>
        </div>
      )}

      {/* Основной блок списка учеников */}
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
              const isExpanded = expandedStudentId === student.id;
              const hasBirthday = isBirthdayToday(student.birth_date);

              return (
                <div 
                  key={student.id} 
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-3"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="space-y-1 cursor-pointer flex-1" onClick={() => onSelectStudent(student)}>
                      <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{student.first_name} {student.last_name}</span>
                        
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          student.status === 'paused' ? 'bg-amber-100 text-amber-800' :
                          student.status === 'left' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {student.status === 'paused' ? 'На паузе' : student.status === 'left' ? 'Ушел' : 'Активен'}
                        </span>

                        {hasBirthday && (
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 animate-pulse">
                            <Cake className="w-3 h-3" /> День рождения сегодня!
                          </span>
                        )}
                      </h4>
                      
                      <p className="text-xs text-slate-500 mt-0.5">
                        Цель: <span className="text-blue-600 font-medium">{getLocalizedGoal(student.goal)}</span> | Зал: {student.gym || 'Не указан'}
                      </p>

                      {/* Блок вывода заметки тренера, если она сохранена */}
                      {student.trainer_notes && (
                        <div className="flex items-start gap-1.5 mt-1.5 bg-amber-50/80 border border-amber-200 p-2 rounded-xl text-[11px] text-amber-900">
                          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><b>Заметка:</b> {student.trainer_notes}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                          {formatUsername(student.username)}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-semibold">
                          {student.monthly_price ? `${student.monthly_price.toLocaleString()} ₸` : '0 ₸'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${
                          leftTrainings <= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          <Calendar className="w-3 h-3" /> Остаток: {leftTrainings} / {totalTrainings} зан.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border border-blue-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Скрыть программу' : 'Программа'}</span>
                      </button>

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
                      <span className="text-xs font-semibold text-blue-600 hidden md:inline cursor-pointer" onClick={() => onSelectStudent(student)}>Профиль</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => onSelectStudent(student)} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-50 border border-blue-100 rounded-xl space-y-2 animate-in fade-in duration-200 text-xs mt-1">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5 text-blue-600" /> Тариф: {student.package_type || 'Персональный (1 на 1)'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">График: {(student.workout_days || []).join(', ')} ({student.workout_time_slot || 'Вечер'})</span>
                      </div>

                      <div className="text-slate-600 space-y-1">
                        <p><b>Назначенный план упражнений:</b></p>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1 text-slate-700">
                          <p>• День 1 (База): Приседания со штангой — 4x8, Жим лежа — 4x8</p>
                          <p>• День 2 (Верх): Тяга блока — 4x10, Подтягивания — 3x8</p>
                          <p>• День 3 (Ноги/Плечи): Румынская тяга — 4x10, Махи гантелями — 3x12</p>
                        </div>
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
