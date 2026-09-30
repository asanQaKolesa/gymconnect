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
  Calendar,
  Layers,
  Utensils
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage } from '../../../utils/telegramNotifications';

// Словарь понятного русского перевода системных значений опыта
const EXPERIENCE_MAP = {
  beginner: 'Новичок (до 1 года)',
  starter: 'Новичок (до 1 года)',
  intermediate: 'Средний уровень (1–3 года)',
  medium: 'Средний уровень (1–3 года)',
  advanced: 'Опытный атлет (более 3 лет)',
  pro: 'Профессионал / Выступающий атлет'
};

export default function AthleteDetailScreen({ 
  student, 
  trainer, 
  onBack, 
  onUpdate 
}) {
  const [currentStudent, setCurrentStudent] = useState(student);
  const [actionLoading, setActionLoading] = useState(false);

  // Режим редактирования цены и условий тарифа
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editPrice, setEditPrice] = useState(currentStudent.monthly_price || 70000);
  const [editBurnable, setEditBurnable] = useState(currentStudent.is_burnable !== false);
  const [editDaysLimit, setEditDaysLimit] = useState(currentStudent.membership_term || 30);

  // Состояние замеров тела (Вес, Талия, Грудь, Бедра)
  const [measurements, setMeasurements] = useState({
    weight: currentStudent.current_weight || currentStudent.weight || '',
    waist: currentStudent.waist || '',
    chest: currentStudent.chest || '',
    hips: currentStudent.hips || ''
  });
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);

  const fullName = currentStudent.full_name || `${currentStudent.first_name || ''} ${currentStudent.last_name || ''}`.trim() || 'Атлет';
  const leftTrainings = Number(currentStudent.left_trainings ?? currentStudent.remaining_workouts ?? 12);
  const totalTrainings = Number(currentStudent.total_trainings || 12);
  const isPaused = (currentStudent.status || '').toLowerCase() === 'paused';

  // 1. Открыть Telegram
  const handleOpenTg = () => {
    const username = (currentStudent.username || currentStudent.telegram_username || '').replace('@', '').trim();
    if (username) {
      window.open(`https://t.me/${username}`, '_blank');
    } else if (currentStudent.phone) {
      window.open(`https://wa.me/${currentStudent.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  // 2. Степпер баланса: изменить на +1 или -1
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

  // 3. Продление абонемента (+12 занятий)
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
        sendTelegramMessage(tgId, `🎉 <b>Абонемент продлен!</b>\n\nНачислено: <b>+12 тренировок</b>.\nТекущий баланс: <b>${updated} занятий</b>.`).catch(() => {});
      }

      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка продления:', e);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Поставить на паузу / Снять
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

  // 5. Сохранение условий абонемента (цена, сгорание, срок)
  const handleSavePlanSettings = async () => {
    setActionLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({
          monthly_price: Number(editPrice) || 70000,
          is_burnable: editBurnable,
          membership_term: `${editDaysLimit} дней`
        })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({
        ...prev,
        monthly_price: Number(editPrice) || 70000,
        is_burnable: editBurnable,
        membership_term: `${editDaysLimit} дней`
      }));
      setIsEditingPlan(false);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка сохранения тарифа:', e);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Выставить счёт на оплату в Telegram
  const handleSendInvoice = () => {
    const tgId = currentStudent.telegram_id || currentStudent.chat_id;
    const coachName = trainer?.full_name || trainer?.first_name || 'Ваш наставник';
    const priceText = Number(currentStudent.monthly_price || 70000).toLocaleString();
    const phone = trainer?.phone || 'указанному номеру';

    const invoiceText = `🧾 <b>Счёт на оплату персональных тренировок</b>\n\nАтлет: <b>${escape(fullName)}</b>\nПакет: <b>12 персональных тренировок</b>\nК оплате: <b>${priceText} ₸</b>\n\nРеквизиты для перевода (Kaspi / Счёт):\n<b>${phone}</b> (${coachName})\n\n<i>После оплаты отправьте чек тренеру в ответном сообщении.</i>`;

    if (tgId) {
      sendTelegramMessage(tgId, invoiceText)
        .then(() => alert('✅ Счёт на оплату успешно отправлен в Telegram-бот подопечного!'))
        .catch(() => alert('Не удалось отправить в бот. Откройте чат напрямую.'));
    } else {
      handleOpenTg();
    }
  };

  // 7. Сохранение замеров тела
  const handleSaveMeasurements = async () => {
    setIsSavingMeasurements(true);
    try {
      await supabase
        .from('profiles')
        .update({
          current_weight: Number(measurements.weight) || null,
          health_notes: `Талия: ${measurements.waist || '—'} см, Грудь: ${measurements.chest || '—'} см, Бёдра: ${measurements.hips || '—'} см`
        })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({
        ...prev,
        current_weight: Number(measurements.weight) || null
      }));
      alert('✅ Замеры тела успешно сохранены!');
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка замеров:', e);
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const experienceText = EXPERIENCE_MAP[(currentStudent.experience_level || '').toLowerCase()] || currentStudent.experience_level || '1–2 года тренировок';
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
            <p className="text-[10px] text-slate-400 font-mono">ID: {currentStudent.id.substring(0, 8)}</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3.5">
        
        {/* 1. ВИЗИТКА И СТАТУС */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 text-lg">
              {currentStudent.avatar_url || currentStudent.photo_url ? (
                <img src={currentStudent.avatar_url || currentStudent.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{fullName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-base font-bold text-slate-800 truncate">
                  {fullName}
                </h3>
                {isPaused ? (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-semibold shrink-0">
                    На паузе
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10.5px] font-semibold shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Активен
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 font-mono">
                {currentStudent.username ? `@${currentStudent.username.replace('@', '')}` : (currentStudent.phone || 'Контакты не указаны')}
              </p>

              {currentStudent.gym && (
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  📍 {currentStudent.gym.split('|')[0]}
                </p>
              )}
            </div>
          </div>

          {/* Быстрые контакты */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenTg}
              className="h-10 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Написать в TG</span>
            </button>

            {currentStudent.phone ? (
              <a
                href={`tel:${currentStudent.phone}`}
                className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Позвонить</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="h-10 bg-slate-50 text-slate-400 rounded-xl text-xs font-medium inline-flex items-center justify-center"
              >
                Нет номера
              </button>
            )}
          </div>
        </div>

        {/* 2. АБОНЕМЕНТ И БАЛАНС (В ОДНУ СТРОКУ, РЕДАКТИРУЕМЫЙ) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Абонемент и баланс</h4>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingPlan(!isEditingPlan)}
              className="text-xs font-semibold text-[#1E60D5] inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingPlan ? 'Скрыть' : 'Тариф'}</span>
            </button>
          </div>

          {/* Редактирование условий пакета */}
          {isEditingPlan ? (
            <div className="p-3 bg-slate-50 rounded-xl space-y-2.5 border border-slate-200/60 text-xs animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Стоимость пакета (₸):</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-semibold text-slate-600 block mb-1">Срок сгорания (дней):</label>
                  <input
                    type="number"
                    value={editDaysLimit}
                    onChange={(e) => setEditDaysLimit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-medium text-slate-700">Правило сгорания занятий:</span>
                <button
                  type="button"
                  onClick={() => setEditBurnable(!editBurnable)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold cursor-pointer transition-colors ${
                    editBurnable ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {editBurnable ? 'Сгораемый блок' : 'Без сгорания'}
                </button>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSavePlanSettings}
                className="w-full py-2 bg-[#1E60D5] text-white rounded-lg text-xs font-semibold cursor-pointer active:scale-98 transition-all"
              >
                Сохранить условия
              </button>
            </div>
          ) : (
            /* Строка 1: Стоимость + Срок сгорания */
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
              <div>
                <span className="text-[10.5px] text-slate-400 block">Стоимость блока:</span>
                <span className="font-mono font-bold text-slate-800">
                  {Number(currentStudent.monthly_price || 70000).toLocaleString()} ₸
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10.5px] text-slate-400 block">Регламент:</span>
                <span className="font-semibold text-slate-700">
                  {currentStudent.is_burnable !== false ? 'Сгорает за 30 дней' : 'Несгораемый'}
                </span>
              </div>
            </div>
          )}

          {/* Строка 2: Счётчик занятий в одну линию */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <button
              type="button"
              disabled={actionLoading || leftTrainings <= 0}
              onClick={() => handleAdjustBalance(-1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              title="Списать 1 занятие"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-medium block">Баланс тренировок</span>
              <p className="text-base font-bold font-mono text-slate-800">
                {leftTrainings} <span className="text-xs font-normal text-slate-400">из {totalTrainings}</span>
              </p>
            </div>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAdjustBalance(+1)}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              title="Добавить 1 занятие"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Действия: Выставить счёт, Продлить +12, Пауза */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendInvoice}
              className="py-2.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer border border-emerald-200/60"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Выставить счёт</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRenewPackage}
              className="py-2.5 px-1 bg-blue-50 hover:bg-blue-100 text-[#1E60D5] rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer border border-blue-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+12 зан.</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleTogglePause}
              className="py-2.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-200"
            >
              {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Снять' : 'Пауза'}</span>
            </button>
          </div>
        </div>

        {/* 3. ЗАМЕРЫ ТЕЛА: ВЕС, ТАЛИЯ, ГРУДЬ, БЕДРА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Замеры тела и динамика</h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#1E60D5]">
              {currentStudent.current_weight || currentStudent.weight || '—'} кг
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Вес (кг)</label>
              <input
                type="number"
                step="0.1"
                placeholder="75.0"
                value={measurements.weight}
                onChange={(e) => setMeasurements({ ...measurements, weight: e.target.value })}
                className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1E60D5]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Талия (см)</label>
              <input
                type="number"
                placeholder="80"
                value={measurements.waist}
                onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1E60D5]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Грудь (см)</label>
              <input
                type="number"
                placeholder="98"
                value={measurements.chest}
                onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1E60D5]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Бёдра (см)</label>
              <input
                type="number"
                placeholder="100"
                value={measurements.hips}
                onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1E60D5]"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isSavingMeasurements}
            onClick={handleSaveMeasurements}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Сохранить замеры</span>
          </button>
        </div>

        {/* 4. АНКЕТА ПРИ РЕГИСТРАЦИИ (ПОЛНЫЙ РУССКИЙ ПЕРЕВОД) */}
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
              <span className="font-semibold text-slate-800">{experienceText}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">Точное время занятия:</span>
              <span className="font-semibold font-mono text-slate-800">{timeSlotText}</span>
            </div>

            {/* Рост и возраст раздельно */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">Рост</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {currentStudent.height ? `${currentStudent.height} см` : 'Не указан'}
                </span>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">Возраст</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {currentStudent.age ? `${currentStudent.age} лет` : 'Не указан'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. АНКЕТА ЗДОРОВЬЯ И ТРАВМЫ (PAR-Q) */}
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
