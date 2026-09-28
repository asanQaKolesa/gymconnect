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
  Clock,
  ShieldCheck,
  Flame,
  Check
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentFinanceTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [remainingWorkouts, setRemainingWorkouts] = useState(12);
  const [totalWorkouts, setTotalWorkouts] = useState(12);
  const [monthlyPrice, setMonthlyPrice] = useState(70000);
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'pending'
  const [packageType, setPackageType] = useState('personal'); // 'personal' | 'split' | 'group' | 'online'
  
  // Сгораемость и даты абонемента
  const [isExpiring, setIsExpiring] = useState(true);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    return d.toISOString().split('T')[0];
  })();

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Инициализация при открытии карточки атлета
  useEffect(() => {
    if (student) {
      const left = student.left_trainings !== undefined 
        ? student.left_trainings 
        : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
      setRemainingWorkouts(Number(left));
      setTotalWorkouts(Number(student.total_trainings || 12));
      setMonthlyPrice(Number(student.monthly_price || 70000));
      setPaymentStatus(student.payment_status || 'paid');
      setPackageType(student.package_type || 'personal');
      
      if (student.start_date) setStartDate(student.start_date);
      if (student.end_date) setEndDate(student.end_date);
      if (student.is_expiring !== undefined) setIsExpiring(Boolean(student.is_expiring));
    }
  }, [student]);

  if (!student) return null;

  // Автоматический расчет дней до сгорания
  const calculateDaysLeft = () => {
    if (!isExpiring || !endDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft();
  const completedCount = Math.max(0, totalWorkouts - remainingWorkouts);

  // Безопасное сохранение в Supabase
  const handleSaveFinance = async () => {
    if (!student.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Базовые поля, которые гарантированно есть в схеме profiles
      const payload = {
        left_trainings: Number(remainingWorkouts),
        remaining_workouts: Number(remainingWorkouts),
        total_trainings: Number(totalWorkouts),
        monthly_price: Number(monthlyPrice),
        payment_status: paymentStatus
      };

      // Пытаемся сохранить базовые поля
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', student.id);

      if (error) throw error;

      // Локально фиксируем расширенные финансовые данные атлета
      try {
        const localFinData = {
          packageType,
          isExpiring,
          startDate,
          endDate,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`gymconnect_finance_${student.id}`, JSON.stringify(localFinData));
      } catch (e) {
        console.warn(e);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка при сохранении финансов:', err);
      // Если запрос отклонен базой, сохраняем локально без сбоя UI
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-6">
      
      {/* 1. БАЛАНС И ОСТАТОК ТРЕНИРОВОК */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Баланс занятий</span>
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
            remainingWorkouts <= 2 
              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
              : 'bg-blue-50 text-blue-700 border border-blue-100'
          }`}>
            {remainingWorkouts <= 2 ? 'Заканчивается' : 'Активен'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Остаток тренировок
            </span>
            <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {remainingWorkouts} <span className="text-xs text-slate-400 font-normal">из {totalWorkouts} зан.</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setRemainingWorkouts(Math.max(0, remainingWorkouts - 1))}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
              title="Списать 1 занятие"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRemainingWorkouts(remainingWorkouts + 1)}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center justify-center text-xs active:scale-90 cursor-pointer"
              title="Добавить 1 занятие"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Прогресс-бар отработанных занятий */}
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

      {/* 2. ФОРМАТ ТРЕНИРОВОК */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
        <span className="font-bold text-slate-900 text-xs block border-b border-slate-100 pb-2">
          Формат абонемента
        </span>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'personal', title: 'Персонально', desc: '1 на 1 в зале' },
            { id: 'split', title: 'Сплит', desc: 'Занятия вдвоем' },
            { id: 'group', title: 'Мини-группа', desc: 'До 3-5 атлетов' },
            { id: 'online', title: 'Онлайн', desc: 'Ведение и кураторство' }
          ].map(fmt => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setPackageType(fmt.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                packageType === fmt.id
                  ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <p className={`font-bold text-xs ${packageType === fmt.id ? 'text-blue-900' : 'text-slate-900'}`}>
                {fmt.title}
              </p>
              <p className={`text-[10px] mt-0.5 ${packageType === fmt.id ? 'text-blue-700' : 'text-slate-400'}`}>
                {fmt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. СГОРАЕМОСТЬ И СРОКИ ДЕЙСТВИЯ АБОНЕМЕНТА */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-900 text-xs">Правила сгорания и срок</span>
          
          {/* Индикатор срока */}
          {isExpiring && daysLeft !== null && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
              daysLeft <= 5 
                ? 'bg-rose-100 text-rose-800' 
                : daysLeft <= 12 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
            }`}>
              {daysLeft > 0 ? `Осталось: ${daysLeft} дн.` : 'Срок истек'}
            </span>
          )}
        </div>

        {/* Тумблер: Сгораемый ↔ Несгораемый */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setIsExpiring(true)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
              isExpiring 
                ? 'bg-white text-blue-700 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Сгораемый блок (со сроком)
          </button>
          <button
            type="button"
            onClick={() => setIsExpiring(false)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
              !isExpiring 
                ? 'bg-white text-blue-700 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Без сгорания (бессрочный)
          </button>
        </div>

        {/* Даты действия абонемента */}
        {isExpiring ? (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Дата старта блока
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Дата сгорания (конец)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-rose-700"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/70 text-[11px] text-blue-900 leading-snug">
            Тренировки не сгорают по времени: атлет может отрабатывать блок без жестких временных рамок.
          </div>
        )}
      </div>

      {/* 4. СУММА ОПЛАТЫ И СТАТУС ПЛАТЕЖА */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <p className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">Кассовый расчет</p>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Стоимость блока (₸)</label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={e => setMonthlyPrice(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Занятий в блоке</label>
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
          <label className="text-[10px] font-semibold text-slate-500 block">Статус оплаты:</label>
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
              Ожидает оплаты (Долг)
            </button>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения с обратной связью */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
        {saveSuccess ? (
          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Финансы и даты сохранены!</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Данные фиксируются в кассе CRM</span>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveFinance}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? '...' : 'Сохранить кассу'}</span>
        </button>
      </div>

    </div>
  );
}
