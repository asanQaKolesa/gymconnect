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
  Activity
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
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastText}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setToastText(null)}
              className="text-white/50 hover:text-white p-0.5"
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
              <h1 className="text-sm font-black text-slate-900 tracking-tight">CoachOS Visual Identity</h1>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                PRO 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Живая спорт-экосистема в стиле Apple & Invictus</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          GC
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* 1. БЛОК РАСПИСАНИЯ: СТРОКА УЧЕНИКА В 1 ЛИНИЮ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                1. Расписание на сегодня
              </span>
              <p className="text-[11.5px] text-slate-500 mt-0.5">Кнопка списания работает в 1 клик</p>
            </div>

            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
              18:30 слот
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-200/60 flex items-center justify-between gap-3">
            {/* Аватар + Имя */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/20">
                АК
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-[13px] font-bold text-slate-900 truncate">Асанали Кусайынов</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700 truncate">Набор массы</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono font-bold text-blue-600">{isCompleted ? '9 зан.' : '10 зан.'}</span>
                </div>
              </div>
            </div>

            {/* Кнопка списания / возврата */}
            <div className="shrink-0">
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    showToast('↩ Списание отменено • Баланс 10 зан.');
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Вернуть (+1)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(true);
                    showToast('✅ Тренировка проведена • Списано 1 занятие');
                  }}
                  className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/25"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Проведено</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. ИНТЕРАКТИВНЫЕ СТЕППЕРЫ (ПОВТОРЫ И ВЕС — БЕЗ БАГА 040) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                2. Нагрузка и рабочие веса
              </span>
              <p className="text-[11.5px] text-slate-500 mt-0.5">Кнопки крупные, ноль спереди не залипает</p>
            </div>

            <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Баг «040» закрыт
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            {/* Повторы */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1.5">
                Повторения
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReps(r => Math.max(1, (Number(r) || 0) - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-black text-sm flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
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
                  className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Вес */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1.5">
                Вес (кг)
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.max(0, Math.round(((Number(w) || 0) - 2.5) * 10) / 10))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-black text-sm flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
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
                  className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center active:scale-90 transition-transform shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. КАРТОЧКИ В СТИЛЕ НАСТРОЕК APPLE & INVICTUS (СОЧНЫЕ ИКОНКИ-СКВИРКЛЫ) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
            3. Сервисы CRM (Иконки со смыслом и цветом)
          </span>

          <div className="divide-y divide-slate-100">
            {/* Синяя иконка: Атлеты */}
            <div 
              onClick={() => showToast('Открыта база учеников')}
              className="py-3 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">База подопечных атлетов</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">14 активных учеников в залах Алматы</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>

            {/* Изумрудная иконка: Касса */}
            <div 
              onClick={() => showToast('Открыта касса')}
              className="py-3 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Касса и абонементы</h4>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">840 000 ₸ за текущий месяц</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-xl">
                100% оплата
              </span>
            </div>

            {/* Огненная иконка: STREAK */}
            <div 
              onClick={() => showToast('Стрик дисциплины: 44 недели')}
              className="py-3 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Дисциплина (STREAK)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Рекорд тренера: 44 недели в строю 🔥</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>

            {/* Красная иконка: PAR-Q травмы */}
            <div 
              onClick={() => showToast('Внимание: у атлета есть травмы')}
              className="py-3 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Ограничения по здоровью (PAR-Q)</h4>
                  <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Исключить осевую нагрузку на спину</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* 4. СЕГМЕНТНЫЕ ПЕРЕКЛЮЧАТЕЛИ (ДНИ 1–7 И СПЛИТЫ) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              4. Дней в неделю (от 1 до 7)
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">{activeDaysCount} дня / нед.</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-2xl">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDaysCount(d)}
                className={`py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  activeDaysCount === d 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Схема тренировочного плана:
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'fullbody', label: 'Full Body' },
                { id: 'upper_lower', label: 'Верх / Низ' },
                { id: 'ppl', label: 'PPL (Ж/Т/Н)' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSplit(item.id)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center truncate ${
                    activeSplit === item.id 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. ПОИСКОВОЕ ПОЛЕ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
            5. Поиск ученика или упражнения
          </span>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Введите имя атлета или название упражнения..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 6. КНОПКИ ДЕЙСТВИЯ (PRIMARY / SECONDARY) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => showToast('🎉 План тренировок успешно назначен ученику!')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Сохранить и отправить план в Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Действие отменено')}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-2xl font-bold text-xs active:scale-98 transition-all cursor-pointer"
          >
            Вернуться назад
          </button>
        </div>

      </div>
    </div>
  );
}
