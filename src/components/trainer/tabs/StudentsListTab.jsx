// src/components/trainer/tabs/StudentsListTab.jsx
import React from 'react';
import { 
  ChevronRight, 
  MessageCircle, 
  AlertCircle, 
  Cake, 
  User, 
  Plus 
} from 'lucide-react';

export default function StudentsListTab({ 
  students = [], 
  formatGoal, 
  onOpenAddModal, 
  onUpdate, 
  onSelectStudent 
}) {
  const handleWhatsAppClick = (e, phone) => {
    e.stopPropagation();
    if (!phone) {
      alert('У ученика не указан номер WhatsApp');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/7${cleanPhone.startsWith('7') ? cleanPhone.slice(1) : cleanPhone}`, '_blank');
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

  // Проверка на день рождения сегодня
  const isBirthdayToday = (birthDateStr) => {
    if (!birthDateStr) return false;
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const parts = birthDateStr.split(/[-.]/);
    if (parts.length >= 2) {
      if (parts[0].length === 4) {
        return Number(parts[1]) === todayMonth && Number(parts[2]) === todayDay;
      }
      if (parts[2]?.length === 4 || parts.length === 2) {
        return Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth;
      }
    }
    return false;
  };

  const lowBalanceStudents = students.filter(s => 
    (s.status === 'active' || !s.status) && 
    (s.left_trainings !== undefined ? s.left_trainings : (s.remaining_workouts !== undefined ? s.remaining_workouts : 12)) <= 2
  );
  
  const birthdayStudents = students.filter(s => isBirthdayToday(s.birth_date));

  return (
    <div className="space-y-3.5 select-none pb-12">
      
      {/* 1. Блок оповещений по базе учеников */}
      {(lowBalanceStudents.length > 0 || birthdayStudents.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-4 shadow-xs flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Важные уведомления</span>
          </div>
          <div className="space-y-1 text-amber-50 leading-relaxed">
            {lowBalanceStudents.length > 0 && (
              <p>• У <b>{lowBalanceStudents.length}</b> учеников осталось ≤ 2 занятий. Пора напомнить о продлении блока.</p>
            )}
            {birthdayStudents.length > 0 && (
              <p>• 🎉 Сегодня день рождения у: <b>{birthdayStudents.map(s => `${s.first_name} ${s.last_name || ''}`).join(', ')}</b>!</p>
            )}
          </div>
        </div>
      )}

      {/* 2. Шапка списка учеников */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">База подопечных ({students.length})</h3>
            <p className="text-[10px] text-slate-400">Нажмите на карточку для открытия полного профиля</p>
          </div>
          <button 
            type="button"
            onClick={onOpenAddModal}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить</span>
          </button>
        </div>

        {/* 3. Список карточек учеников */}
        <div className="divide-y divide-slate-100">
          {students.length > 0 ? (
            students.map((student) => {
              const leftTrainings = student.left_trainings !== undefined 
                ? student.left_trainings 
                : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
              const totalTrainings = student.total_trainings || 12;
              const hasBirthday = isBirthdayToday(student.birth_date);

              return (
                <div 
                  key={student.id} 
                  onClick={() => onSelectStudent && onSelectStudent(student)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs overflow-hidden">
                        {student.photo_url || student.avatar_url ? (
                          <img src={student.photo_url || student.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{student.first_name ? student.first_name[0] : 'U'}</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">
                            {student.first_name} {student.last_name || ''}
                          </h4>

                          <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold ${
                            student.status === 'paused' 
                              ? 'bg-amber-100 text-amber-800' 
                              : student.status === 'left' 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-blue-50 text-blue-700'
                          }`}>
                            {student.status === 'paused' ? 'Пауза' : student.status === 'left' ? 'Завершил' : 'Активен'}
                          </span>

                          {hasBirthday && (
                            <span className="text-[9.5px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <Cake className="w-2.5 h-2.5" /> ДР
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          {getLocalizedGoal(student.goal)} • {student.gym ? student.gym.split('|')[0] : 'Зал не указан'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-normal">Остаток</span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border inline-block mt-0.5 ${
                        leftTrainings <= 2 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}>
                        {leftTrainings} / {totalTrainings}
                      </span>
                    </div>
                  </div>

                  {/* Нижняя строчка */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">
                        {formatUsername(student.username)}
                      </span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        {student.monthly_price ? `${Number(student.monthly_price).toLocaleString()} ₸` : '0 ₸'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {student.phone && (
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppClick(e, student.phone)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 border border-emerald-200/80 active:scale-95 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Написать</span>
                        </button>
                      )}

                      <div className="p-1 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-400 text-xs">
              <User className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">У вас пока нет учеников в базе.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Нажмите «Добавить», чтобы зарегистрировать первого атлета.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
