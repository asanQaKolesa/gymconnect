// src/components/trainer/screens/AthleteMeasurementsScreen.jsx
import React, { useState } from 'react';
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
  Target
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteMeasurementsScreen({ student, trainer, onBack }) {
  const [requestSent, setRequestSent] = useState(false);
  const [coachNote, setCoachNote] = useState(student?.coach_notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

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

  // Матрица параметров тела: [Зона, Старт, Прошлый, Сейчас, Ед.]
  const measurementRows = [
    { label: 'Вес тела', start: startWeight, prev: prevWeight, current: currentWeight, unit: 'кг', isKey: true },
    { label: 'Талия (живот)', start: 86.0, prev: 82.5, current: Number(student?.waist || 80.0), unit: 'см' },
    { label: 'Грудь', start: 101.0, prev: 99.5, current: Number(student?.chest || 99.0), unit: 'см' },
    { label: 'Бёдра (ягодицы)', start: 103.0, prev: 99.0, current: Number(student?.hips || 97.5), unit: 'см' },
    { label: 'Шея', start: 39.0, prev: 38.5, current: Number(student?.neck || 38.0), unit: 'см' },
    { label: 'Правый бицепс', start: 34.5, prev: 35.5, current: Number(student?.biceps_right || 36.0), unit: 'см' },
    { label: 'Левый бицепс', start: 34.0, prev: 35.0, current: Number(student?.biceps_left || 35.5), unit: 'см' },
    { label: 'Правое бедро', start: 58.5, prev: 57.0, current: Number(student?.thigh_right || 56.0), unit: 'см' },
    { label: 'Левое бедро', start: 58.0, prev: 56.5, current: Number(student?.thigh_left || 55.5), unit: 'см' },
    { label: 'Правая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_right || 37.0), unit: 'см' },
    { label: 'Левая икра', start: 38.0, prev: 37.5, current: Number(student?.calf_left || 37.0), unit: 'см' }
  ];

  // Хронологические срезы
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
      note: 'Первичный антропометрический срез при начале тренировок.',
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

  const handleSaveCoachNote = async () => {
    if (!student?.id) return;
    setIsSavingNote(true);
    try {
      await supabase
        .from('profiles')
        .update({ coach_notes: coachNote })
        .eq('id', student.id);

      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch (e) {
      console.warn('Ошибка сохранения заметки:', e);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSendNoteToAthlete = () => {
    const tgId = student?.telegram_id || student?.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    if (!coachNote.trim()) {
      alert('Напишите комментарий перед отправкой.');
      return;
    }

    const text = `📋 <b>Рекомендации тренера по замерам:</b>\n\n${escapeHtml(coachNote.trim())}\n\n<i>Наставник: ${escapeHtml(coachName)}</i>`;

    if (tgId) {
      sendTelegramMessage(tgId, text)
        .then(() => alert('✅ Рекомендация отправлена подопечному в Telegram!'))
        .catch(() => alert('Не удалось отправить. Откройте чат напрямую.'));
    } else {
      alert('Telegram ID атлета не найден.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-28">
      
      {/* 1. ВЕРХНЯЯ ШАПКА */}
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

        {/* 2. ПОЛНОЦЕННАЯ ВИЗИТКА АТЛЕТА С ПОДЛОЖКОЙ ДЛЯ ЦЕЛИ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 text-base">
              {student?.avatar_url || student?.photo_url ? (
                <img src={student.avatar_url || student.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <h2 className="text-base font-bold text-slate-900 truncate">
                {fullName}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {student?.username ? `@${student.username.replace('@', '')}` : (student?.phone || 'Контакты не указаны')}
              </p>
              {student?.gym && (
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  📍 {student.gym.split('|')[0]}
                </p>
              )}
            </div>
          </div>

          {/* Плашка главной цели */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Target className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-slate-500 font-medium">Цель программы:</span>
              <span className="font-bold text-slate-800 truncate">{student?.goal || 'Коррекция фигуры'}</span>
            </div>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10.5px] font-mono font-bold text-slate-700 shrink-0">
              Цель: {targetWeight} кг
            </span>
          </div>
        </div>

        {/* 3. КАРТОЧКА ДИНАМИКИ ВЕСА (3 СРЕЗА + ИТОГОВАЯ ДЕЛЬТА) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Динамика веса</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Все значения в кг</span>
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
              <span className="text-[10px] text-slate-400 font-mono block mb-1">за всё время</span>
              <span className={`text-xs font-mono font-bold inline-flex items-center justify-center gap-0.5 ${
                currentWeight <= startWeight ? 'text-emerald-700' : 'text-[#1E60D5]'
              }`}>
                {(currentWeight - startWeight).toFixed(1)} кг
              </span>
            </div>
          </div>
        </div>

        {/* 4. ТАБЛИЦА МАТРИЦЫ ЗАМЕРОВ ТЕЛА (ЧЁТКАЯ СЕТКА ПО ЦЕНТРУ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Матрица замеров тела</h3>
            </div>
            <span className="text-[10.5px] text-slate-400 font-mono">Период: {startDateFormatted} → {currentDateFormatted}</span>
          </div>

          {/* Шапка таблицы */}
          <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 text-center">
            <span className="col-span-4 text-left">Параметр</span>
            <span className="col-span-2">Старт</span>
            <span className="col-span-2">Прошлый</span>
            <span className="col-span-2">Сейчас</span>
            <span className="col-span-2 text-right">Итог (Δ)</span>
          </div>

          {/* Строки таблицы с фиксированным выравниванием */}
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {measurementRows.map((row, idx) => {
              const diff = (row.current - row.start).toFixed(1);
              const numDiff = Number(diff);

              return (
                <div 
                  key={idx} 
                  className={`grid grid-cols-12 gap-1 py-2 items-center text-center ${
                    row.isKey ? 'bg-slate-50/90 font-bold rounded-lg px-1.5 -mx-1.5' : ''
                  }`}
                >
                  {/* Название зоны */}
                  <span className={`col-span-4 text-left font-sans text-[11.5px] truncate ${
                    row.isKey ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                  }`}>
                    {row.label}
                  </span>

                  {/* Старт */}
                  <span className="col-span-2 text-slate-500 text-[11px]">
                    {row.start} {row.unit}
                  </span>

                  {/* Прошлый */}
                  <span className="col-span-2 text-slate-500 text-[11px]">
                    {row.prev} {row.unit}
                  </span>

                  {/* Сейчас */}
                  <span className={`col-span-2 text-[11px] ${
                    row.isKey ? 'font-bold text-slate-900' : 'font-bold text-slate-800'
                  }`}>
                    {row.current} {row.unit}
                  </span>

                  {/* Итог (Δ) */}
                  <div className="col-span-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10.5px] inline-block ${
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

        {/* 5. ХРОНОЛОГИЯ ВСЕХ ЗАМЕРОВ ПО ДАТАМ (БЕЗ ЭМОДЗИ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">Хронология срезов по датам</h3>
            <span className="text-[10.5px] text-slate-400 font-mono">Архив замеров</span>
          </div>

          <div className="space-y-2.5">
            {timelineHistory.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1.5">
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-900 block">
                      {item.date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {item.weight} кг
                  </span>
                </div>

                {/* Аккуратные плашки параметров */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {item.stats.map((st, sIdx) => (
                    <div key={sIdx} className="bg-white px-2 py-1 rounded-lg border border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{st.label}:</span>
                      <span className="font-mono font-bold text-slate-700 ml-1">{st.val}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10.5px] text-slate-500 italic pt-0.5">
                  «{item.note}»
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. БЛОК: ЗАМЕТКИ И КОММЕНТАРИИ ТРЕНЕРА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h3 className="text-xs font-bold text-slate-800">Комментарии и указания тренера</h3>
            </div>
            {noteSaved && <span className="text-[10px] font-bold text-emerald-600">Сохранено</span>}
          </div>

          <textarea
            rows={3}
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            placeholder="Внесите рекомендации по рациону, корректировке силовых весов или режиму отдыха..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
          />

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              disabled={isSavingNote}
              onClick={handleSaveCoachNote}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingNote ? 'Сохранение...' : 'Сохранить заметку'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendNoteToAthlete}
              className="h-9 px-3 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить в TG</span>
            </button>
          </div>
        </div>

        {/* 7. КНОПКА ЗАПРОСА ОБНОВЛЕНИЯ ЗАМЕРОВ */}
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
