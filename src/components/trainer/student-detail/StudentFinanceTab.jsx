// src/components/trainer/student-detail/StudentFinanceTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Plus, 
  Minus,
  Clock
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentFinanceTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [remainingWorkouts, setRemainingWorkouts] = useState(12);
  const [totalWorkouts, setTotalWorkouts] = useState(12);
  const [monthlyPrice, setMonthlyPrice] = useState(70000);
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'pending'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      const left = student.left_trainings !== undefined 
        ? student.left_trainings 
        : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
      setRemainingWorkouts(Number(left));
      setTotalWorkouts(Number(student.total_trainings || 12));
      setMonthlyPrice(Number(student.monthly_price || 70000));
      setPaymentStatus(student.payment_status || 'paid');
    }
  }, [student]);

  if (!student) return null;

  const handleSaveFinance = async () => {
    if (!student.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        left_trainings: Number(remainingWorkouts),
        remaining_workouts: Number(remainingWorkouts),
        total_trainings: Number(totalWorkouts),
        monthly_price: Number(monthlyPrice),
        payment_status: paymentStatus
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', student.id);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка при сохранении финансов: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = Math.max(0, totalWorkouts - remainingWorkouts);

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-6">
      
      {/* 1. БЛОК ОСТАТКА ТРЕНИРОВОК */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Баланс абонемента</span>
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
            remainingWorkouts <= 2 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
          }`}>
            {remainingWorkouts <= 2 ? 'Заканчивается' : 'Активен'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Осталось тренировок</span>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {remainingWorkouts} <span className="text-xs text-slate-400 font-normal">из {totalWorkouts} зан.</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setRemainingWorkouts(Math.max(0, remainingWorkouts - 1))}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
              title="Списать 1 тренировку"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRemainingWorkouts(remainingWorkouts + 1)}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center justify-center text-xs active:scale-90 cursor-pointer"
              title="Добавить 1 тренировку"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Прогресс-бар списания */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Проведено: {completedCount} зан.</span>
            <span>Осталось: {remainingWorkouts} зан.</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((completedCount / (totalWorkouts || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. СУММА ОПЛАТЫ И СТАТУС */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Финансовые условия блока</p>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Сумма за блок (₸)</label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={e => setMonthlyPrice(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Всего занятий в блоке</label>
            <input
              type="number"
              value={totalWorkouts}
              onChange={e => setTotalWorkouts(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 text-center focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Переключатель статуса оплаты */}
        <div className="space-y-1 pt-1">
          <label className="text-[10px] font-semibold text-slate-500 block">Статус платежа:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentStatus('paid')}
              className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                paymentStatus === 'paid'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Оплачено
            </button>

            <button
              type="button"
              onClick={() => setPaymentStatus('pending')}
              className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                paymentStatus === 'pending'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Ожидает оплаты
            </button>
          </div>
        </div>

        {remainingWorkouts <= 2 && (
          <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-[10.5px] flex items-center gap-1.5 leading-snug">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Внимание: блок подходит к концу. Рекомендуется согласовать продление на новый период.</span>
          </div>
        )}
      </div>

      {/* Кнопка сохранения с обратной связью */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
        {saveSuccess ? (
          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Финансы обновлены!</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Синхронизируется с базой Supabase</span>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveFinance}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? '...' : 'Сохранить баланс'}</span>
        </button>
      </div>

    </div>
  );
}
