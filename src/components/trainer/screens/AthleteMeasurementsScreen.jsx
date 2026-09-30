// src/components/trainer/screens/AthleteMeasurementsScreen.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calendar, 
  Scale, 
  BellRing, 
  Check, 
  Clock, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteMeasurementsScreen({ student, trainer, onBack }) {
  const [requestSent, setRequestSent] = useState(false);

  const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Атлет';

  // Исходные и актуальные данные
  const startWeight = Number(student?.weight || student?.start_weight || 82.0);
  const currentWeight = Number(student?.current_weight || student?.weight || 76.5);
  const targetWeight = Number(student?.target_weight || 72.0);

  const startDate = student?.created_at ? new Date(student.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Начало программы';
  const currentDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  // Анатомические пары замеров: [Старт, Сейчас, Единица]
  const metricsComparison = [
    { label: 'Вес тела', key: 'weight', start: startWeight, current: currentWeight, unit: 'кг', isWeight: true },
    { label: 'Талия (живот)', key: 'waist', start: Number(student?.start_waist || 88), current: Number(student?.waist || 81), unit: 'см' },
    { label: 'Грудь', key: 'chest', start: Number(student?.start_chest || 102), current: Number(student?.chest || 99), unit: 'см' },
    { label: 'Бёдра (ягодицы)', key: 'hips', start: Number(student?.start_hips || 104), current: Number(student?.hips || 98), unit: 'см' },
    { label: 'Шея', key: 'neck', start: Number(student?.start_neck || 39), current: Number(student?.neck || 38), unit: 'см' },
    { label: 'Правый бицепс', key: 'biceps_r', start: Number(student?.start_biceps_r || 35), current: Number(student?.biceps_right || 36.5), unit: 'см' },
    { label: 'Левый бицепс', key: 'biceps_l', start: Number(student?.start_biceps_l || 34.5), current: Number(student?.biceps_left || 36), unit: 'см' },
    { label: 'Правое бедро', key: 'thigh_r', start: Number(student?.start_thigh_r || 59), current: Number(student?.thigh_right || 56.5), unit: 'см' },
    { label: 'Левое бедро', key: 'thigh_l', start: Number(student?.start_thigh_l || 58.5), current: Number(student?.thigh_left || 56), unit: 'см' },
    { label: 'Правая икра', key: 'calf_r', start: Number(student?.start_calf_r || 38), current: Number(student?.calf_right || 37.5), unit: 'см' },
    { label: 'Левая икра', key: 'calf_l', start: Number(student?.start_calf_l || 38), current: Number(student?.calf_left || 37.5), unit: 'см' }
  ];

  // Годовой таймлайн истории
  const timelineHistory = [
    { period: 'Октябрь 2026', weight: currentWeight, waist: 81, chest: 99, hips: 98, note: 'Сушка, активный дефицит' },
    { period: 'Август 2026', weight: (currentWeight + 2.4).toFixed(1), waist: 83.5, chest: 100.5, hips: 100, note: 'Промежуточный чек-ап' },
    { period: 'Июнь 2026', weight: (currentWeight + 4.1).toFixed(1), waist: 85, chest: 101, hips: 102, note: 'Коррекция силовых' },
    { period: `${startDate}`, weight: startWeight, waist: 88, chest: 102, hips: 104, note: 'Старт программы' }
  ];

  const handleRequestTelegram = () => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const text = `📏 <b>Запрос на обновление замеров тела</b>\n\nПривет, ${escapeHtml(fullName)}! Наставник ${escapeHtml(coachName)} просит тебя снять свежие замеры (вес, талия, грудь, руки, бедра) натощак.\n\nПожалуйста, заполни их в боте для обновления динамики!`;

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
      {/* Шапка */}
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
            <h1 className="text-sm font-bold text-slate-800">Сравнение и прогресс замеров</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{fullName}</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        
        {/* КАРТОЧКА ГЛАВНОГО РЕЗУЛЬТАТА ПО ВЕСУ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Динамика массы тела</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Цель: {targetWeight} кг</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Старт ({startDate})</span>
              <span className="text-sm font-mono font-bold text-slate-700">{startWeight} кг</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Сейчас ({currentDate})</span>
              <span className="text-sm font-mono font-bold text-slate-900">{currentWeight} кг</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block mb-0.5">Общая дельта (Δ)</span>
              <span className={`text-sm font-mono font-bold inline-flex items-center gap-0.5 ${
                currentWeight <= startWeight ? 'text-emerald-600' : 'text-[#1E60D5]'
              }`}>
                {currentWeight <= startWeight ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {(currentWeight - startWeight).toFixed(1)} кг
              </span>
            </div>
          </div>
        </div>

        {/* СРАВНИТЕЛЬНАЯ ТАБЛИЦА АНАТОМИЧЕСКИХ ЗАМЕРОВ (ДО / ПОСЛЕ / ДЕЛЬТА) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Анатомические замеры: До и После</h3>
              <p className="text-[10px] text-slate-400">Сравнение стартовых и актуальных обхватов</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {metricsComparison.map((m) => {
              const diff = (m.current - m.start).toFixed(1);
              const numDiff = Number(diff);

              return (
                <div key={m.key} className="py-2.5 flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 text-[11.5px] min-w-[110px]">
                    {m.label}
                  </span>

                  {/* До -> После */}
                  <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-slate-500">
                    <span>{m.start}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                    <span className="font-bold text-slate-800">{m.current} {m.unit}</span>
                  </div>

                  {/* Дельта */}
                  <div className="text-right min-w-[65px]">
                    <span className={`px-1.5 py-0.5 rounded-md font-mono font-bold text-[10.5px] inline-flex items-center gap-0.5 ${
                      numDiff < 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : numDiff > 0 
                          ? 'bg-blue-50 text-[#1E60D5]' 
                          : 'bg-slate-100 text-slate-500'
                    }`}>
                      {numDiff > 0 ? `+${diff}` : diff} {m.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ГОДОВОЙ ПРОГРЕСС И ХРОНОЛОГИЯ ПО МЕСЯЦАМ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Хронология прогресса по датам</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">История</span>
          </div>

          <div className="space-y-2">
            {timelineHistory.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E60D5]" />
                    {item.period}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">{item.weight} кг</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Талия: {item.waist} см</span>
                  <span>•</span>
                  <span>Грудь: {item.chest} см</span>
                  <span>•</span>
                  <span>Бёдра: {item.hips} см</span>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-0.5">
                  «{item.note}»
                </p>
              </div>
            ))}
          </div>

          {/* Запрос обновления через бота */}
          <button
            type="button"
            onClick={handleRequestTelegram}
            className={`w-full h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              requestSent 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-[#1E60D5] hover:bg-blue-600 text-white shadow-xs'
            }`}
          >
            {requestSent ? <Check className="w-4 h-4 text-emerald-600" /> : <BellRing className="w-4 h-4" />}
            <span>{requestSent ? 'Запрос отправлен в Telegram!' : 'Запросить новый замер в Telegram'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
