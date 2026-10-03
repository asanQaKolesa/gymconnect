// src/components/trainer/analytics/AthleteProgressDeepDive.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Scale, 
  Activity, 
  Calendar, 
  Utensils, 
  Flame, 
  Droplet, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Smile, 
  Send 
} from 'lucide-react';

export default function AthleteProgressDeepDive({ student, trainer, onBack }) {
  const [activeSection, setActiveSection] = useState('measurements'); // 'measurements' | 'attendance' | 'nutrition'
  const [selectedMetric, setSelectedMetric] = useState('waist');

  const fullName = student?.full_name || `${student?.first_name || 'Атлет'} ${student?.last_name || ''}`.trim();
  const formatMoney = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ₸`;

  // Параметры антропометрии
  const heightCm = Number(student?.height) > 0 ? Number(student.height) : 178;
  const startWeight = Number(student?.start_weight || student?.weight || 75.0);
  const currentWeight = Number(student?.current_weight || student?.weight || 71.8);
  const targetWeight = Number(student?.target_weight || 68.0);
  const weightDelta = (currentWeight - startWeight).toFixed(1);

  // Сетка замеров
  const measurements = useMemo(() => [
    { key: 'waist', label: 'Талия (живот)', start: 86.0, current: Number(student?.waist) || 80.5, unit: 'см', isFat: true },
    { key: 'chest', label: 'Грудь', start: 101.0, current: Number(student?.chest) || 99.0, unit: 'см', isFat: false },
    { key: 'hips', label: 'Бёдра (ягодицы)', start: 103.0, current: Number(student?.hips) || 98.0, unit: 'см', isFat: true },
    { key: 'neck', label: 'Шея', start: 39.0, current: Number(student?.neck) || 38.0, unit: 'см', isFat: true },
    { key: 'biceps_r', label: 'Правый бицепс', start: 34.5, current: Number(student?.biceps_right) || 36.2, unit: 'см', isFat: false },
    { key: 'biceps_l', label: 'Левый бицепс', start: 34.0, current: Number(student?.biceps_left) || 35.8, unit: 'см', isFat: false },
    { key: 'thigh_r', label: 'Правое бедро', start: 58.5, current: Number(student?.thigh_right) || 56.5, unit: 'см', isFat: true },
    { key: 'thigh_l', label: 'Левое бедро', start: 58.0, current: Number(student?.thigh_left) || 56.0, unit: 'см', isFat: true },
    { key: 'calf_r', label: 'Правая икра', start: 38.0, current: Number(student?.calf_right) || 37.5, unit: 'см', isFat: false },
    { key: 'calf_l', label: 'Левая икра', start: 38.0, current: Number(student?.calf_left) || 37.5, unit: 'см', isFat: false }
  ], [student]);

  const activeMetricObj = measurements.find(m => m.key === selectedMetric) || measurements[0];

  // Биометрические индексы
  const heightM = heightCm / 100;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);
  const whtr = (activeMetricObj.current / heightCm).toFixed(2);
  const vTaper = ((Number(student?.chest) || 99.0) / (Number(student?.waist) || 80.5)).toFixed(2);

  // Показатели дисциплины и явок
  const attendanceRate = student?.attendance_rate ? Number(student.attendance_rate) : 94;
  const currentStreakWeeks = student?.streak_weeks ? Number(student.streak_weeks) : 6;
  const totalWorkoutsHeld = 28;
  const totalWorkoutsMissed = 2;

  // Питание
  const targetCalories = student?.assigned_nutrition?.calories || 2150;
  const actualCaloriesAvg = 2080;
  const nutritionCompliance = Math.round((actualCaloriesAvg / targetCalories) * 100);
  const waterNormMl = Math.round(currentWeight * 35);
  const waterActualMl = student?.assigned_nutrition?.waterMl || 2400;

  // Векторный график веса
  const svgPath = "M 30 75 Q 110 50, 190 38 T 330 22";
  const svgFill = `${svgPath} L 330 95 L 30 95 Z`;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 select-none pb-28">
      {/* 1. Верхний бар */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Качество ведения</span>
          </button>

          <div className="text-center">
            <h1 className="text-xs font-bold text-slate-900">Профиль прогресса атлета</h1>
            <p className="text-[10px] text-slate-400 font-medium">Комплексный анализ данных</p>
          </div>

          <div className="w-8" />
        </div>

        {/* 3 вкладки анализа */}
        <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl mt-3 max-w-md mx-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveSection('measurements')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'measurements' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Замеры и вес
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('attendance')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'attendance' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Доходимость
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('nutrition')}
            className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === 'nutrition' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Питание
          </button>
        </div>
      </div>

      <div className="p-3.5 max-w-md mx-auto space-y-3.5">
        
        {/* Карточка атлета */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 overflow-hidden shrink-0">
              {student?.photo_url || student?.avatar_url ? (
                <img src={student.photo_url || student.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-slate-900 truncate">{fullName}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {student?.gym ? student.gym.split('|')[0] : 'Фитнес-клуб не указан'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span>Цель: {student?.goal || 'Набор массы'}</span>
                <span>•</span>
                <span className="font-mono">Стаж: {student?.experience_level || '1–2 года'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. РАЗДЕЛ: ЗАМЕРЫ И ДИНАМИКА ВЕСА */}
        {activeSection === 'measurements' && (
          <div className="space-y-3.5">
            {/* Карточка массы тела с графиком */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900">Динамика веса тела</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Старт → Текущий</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-sans block mb-0.5">Старт</span>
                  <span className="text-xs font-bold text-slate-800">{startWeight} кг</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-sans block mb-0.5">Текущий</span>
                  <span className="text-xs font-bold text-slate-900">{currentWeight} кг</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-sans block mb-0.5">Цель</span>
                  <span className="text-xs font-bold text-slate-700">{targetWeight} кг</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-sans block mb-0.5">Итог</span>
                  <span className="text-xs font-bold text-slate-900">{weightDelta} кг</span>
                </div>
              </div>

              {/* График тренда веса */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500">Вектор изменения массы</span>
                  <span className="font-mono font-bold text-slate-800">{weightDelta} кг за период</span>
                </div>

                <div className="w-full h-24 flex items-center justify-center">
                  <svg viewBox="0 0 360 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={svgFill} fill="url(#curveGradient)" />
                    <path d={svgPath} fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="30" cy="75" r="4" fill="#64748B" />
                    <circle cx="190" cy="38" r="4" fill="#475569" />
                    <circle cx="330" cy="22" r="5" fill="#0F172A" />
                  </svg>
                </div>

                <div className="flex justify-between text-[9.5px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                  <span>Старт ({startWeight} кг)</span>
                  <span>-4 недели</span>
                  <span className="text-slate-800 font-bold">Сейчас ({currentWeight} кг)</span>
                </div>
              </div>
            </div>

            {/* Биометрические индексы */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Биометрические пропорции</span>
                <span className="text-[10px] text-slate-400 font-mono">Научный расчет</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Индекс массы (ИМТ)</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{bmi}</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">Норма нормы</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Талия к росту</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{whtr}</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">Здоровый баланс</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">V-конус (Грудь/Талия)</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{vTaper}</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">Атлетический торс</span>
                </div>
              </div>
            </div>

            {/* Анатомическая матрица замеров */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Анатомические замеры зон</span>
                <span className="text-[10px] text-slate-400 font-mono">10 ключевых точек</span>
              </div>

              <div className="divide-y divide-slate-100">
                {measurements.map(m => {
                  const delta = (m.current - m.start).toFixed(1);
                  const isNegative = Number(delta) < 0;

                  return (
                    <div
                      key={m.key}
                      onClick={() => setSelectedMetric(m.key)}
                      className={`py-2 px-1 flex items-center justify-between cursor-pointer rounded-xl transition-colors ${
                        selectedMetric === m.key ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">{m.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Старт: {m.start} {m.unit}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-900 block">{m.current} {m.unit}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-500 block">
                          {Number(delta) > 0 ? `+${delta}` : delta} {m.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. РАЗДЕЛ: ДОХОДИМОСТЬ И СТРИКИ ТРЕНИРОВОК */}
        {activeSection === 'attendance' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Показатель доходимости в зал</span>
                <span className="text-[10.5px] font-mono font-bold text-slate-900">{attendanceRate}%</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Проведено</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{totalWorkoutsHeld}</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">занятий</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Пропуски</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{totalWorkoutsMissed}</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">по уважительной</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Текущий стрик</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{currentStreakWeeks} нед.</span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5">без срывов</span>
                </div>
              </div>

              {/* Шкала посещаемости за последние 14 дней */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10.5px] text-slate-500 font-semibold block">Сетка посещений (последние недели)</span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[9px] text-slate-400 block">{d}</span>
                      <div className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        i % 2 === 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {i % 2 === 0 ? '✓' : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. РАЗДЕЛ: ОТЧЁТ ПО ПИТАНИЮ И КБЖУ */}
        {activeSection === 'nutrition' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Соблюдение плана питания</span>
                <span className="text-[10.5px] font-mono font-bold text-slate-900">{nutritionCompliance}% соответствия</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Целевая норма калорий</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{targetCalories} ккал</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Факт: ~{actualCaloriesAvg} ккал</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Водный баланс в день</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block">{waterActualMl} мл</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Норма: {waterNormMl} мл</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block text-[11px]">Заключение по питанию:</span>
                <p className="leading-snug text-[11px]">
                  Подопечный держит стабильный баланс макронутриентов. Белок поступает в объёме 1.8г на кг веса. Дефицит калорий соблюдается без срывов.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
