// src/components/trainer/finance/FinanceTargetScreen.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Clock, 
  Check 
} from 'lucide-react';

export default function FinanceTargetScreen({ trainer, onBack }) {
  const [targetIncome, setTargetIncome] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_target_income');
      return saved ? Number(saved) : 1000000;
    } catch {
      return 1000000;
    }
  });

  const [personalPrice, setPersonalPrice] = useState(() => {
    return Number(trainer?.pricing?.personal_block) || 70000;
  });

  const [rentCost, setRentCost] = useState(() => {
    return Number(trainer?.monthly_rent) || 90000;
  });

  const [sessionsPerClient] = useState(12);

  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  useEffect(() => {
    try {
      localStorage.setItem('gymconnect_coach_target_income', String(targetIncome));
    } catch (e) {}
  }, [targetIncome]);

  const grossTarget = targetIncome + rentCost;
  const athletesNeeded = Math.ceil(grossTarget / (personalPrice || 70000));
  const monthlyWorkoutsTotal = athletesNeeded * sessionsPerClient;
  const weeklyWorkouts = Math.ceil(monthlyWorkoutsTotal / 4.3);
  const dailyWorkoutsAt5Days = (weeklyWorkouts / 5).toFixed(1);

  const workloadLevel = useMemo(() => {
    const daily = Number(dailyWorkoutsAt5Days);
    if (daily <= 3.5) {
      return { 
        status: 'Лёгкая нагрузка', 
        desc: 'Комфортный график, свободное время на отдых и личные тренировки.' 
      };
    }
    if (daily <= 5.5) {
      return { 
        status: 'Оптимальный баланс', 
        desc: 'Золотой стандарт загрузки профессионального тренера в зале.' 
      };
    }
    if (daily <= 7.5) {
      return { 
        status: 'Плотный график', 
        desc: 'Высокая интенсивность. Рекомендуется объединять клиентов в сплит-пары.' 
      };
    }
    return { 
      status: 'Перегрузка', 
      desc: 'Более 8 часов у помоста в день. Рекомендуется поднять чек за блок занятий.' 
    };
  }, [dailyWorkoutsAt5Days]);

  const splitPairsNeeded = Math.ceil(grossTarget / 100000);
  const miniGroupsNeeded = Math.ceil(grossTarget / 140000);

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
            <h1 className="text-xs font-bold text-slate-900">Декомпозиция дохода</h1>
            <p className="text-[10px] text-slate-400 font-medium">Финансовая цель тренера</p>
          </div>

          <div className="w-8" />
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3.5">
        
        {/* КАРТОЧКА ГЛАВНОЙ ЦЕЛИ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900">Целевой чистый доход в месяц</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">₸ / месяц</span>
          </div>

          <div className="space-y-2">
            <input
              type="number"
              step="50000"
              value={targetIncome}
              onChange={e => setTargetIncome(Number(e.target.value))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-mono font-bold text-slate-900 text-center outline-none focus:border-slate-400 focus:bg-white transition-all"
            />

            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {[500000, 800000, 1000000, 1500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetIncome(val)}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono transition-all cursor-pointer ${
                    targetIncome === val 
                      ? 'bg-slate-900 text-white font-bold shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {val >= 1000000 ? `${val / 1000000} млн ₸` : `${val / 1000}k ₸`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ВВОДНЫЕ ПАРАМЕТРЫ ЧЕКА И АРЕНДЫ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
            Вводные параметры тарифов
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-semibold">
                Чек за блок (₸):
              </label>
              <input
                type="number"
                step="5000"
                value={personalPrice}
                onChange={e => setPersonalPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold text-xs outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-semibold">
                Аренда залу (₸):
              </label>
              <input
                type="number"
                step="10000"
                value={rentCost}
                onChange={e => setRentCost(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* НЕОБХОДИМАЯ БАЗА ПОДОПЕЧНЫХ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Необходимая база подопечных</span>
            </span>
            <span className="text-[11px] font-mono text-slate-900 font-bold">
              {athletesNeeded} атлетов
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">1 на 1 в зале</span>
              <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                {athletesNeeded} чел.
              </span>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">по {formatMoney(personalPrice)}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Сплит-пары</span>
              <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                {splitPairsNeeded} пар
              </span>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">по 100k ₸</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 block font-semibold">Мини-группы</span>
              <span className="text-sm font-bold text-slate-900 font-mono block mt-1">
                {miniGroupsNeeded} гр.
              </span>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">по 4 человека</span>
            </div>
          </div>
        </div>

        {/* НАГРУЗКА В ЗАЛЕ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>{workloadLevel.status}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              ~{dailyWorkoutsAt5Days} ч / день
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            {workloadLevel.desc} При 5-дневной неделе это <b>{weeklyWorkouts} тренировок в неделю</b>.
          </p>
        </div>

      </div>
    </div>
  );
}
