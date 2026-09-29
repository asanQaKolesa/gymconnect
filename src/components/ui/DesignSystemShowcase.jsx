// src/components/ui/DesignSystemShowcase.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Users, 
  Flame, 
  Calendar, 
  ArrowLeft,
  DollarSign,
  Zap,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Search,
  X,
  Check,
  CreditCard,
  RotateCcw,
  Clock
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  const [activeSplit, setActiveSplit] = useState('fullbody');
  const [activeDaysCount, setActiveDaysCount] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastText, setToastText] = useState(null);

  const showToast = (text) => {
    setToastText(text);
    setTimeout(() => setToastText(null), 2500);
  };

  const handleWeightInput = (raw) => {
    if (raw === '') {
      setWeight('');
      return;
    }
    const clean = raw.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    setWeight(isNaN(num) ? '' : num);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-32 font-sans select-none antialiased">
      
      {/* ПЛАВАЮЩИЙ ДИНАМИЧЕСКИЙ ТОСТ (DYNAMIC ISLAND) */}
      {toastText && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-full px-4 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastText}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastText(null)}
              className="text-white/50 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ШАПКА ВИЗУАЛЬНОЙ СИСТЕМЫ */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">CoachOS Design System</h1>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                v2.1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Единый спокойный стандарт интерфейса</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          GC
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-3.5">

        {/* 1. БЛОК РАСПИСАНИЯ: СТРОКА УЧЕНИКА (НИКАКИХ РАЗРЫВОВ НА 2 СТРОКИ) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Расписание на сегодня
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Быстрое списание тренировки</p>
            </div>

            <span className="text-[10.5px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>18:30</span>
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 flex items-center justify-between gap-3">
            {/* Аватар + Имя + Баланс строго в одну строку */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                АК
              </div>

              <div className="min-w-0 flex-1">
                {/* Верхняя строка: Имя + компактный бейдж баланса вместе */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-900 truncate">Асанали Кусайынов</h4>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                    {isCompleted ? '9 зан.' : '10 зан.'}
                  </span>
                </div>

                {/* Нижняя строка: Цель тренировок */}
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Набор мышечной массы
                </p>
              </div>
            </div>

            {/* Кнопка действия */}
            <div className="shrink-0">
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    showToast('↩ Списание отменено • Баланс 10 зан.');
                  }}
                  className="py-1.5 px-3 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3 text-rose-500" />
                  <span>Вернуть</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(true);
                    showToast('✅ Тренировка проведена • Списано 1 занятие');
                  }}
                  className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/20 whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Проведено</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. РАБОЧИЕ ВЕСА И СТЕППЕРЫ (БЕЗ ЗАЛИПАНИЯ В 040) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Рабочие веса и подходы
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Удобный шаг и ручной ввод</p>
            </div>

            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80">
              Без залипания «040»
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Повторы */}
            <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 block text-center mb-1">
                Повторения
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                  className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <input 
                  type="text"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setReps(clean === '' ? '' : Number(clean));
                  }}
                  className="w-12 text-center text-sm font-extrabold font-mono text-slate-900 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setReps(r => (Number(r) || 0) + 1)}
                  className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Вес */}
            <div className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 block text-center mb-1">
                Вес (кг)
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                  className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  placeholder="0"
                  onChange={(e) => handleWeightInput(e.target.value)}
                  className="w-14 text-center text-sm font-extrabold font-mono text-blue-600 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.round(((Number(w) || 0) + 2.5) * 10) / 10)}
                  className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. КАРТОЧКИ РАЗДЕЛОВ (МЯГКИЕ ИКОНКИ БЕЗ КАПСЛОКА) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Разделы управления
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Быстрый переход по функциям</p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Атлеты */}
            <div 
              onClick={() => showToast('Открыта база учеников')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">База подопечных атлетов</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">14 учеников в залах Алматы</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            {/* Касса */}
            <div 
              onClick={() => showToast('Открыта касса')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Касса и абонементы</h4>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">840 000 ₸ за текущий месяц</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                Оплачено
              </span>
            </div>

            {/* STREAK */}
            <div 
              onClick={() => showToast('Стрик дисциплины: 44 недели')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Дисциплина (Streak)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Рекорд тренера: 44 недели в строю 🔥</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>

            {/* Ограничения PAR-Q */}
            <div 
              onClick={() => showToast('Внимание: у атлета есть травмы')}
              className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-slate-900 leading-tight">Ограничения по здоровью</h4>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">Без осевой нагрузки на спину</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>
          </div>
        </div>

        {/* 4. ГРАФИК ТРЕНИРОВОК (СПОКОЙНЫЕ ПЕРЕКЛЮЧАТЕЛИ 1-7 ДНЕЙ) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              Дней тренировок в неделю
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600">{activeDaysCount} дня / нед.</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-2xl">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDaysCount(d)}
                className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  activeDaysCount === d 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Схема тренировочного сплита:
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'fullbody', label: 'Full Body' },
                { id: 'upper_lower', label: 'Верх / Низ' },
                { id: 'ppl', label: 'PPL' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSplit(item.id)}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center truncate ${
                    activeSplit === item.id 
                      ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. ПОИСК УЧЕНИКА ИЛИ УПРАЖНЕНИЯ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-800">
            Поиск по базе
          </h3>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Имя атлета или название упражнения..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 6. ГЛАВНЫЕ КНОПКИ ДЕЙСТВИЯ */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => showToast('🎉 План тренировок успешно назначен ученику!')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Сохранить и отправить план в Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Действие отменено')}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl font-semibold text-xs active:scale-98 transition-all cursor-pointer"
          >
            Отмена
          </button>
        </div>

      </div>
    </div>
  );
}
