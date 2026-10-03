// src/components/trainer/finance/FinanceStudentsMatrix.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Users
} from 'lucide-react';

export default function FinanceStudentsMatrix({ 
  students = [], 
  onBack, 
  onSelectStudent 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'expiring' | 'debt' | 'paid'

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const name = (st.full_name || `${st.first_name || ''} ${st.last_name || ''}`).toLowerCase();
      const tg = (st.username || st.telegram_username || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || tg.includes(q);
      if (!matchesSearch) return false;

      const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
      const isPaid = st.payment_status === 'paid' || !st.payment_status;

      if (activeFilter === 'expiring') return left <= 2;
      if (activeFilter === 'debt') return st.payment_status === 'pending';
      if (activeFilter === 'paid') return isPaid;

      return true;
    });
  }, [students, searchQuery, activeFilter]);

  const expiringCount = students.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 12) <= 2).length;
  const debtCount = students.filter(s => s.payment_status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 select-none pb-28">
      {/* ШАПКА */}
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
            <h1 className="text-xs font-bold text-slate-900">Реестр абонементов</h1>
            <p className="text-[10px] text-slate-400 font-medium">Контроль балансов и оплат</p>
          </div>

          <div className="w-8" />
        </div>

        {/* Быстрые фильтры */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Все ({students.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'expiring' 
                ? 'bg-amber-600 text-white shadow-2xs' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Заканчиваются ({expiringCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('debt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'debt' 
                ? 'bg-rose-600 text-white shadow-2xs' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            Долг ({debtCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'paid' 
                ? 'bg-emerald-600 text-white shadow-2xs' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            Оплачено
          </button>
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3">
        {/* Поиск */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск по имени или Telegram..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#1E60D5] shadow-2xs"
          />
        </div>

        {/* Список атлетов */}
        <div className="space-y-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(st => {
              const fullName = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();
              const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
              const total = Number(st.total_trainings || 12);
              const isPaid = st.payment_status === 'paid' || !st.payment_status;
              const isLow = left <= 2;

              return (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent && onSelectStudent(st)}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 overflow-hidden">
                      {st.photo_url || st.avatar_url ? (
                        <img src={st.photo_url || st.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {st.gym ? st.gym.split('|')[0] : 'Фитнес-клуб'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2.5">
                    <div>
                      <span className={`text-xs font-mono font-bold block ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                        {left} из {total} зан.
                      </span>
                      <span className={`text-[10px] font-semibold block mt-0.5 ${isPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isPaid ? 'Оплачено' : 'Ожидает оплаты'}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-6">
              Атлеты по выбранному фильтру не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
