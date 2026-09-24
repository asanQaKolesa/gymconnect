// src/components/trainer/tabs/FinanceTab.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { DollarSign, AlertCircle, CheckCircle2, Calendar, User } from 'lucide-react';

export default function FinanceTab({ students, onUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  // Считаем общий потенциальный и подтвержденный доход
  const activeStudents = students.filter(s => s.status === 'active' || !s.status);
  const totalMonthlyPotential = activeStudents.reduce((sum, s) => sum + (Number(s.monthly_price) || 0), 0);
  
  // Ученики с критическим остатком тренировок (<= 2)
  const lowBalanceStudents = activeStudents.filter(s => (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);

  const handleTogglePaymentStatus = async (student) => {
    setUpdatingId(student.id);
    const newStatus = student.payment_status === 'paid' ? 'pending' : 'paid';

    const { error } = await supabase
      .from('profiles')
      .update({ payment_status: newStatus })
      .eq('id', student.id);

    setUpdatingId(null);
    if (error) {
      alert('Ошибка обновления статуса оплаты: ' + error.message);
    } else {
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Сводка по финансам */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Потенциальный доход / мес</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totalMonthlyPotential.toLocaleString()} ₸</h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных плательщиков</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{activeStudents.length} <span className="text-xs font-normal text-slate-500">уч.</span></h3>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Требуют продления абонемента</p>
          <h3 className={`text-2xl font-black mt-1 ${lowBalanceStudents.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {lowBalanceStudents.length} <span className="text-xs font-normal text-slate-500">уч.</span>
          </h3>
        </div>
      </div>

      {/* Список оплат учеников */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900">Касса и учет абонементов</h3>
            <p className="text-[10px] text-slate-500">Контроль оплат и остатка тренировок подопечных</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {students.length > 0 ? (
            students.map((student) => {
              const left = student.left_trainings !== undefined ? student.left_trainings : 12;
              const total = student.total_trainings || 12;
              const isPaid = student.payment_status === 'paid';

              return (
                <div key={student.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900">{student.first_name} {student.last_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid ? 'Оплачено' : 'Ожидает оплаты'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Тариф: <span className="font-medium text-slate-700">{student.package_type || 'individual'}</span> | Стоимость: <b className="text-emerald-600 font-mono">{student.monthly_price ? `${student.monthly_price.toLocaleString()} ₸` : '0 ₸'}</b>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                      left <= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" /> Остаток: {left} / {total} зан.
                    </span>

                    <button
                      type="button"
                      disabled={updatingId === student.id}
                      onClick={() => handleTogglePaymentStatus(student)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                        isPaid 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isPaid ? 'Отменить оплату' + (updatingId === student.id ? '...' : '') : 'Отметить оплачено' + (updatingId === student.id ? '...' : '')}
                    </button>
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
    </div>
  );
}
