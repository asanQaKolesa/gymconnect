// src/components/trainer/finance/FinanceExpensesScreen.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Building, 
  Plus, 
  TrendingDown, 
  ArrowUpRight, 
  Wallet, 
  Receipt, 
  Trash2,
  PieChart
} from 'lucide-react';

export default function FinanceExpensesScreen({ 
  students = [], 
  trainer, 
  onBack,
  onOpenCashbox 
}) {
  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  // Сбор фактической выручки
  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const st = (s.status || '').toLowerCase().trim();
      return st !== 'left' && st !== 'archived';
    });
  }, [students]);

  const grossRevenue = useMemo(() => {
    return activeStudents.reduce((sum, s) => {
      const p = Number(String(s.monthly_price || 70000).replace(/\D/g, '')) || 70000;
      return sum + p;
    }, 0);
  }, [activeStudents]);

  // Список всех расходов (сохраняется в памяти)
  const [expenseItems, setExpenseItems] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_receipts');
      if (saved) {
        const list = JSON.parse(saved);
        const onlyExpenses = list.filter(item => item.amount < 0 || item.type === 'expense');
        if (onlyExpenses.length > 0) return onlyExpenses;
      }
    } catch (e) {}

    const defaultRent = Number(trainer?.monthly_rent) || 90000;
    return [
      { id: 'exp-1', title: 'Аренда тренажерного зала', category: 'Аренда зала', amount: defaultRent, date: 'Текущий месяц' },
      { id: 'exp-2', title: 'Спортивный инвентарь и магнезия', category: 'Инвентарь', amount: 15000, date: 'Текущий месяц' }
    ];
  });

  const totalExpensesAmount = useMemo(() => {
    return expenseItems.reduce((sum, item) => sum + Math.abs(Number(item.amount) || 0), 0);
  }, [expenseItems]);

  const netProfit = Math.max(0, grossRevenue - totalExpensesAmount);
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  const handleDeleteExpense = (id) => {
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 select-none pb-28">
      {/* 1. ШАПКА */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Финансы</span>
          </button>

          <div className="text-center">
            <h1 className="text-xs font-bold text-slate-900">Структура прибыли</h1>
            <p className="text-[10px] text-slate-400 font-medium">Финансовый отчёт тренера</p>
          </div>

          <div className="w-8" />
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3.5">
        
        {/* КАРТОЧКА ГЛАВНОГО РАСЧЕТА: ЧИСТАЯ ПРИБЫЛЬ */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Итоговый чистый доход
            </span>
            <span className="text-[10.5px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              Маржа: {profitMarginPercent}%
            </span>
          </div>

          <div>
            <span className="text-2xl font-bold font-mono text-slate-900 block">
              {formatMoney(netProfit)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Сумма после вычета всех клубных расходов и аренды
            </p>
          </div>

          {/* Визуальная шкала распределения: Выручка vs Расходы */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div 
                style={{ width: `${profitMarginPercent}%` }} 
                className="bg-slate-900 h-full transition-all"
                title="Чистая прибыль"
              />
              <div 
                style={{ width: `${100 - profitMarginPercent}%` }} 
                className="bg-slate-300 h-full transition-all"
                title="Расходы"
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <span>Прибыль ({formatMoney(netProfit)})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Расходы ({formatMoney(totalExpensesAmount)})</span>
              </span>
            </div>
          </div>
        </div>

        {/* СВОДНЫЙ БЛОК: ДОХОДЫ И РАСХОДЫ */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-medium block">Валовая выручка</span>
            <span className="text-base font-bold text-slate-900 font-mono block">
              {formatMoney(grossRevenue)}
            </span>
            <span className="text-[10px] text-slate-400 block font-normal">
              {activeStudents.length} активных атлетов
            </span>
          </div>

          <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-medium block">Всего расходов</span>
            <span className="text-base font-bold text-slate-900 font-mono block">
              -{formatMoney(totalExpensesAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block font-normal">
              {expenseItems.length} статьи списаний
            </span>
          </div>
        </div>

        {/* СПИСОК СТАТЕЙ РАСХОДОВ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">
              Статьи расходов за месяц
            </span>
            <button
              type="button"
              onClick={onOpenCashbox}
              className="text-[10.5px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить расход</span>
            </button>
          </div>

          <div className="space-y-2">
            {expenseItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[10.5px] text-slate-400">{item.category} • {item.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    -{formatMoney(Math.abs(Number(item.amount) || 0))}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(item.id)}
                    className="p-1 text-slate-300 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
