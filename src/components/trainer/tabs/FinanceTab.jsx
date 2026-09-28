// src/components/trainer/tabs/FinanceTab.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  Calendar,
  Wallet,
  MessageCircle
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';

export default function FinanceTab({ students = [], onUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Корректная фильтрация: не отсекает атлетов с кастомными статусами
  const isStudentActive = (s) => {
    if (!s) return false;
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  };

  const activeStudents = students.filter(isStudentActive);
  
  // Общий потенциальный доход
  const totalPotential = activeStudents.reduce((sum, s) => sum + (Number(s.monthly_price) || 0), 0);
  
  // Фактически собранные средства (оплаченные)
  const paidEarnings = activeStudents
    .filter(s => s.payment_status === 'paid' || !s.payment_status)
    .reduce((sum, s) => sum + (Number(s.monthly_price) || 0), 0);

  // Ожидают оплаты (задолженность)
  const pendingEarnings = totalPotential - paidEarnings;

  // Ученики с остатком занятий <= 2
  const lowBalanceStudents = activeStudents.filter(s => {
    const left = s.left_trainings !== undefined ? s.left_trainings : (s.remaining_workouts !== undefined ? s.remaining_workouts : 12);
    return left <= 2;
  });

  const handleTogglePaymentStatus = async (e, student) => {
    e.stopPropagation();
    setUpdatingId(student.id);
    const newStatus = student.payment_status === 'paid' ? 'pending' : 'paid';

    try {
      if (student.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ payment_status: newStatus })
          .eq('id', student.id);

        if (error) throw error;
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка обновления статуса оплаты: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemindDebtWhatsApp = (e, student) => {
    e.stopPropagation();
    const phone = (student.phone || student.whatsapp || '').replace(/\D/g, '');
    if (!phone) {
      alert('У ученика не указан номер телефона');
      return;
    }
    const price = Number(student.monthly_price || 70000).toLocaleString();
    const text = encodeURIComponent(
      `Привет, ${student.first_name}! Напоминаю об оплате тренировочного абонемента на сумму ${price} ₸. Выставить счет в Kaspi или скинуть реквизиты?`
    );
    window.open(`https://wa.me/7${phone.startsWith('7') ? phone.slice(1) : phone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-3.5 select-none pb-12 text-xs">
      
      {/* 1. Сводные финансовые KPI карточки */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-3xl shadow-xs space-y-1">
          <p className="text-[10.5px] text-slate-400 font-medium">Собрано в кассу</p>
          <p className="text-lg font-bold text-emerald-600 font-mono">
            {paidEarnings.toLocaleString()} ₸
          </p>
          <span className="text-[10px] text-slate-400 block font-normal">
            {activeStudents.filter(s => s.payment_status === 'paid' || !s.payment_status).length} учеников оплатили
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-3.5 rounded-3xl shadow-xs space-y-1">
          <p className="text-[10.5px] text-slate-400 font-medium">Ожидает оплаты</p>
          <p className="text-lg font-bold text-amber-600 font-mono">
            {pendingEarnings.toLocaleString()} ₸
          </p>
          <span className="text-[10px] text-slate-400 block font-normal">
            {activeStudents.filter(s => s.payment_status === 'pending').length} задолженностей
          </span>
        </div>
      </div>

      {/* 2. Напоминание по окончанию абонементов */}
      {lowBalanceStudents.length > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-amber-900 text-[11px]">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            У <b>{lowBalanceStudents.length}</b> учеников осталось ≤ 2 занятий. Пора согласовать продление на новый месяц.
          </span>
        </div>
      )}

      {/* 3. Список учета абонементов подопечных */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Касса и абонементы</h3>
            <p className="text-[10.5px] text-slate-400">Нажмите на карточку для открытия полного досье</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {activeStudents.length > 0 ? (
            activeStudents.map((student) => {
              const left = student.left_trainings !== undefined 
                ? student.left_trainings 
                : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
              const total = student.total_trainings || 12;
              const isPaid = student.payment_status === 'paid' || !student.payment_status;

              return (
                <div 
                  key={student.id} 
                  onClick={() => setSelectedStudentForModal(student)}
                  className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900">
                          {student.first_name} {student.last_name || ''}
                        </h4>
                        <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPaid ? 'Оплачено' : 'Долг'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {student.gym ? student.gym.split('|')[0] : 'Зал не указан'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold font-mono text-xs text-slate-900">
                        {student.monthly_price ? `${Number(student.monthly_price).toLocaleString()} ₸` : '70 000 ₸'}
                      </p>
                      <span className={`text-[10px] font-mono font-semibold ${
                        left <= 2 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        Остаток: {left} / {total} зан.
                      </span>
                    </div>
                  </div>

                  {/* Кнопка смены статуса оплаты и кнопка напоминания */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Блок на {total} занятий</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={(e) => handleRemindDebtWhatsApp(e, student)}
                          className="py-1 px-2 rounded-lg text-[10.5px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Напомнить</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={updatingId === student.id}
                        onClick={(e) => handleTogglePaymentStatus(e, student)}
                        className={`py-1 px-2.5 rounded-lg text-[10.5px] font-semibold transition-all border cursor-pointer active:scale-95 ${
                          isPaid
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        }`}
                      >
                        {updatingId === student.id 
                          ? '...' 
                          : isPaid ? 'Отменить оплату' : 'Отметить оплаченным'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Нет данных по ученикам для финансового учета.
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
