// src/components/trainer/screens/AthleteDetailScreen.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Scale, 
  HeartPulse, 
  Dumbbell, 
  Clock, 
  Plus, 
  Minus, 
  PauseCircle, 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  Edit2, 
  Check, 
  AlertCircle,
  BellRing,
  Camera,
  History,
  TrendingDown,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

const translateExperience = (raw) => {
  if (!raw) return '1–2 года тренировок';
  const val = String(raw).toLowerCase().trim();
  if (val.includes('regular')) return 'Регулярные тренировки (1–3 года)';
  if (val.includes('begin') || val.includes('start')) return 'Новичок (до 1 года)';
  if (val.includes('inter') || val.includes('medium')) return 'Средний уровень (1–3 года)';
  if (val.includes('advanc') || val.includes('pro')) return 'Опытный атлет (более 3 лет)';
  return raw;
};

export default function AthleteDetailScreen({ 
  student, 
  trainer, 
  onBack, 
  onUpdate 
}) {
  const [currentStudent, setCurrentStudent] = useState(student);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [photoNotice, setPhotoNotice] = useState(false);

  // Режим редактирования абонемента
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editPrice, setEditPrice] = useState(currentStudent.monthly_price || 70000);
  const [editBurnable, setEditBurnable] = useState(currentStudent.is_burnable !== false);
  const [editDaysLimit, setEditDaysLimit] = useState(parseInt(currentStudent.membership_term, 10) || 30);
  const [editFormat, setEditFormat] = useState(currentStudent.training_format || currentStudent.package_type || 'individual');

  const fullName = currentStudent.full_name || `${currentStudent.first_name || ''} ${currentStudent.last_name || ''}`.trim() || 'Атлет';
  const leftTrainings = Number(currentStudent.left_trainings ?? currentStudent.remaining_workouts ?? 12);
  const totalTrainings = Number(currentStudent.total_trainings || 12);
  const isPaused = (currentStudent.status || '').toLowerCase() === 'paused';
  const isExpiring = leftTrainings <= 2;

  // Парсинг замеров тела
  const startWeight = Number(currentStudent.weight || currentStudent.start_weight || 78.5);
  const currentWeight = Number(currentStudent.current_weight || currentStudent.weight || 74.3);
  const targetWeight = Number(currentStudent.target_weight || 70.0);
  const weightDelta = (currentWeight - startWeight).toFixed(1);

  // Карта текущих замеров (в боевом режиме подтягивается из профиля или логов замеров)
  const bodyMetrics = {
    fat: currentStudent.body_fat || '18.4',
    neck: currentStudent.neck || '38.0',
    chest: currentStudent.chest || '99.0',
    waist: currentStudent.waist || '81.5',
    hips: currentStudent.hips || '98.0',
    bicepsRight: currentStudent.biceps_right || currentStudent.biceps || '36.5',
    bicepsLeft: currentStudent.biceps_left || '36.0',
    thighRight: currentStudent.thigh_right || currentStudent.thigh || '57.0',
    thighLeft: currentStudent.thigh_left || '56.5',
    calfRight: currentStudent.calf_right || '37.0',
    calfLeft: currentStudent.calf_left || '37.0'
  };

  // Демонстрационная хронологическая история замеров для наглядности
  const measurementsHistory = [
    { date: '18 сен', weight: currentWeight, waist: bodyMetrics.waist, chest: bodyMetrics.chest },
    { date: '04 сен', weight: (currentWeight + 1.2).toFixed(1), waist: '83.0', chest: '100.0' },
    { date: '20 авг', weight: startWeight, waist: '85.0', chest: '101.5' }
  ];

  const handleOpenTg = () => {
    const username = (currentStudent.username || currentStudent.telegram_username || '').replace('@', '').trim();
    if (username) {
      window.open(`https://t.me/${username}`, '_blank');
    } else if (currentStudent.phone) {
      window.open(`https://wa.me/${currentStudent.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleAdjustBalance = async (delta) => {
    const updated = Math.max(0, leftTrainings + delta);
    setActionLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ left_trainings: updated, remaining_workouts: updated })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({ ...prev, left_trainings: updated, remaining_workouts: updated }));
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка изменения баланса:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewPackage = async () => {
    setActionLoading(true);
    const updated = leftTrainings + 12;
    try {
      await supabase
        .from('profiles')
        .update({ 
          left_trainings: updated, 
          remaining_workouts: updated,
          total_trainings: 12,
          payment_status: 'paid',
          status: 'active'
        })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({ 
        ...prev, 
        left_trainings: updated, 
        remaining_workouts: updated, 
        payment_status: 'paid',
        status: 'active'
      }));

      const tgId = currentStudent.telegram_id || currentStudent.chat_id;
      if (tgId) {
        sendTelegramMessage(tgId, `🎉 <b>Абонемент обновлен!</b>\n\nВам начислено: <b>+12 тренировок</b>.\nТекущий баланс: <b>${updated} занятий</b>.`).catch(() => {});
      }

      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка обновления абонемента:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePause = async () => {
    setActionLoading(true);
    const newStatus = isPaused ? 'active' : 'paused';
    try {
      await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({ ...prev, status: newStatus }));
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка смены статуса:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePlanSettings = async () => {
    setActionLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          monthly_price: Number(editPrice) || 70000,
          is_burnable: editBurnable,
          membership_term: `${editDaysLimit} дней`,
          training_format: editFormat,
          package_type: editFormat
        })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({
        ...prev,
        monthly_price: Number(editPrice) || 70000,
        is_burnable: editBurnable,
        membership_term: `${editDaysLimit} дней`,
        training_format: editFormat,
        package_type: editFormat
      }));
      setIsEditingPlan(false);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка сохранения тарифа:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvoice = () => {
    const tgId = currentStudent.telegram_id || currentStudent.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const priceText = Number(currentStudent.monthly_price || 70000).toLocaleString();
    const phone = trainer?.phone || 'указанному номеру Kaspi';

    const invoiceText = `🧾 <b>Счёт на оплату тренировок</b>\n\nАтлет: <b>${escapeHtml(fullName)}</b>\nПакет: <b>12 персональных занятий</b>\nК оплате: <b>${priceText} ₸</b>\n\nРеквизиты для перевода (Kaspi):\n<b>${phone}</b> (${coachName})\n\n<i>После оплаты отправьте квитанцию тренеру.</i>`;

    if (tgId) {
      sendTelegramMessage(tgId, invoiceText)
        .then(() => alert('✅ Счёт на оплату отправлен атлету в Telegram!'))
        .catch(() => alert('Не удалось отправить в бот. Откройте диалог Telegram напрямую.'));
    } else {
      handleOpenTg();
    }
  };

  const handleRequestMeasurements = () => {
    const tgId = currentStudent.telegram_id || currentStudent.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш тренер';
    const text = `📏 <b>Контроль прогресса и замеры тела</b>\n\nПривет, ${escapeHtml(fullName)}! Тренер ${escapeHtml(coachName)} просит тебя обновить замеры тела (вес, талия, грудь, бёдра, руки).\n\nПожалуйста, сделай замеры натощак и внеси их в бота для отслеживания динамики!`;

    if (tgId) {
      sendTelegramMessage(tgId, text)
        .then(() => {
          setRequestSent(true);
          setTimeout(() => setRequestSent(false), 3000);
        })
        .catch(() => handleOpenTg());
    } else {
      handleOpenTg();
    }
  };

  const formatRu = {
    individual: 'Индивидуально',
    split: 'Сплит-тренировка',
    group: 'Мини-группа',
    online: 'Онлайн-ведение'
  }[currentStudent.training_format || currentStudent.package_type || 'individual'] || 'Индивидуально';

  const timeSlotText = currentStudent.custom_time || currentStudent.workout_time || currentStudent.workout_time_slot || '18:00';

  return (
    <div className="min-h-screen bg-slate-50 select-none pb-28">
      
      {/* ШАПКА ДОСЬЕ */}
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
            <h1 className="text-sm font-bold text-slate-800">Досье подопечного</h1>
            <p className="text-[10px] text-slate-400 font-medium">Персональная карточка атлета</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3.5">
        
        {/* 1. КОМПАКТНАЯ ВИЗИТКА С АКТУАЛЬНЫМ АВАТАРОМ И СТАТУСОМ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Компактный аватар w-11 h-11 */}
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 text-sm">
                {currentStudent.avatar_url || currentStudent.photo_url ? (
                  <img src={currentStudent.avatar_url || currentStudent.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-[14.5px] font-bold text-slate-800 truncate">
                  {fullName}
                </h3>

                <p className="text-[11.5px] text-slate-400 font-mono">
                  {currentStudent.username ? `@${currentStudent.username.replace('@', '')}` : (currentStudent.phone || 'Контакты не указаны')}
                </p>

                {currentStudent.gym && (
                  <p className="text-[10.5px] text-slate-500 font-medium truncate">
                    📍 {currentStudent.gym.split('|')[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Тумблер паузы */}
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleTogglePause}
              className={`h-8 px-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                isPaused 
                  ? 'bg-amber-50 text-amber-700 border-amber-200/80' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{isPaused ? 'На паузе' : 'Активен'}</span>
            </button>
          </div>

          {/* Быстрые контакты */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleOpenTg}
              className="h-9 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Написать в TG</span>
            </button>

            {currentStudent.phone ? (
              <a
                href={`tel:${currentStudent.phone}`}
                className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Позвонить</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="h-9 bg-slate-50 text-slate-400 rounded-xl text-xs font-medium inline-flex items-center justify-center"
              >
                Нет номера
              </button>
            )}
          </div>
        </div>

        {/* ПРЕДУПРЕЖДЕНИЕ: АБОНЕМЕНТ ЗАКАНЧИВАЕТСЯ */}
        {isExpiring && (
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-amber-900 block leading-tight">
                  Абонемент завершается
                </span>
                <span className="text-[11px] text-amber-700">
                  Осталось всего {leftTrainings} зан. Выставите счёт на продление.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. АБОНЕМЕНТ И ТАРИФ (ПОЛНЫЕ ТЕКСТЫ КНОПОК, ДВЕ СТРОКИ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Абонемент и тариф</h4>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingPlan(!isEditingPlan)}
              className="text-xs font-semibold text-[#1E60D5] inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingPlan ? 'Закрыть' : 'Изменить тариф'}</span>
            </button>
          </div>

          {/* Редактирование условий абонемента */}
          {isEditingPlan ? (
            <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200/60 text-xs animate-in fade-in">
              {/* Формат ведения: 2 строки по 2 кнопки без сокращений */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Формат ведения:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'individual', title: 'Индивидуально' },
                    { id: 'split', title: 'Сплит-тренировка' },
                    { id: 'group', title: 'Мини-группа' },
                    { id: 'online', title: 'Онлайн-ведение' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEditFormat(f.id)}
                      className={`h-8 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        editFormat === f.id 
                          ? 'bg-white text-slate-900 border-slate-300 shadow-2xs' 
                          : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {f.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Тумблер сгорания */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Правило сгорания:</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditBurnable(true)}
                    className={`h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      editBurnable ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Сгораемый
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBurnable(false)}
                    className={`h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !editBurnable ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Без сгорания
                  </button>
                </div>
              </div>

              {/* Стоимость и срок */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Стоимость пакета (₸):</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Срок действия (дней):</label>
                  <input
                    type="number"
                    value={editDaysLimit}
                    onChange={(e) => setEditDaysLimit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSavePlanSettings}
                className="w-full py-2 bg-[#1E60D5] text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-98 transition-all shadow-xs"
              >
                Сохранить тариф
              </button>
            </div>
          ) : (
            /* Информация о тарифе */
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-medium block">Формат</span>
                <span className="text-xs font-semibold text-slate-800 block mt-0.5 truncate">{formatRu}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-medium block">Стоимость</span>
                <span className="text-xs font-mono font-bold text-slate-800 block mt-0.5">
                  {Number(currentStudent.monthly_price || 70000).toLocaleString()} ₸
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-medium block">Регламент</span>
                <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                  {currentStudent.is_burnable !== false ? 'Сгорает 30 дн.' : 'Несгораемый'}
                </span>
              </div>
            </div>
          )}

          {/* Строка баланса тренировок со степпером */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              disabled={actionLoading || leftTrainings <= 0}
              onClick={() => handleAdjustBalance(-1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              title="Списать 1 занятие"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-medium block">Баланс занятий</span>
              <p className="text-[13px] font-mono font-bold text-slate-800">
                {leftTrainings} из {totalTrainings} тренировок
              </p>
            </div>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAdjustBalance(+1)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              title="Добавить / подарить 1 занятие"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Кнопки действий: 2 строки на полную ширину без обрезков текста */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleSendInvoice}
              className="w-full h-10 px-3 bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-800 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-200/70"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Выставить счёт на оплату</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRenewPackage}
              className="w-full h-10 px-3 bg-[#1E60D5] hover:bg-blue-600 active:scale-98 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Продлить абонемент (+12 занятий)</span>
            </button>
          </div>
        </div>

        {/* 3. ПОЛНАЯ АНАТОМИЧЕСКАЯ КАРТА ЗАМЕРОВ ТЕЛА И ДЕЛЬТА ПРОГРЕССА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Замеры тела и прогресс</h4>
            </div>

            <span className="text-[11px] font-mono font-bold text-[#1E60D5]">
              {currentWeight} кг
            </span>
          </div>

          {/* Плашка анализа динамики (Дельта) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Старт</span>
              <span className="text-xs font-mono font-bold text-slate-700">{startWeight} кг</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Текущий</span>
              <span className="text-xs font-mono font-bold text-slate-800">{currentWeight} кг</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Прогресс (Δ)</span>
              <span className={`text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                Number(weightDelta) <= 0 ? 'text-emerald-600' : 'text-[#1E60D5]'
              }`}>
                {Number(weightDelta) <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} кг
              </span>
            </div>
          </div>

          {/* Полная анатомическая сетка замеров */}
          <div className="space-y-2">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Анатомические замеры (см)
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Жир (%)</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.fat}%</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Шея</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.neck} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Грудь</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.chest} см</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Талия</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.waist} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Бёдра</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.hips} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Пр. бицепс</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.bicepsRight} см</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Лев. бицепс</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.bicepsLeft} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Пр. бедро</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.thighRight} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Лев. бедро</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.thighLeft} см</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Пр. икра</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.calfRight} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Лев. икра</span>
                <span className="text-xs font-mono font-bold text-slate-800">{bodyMetrics.calfLeft} см</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Целевой</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{targetWeight} кг</span>
              </div>
            </div>
          </div>

          {/* Хронологическая история замеров */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <History className="w-3.5 h-3.5" />
              <span>История динамики по датам</span>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-2.5 border border-slate-200/40 text-xs">
              {measurementsHistory.map((item, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <span className="text-slate-500 font-medium">{item.date}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-800">{item.weight} кг</span>
                    <span className="text-slate-400 text-[10px]">Талия: {item.waist} см</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка запроса замеров через Telegram */}
          <button
            type="button"
            onClick={handleRequestMeasurements}
            className={`w-full h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              requestSent 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {requestSent ? <Check className="w-4 h-4 text-emerald-600" /> : <BellRing className="w-4 h-4 text-slate-600" />}
            <span>{requestSent ? 'Запрос отправлен атлету в Telegram!' : 'Запросить обновление замеров в Telegram'}</span>
          </button>
        </div>

        {/* 4. ФОТО ПРОГРЕССА (ФОРМА АТЛЕТА) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Фотографии формы атлета</h4>
            </div>
            <span className="text-[10.5px] text-slate-400">До / После</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Визуальная фиксация формы атлета для сопоставления с анатомическими замерами.
          </p>

          <button
            type="button"
            onClick={() => {
              setPhotoNotice(true);
              setTimeout(() => setPhotoNotice(false), 3000);
            }}
            className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-600" />
            <span>{photoNotice ? 'Функция будет доступна скоро' : 'Загрузить фото прогресса'}</span>
          </button>
        </div>

        {/* 5. ВХОДНАЯ АНКЕТА ИЗ БОТА (ПОЛНЫЙ РУССКИЙ ЯЗЫК, МОНОХРОМНОЕ ВРЕМЯ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-slate-600 stroke-[2]" />
            <h4 className="text-xs font-bold text-slate-800">Входная анкета ученика</h4>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Главная цель:</span>
              <span className="font-semibold text-slate-800">{currentStudent.goal || 'Укрепление формы'}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">Опыт тренировок:</span>
              <span className="font-semibold text-slate-800">{translateExperience(currentStudent.experience_level)}</span>
            </div>

            {/* График и монохромное время */}
            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">График в зале:</span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                  Вечер
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-mono">
                  {timeSlotText}
                </span>
              </div>
            </div>

            {/* Рост и возраст аккуратными плашками */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2 bg-slate-50 rounded-xl text-center border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Рост</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {currentStudent.height ? `${currentStudent.height} см` : 'Не указан'}
                </span>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl text-center border border-slate-200/40">
                <span className="text-[10px] text-slate-400 block">Возраст</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {currentStudent.age ? `${currentStudent.age} лет` : 'Не указан'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. АНКЕТА ЗДОРОВЬЯ И ОГРАНИЧЕНИЯ (PAR-Q) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <HeartPulse className="w-4 h-4 text-rose-500 stroke-[2]" />
            <h4 className="text-xs font-bold text-slate-800">Ограничения и травмы (PAR-Q)</h4>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-200/60 leading-relaxed">
            {currentStudent.injury_notes || currentStudent.health_notes || currentStudent.parq_notes ? (
              <p className="text-rose-700 font-medium">
                ⚠️ {currentStudent.injury_notes || currentStudent.health_notes || currentStudent.parq_notes}
              </p>
            ) : (
              <p className="text-slate-500">
                Травмы, противопоказания и ограничения не зафиксированы.
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
