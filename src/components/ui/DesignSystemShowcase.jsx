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
  Award,
  CreditCard,
  Bell,
  Settings
} from 'lucide-react';
import {
  GroupedCard,
  InsetRow,
  ScheduleRow,
  HapticStepper,
  SegmentedControl,
  MetricPod,
  StatusDotBadge,
  FloatingToast,
  EmptyState,
  SearchField
} from './AppleHIGKit';

export default function DesignSystemShowcase({ onBack }) {
  // Живые стейты интерактивной демонстрации
  const [activeTab, setActiveTab] = useState('fullbody');
  const [activeDay, setActiveDay] = useState(3);
  const [repsVal, setRepsVal] = useState(10);
  const [weightVal, setWeightVal] = useState(60);
  const [searchVal, setSearchVal] = useState('');
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Вызов всплывающего уведомления в стиле Dynamic Island
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleToggleSchedule = () => {
    const nextState = !isWorkoutDone;
    setIsWorkoutDone(nextState);
    if (nextState) {
      triggerToast('✓ Тренировка зачтена • Списано 1 занятие');
    } else {
      triggerToast('↩ Списание отменено • Баланс восстановлен');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-32 font-sans select-none">
      
      {/* 1. ПЛАВАЮЩИЙ TOAST (DYNAMIC ISLAND) */}
      <FloatingToast 
        isVisible={Boolean(toastMessage)} 
        message={toastMessage} 
        onClose={() => setToastMessage(null)} 
      />

      {/* 2. ШАПКА ВИЗУАЛЬНОЙ СИСТЕМЫ */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
              <span>CoachOS Design System</span>
              <span className="text-[9.5px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                Obsidian Minimal
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Канонический стандарт визуального языка GymConnect</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-slate-700">Apple HIG</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-3.5 space-y-3.5">

        {/* 3. МОНОХРОМНАЯ СТРОКА РАСПИСАНИЯ В 1 ЛИНИЮ */}
        <GroupedCard 
          header="1. Ячейка расписания ученика (Schedule Row)"
          action={<span className="text-[10px] text-slate-400 font-mono">Нажмите «Проведено»</span>}
        >
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200/70 p-0.5">
            <ScheduleRow 
              name="Асанали Кусайынов"
              goal="Набор мышечной массы"
              time="18:30"
              remainingWorkouts={isWorkoutDone ? 9 : 10}
              isCompleted={isWorkoutDone}
              onToggleStatus={handleToggleSchedule}
              onClick={handleToggleSchedule}
            />
          </div>
        </GroupedCard>

        {/* 4. ИНТЕРАКТИВНЫЕ СТЕППЕРЫ (БЕЗ ЗАЛИПАНИЯ В 040) */}
        <GroupedCard 
          header="2. Haptic Степперы (Вес и повторения)"
          action={<span className="text-[10px] text-emerald-600 font-bold font-mono">Без бага «040»</span>}
        >
          <div className="grid grid-cols-2 gap-2">
            <HapticStepper 
              label="Повторения"
              unit="раз"
              value={repsVal}
              onChange={setRepsVal}
              step={1}
              min={1}
            />

            <HapticStepper 
              label="Рабочий вес"
              unit="кг"
              value={weightVal}
              onChange={setWeightVal}
              step={2.5}
              min={0}
            />
          </div>
        </GroupedCard>

        {/* 5. СКОЛЬЗЯЩИЕ СЕГМЕНТНЫЕ КОНТРОЛЛЕРЫ (PILLS) */}
        <GroupedCard header="3. Скользящие переключатели (Pills & Segments)">
          {/* Дни тренировок 1-7 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Дней в неделю:</span>
              <span className="text-[11px] font-mono font-bold text-slate-800">{activeDay} дня / нед.</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 bg-slate-100/90 p-1 rounded-2xl">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDay(d)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    activeDay === d
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Форматы планов */}
          <div className="pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Схема сплита:</span>
            <SegmentedControl 
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { id: 'fullbody', label: 'Full Body' },
                { id: 'upper_lower', label: 'Верх / Низ' },
                { id: 'ppl', label: 'PPL (Ж/Т/Н)' }
              ]}
            />
          </div>
        </GroupedCard>

        {/* 6. КАРТОЧКИ INSET GROUPED (ЧИСТЫЙ МОНОХРОМ БЕЗ СВЕТОФОРА) */}
        <GroupedCard header="4. Списки сервисов (Монохромные иконки)">
          <div className="divide-y divide-slate-100">
            <InsetRow 
              icon={Users}
              title="Персональные тренировки"
              subtitle="12 активных атлетов в зале"
              value="12 атл."
              onClick={() => triggerToast('Открыт список атлетов')}
            />

            <InsetRow 
              icon={CreditCard}
              title="Абонементы и касса"
              subtitle="Автоматический подсчёт сгораний"
              badge={<StatusDotBadge label="В норме" variant="success" />}
              onClick={() => triggerToast('Открыт раздел кассы')}
            />

            <InsetRow 
              icon={Flame}
              title="STREAK дисциплины"
              subtitle="44 недели регулярных тренировок"
              value="44 нед."
              onClick={() => triggerToast('Стрик активен 🔥')}
            />

            <InsetRow 
              icon={ShieldAlert}
              title="Анкета ограничений (PAR-Q)"
              subtitle="Травмы и противопоказания атлета"
              badge={<StatusDotBadge label="Внимание" variant="warning" />}
              onClick={() => triggerToast('Просмотр травм атлета')}
            />
          </div>
        </GroupedCard>

        {/* 7. ТОЧЕЧНАЯ СИСТЕМА СТАТУСОВ (ВМЕСТО РАЗНОЦВЕТНЫХ ПЛАШЕК) */}
        <GroupedCard header="5. Премиальные точечные индикаторы статуса">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusDotBadge label="Оплачено (Активен)" variant="success" />
            <StatusDotBadge label="Ожидает оплаты" variant="warning" />
            <StatusDotBadge label="Травма (Ограничение)" variant="danger" />
            <StatusDotBadge label="Базовый Free" variant="neutral" />
          </div>
        </GroupedCard>

        {/* 8. ВИДЖЕТЫ КАССЫ И МЕТРИК (METRIC PODS) */}
        <div className="grid grid-cols-3 gap-2">
          <MetricPod 
            title="Касса"
            value="840k ₸"
            subtitle="в месяц"
            icon={DollarSign}
          />

          <MetricPod 
            title="В строю"
            value="14 атл."
            trend="+2 нов."
            icon={Users}
          />

          <MetricPod 
            title="План дня"
            value="6 зан."
            subtitle="сегодня"
            icon={Calendar}
          />
        </div>

        {/* 9. ПОИСКОВОЕ ПОЛЕ APPLE HIG */}
        <GroupedCard header="6. Поисковое поле без залипания">
          <SearchField 
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Поиск по имени ученика или залу..."
          />
        </GroupedCard>

        {/* 10. ПРЕМИАЛЬНЫЙ ЭКРАН ZERO-STATE (ПУСТОЕ СОСТОЯНИЕ) */}
        <EmptyState 
          icon={Dumbbell}
          title="На сегодня тренировок нет"
          description="Все подопечные выполнили план или отдыхают. Нажмите ниже, чтобы составить план новому атлету."
          actionText="+ Назначить программу"
          onAction={() => triggerToast('Открытие конструктора плана')}
        />

      </div>
    </div>
  );
}
