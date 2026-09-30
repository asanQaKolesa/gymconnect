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
  MessageSquare, 
  Send,
  Target,
  LineChart as ChartIcon,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteMeasurementsScreen({ student, trainer, onBack }) {
  const [requestSent, setRequestSent] = useState(false);

  // Выбранный анатомический параметр для интерактивного графика (по умолчанию Талия)
  const [selectedMetricKey, setSelectedMetricKey] = useState('waist');

  const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Атлет';

  // Базовые параметры веса
  const startWeight = Number(student?.weight || student?.start_weight || 75.0);
  const prevWeight = Number((startWeight - 2.8).toFixed(1));
  const currentWeight = Number(student?.current_weight || student?.weight || 71.5);
  const targetWeight = Number(student?.target_weight || 68.0);

  const formatNumericDate = (dateVal) => {
    const d = dateVal ? new Date(dateVal) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const startDateFormatted = student?.created_at ? formatNumericDate(student.created_at) : '01.08.2026';
  const prevDateFormatted = '15.09.2026';
  const currentDateFormatted = formatNumericDate(new Date());

  // ЧИСТАЯ АНАТОМИЧЕСКАЯ МАТРИЦА (БЕЗ ДУБЛЯ ВЕСА ТЕЛА)
  const measurementRows = [
    { key: 'waist', label: 'Талия (живот)', start: 86.0, prev: 82.5, current: Number(student?.waist || 80.0), unit: 'см' },
    { key: 'chest', label: 'Грудь', start: 101.0, prev: 99.5, current: Number(student?.chest || 99.0), unit: 'см' },
    { key: 'hips', label: 'Бёдра (ягодицы)', start: 103.0, prev: 99.0, current: Number(student?.hips || 97.5), unit: 'см' },
    { key: 'neck', label: 'Шея', start: 39.0, prev: 38.5, current: Number(student?.neck || 38.0), unit: 'см' },
    { key: 'biceps_r', label: 'Правый бицепс', start: 34.5, prev: 35.5, current: Number(student?.biceps_right || 36.0), unit: 'см' },
    { key: 'biceps_l', label: 'Левый бицепс', start: 34.0, prev: 35.0, current: Number(student?.biceps_left || 35.5), unit: 'см' },
    { key: 'thigh_r', label: 'Правое бедро', start: 58.5, prev: 57.0, current: Number(student?.thigh_right || 56.0), unit: 'см' },
    { key: 'thigh_l', label: 'Левое бедро', start: 58.0, prev: 56.5, current: Number(student?.thigh_left || 55.5), unit: 'см' },
    { key: 'calf_r', label: 'Правая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_right || 37.0), unit: 'см' },
    { key: 'calf_l', label: 'Левая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_left || 37.0), unit: 'см' }
  ];

  // Активная метрика для графика
  const activeMetric = useMemo(() => {
    return measurementRows.find(m => m.key === selectedMetricKey) || measurementRows[0];
  }, [selectedMetricKey, measurementRows]);

  // Генератор SVG кривой с защитой от наложения цифр
  const generateSvgChart = (p1, p2, p3, minVal, maxVal, width = 340, height = 115) => {
    const range = (maxVal - minVal) || 1;
    const getY = (val) => height - 22 - ((val - minVal) / range) * (height - 44);

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
    const all = [startWeight, prevWeight, currentWeight, targetWeight];
    const min = Math.min(...all) - 1.2;
    const max = Math.max(...all) + 1.2;
    return generateSvgChart(startWeight, prevWeight, currentWeight, min, max, 340, 115);
  }, [startWeight, prevWeight, currentWeight, targetWeight]);

  const dynamicMetricChart = useMemo(() => {
    const all = [activeMetric.start, activeMetric.prev, activeMetric.current];
    const min = Math.min(...all) - 1.0;
    const max = Math.max(...all) + 1.0;
    return generateSvgChart(activeMetric.start, activeMetric.prev, activeMetric.current, min, max, 340, 105);
  }, [activeMetric]);

  // Хронология с персональными комментариями тренера к КАЖДОМУ срезу
  const [timelineNotes, setTimelineNotes] = useState({
    '0': 'Отличная динамика талии, сохраняем режим кардио.',
    '1': 'Добавлен белок в рацион, силовые в тяге растут.',
    '2': 'Первичный антропометрический срез при старте.'
  });
  const [savedNoteIdx, setSavedNoteIdx] = useState(null);

  const handleSaveTimelineNote = async (idx) => {
    setSavedNoteIdx(idx);
    setTimeout(() => setSavedNoteIdx(null), 2000);
  };

  const handleSendTimelineNote = (idx, dateTitle) => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const noteText = timelineNotes[idx];
    if (!noteText?.trim()) return;

    const text = `📋 <b>Комментарий тренера к замеру (${dateTitle}):</b>\n\n«${escapeHtml(noteText)}»\n\n<i>Наставник: ${escapeHtml(coachName)}</i>`;

    if (tgId) {
      sendTelegramMessage(tgId, text)
        .then(() => alert(`✅ Комментарий к замеру ${dateTitle} отправлен подопечному!`))
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

        {/* 2. ВИЗИТКА АТЛЕТА С ЦЕЛЬЮ СТРОГО В ОДНУ СТРОКУ */}
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

          {/* Плашка цели строго в одну строку без разрывов */}
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
        </div>

        {/* 3. КАРТОЧКА ДИНАМИКИ ВЕСА С ПОНЯТНЫМИ ПОДПИСЯМИ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Контроль веса тела</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Динамика: Старт → Пред. → Сейчас</span>
          </div>

          {/* 4 столбца с датами */}
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

          {/* SVG ТРЕНД-ГРАФИК ВЕСА БЕЗ НАЛОЖЕНИЯ ЦИФР */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ChartIcon className="w-3.5 h-3.5 text-slate-500" />
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

                {/* Точка 1: Старт */}
                <circle cx={weightChart.x1} cy={weightChart.y1} r="4.5" fill="#64748B" stroke="#FFFFFF" strokeWidth="2" />
                <text x={weightChart.x1} y={weightChart.y1 - 9} fontSize="10" fontWeight="bold" fill="#64748B" textAnchor="middle" fontFamily="monospace">
                  {startWeight}
                </text>

                {/* Точка 2: Прошлый срез */}
                <circle cx={weightChart.x2} cy={weightChart.y2} r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <text x={weightChart.x2} y={weightChart.y2 - 9} fontSize="10" fontWeight="bold" fill="#3B82F6" textAnchor="middle" fontFamily="monospace">
                  {prevWeight}
                </text>

                {/* Точка 3: Сейчас */}
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

        {/* 4. МАТРИЦА АНАТОМИЧЕСКИХ ЗАМЕРОВ С ГОРИЗОНТАЛЬНЫМ СВАЙПОМ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Матрица анатомических замеров</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Листайте таблицу вправо при необходимости →</p>
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
              Кликните по любой строке ниже, чтобы отобразить динамику конкретной мышцы
            </p>
          </div>

          {/* ТАБЛИЦА С МЯГКИМ СКРОЛЛОМ ВПРАВО (БЕЗ НАЕЗДА ДРУГ НА ДРУГА) */}
          <div className="overflow-x-auto pb-1 -mx-2 px-2 no-scrollbar">
            <div className="min-w-[390px]">
              {/* Шапка таблицы */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 text-center">
                <span className="col-span-4 text-left">Зона тела</span>
                <span className="col-span-2">Старт</span>
                <span className="col-span-2">Прошлый</span>
                <span className="col-span-2">Сейчас</span>
                <span className="col-span-2 text-right">Итог (Δ)</span>
              </div>

              {/* Строки таблицы */}
              <div className="divide-y divide-slate-100 text-xs font-mono">
                {measurementRows.map((row) => {
                  const diff = (row.current - row.start).toFixed(1);
                  const numDiff = Number(diff);
                  const isSelected = selectedMetricKey === row.key;

                  return (
                    <div 
                      key={row.key}
                      onClick={() => setSelectedMetricKey(row.key)}
                      className={`grid grid-cols-12 gap-2 py-2.5 items-center text-center cursor-pointer transition-colors rounded-xl px-2 ${
                        isSelected 
                          ? 'bg-blue-50/90 border border-blue-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`col-span-4 text-left font-sans text-[11.5px] truncate ${
                        isSelected ? 'font-bold text-[#1E60D5]' : 'font-medium text-slate-700'
                      }`}>
                        {row.label}
                      </span>

                      <span className="col-span-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {row.start} {row.unit}
                      </span>

                      <span className="col-span-2 text-slate-500 text-[11px] whitespace-nowrap">
                        {row.prev} {row.unit}
                      </span>

                      <span className={`col-span-2 text-[11px] whitespace-nowrap ${
                        isSelected ? 'font-bold text-[#1E60D5]' : 'font-bold text-slate-800'
                      }`}>
                        {row.current} {row.unit}
                      </span>

                      <div className="col-span-2 text-right whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10.5px] inline-block ${
                          numDiff < 0 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : numDiff > 0 
                              ? 'bg-blue-50 text-[#1E60D5]' 
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {numDiff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. ХРОНОЛОГИЯ С ПЕРСОНАЛЬНЫМ КОММЕНТАРИЕМ К КАЖДОМУ ЗАМЕРУ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">Хронология срезов и пометки наставника</h3>
            <span className="text-[10.5px] text-slate-400 font-mono">Архив замеров</span>
          </div>

          <div className="space-y-3">
            {timelineHistory.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      {item.date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {item.weight} кг
                  </span>
                </div>

                {/* Сетка замеров */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {item.stats.map((st, sIdx) => (
                    <div key={sIdx} className="bg-white px-2 py-1 rounded-lg border border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{st.label}:</span>
                      <span className="font-mono font-bold text-slate-700 ml-1">{st.val}</span>
                    </div>
                  ))}
                </div>

                {/* Персональный комментарий тренера к этому замеру */}
                <div className="pt-1.5 border-t border-slate-200/40 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>Указание к этому замеру:</span>
                    </span>
                    {savedNoteIdx === idx && (
                      <span className="text-emerald-600 font-bold">Сохранено</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={timelineNotes[idx] || ''}
                    onChange={(e) => setTimelineNotes({ ...timelineNotes, [idx]: e.target.value })}
                    placeholder="Например: снизить соль, добавить 10 мин кардио..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1E60D5]"
                  />

                  <div className="flex justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSaveTimelineNote(idx)}
                      className="h-7 px-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTimelineNote(idx, item.date)}
                      className="h-7 px-2.5 bg-[#1E60D5] hover:bg-blue-600 text-white rounded-lg text-[10.5px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>В TG</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. КНОПКА ЗАПРОСА ОБНОВЛЕНИЯ ЗАМЕРОВ В TELEGRAM */}
        <button
          type="button"
          onClick={handleRequestTelegram}
          className={`w-full h-11 rounded-2xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            requestSent 
              ? 'bg-emerald-600 text-white' 
              : 'bg-slate-900 hover:bg-black text-white active:scale-98'
          }`}
        >
          {requestSent ? <Check className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
          <span>{requestSent ? 'Запрос отправлен атлету в Telegram!' : 'Запросить новый замер тела в Telegram'}</span>
        </button>

      </div>
    </div>
  );
}
