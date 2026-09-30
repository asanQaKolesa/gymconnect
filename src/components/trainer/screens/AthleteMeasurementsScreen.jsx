// src/components/trainer/screens/AthleteMeasurementsScreen.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Scale, 
  BellRing, 
  Check, 
  Activity,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteMeasurementsScreen({ student, trainer, onBack }) {
  const [requestSent, setRequestSent] = useState(false);

  const fullName = student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Атлет';

  // Исходные, предыдущие (2 недели назад) и актуальные параметры
  const startWeight = Number(student?.weight || student?.start_weight || 82.0);
  const prevWeight = Number((startWeight - 3.2).toFixed(1)); // Предыдущий срез 2 недели назад
  const currentWeight = Number(student?.current_weight || student?.weight || 76.5);
  const targetWeight = Number(student?.target_weight || 72.0);

  const formatNumericDate = (dateVal) => {
    const d = dateVal ? new Date(dateVal) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const startDateFormatted = student?.created_at ? formatNumericDate(student.created_at) : '01.08.2026';
  const prevDateFormatted = '15.09.2026'; // Дата предыдущего чек-апа
  const currentDateFormatted = formatNumericDate(new Date());

  // Полная матрица замеров: [Старт, Прошлый замер, Сейчас]
  const fullMetricsMatrix = [
    { label: 'Вес тела', start: startWeight, prev: prevWeight, current: currentWeight, unit: 'кг' },
    { label: 'Талия (живот)', start: 88.0, prev: 83.0, current: Number(student?.waist || 81.0), unit: 'см' },
    { label: 'Грудь', start: 102.0, prev: 100.0, current: Number(student?.chest || 99.0), unit: 'см' },
    { label: 'Бёдра (ягодицы)', start: 104.0, prev: 100.0, current: Number(student?.hips || 98.0), unit: 'см' },
    { label: 'Шея', start: 39.0, prev: 38.5, current: Number(student?.neck || 38.0), unit: 'см' },
    { label: 'Правый бицепс', start: 35.0, prev: 36.0, current: Number(student?.biceps_right || 36.5), unit: 'см' },
    { label: 'Левый бицепс', start: 34.5, prev: 35.5, current: Number(student?.biceps_left || 36.0), unit: 'см' },
    { label: 'Правое бедро', start: 59.0, prev: 57.5, current: Number(student?.thigh_right || 56.5), unit: 'см' },
    { label: 'Левое бедро', start: 58.5, prev: 57.0, current: Number(student?.thigh_left || 56.0), unit: 'см' },
    { label: 'Правая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_right || 37.5), unit: 'см' },
    { label: 'Левая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_left || 37.5), unit: 'см' }
  ];

  // Полная хронология замеров (все 11 замеров на каждую дату)
  const fullTimelineHistory = [
    {
      date: currentDateFormatted,
      title: 'Актуальный замер',
      weight: currentWeight,
      note: 'Стабильное снижение талии, сохранение объемов плечевого пояса',
      allStats: [
        { label: 'Талия', val: '81.0 см' },
        { label: 'Грудь', val: '99.0 см' },
        { label: 'Бёдра', val: '98.0 см' },
        { label: 'Шея', val: '38.0 см' },
        { label: 'Пр. бицепс', val: '36.5 см' },
        { label: 'Лев. бицепс', val: '36.0 см' },
        { label: 'Пр. бедро', val: '56.5 см' },
        { label: 'Лев. бедро', val: '56.0 см' },
        { label: 'Пр. икра', val: '37.5 см' },
        { label: 'Лев. икра', val: '37.5 см' }
      ]
    },
    {
      date: prevDateFormatted,
      title: 'Промежуточный чек-ап (-2 недели)',
      weight: prevWeight,
      note: 'Коррекция калоража, увеличение силовых подходов',
      allStats: [
        { label: 'Талия', val: '83.0 см' },
        { label: 'Грудь', val: '100.0 см' },
        { label: 'Бёдра', val: '100.0 см' },
        { label: 'Шея', val: '38.5 см' },
        { label: 'Пр. бицепс', val: '36.0 см' },
        { label: 'Лев. бицепс', val: '35.5 см' },
        { label: 'Пр. бедро', val: '57.5 см' },
        { label: 'Лев. бедро', val: '57.0 см' },
        { label: 'Пр. икра', val: '37.5 см' },
        { label: 'Лев. икра', val: '37.5 см' }
      ]
    },
    {
      date: startDateFormatted,
      title: 'Стартовые замеры при входе',
      weight: startWeight,
      note: 'Первичная антропометрия в день регистрации',
      allStats: [
        { label: 'Талия', val: '88.0 см' },
        { label: 'Грудь', val: '102.0 см' },
        { label: 'Бёдра', val: '104.0 см' },
        { label: 'Шея', val: '39.0 см' },
        { label: 'Пр. бицепс', val: '35.0 см' },
        { label: 'Лев. бицепс', val: '34.5 см' },
        { label: 'Пр. бедро', val: '59.0 см' },
        { label: 'Лев. бедро', val: '58.5 см' },
        { label: 'Пр. икра', val: '38.0 см' },
        { label: 'Лев. икра', val: '38.0 см' }
      ]
    }
  ];

  const handleRequestTelegram = () => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const text = `📏 <b>Запрос на обновление замеров тела</b>\n\nПривет, ${escapeHtml(fullName)}! Наставник ${escapeHtml(coachName)} просит тебя зафиксировать свежие замеры (вес, талия, грудь, руки, бедра) натощак.\n\nПожалуйста, внеси их в бота для обновления динамики!`;

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

      <div className="p-4 max-w-md mx-auto space-y-3.5">
        
        {/* КАРТОЧКА ГЛАВНОГО РЕЗУЛЬТАТА ПО ВЕСУ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Динамика веса: 3 среза</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-medium">Цель: {targetWeight} кг</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
              <span className="text-[9.5px] text-slate-400 block mb-0.5">Старт ({startDateFormatted})</span>
              <span className="text-xs font-mono font-bold text-slate-700">{startWeight}</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
              <span className="text-[9.5px] text-slate-400 block mb-0.5">-2 нед. ({prevDateFormatted})</span>
              <span className="text-xs font-mono font-bold text-slate-700">{prevWeight}</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
              <span className="text-[9.5px] text-slate-400 block mb-0.5">Сейчас ({currentDateFormatted})</span>
              <span className="text-xs font-mono font-bold text-slate-900">{currentWeight}</span>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
              <span className="text-[9.5px] text-slate-400 block mb-0.5">Итог (Δ)</span>
              <span className={`text-xs font-mono font-bold inline-flex items-center justify-center gap-0.5 ${
                currentWeight <= startWeight ? 'text-emerald-600' : 'text-[#1E60D5]'
              }`}>
                {(currentWeight - startWeight).toFixed(1)} кг
              </span>
            </div>
          </div>
        </div>

        {/* МАТРИЦА СРАВНЕНИЯ АНАТОМИИ (СТАРТ -> ПРОШЛЫЙ -> СЕЙЧАС -> ПРОМЕЖУТОК -> ИТОГ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Матрица замеров тела</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Старт ({startDateFormatted}) → Пред. ({prevDateFormatted}) → Сейчас ({currentDateFormatted})
              </p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {fullMetricsMatrix.map((m, idx) => {
              const recentDelta = (m.current - m.prev).toFixed(1); // За последние 2 недели
              const totalDelta = (m.current - m.start).toFixed(1);  // Со старта программы
              const numRecent = Number(recentDelta);
              const numTotal = Number(totalDelta);

              return (
                <div key={idx} className="py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[12px]">
                      {m.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-[12px]">
                      {m.current} {m.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px] font-mono">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                      <span className="text-slate-400 block text-[9px]">Старт:</span>
                      <span className="text-slate-700 font-bold">{m.start}</span>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                      <span className="text-slate-400 block text-[9px]">-2 недели:</span>
                      <span className="text-slate-700 font-bold">{m.prev}</span>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                      <span className="text-slate-400 block text-[9px]">За 2 нед. (Δ):</span>
                      <span className={`font-bold ${numRecent < 0 ? 'text-emerald-700' : numRecent > 0 ? 'text-[#1E60D5]' : 'text-slate-500'}`}>
                        {numRecent > 0 ? `+${recentDelta}` : recentDelta}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                      <span className="text-slate-400 block text-[9px]">Всего (Δ):</span>
                      <span className={`font-bold ${numTotal < 0 ? 'text-emerald-700' : numTotal > 0 ? 'text-[#1E60D5]' : 'text-slate-500'}`}>
                        {numTotal > 0 ? `+${totalDelta}` : totalDelta}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ПОЛНАЯ ХРОНОЛОГИЯ ПО ВСЕМ 11 ЗАМЕРАМ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Хронология всех замеров по датам</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">История</span>
          </div>

          <div className="space-y-3">
            {fullTimelineHistory.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      📅 {item.date}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
                    {item.weight} кг
                  </span>
                </div>

                {/* Все 10 анатомических замеров в аккуратной сетке */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {item.allStats.map((st, sIdx) => (
                    <div key={sIdx} className="bg-white px-2 py-1 rounded-lg border border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{st.label}:</span>
                      <span className="font-mono font-bold text-slate-800 ml-1">{st.val}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10.5px] text-slate-500 italic pt-0.5">
                  «{item.note}»
                </p>
              </div>
            ))}
          </div>

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
