// src/components/ui/DesignSystemShowcase.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Users, 
  Flame, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Check, 
  ShieldAlert, 
  Zap, 
  ArrowLeft,
  DollarSign,
  Activity,
  Send,
  Eye
} from 'lucide-react';

export default function DesignSystemShowcase({ onBack }) {
  // Живые стейты для тестирования компонентов
  const [activeTab, setActiveTab] = useState('fullbody');
  const [activeDay, setActiveDay] = useState(3);
  const [counterVal, setCounterVal] = useState(10);
  const [weightVal, setWeightVal] = useState(60);
  const [searchVal, setSearchVal] = useState('');
  const [isBodyweight, setIsBodyweight] = useState(false);

  // Обработчик веса без залипания нуля
  const handleWeightInput = (val) => {
    if (val === '') {
      setWeightVal('');
      return;
    }
    const clean = val.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    setWeightVal(isNaN(num) ? '' : num);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-28 font-sans select-none">
      
      {/* 1. ФИКСИРОВАННАЯ ШАПКА */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>CoachOS UI Kit</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                v2.0 Apple HIG
              </span>
            </h1>
            <p className="text-[10.5px] text-slate-400">Единый стандарт визуальной айдентики GymConnect</p>
          </div>
        </div>

        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Система активна" />
      </div>

      <div className="max-w-md mx-auto p-3.5 space-y-4">

        {/* 2. ЦВЕТОВАЯ ПАЛИТРА И ТОКЕНЫ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1. Фирменная палитра цветов
          </span>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-2xl bg-blue-600 text-white text-center shadow-xs">
              <span className="block text-[10px] font-bold">Cobalt</span>
              <span className="block text-[8.5px] opacity-80 font-mono">#1D4ED8</span>
            </div>
            <div className="p-2 rounded-2xl bg-emerald-600 text-white text-center shadow-xs">
              <span className="block text-[10px] font-bold">Sport Green</span>
              <span className="block text-[8.5px] opacity-80 font-mono">#16A34A</span>
            </div>
            <div className="p-2 rounded-2xl bg-slate-900 text-white text-center shadow-xs">
              <span className="block text-[10px] font-bold">Graphite</span>
              <span className="block text-[8.5px] opacity-80 font-mono">#0F172A</span>
            </div>
            <div className="p-2 rounded-2xl bg-[#F2F2F7] border border-slate-200 text-slate-700 text-center">
              <span className="block text-[10px] font-bold">iOS BG</span>
              <span className="block text-[8.5px] text-slate-400 font-mono">#F2F2F7</span>
            </div>
          </div>
        </div>

        {/* 3. ТИПОГРАФИКА */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
            2. Шрифтовая иерархия
          </span>
          
          <div className="space-y-2 pt-1">
            <div>
              <span className="text-[9.5px] text-blue-600 font-mono block">Overline (10px Bold Caps):</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Подопечный атлет • Параметры дня
              </p>
            </div>

            <div>
              <span className="text-[9.5px] text-blue-600 font-mono block">Card Title (12-13px Bold):</span>
              <p className="text-xs font-bold text-slate-900">
                Жим штанги лежа на горизонтальной скамье
              </p>
            </div>

            <div>
              <span className="text-[9.5px] text-blue-600 font-mono block">Subheadline / Caption (11px Medium):</span>
              <p className="text-[11px] text-slate-500 font-medium">
                4 подхода • 10 повторений • Отдых 90 сек между сетами
              </p>
            </div>

            <div>
              <span className="text-[9.5px] text-blue-600 font-mono block">Mono Number (13px Extrabold):</span>
              <p className="font-mono font-extrabold text-sm text-slate-900">
                70 000 ₸ • 85.5 кг • STREAK 44 🔥
              </p>
            </div>
          </div>
        </div>

        {/* 4. КНОПКИ И МИКРО-АНИМАЦИИ (Haptic Feedback) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            3. Кнопки действий (Apple Haptics)
          </span>

          <div className="space-y-2">
            {/* Primary */}
            <button 
              type="button" 
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Primary Button (Сохранить / Назначить)</span>
            </button>

            {/* Secondary / Inset */}
            <button 
              type="button" 
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Secondary Button (Отмена / Назад)</span>
            </button>

            {/* Danger / Reversible */}
            <button 
              type="button" 
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Destructive Action (Стереть / Отозвать)</span>
            </button>
          </div>
        </div>

        {/* 5. ИНТЕРАКТИВНЫЕ СТЕППЕРЫ (Без залипания в 040) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              4. Интерактивные степперы весов и повторов
            </span>
            <span className="text-[9.5px] font-mono text-emerald-600 font-bold">Баг 040 исправлен</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            
            {/* Повторы */}
            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1">
                Повторения
              </span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCounterVal(v => Math.max(1, (Number(v) || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-90 transition-all shadow-2xs cursor-pointer"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={counterVal}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setCounterVal(clean === '' ? '' : Number(clean));
                  }}
                  className="w-10 text-center text-xs font-mono font-extrabold text-slate-900 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCounterVal(v => (Number(v) || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs active:scale-90 transition-all shadow-2xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Вес */}
            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Вес ({isBodyweight ? 'Свой' : 'кг'})
                </span>
                <button
                  type="button"
                  onClick={() => setIsBodyweight(!isBodyweight)}
                  className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md transition-all ${
                    isBodyweight ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isBodyweight ? 'Свой вес' : 'В весе'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={isBodyweight}
                  onClick={() => setWeightVal(v => Math.max(0, Math.round(((Number(v) || 0) - 2.5) * 10) / 10))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-90 transition-all shadow-2xs cursor-pointer disabled:opacity-30"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isBodyweight}
                  value={isBodyweight ? 'Body' : weightVal}
                  onChange={e => handleWeightInput(e.target.value)}
                  placeholder="0"
                  className="w-12 text-center text-xs font-mono font-extrabold text-blue-600 bg-transparent outline-none disabled:text-slate-400"
                />
                <button
                  type="button"
                  disabled={isBodyweight}
                  onClick={() => setWeightVal(v => Math.round(((Number(v) || 0) + 2.5) * 10) / 10)}
                  className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs active:scale-90 transition-all shadow-2xs cursor-pointer disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 6. СЕГМЕНТИРОВАННЫЕ ПЕРЕКЛЮЧАТЕЛИ (Pills & Chips) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            5. Сегментированные контроллеры (Apple Pills)
          </span>

          {/* Дни тренировок 1-7 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Дней в неделю:</span>
              <span className="text-[10.5px] font-mono font-bold text-blue-600">{activeDay} дня</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    activeDay === day
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Форматы сплитов */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Формат плана:</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'fullbody', label: 'Full Body' },
                { id: 'split', label: 'Верх / Низ' },
                { id: 'ppl', label: 'PPL (Ж/Т/Н)' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 7. КАРТОЧКИ В СТИЛЕ INVICTUS (Inset Grouped) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            6. Эталонная карточка Inset Grouped (Apple HIG)
          </span>

          <div className="divide-y divide-slate-100">
            {/* Карточка 1 */}
            <div className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Персональные тренировки</h4>
                  <p className="text-[10.5px] text-slate-500">Доверьтесь сертифицированному наставнику</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>

            {/* Карточка 2 */}
            <div className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">STREAK (Недели в строю)</h4>
                  <p className="text-[10.5px] text-emerald-700 font-bold">12 недель подряд 🔥 Рекорд</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                12 нед.
              </span>
            </div>
          </div>
        </div>

        {/* 8. ИДЕАЛЬНЫЙ ПОИСКОВЫЙ ИНПУТ */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            7. Поле поиска атлета / зала
          </span>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Поиск по имени или упражнению..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchVal && (
              <button 
                type="button" 
                onClick={() => setSearchVal('')} 
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
