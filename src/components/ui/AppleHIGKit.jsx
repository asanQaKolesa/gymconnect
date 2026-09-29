// src/components/ui/AppleHIGKit.jsx
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

/* ========================================================
   1. GROUPED CARD (Базовый белый контейнер Inset)
   ======================================================== */
export function GroupedCard({ children, className = '', header, action }) {
  return (
    <div className={`bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 ${className}`}>
      {(header || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          {header && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {header}
              </span>
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ========================================================
   2. INSET ROW (Строка в стиле Apple Settings / Invictus)
   ======================================================== */
export function InsetRow({ 
  icon: Icon, 
  title, 
  subtitle, 
  value, 
  onClick, 
  badge,
  isDestructive = false,
  showChevron = true 
}) {
  return (
    <div 
      onClick={onClick}
      className={`py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity select-none ${
        isDestructive ? 'text-rose-600' : 'text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/60 ${
            isDestructive ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-100 text-slate-800'
          }`}>
            <Icon className="w-4 h-4 stroke-[1.9]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold truncate leading-tight">{title}</h4>
          {subtitle && (
            <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {value && <span className="text-xs font-semibold text-slate-500">{value}</span>}
        {badge && <div>{badge}</div>}
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        )}
      </div>
    </div>
  );
}

/* ========================================================
   3. SCHEDULE ROW (Строка расписания строго в 1 линию)
   ======================================================== */
export function ScheduleRow({ 
  name, 
  goal, 
  time, 
  remainingWorkouts, 
  isCompleted, 
  onToggleStatus, 
  onClick 
}) {
  return (
    <div 
      onClick={onClick}
      className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50/80 active:bg-slate-100/60 transition-colors cursor-pointer select-none rounded-2xl"
    >
      {/* Инициал и инфо ученика */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          {name ? name.charAt(0).toUpperCase() : 'A'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 truncate">{name || 'Без имени'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5 whitespace-nowrap">
            <span className="text-slate-600 font-medium truncate max-w-[110px]">{goal || 'План'}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
            <span className="text-slate-500 font-mono">{time || 'Вечер'}</span>
          </div>
        </div>
      </div>

      {/* Правая часть: Счетчик баланса + кнопка действия в 1 строку */}
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-mono font-extrabold text-slate-700 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200/80 whitespace-nowrap">
          {remainingWorkouts} зан.
        </span>

        {isCompleted ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus && onToggleStatus();
            }}
            className="py-1.5 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-[10.5px] font-bold border border-slate-200/80 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
            title="Отменить списание"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>Вернуть</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus && onToggleStatus();
            }}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10.5px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-xs"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Проведено</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ========================================================
   4. HAPTIC STEPPER (Интерактивный степпер без бага 040)
   ======================================================== */
export function HapticStepper({ 
  label, 
  value, 
  onChange, 
  step = 1, 
  min = 0, 
  unit = '',
  disabled = false 
}) {
  const handleInputChange = (raw) => {
    if (raw === '' || raw === undefined) {
      onChange('');
      return;
    }
    const clean = String(raw).replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    onChange(isNaN(num) ? '' : num);
  };

  const adjustValue = (delta) => {
    const cur = Number(value) || 0;
    const next = Math.max(min, Math.round((cur + delta) * 10) / 10);
    onChange(next);
  };

  return (
    <div className="bg-slate-50/90 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between select-none">
      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-1 truncate">
        {label} {unit ? `(${unit})` : ''}
      </span>
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={disabled || Number(value) <= min}
          onClick={() => adjustValue(-step)}
          className="w-7 h-7 rounded-xl bg-white border border-slate-200/80 text-slate-700 font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-2xs cursor-pointer disabled:opacity-30"
        >
          <Minus className="w-3 h-3 stroke-[2.5]" />
        </button>

        <input
          type="text"
          inputMode="decimal"
          disabled={disabled}
          value={value ?? ''}
          placeholder="0"
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-12 text-center text-xs font-mono font-extrabold text-slate-900 bg-transparent outline-none disabled:text-slate-400"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => adjustValue(step)}
          className="w-7 h-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-2xs cursor-pointer disabled:opacity-30"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

/* ========================================================
   5. SEGMENTED CONTROL (Apple Sliding Pills)
   ======================================================== */
export function SegmentedControl({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`p-1 bg-slate-100/90 rounded-2xl flex items-center gap-1 select-none ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer truncate text-center ${
              isSelected
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ========================================================
   6. METRIC POD (Виджет кассы и статистики)
   ======================================================== */
export function MetricPod({ title, value, subtitle, trend, icon: Icon }) {
  return (
    <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
          {title}
        </span>
        {Icon && (
          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p className="text-sm font-extrabold font-mono text-slate-900 tracking-tight truncate">
          {value}
        </p>
        {(subtitle || trend) && (
          <span className="text-[9.5px] text-slate-400 font-medium block truncate mt-0.5">
            {trend && <span className="text-emerald-600 font-bold mr-1">{trend}</span>}
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/* ========================================================
   7. STATUS DOT BADGE (Точечный премиум-индикатор)
   ======================================================== */
export function StatusDotBadge({ label, variant = 'neutral' }) {
  const dotColor = 
    variant === 'success' ? 'bg-emerald-500' :
    variant === 'warning' ? 'bg-amber-500' :
    variant === 'danger' ? 'bg-rose-500' :
    'bg-slate-400';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10.5px] font-bold border border-slate-200/70 select-none">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

/* ========================================================
   8. DYNAMIC ISLAND TOAST (Всплывающее микро-уведомление)
   ======================================================== */
export function FloatingToast({ message, isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-w-xs w-full px-3 pointer-events-none">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-semibold truncate">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">{message}</span>
        </div>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="text-white/60 hover:text-white p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ========================================================
   9. EMPTY STATE (Монохромное пустое состояние)
   ======================================================== */
export function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="p-8 text-center space-y-2.5 bg-white border border-slate-200/80 rounded-3xl select-none">
      {Icon && (
        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <Icon className="w-5 h-5 stroke-[1.8]" />
        </div>
      )}
      <div>
        <h4 className="text-xs font-bold text-slate-900">{title}</h4>
        {description && (
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed mt-0.5">
            {description}
          </p>
        )}
      </div>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

/* ========================================================
   10. SEARCH FIELD (Поисковое поле без залипания)
   ======================================================== */
export function SearchField({ value, onChange, placeholder = 'Поиск...', onClear }) {
  return (
    <div className="relative flex items-center w-full select-none">
      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
      />
      {value && (
        <button 
          type="button" 
          onClick={onClear || (() => onChange(''))}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
