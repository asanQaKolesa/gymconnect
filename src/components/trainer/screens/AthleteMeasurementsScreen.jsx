// src/components/trainer/screens/AthleteMeasurementsScreen.jsx
import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
Scale,
  BellRing, 
  Check, 
  Activity, 
  Send,
  Target,
  BarChart3,
  Sparkles,
  Clock
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteMeasurementsScreen({ student, trainer, onBack }) {
  const [requestSent, setRequestSent] = useState(false);
  const [selectedMetricKey, setSelectedMetricKey] = useState('waist');

  const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Атлет';

  // Проверка на количество замеров (empty state)
  const hasMeasurements = student?.waist || student?.chest || student?.hips || student?.weight;
  // Мы также можем проверять наличие истории замеров (не менее двух), но пока проверяем хоть какие-то данные.


  // Базовые параметры с безопасными дефолтами
  const heightCm = Number(student?.height) > 0 ? Number(student.height) : 178;
  const startWeight = Number(student?.weight || student?.start_weight || 75.0);
  const prevWeight = Number((startWeight - 2.8).toFixed(1));
  const currentWeight = Number(student?.current_weight || student?.weight || 71.5);
  const targetWeight = Number(student?.target_weight || 68.0);

  const formatNumericDate = (dateVal) => {
    try {
      const d = dateVal ? new Date(dateVal) : new Date();
      if (isNaN(d.getTime())) return '01.08.2026';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return '01.08.2026';
    }
  };

  const startDateFormatted = student?.created_at ? formatNumericDate(student.created_at) : '01.08.2026';
  const prevDateFormatted = '15.09.2026';
  const currentDateFormatted = formatNumericDate(new Date());

  // Матрица анатомических замеров
  const measurementRows = useMemo(() => [
    { key: 'waist', label: 'Талия (живот)', start: 86.0, prev: 82.5, current: Number(student?.waist) || 80.0, unit: 'см' },
    { key: 'chest', label: 'Грудь', start: 101.0, prev: 99.5, current: Number(student?.chest) || 99.0, unit: 'см' },
    { key: 'hips', label: 'Бёдра (ягодицы)', start: 103.0, prev: 99.0, current: Number(student?.hips) || 97.5, unit: 'см' },
    { key: 'neck', label: 'Шея', start: 39.0, prev: 38.5, current: Number(student?.neck) || 38.0, unit: 'см' },
    { key: 'biceps_r', label: 'Правый бицепс', start: 34.5, prev: 35.5, current: Number(student?.biceps_right) || 36.0, unit: 'см' },
    { key: 'biceps_l', label: 'Левый бицепс', start: 34.0, prev: 35.0, current: Number(student?.biceps_left) || 35.5, unit: 'см' },
    { key: 'thigh_r', label: 'Правое бедро', start: 58.5, prev: 57.0, current: Number(student?.thigh_right) || 56.0, unit: 'см' },
    { key: 'thigh_l', label: 'Левое бедро', start: 58.0, prev: 56.5, current: Number(student?.thigh_left) || 55.5, unit: 'см' },
    { key: 'calf_r', label: 'Правая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_right) || 37.0, unit: 'см' },
    { key: 'calf_l', label: 'Левая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_left) || 37.0, unit: 'см' }
  ], [student]);

  // Расчёт пропорций и ИМТ с защитой от деления на 0
  const startWaist = 86.0;
  const currentWaist = Number(student?.waist) || 80.0;
  const startChest = 101.0;
  const currentChest = Number(student?.chest) || 99.0;
  const currentHips = Number(student?.hips) || 97.5;


  const heightM = heightCm > 0 ? heightCm / 100 : 0;

  // BMI
  const startBMI = heightM > 0 && startWeight > 0 ? (startWeight / (heightM * heightM)).toFixed(1) : '—';
  const currentBMI = heightM > 0 && currentWeight > 0 ? (currentWeight / (heightM * heightM)).toFixed(1) : '—';
  const getBmiStatus = (bmi) => {
    if (bmi === '—') return 'Нет данных';
    const b = Number(bmi);
    if (b < 18.5) return 'Дефицит';
    if (b >= 18.5 && b <= 24.9) return 'Норма';
    return 'Избыток';
  };
  const bmiStatus = getBmiStatus(currentBMI);

  // WHtR (Waist-to-Height Ratio)
  const currentWHtR = heightCm > 0 && currentWaist > 0 ? (currentWaist / heightCm).toFixed(2) : '—';
  const whtrStatus = currentWHtR === '—' ? 'Нет данных' : (Number(currentWHtR) < 0.5 ? 'Здоровая норма' : 'Выше нормы');

  // V-Taper (Shoulders/Waist) -> We use Shoulders if available, else fallback to Chest
  const currentShoulders = Number(student?.shoulders) || currentChest; // Fallback to chest if shoulders not in DB
  const currentVTaper = currentWaist > 0 && currentShoulders > 0 ? (currentShoulders / currentWaist).toFixed(2) : '—';
  const vtaperStatus = currentVTaper === '—' ? 'Нет данных' : (Number(currentVTaper) >= 1.6 ? 'Идеальный конус' : 'Цель ~1.61');

  // Chest/Waist
  const chestWaistRatio = currentWaist > 0 && currentChest > 0 ? (currentChest / currentWaist).toFixed(2) : '—';
  const chestWaistStatus = chestWaistRatio === '—' ? 'Нет данных' : 'Пропорции торса';


  const activeMetric = useMemo(() => {
    return measurementRows.find(m => m.key === selectedMetricKey) || measurementRows[0];
  }, [selectedMetricKey, measurementRows]);

  // Безопасный генератор SVG кривых
  const generateSvgChart = (p1, p2, p3, minVal, maxVal, width = 340, height = 115) => {
    const range = (maxVal - minVal) > 0 ? (maxVal - minVal) : 1;
    const getY = (val) => {
      const clampedVal = isNaN(val) ? minVal : val;
      return height - 22 - ((clampedVal - minVal) / range) * (height - 44);
    };

    const x1 = 36;
    const x2 = width / 2;
    const x3 = width - 36;

    const y1 = getY(p1);
    const y2 = getY(p2);
    const y3 = getY(p3);

    const pathD = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1}, ${x2} ${y2} T ${x3} ${y3}`;
    const fillD = `${pathD} L ${x3} ${height} L ${x1} ${height} Z`;

    return { x1, y1, x2, y2, x3, y3, pathD, fillD };
  };

  const weightChart = useMemo(() => {
    const all = [startWeight, prevWeight, currentWeight, targetWeight].filter(n => !isNaN(n));
    const min = all.length > 0 ? Math.min(...all) - 1.2 : 0;
    const max = all.length > 0 ? Math.max(...all) + 1.2 : 100;
    return generateSvgChart(startWeight, prevWeight, currentWeight, min, max, 340, 115);
  }, [startWeight, prevWeight, currentWeight, targetWeight]);

  const dynamicMetricChart = useMemo(() => {
    const all = [activeMetric?.start, activeMetric?.prev, activeMetric?.current].filter(n => n !== undefined && !isNaN(n));
    const min = all.length > 0 ? Math.min(...all) - 1.0 : 0;
    const max = all.length > 0 ? Math.max(...all) + 1.0 : 100;
    return generateSvgChart(activeMetric?.start || 0, activeMetric?.prev || 0, activeMetric?.current || 0, min, max, 340, 105);
  }, [activeMetric]);

  const [timelineNotes, setTimelineNotes] = useState({
    '0': 'Отличный темп, талия уменьшается без потери плечевого пояса.',
    '1': 'Добавлен белок в рацион, силовые в тяге растут.',
    '2': 'Первичный антропометрический срез при входе.'
  });
  const [sentNoteIdx, setSentNoteIdx] = useState(null);

  const quickChips = ['Отличный темп 🔥', 'Держим дефицит 🥗', 'Добавить кардио 🏃', 'Застой по весу ⚠️'];

  const handleApplyChip = (idx, chipText) => {
    setTimelineNotes(prev => ({
      ...prev,
      [idx]: prev[idx] ? `${prev[idx]} ${chipText}` : chipText
    }));
  };

  const handleSendTimelineNote = (idx, dateTitle) => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const noteText = timelineNotes[idx];
    if (!noteText?.trim()) return;

    const text = `📋 <b>Комментарий тренера к замеру (${dateTitle}):</b>\n\n«${escapeHtml(noteText)}»\n\n<i>Наставник: ${escapeHtml(coachName)}</i>`;

    if (tgId) {
      sendTelegramMessage(tgId, text)
        .then(() => {
          setSentNoteIdx(idx);
          setTimeout(() => setSentNoteIdx(null), 2500);
        })
        .catch(() => alert('Не удалось отправить. Откройте чат напрямую.'));
    } else {
      alert('Telegram ID атлета не найден.');
    }
  };

  const handleRequestTelegram = () => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const text = `📏 <b>Запрос на обновление замеров тела</b>\n\nПривет, ${escapeHtml(fullName)}! Наставник ${escapeHtml(coachName)} просит тебя зафиксировать свежие замеры (талия, грудь, руки, бедра) натощак.\n\nПожалуйста, внеси их в бота для обновления динамики!`;

    if (tgId) {
      sendTelegramMessage(tgId, text)
        .then(() => {
          setRequestSent(true);
          setTimeout(() => setRequestSent(false), 3000);
        })
        .catch(() => alert('Откройте Telegram чат напрямую.'));
    } else {
      alert('У ученика не привязан Telegram ID для автоматического бота.');
    }
  };

  // Хронология срезов
  const timelineHistory = [
    {
      date: currentDateFormatted,
      title: 'Актуальный замер',
      weight: currentWeight,
      note: 'Хорошая прорисовка талии, симметрия рук стабильна.',
      stats: [
        { label: 'Талия', val: '80.0 см' },
        { label: 'Грудь', val: '99.0 см' },
        { label: 'Бёдра', val: '97.5 см' },
        { label: 'Шея', val: '38.0 см' },
        { label: 'Пр. бицепс', val: '36.0 см' },
        { label: 'Лев. бицепс', val: '35.5 см' },
        { label: 'Пр. бедро', val: '56.0 см' },
        { label: 'Лев. бедро', val: '55.5 см' },
        { label: 'Пр. икра', val: '37.0 см' },
        { label: 'Лев. икра', val: '37.0 см' }
      ]
    },
    {
      date: prevDateFormatted,
      title: 'Прошлый замер (-2 нед)',
      weight: prevWeight,
      note: 'Увеличен белок в рационе, рабочий вес в тяге поднят.',
      stats: [
        { label: 'Талия', val: '82.5 см' },
        { label: 'Грудь', val: '99.5 см' },
        { label: 'Бёдра', val: '99.0 см' },
        { label: 'Шея', val: '38.5 см' },
        { label: 'Пр. бицепс', val: '35.5 см' },
        { label: 'Лев. бицепс', val: '35.0 см' },
        { label: 'Пр. бедро', val: '57.0 см' },
        { label: 'Лев. бедро', val: '56.5 см' },
        { label: 'Пр. икра', val: '37.5 см' },
        { label: 'Лев. икра', val: '37.5 см' }
      ]
    },
    {
      date: startDateFormatted,
      title: 'Стартовая фиксация',
      weight: startWeight,
      note: 'Первичный антропометрический срез при входе.',
      stats: [
        { label: 'Талия', val: '86.0 см' },
        { label: 'Грудь', val: '101.0 см' },
        { label: 'Бёдра', val: '103.0 см' },
        { label: 'Шея', val: '39.0 см' },
        { label: 'Пр. бицепс', val: '34.5 см' },
        { label: 'Лев. бицепс', val: '34.0 см' },
        { label: 'Пр. бедро', val: '58.5 см' },
        { label: 'Лев. бедро', val: '58.0 см' },
        { label: 'Пр. икра', val: '38.0 см' },
        { label: 'Лев. икра', val: '38.0 см' }
      ]
    }
  ];

  if (!hasMeasurements) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 mb-2">Замеров пока нет</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          Внесите первый замер, чтобы увидеть динамику и индексы
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-28">
      
      {/* 1. ШАПКА */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-800">Прогресс и замеры тела</h1>
            <p className="text-[10px] text-slate-400 font-medium">Аналитическая карта подопечного</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3.5">

        {/* 2. ВИЗИТКА АТЛЕТА С ЦЕЛЬЮ В ОДНУ СТРОКУ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 text-sm">
              {student?.avatar_url || student?.photo_url ? (
                <img src={student.avatar_url || student.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <h2 className="text-[14.5px] font-bold text-slate-900 truncate">
                {fullName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{student?.username ? `@${student.username.replace('@', '')}` : (student?.phone || 'Атлет')}</span>
                {student?.gym && <span>• 📍 {student.gym.split('|')[0]}</span>}
              </div>
            </div>
          </div>

          {/* Плашка цели строго в одну строку */}
          <div className="px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <Target className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-500">Цель:</span>
              <span className="font-bold text-slate-800 truncate">{student?.goal || 'Набор массы'}</span>
            </div>
            <span className="font-mono font-bold text-slate-700 shrink-0 whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
              Ориентир: {targetWeight} кг
            </span>
          </div>

          {/* Метка регулярности чек-апа */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-0.5 px-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Последний срез: 14 дней назад</span>
            </span>
            <span className="font-medium text-[#1E60D5]">Чек-ап: по графику</span>
          </div>
        </div>

        {/* 3. КАРТОЧКА ДИНАМИКИ ВЕСА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-semibold text-slate-800">Контроль веса тела</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Старт → Пред. → Сейчас</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/50">
              <span className="text-[9.5px] text-slate-400 block mb-0.5 font-medium">Старт</span>
              <span className="text-[10px] text-slate-400 font-mono block mb-1">{startDateFormatted}</span>
              <span className="text-xs font-mono font-bold text-slate-800">{startWeight} кг</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/50">
              <span className="text-[9.5px] text-slate-400 block mb-0.5 font-medium">Прошлый</span>
              <span className="text-[10px] text-slate-400 font-mono block mb-1">{prevDateFormatted}</span>
              <span className="text-xs font-mono font-bold text-slate-800">{prevWeight} кг</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/50">
              <span className="text-[9.5px] text-slate-400 block mb-0.5 font-medium">Сейчас</span>
              <span className="text-[10px] text-slate-400 font-mono block mb-1">{currentDateFormatted}</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentWeight} кг</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/50">
              <span className="text-[9.5px] text-slate-400 block mb-0.5 font-medium">Итог (Δ)</span>
              <span className="text-[10px] text-slate-400 font-mono block mb-1">дельта</span>
              <span className={`text-xs font-mono font-bold inline-flex items-center justify-center gap-0.5 ${
                currentWeight <= startWeight ? 'text-emerald-700' : 'text-[#1E60D5]'
              }`}>
                {(currentWeight - startWeight).toFixed(1)} кг
              </span>
            </div>
          </div>

          {/* ВЕКТОРНЫЙ ГРАФИК ВЕСА */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Тренд изменения массы</span>
              </span>
              <span className="font-mono text-emerald-700 font-bold">
                {(currentWeight - startWeight).toFixed(1)} кг за период
              </span>
            </div>

            <div className="relative w-full h-[115px] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 340 115" className="w-full h-full">
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E60D5" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1E60D5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="20" y1="20" x2="320" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="58" x2="320" y2="58" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="95" x2="320" y2="95" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />

                <path d={weightChart.fillD} fill="url(#weightGrad)" />
                <path d={weightChart.pathD} fill="none" stroke="#1E60D5" strokeWidth="2.5" strokeLinecap="round" />

                <circle cx={weightChart.x1} cy={weightChart.y1} r="4.5" fill="#64748B" stroke="#FFFFFF" strokeWidth="2" />
                <text x={weightChart.x1} y={weightChart.y1 - 9} fontSize="10" fontWeight="bold" fill="#64748B" textAnchor="middle" fontFamily="monospace">
                  {startWeight}
                </text>

                <circle cx={weightChart.x2} cy={weightChart.y2} r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <text x={weightChart.x2} y={weightChart.y2 - 9} fontSize="10" fontWeight="bold" fill="#3B82F6" textAnchor="middle" fontFamily="monospace">
                  {prevWeight}
                </text>

                <circle cx={weightChart.x3} cy={weightChart.y3} r="5" fill="#1E60D5" stroke="#FFFFFF" strokeWidth="2" />
                <text x={weightChart.x3} y={weightChart.y3 - 9} fontSize="10.5" fontWeight="bold" fill="#1E60D5" textAnchor="middle" fontFamily="monospace">
                  {currentWeight}
                </text>
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 px-1 border-t border-slate-200/50">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Старт ({startDateFormatted})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>-2 нед ({prevDateFormatted})</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-[#1E60D5]" />
                <span>Сейчас ({currentDateFormatted})</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4. БИОМЕТРИЧЕСКИЕ ИНДЕКСЫ И ПРОПОРЦИИ ТЕЛА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-semibold text-slate-800">Индексы пропорций и состава тела</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Биометрия</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-medium mb-1">ИМТ (BMI)</span>
              <span className="text-lg font-semibold text-white block mb-0.5">{currentBMI}</span>
              <span className="text-[10px] text-slate-500 block">{bmiStatus}</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-medium mb-1">WHtR (Талия/Рост)</span>
              <span className="text-lg font-semibold text-white block mb-0.5">{currentWHtR}</span>
              <span className="text-[10px] text-slate-500 block">{whtrStatus}</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-medium mb-1">V-конус (Плечи/Талия)</span>
              <span className="text-lg font-semibold text-white block mb-0.5">{currentVTaper}</span>
              <span className="text-[10px] text-slate-500 block">{vtaperStatus}</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-neutral-400 font-medium mb-1">Грудь/Талия</span>
              <span className="text-lg font-semibold text-white block mb-0.5">{chestWaistRatio}</span>
              <span className="text-[10px] text-slate-500 block">{chestWaistStatus}</span>
            </div>
          </div>
        </div>

        {/* 5. МАТРИЦА АНАТОМИЧЕСКИХ ЗАМЕРОВ С ГОРИЗОНТАЛЬНЫМ СКРОЛЛОМ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Матрица анатомических замеров</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Скролл вправо для детального среза →</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          {/* ИНТЕРАКТИВНЫЙ ГРАФИК ВЫБРАННОЙ ЗОНЫ */}
          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <span>Кривая:</span>
                <span className="text-[#1E60D5]">{activeMetric.label}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700">
                Дельта: {(activeMetric.current - activeMetric.start) > 0 ? `+${(activeMetric.current - activeMetric.start).toFixed(1)}` : (activeMetric.current - activeMetric.start).toFixed(1)} {activeMetric.unit}
              </span>
            </div>

            <div className="relative w-full h-[105px] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 340 105" className="w-full h-full">
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="20" y1="20" x2="320" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="52" x2="320" y2="52" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="85" x2="320" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />

                <path d={dynamicMetricChart.fillD} fill="url(#metricGrad)" />
                <path d={dynamicMetricChart.pathD} fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />

                <circle cx={dynamicMetricChart.x1} cy={dynamicMetricChart.y1} r="4" fill="#64748B" stroke="#FFFFFF" strokeWidth="2" />
                <text x={dynamicMetricChart.x1} y={dynamicMetricChart.y1 - 8} fontSize="10" fontWeight="bold" fill="#64748B" textAnchor="middle" fontFamily="monospace">
                  {activeMetric.start} {activeMetric.unit}
                </text>

                <circle cx={dynamicMetricChart.x2} cy={dynamicMetricChart.y2} r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                <text x={dynamicMetricChart.x2} y={dynamicMetricChart.y2 - 8} fontSize="10" fontWeight="bold" fill="#0284C7" textAnchor="middle" fontFamily="monospace">
                  {activeMetric.prev} {activeMetric.unit}
                </text>

                <circle cx={dynamicMetricChart.x3} cy={dynamicMetricChart.y3} r="4.5" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="2" />
                <text x={dynamicMetricChart.x3} y={dynamicMetricChart.y3 - 8} fontSize="10" fontWeight="bold" fill="#0EA5E9" textAnchor="middle" fontFamily="monospace">
                  {activeMetric.current} {activeMetric.unit}
                </text>
              </svg>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center">
              Нажмите на строку ниже, чтобы посмотреть динамику обхвата
            </p>
          </div>

          {/* ТАБЛИЦА С МЯГКИМ СКРОЛЛОМ */}
          <div className="overflow-x-auto pb-1 -mx-2 px-2 no-scrollbar">
            <div className="min-w-[390px]">
              <div className="grid grid-cols-10 gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 text-center">
                <span className="col-span-4 text-left">Зона тела</span>
                <span className="col-span-2">Старт</span>
                <span className="col-span-2">Сейчас</span>
                <span className="col-span-2 text-right">Итог (Δ)</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs font-mono">
                {(measurementRows || []).map((row, index) => {
                  const diff = row ? (row.current - row.start).toFixed(1) : 0;
                  const numDiff = Number(diff) || 0;
                  const isSelected = row && selectedMetricKey === row.key;

                  // Define arrow and color based on metric type (fat vs muscle)
                  const isFatMetric = row.key === 'waist' || row.key === 'hips' || row.key === 'neck';
                  let deltaColor = 'text-slate-500';
                  let deltaBg = 'bg-slate-100';
                  let ArrowIcon = null;

                  if (numDiff < 0) {
                    deltaColor = isFatMetric ? 'text-emerald-700' : 'text-rose-600';
                    deltaBg = isFatMetric ? 'bg-emerald-50' : 'bg-rose-50';
                    ArrowIcon = TrendingDown;
                  } else if (numDiff > 0) {
                    deltaColor = isFatMetric ? 'text-rose-600' : 'text-emerald-700';
                    deltaBg = isFatMetric ? 'bg-rose-50' : 'bg-emerald-50';
                    ArrowIcon = TrendingUp;
                  }

                  return (
                    <div 
                      key={row?.key || index}
                      onClick={() => row && setSelectedMetricKey(row.key)}
                      className={`grid grid-cols-10 gap-2 py-2.5 items-center text-center cursor-pointer transition-colors rounded-xl px-2 ${
                        isSelected 
                          ? 'bg-blue-50/90 border border-blue-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`col-span-4 text-left font-sans text-[11.5px] truncate ${
                        isSelected ? 'font-semibold text-[#1E60D5]' : 'font-medium text-slate-700'
                      }`}>
                        {row?.label || ''}
                      </span>

                      <span className="col-span-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {row?.start || 0} {row?.unit || ''}
                      </span>

                      <span className={`col-span-2 text-[11px] whitespace-nowrap ${
                        isSelected ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'
                      }`}>
                        {row?.current || 0} {row?.unit || ''}
                      </span>

                      <div className="col-span-2 text-right whitespace-nowrap flex justify-end">
                        <span className={`px-1.5 py-0.5 rounded-md font-semibold text-[10.5px] inline-flex items-center gap-0.5 ${deltaBg} ${deltaColor}`}>
                          {ArrowIcon && <ArrowIcon className="w-3 h-3" />}
                          {Math.abs(numDiff).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 6. ХРОНОЛОГИЯ С КОМПАКТНЫМ КОММЕНТАРИЕМ В ОДНУ СТРОКУ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-semibold text-slate-800">Хронология срезов и пометки наставника</h3>
            <span className="text-[10.5px] text-slate-400 font-mono">Архив замеров</span>
          </div>

          <div className="space-y-3">
            {(timelineHistory || []).map((item, idx) => (
              <div key={item?.date || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      {item?.date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item?.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {item?.weight} кг
                  </span>
                </div>

                {/* Сетка замеров */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(item?.stats || []).map((st, sIdx) => (
                    <div key={st?.label || sIdx} className="bg-white px-2 py-1 rounded-lg border border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{st?.label}:</span>
                      <span className="font-mono font-bold text-slate-700 ml-1">{st?.val}</span>
                    </div>
                  ))}
                </div>

                {/* Быстрые чипсы-шаблоны */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                  {(quickChips || []).map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleApplyChip(idx, chip)}
                      className="px-2 py-0.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-md text-[9.5px] font-medium whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* КОММЕНТАРИЙ ТРЕНЕРА В ОДНУ СТРОКУ */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={timelineNotes[idx] || ''}
                    onChange={(e) => setTimelineNotes({ ...timelineNotes, [idx]: e.target.value })}
                    placeholder="Заметка к замеру..."
                    className="w-full h-8 pl-3 pr-16 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1E60D5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTimelineNote(idx, item?.date)}
                    className="absolute right-1 h-6 px-2.5 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-md text-[10.5px] font-semibold inline-flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    {sentNoteIdx === idx ? <Check className="w-3 h-3 text-white" /> : <Send className="w-3 h-3" />}
                    <span>{sentNoteIdx === idx ? 'Ушло' : 'В TG'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. ФИРМЕННАЯ СИНЯЯ КНОПКА ЗАПРОСА В TELEGRAM */}
        <button
          type="button"
          onClick={handleRequestTelegram}
          className="w-full h-11 bg-[#1E60D5] hover:bg-blue-600 active:scale-98 text-white rounded-2xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          {requestSent ? <Check className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
          <span>{requestSent ? 'Запрос отправлен атлету в Telegram!' : 'Запросить новый замер тела в Telegram'}</span>
        </button>

      </div>
    </div>
  );
}
