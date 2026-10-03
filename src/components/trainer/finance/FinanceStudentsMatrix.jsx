// src/components/trainer/finance/FinanceStudentsMatrix.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Send,
  Building,
  Video,
  Users
} from 'lucide-react';

export default function FinanceStudentsMatrix({ 
  students = [], 
  onBack, 
  onSelectStudent 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'debt' | 'expiring' | 'paid' | 'gym' | 'online'

  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const name = (st.full_name || `${st.first_name || ''} ${st.last_name || ''}`).toLowerCase();
      const tg = (st.username || st.telegram_username || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || name.includes(q) || tg.includes(q);
      if (!matchesSearch) return false;

      const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
      const isPaid = st.payment_status === 'paid' || !st.payment_status;
      const format = (st.training_format || st.package_type || 'individual').toLowerCase();

      if (activeFilter === 'expiring') return left <= 2;
      if (activeFilter === 'debt') return st.payment_status === 'pending';
      if (activeFilter === 'paid') return isPaid;
      if (activeFilter === 'gym') return !format.includes('online');
      if (activeFilter === 'online') return format.includes('online');

      return true;
    });
  }, [students, searchQuery, activeFilter]);

  const expiringCount = students.filter(s => Number(s.left_trainings ?? s.remaining_workouts ?? 12) <= 2).length;
  const debtCount = students.filter(s => s.payment_status === 'pending').length;

  const handleOpenAthleteTelegram = (e, st) => {
    e.stopPropagation();
    const cleanNick = (st.username || st.telegram_username || '').replace('@', '').trim();
    if (cleanNick) {
      window.open(`https://t.me/${cleanNick}`, '_blank');
    } else if (st.phone) {
      const digits = String(st.phone).replace(/\D/g, '');
      window.open(`https://wa.me/7${digits.slice(-10)}`, '_blank');
    }
  };

  const getFormatTitle = (st) => {
    const f = (st.training_format || st.package_type || 'individual').toLowerCase();
    if (f.includes('online')) return 'Онлайн';
    if (f.includes('split')) return 'Сплит-пара';
    if (f.includes('group')) return 'Мини-группа';
    return 'Индивидуально';
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
            <h1 className="text-xs font-bold text-slate-900">Реестр подопечных</h1>
            <p className="text-[10px] text-slate-400 font-medium">Формат, статус оплаты и баланс</p>
          </div>

          <div className="w-8" />
        </div>

        {/* Быстрые фильтры */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 max-w-md mx-auto">
          {[
            { id: 'all', label: `Все (${students.length})` },
            { id: 'debt', label: `Долг (${debtCount})` },
            { id: 'expiring', label: `Остаток ≤ 2 (${expiringCount})` },
            { id: 'paid', label: 'Оплачено' },
            { id: 'gym', label: 'В зале' },
            { id: 'online', label: 'Онлайн' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === f.id 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
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
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 shadow-2xs"
          />
        </div>

        {/* СПИСОК / ТАБЛИЦА АТЛЕТОВ */}
        <div className="space-y-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(st => {
              const fullName = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();
              const left = Number(st.left_trainings ?? st.remaining_workouts ?? 12);
              const total = Number(st.total_trainings || 12);
              const isPaid = st.payment_status === 'paid' || !st.payment_status;
              const formatLabel = getFormatTitle(st);
              const price = Number(st.monthly_price || 70000);

              return (
                <div
                  key={st.id}
                  onClick={() => onSelectStudent && onSelectStudent(st)}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99]"
                >
                  {/* Верхняя строка: Имя, формат и сумма */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 overflow-hidden">
                        {st.photo_url || st.avatar_url ? (
                          <img src={st.photo_url || st.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{fullName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {fullName}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-medium mt-0.5">
                          <span>{formatLabel}</span>
                          <span>•</span>
                          <span className="truncate">{st.gym ? st.gym.split('|')[0] : 'Зал'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        {formatMoney(price)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block mt-0.5 border ${
                        isPaid ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-900 text-white border-slate-900'
                      }`}>
                        {isPaid ? 'Оплачено' : 'Долг / Ожидает'}
                      </span>
                    </div>
                  </div>

                  {/* Нижняя строка: баланс занятий и кнопка перехода в чат */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] text-slate-400 font-medium">Остаток:</span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        left <= 2 ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {left} из {total} зан.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleOpenAthleteTelegram(e, st)}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10.5px] font-bold border border-slate-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3 text-slate-700" />
                      <span>В Telegram</span>
                    </button>
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
