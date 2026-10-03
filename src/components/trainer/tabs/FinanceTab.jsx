// src/components/trainer/tabs/FinanceTab.jsx
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Target, 
  Users, 
  Plus, 
  ChevronRight, 
  AlertCircle, 
  Building, 
  Wallet,
  X
} from 'lucide-react';
import FinanceCashboxScreen from '../finance/FinanceCashboxScreen';
import FinanceExpensesScreen from '../finance/FinanceExpensesScreen';
import FinanceTargetScreen from '../finance/FinanceTargetScreen';
import FinanceStudentsMatrix from '../finance/FinanceStudentsMatrix';

export default function FinanceTab({ 
  students = [], 
  trainer, 
  onUpdate, 
  onSelectStudent 
}) {
  // Навигация между полноэкранными подстраницами модуля
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'cashbox' | 'expenses' | 'target' | 'matrix'
  const [isQuickOpOpen, setIsQuickOpOpen] = useState(false);

  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const st = (s.status || '').toLowerCase().trim();
      return st !== 'left' && st !== 'archived';
    });
  }, [students]);

  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  const totalRevenue = useMemo(() => {
    return activeStudents.reduce((sum, s) => {
      const p = Number(String(s.monthly_price || 70000).replace(/\D/g, '')) || 70000;
      return sum + p;
    }, 0);
  }, [activeStudents]);

  const paidRevenue = useMemo(() => {
    return activeStudents
      .filter(s => s.payment_status === 'paid' || !s.payment_status)
      .reduce((sum, s) => {
        const p = Number(String(s.monthly_price || 70000).replace(/\D/g, '')) || 70000;
        return sum + p;
      }, 0);
  }, [activeStudents]);

  const pendingRevenue = Math.max(0, totalRevenue - paidRevenue);
  const pendingInvoicesCount = activeStudents.filter(s => s.payment_status === 'pending').length;

  const monthlyRent = Number(trainer?.monthly_rent) || 90000;
  const netProfit = Math.max(0, paidRevenue - monthlyRent);

  const targetIncome = useMemo(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_target_income');
      return saved ? Number(saved) : 1000000;
    } catch {
      return 1000000;
    }
  }, []);

  const targetProgressPercent = Math.min(100, Math.round((netProfit / (targetIncome || 1)) * 100));

  const expiringStudents = useMemo(() => {
    return activeStudents.filter(s => {
      const left = Number(s.left_trainings ?? s.remaining_workouts ?? 12);
      return left <= 2;
    });
  }, [activeStudents]);

  // Маршрутизация на полноэкранные страницы
  if (currentView === 'cashbox') {
    return (
      <FinanceCashboxScreen
        students={students}
        trainer={trainer}
        onBack={() => setCurrentView('dashboard')}
        onUpdate={onUpdate}
      />
    );
  }

  if (currentView === 'expenses') {
    return (
      <FinanceExpensesScreen
        students={students}
        trainer={trainer}
        onBack={() => setCurrentView('dashboard')}
        onOpenCashbox={() => setCurrentView('cashbox')}
      />
    );
  }

  if (currentView === 'target') {
    return (
      <FinanceTargetScreen
        trainer={trainer}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'matrix') {
    return (
      <FinanceStudentsMatrix
        students={students}
        onBack={() => setCurrentView('dashboard')}
        onSelectStudent={onSelectStudent}
      />
    );
  }

  return (
    <div className="space-y-3.5 select-none pb-28 text-xs text-slate-900">
      
      {/* 1. КАРТОЧКА 1: КАССА И СЧЕТА */}
      <div
        onClick={() => setCurrentView('cashbox')}
        className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <CreditCard className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Касса и Выставленные счета</h3>
              <p className="text-[11px] text-slate-400 font-medium">Безналичные переводы и чеки</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
            <span>Открыть</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Собрано за месяц</span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {formatMoney(paidRevenue)}
            </span>
          </div>

          {pendingRevenue > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Ждут оплаты</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {pendingInvoicesCount} счёта ({formatMoney(pendingRevenue)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. КАРТОЧКА 2: ЧИСТАЯ ПРИБЫЛЬ И АРЕНДА (ОТКРЫВАЕТ ПОЛНОЭКРАННЫЙ ОТЧЁТ) */}
      <div
        onClick={() => setCurrentView('expenses')}
        className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Wallet className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Чистая прибыль за месяц</h3>
              <p className="text-[11px] text-slate-400 font-medium">Выручка минус аренда и расходы</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
            <span>Полный отчёт</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {formatMoney(netProfit)}
            </span>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500">
            Аренда зала: <span className="text-slate-800 font-semibold">-{formatMoney(monthlyRent)}</span>
          </div>
        </div>
      </div>

      {/* 3. КАРТОЧКА 3: ЦЕЛЬ МЕСЯЦА (ДЕКОМПОЗИЦИЯ) */}
      <div
        onClick={() => setCurrentView('target')}
        className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Target className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Цель дохода на месяц</h3>
              <p className="text-[11px] text-slate-400 font-medium">Декомпозиция по подопечным</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
            {targetProgressPercent}%
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all"
              style={{ width: `${targetProgressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Факт: {formatMoney(netProfit)}</span>
            <span>Цель: {formatMoney(targetIncome)}</span>
          </div>
        </div>
      </div>

      {/* 4. ВИДЖЕТ 4: АБОНЕМЕНТЫ НА КОНТРОЛЕ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900">Абонементы на контроле (≤ 2 зан.)</h3>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('matrix')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Таблица атлетов</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {expiringStudents.length > 0 ? (
          <div className="space-y-2">
            {expiringStudents.slice(0, 3).map(st => {
              const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
              const fullName = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();

              return (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent ? onSelectStudent(st) : setCurrentView('matrix')}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{fullName}</h4>
                    <p className="text-[10.5px] text-slate-400">{st.gym ? st.gym.split('|')[0] : 'Зал'}</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    Осталось: {left} зан.
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2 font-medium">
            У всех активных подопечных достаточный баланс занятий.
          </p>
        )}
      </div>

      {/* 5. КНОПКА «+ НОВАЯ ОПЕРАЦИЯ» */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsQuickOpOpen(true)}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Новая операция</span>
        </button>
      </div>

      {/* ШТОРКА БЫСТРОЙ ОПЕРАЦИИ */}
      {isQuickOpOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 w-full max-w-md p-5 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900">Выберите действие</h3>
              <button
                type="button"
                onClick={() => setIsQuickOpOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsQuickOpOpen(false);
                  setCurrentView('cashbox');
                }}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Выставить счёт на оплату</span>
                    <span className="text-[10px] text-slate-400">Формирование счёта и отправка в Telegram</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickOpOpen(false);
                  setCurrentView('matrix');
                }}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Реестр и балансы атлетов</span>
                    <span className="text-[10px] text-slate-400">Контроль абонементов и списание</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
