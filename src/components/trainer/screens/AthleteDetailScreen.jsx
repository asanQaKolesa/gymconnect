// src/components/trainer/screens/AthleteDetailScreen.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Calendar, 
  Scale, 
  HeartPulse, 
  Dumbbell, 
  Clock, 
  Plus, 
  Minus, 
  RefreshCw, 
  PauseCircle, 
  PlayCircle, 
  ShieldAlert, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../utils/telegramNotifications';

export default function AthleteDetailScreen({ 
  student, 
  trainer, 
  onBack, 
  onUpdate 
}) {
  const [currentStudent, setCurrentStudent] = useState(student);
  const [newWeight, setNewWeight] = useState('');
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  // 2. Списание одного занятия вручную
  const handleDeductWorkout = async () => {
    if (leftTrainings <= 0) return;
    setActionLoading(true);
    const updated = Math.max(0, leftTrainings - 1);
    try {
      await supabase
        .from('profiles')
        .update({ left_trainings: updated, remaining_workouts: updated })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({ ...prev, left_trainings: updated, remaining_workouts: updated }));
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка списания:', e);
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

      // Уведомление атлету в бот
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

  // 4. Поставить на паузу / Снять с паузы
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

  // 5. Зафиксировать новый замер веса
  const handleSaveWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    setIsUpdatingWeight(true);
    const val = Number(newWeight);
    try {
      await supabase
        .from('profiles')
        .update({ current_weight: val })
        .eq('id', currentStudent.id);

      setCurrentStudent(prev => ({ ...prev, current_weight: val }));
      setNewWeight('');
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка веса:', e);
    } finally {
      setIsUpdatingWeight(false);
    }
  };

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
            <p className="text-[10px] text-slate-400 font-mono font-medium">ID: {currentStudent.id.substring(0, 8)}</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-3.5">
        
        {/* 1. ВИЗИТКА И БЫСТРЫЕ КОНТАКТЫ */}
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 truncate">
                  {fullName}
                </h3>
                {isPaused ? (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    На паузе
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Занимается
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenTg}
              className="h-10 bg-[#1E60D5] hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Написать в Telegram</span>
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
                Нет телефона
              </button>
            )}
          </div>
        </div>

        {/* 2. АБОНЕМЕНТ И ОПЕРАЦИИ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Абонемент и баланс</h4>
            </div>
            <span className="text-xs font-mono font-bold text-[#1E60D5]">
              {leftTrainings} из {totalTrainings} занятий
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Остаток</span>
              <span className="text-base font-bold font-mono text-slate-800">{leftTrainings}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Тариф</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                {currentStudent.monthly_price ? `${Number(currentStudent.monthly_price).toLocaleString()} ₸` : '70 000 ₸'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-medium block">Сгорание</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                {currentStudent.is_burnable !== false ? 'Сгораемый' : 'Без сгорания'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              disabled={actionLoading || leftTrainings <= 0}
              onClick={handleDeductWorkout}
              className="py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Списать 1</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRenewPackage}
              className="py-2 px-1 bg-blue-50 hover:bg-blue-100 text-[#1E60D5] rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+12 зан.</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleTogglePause}
              className="py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Снять паузу' : 'Пауза'}</span>
            </button>
          </div>
        </div>

        {/* 3. ДИНАМИКА ВЕСА И ЗАМЕРЫ */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600 stroke-[2]" />
              <h4 className="text-xs font-bold text-slate-800">Замеры и вес</h4>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              {currentStudent.current_weight ? `${currentStudent.current_weight} кг` : 'Вес не указан'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Старт</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {currentStudent.weight ? `${currentStudent.weight} кг` : '—'}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Текущий</span>
              <span className="text-xs font-mono font-bold text-[#1E60D5]">
                {currentStudent.current_weight || currentStudent.weight || '—'} кг
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Цель</span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {currentStudent.target_weight ? `${currentStudent.target_weight} кг` : '—'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="number"
              step="0.1"
              placeholder="Новый замер веса (кг)..."
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#1E60D5]"
            />
            <button
              type="button"
              disabled={isUpdatingWeight || !newWeight}
              onClick={handleSaveWeight}
              className="px-4 bg-[#1E60D5] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              {isUpdatingWeight ? '...' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* 4. АНКЕТА ЗДОРОВЬЯ И ОГРАНИЧЕНИЯ (PAR-Q) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <HeartPulse className="w-4 h-4 text-rose-500 stroke-[2]" />
            <h4 className="text-xs font-bold text-slate-800">Здоровье и ограничения (PAR-Q)</h4>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200/60">
            {currentStudent.injury_notes || currentStudent.health_notes || currentStudent.parq_notes ? (
              <p className="text-rose-700 font-medium leading-relaxed">
                ⚠️ {currentStudent.injury_notes || currentStudent.health_notes || currentStudent.parq_notes}
              </p>
            ) : (
              <p className="text-slate-500">
                Противопоказания, травмы и ограничения не зафиксированы.
              </p>
            )}
          </div>
        </div>

        {/* 5. ВХОДНАЯ АНКЕТА ИЗ БОТА */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-slate-600 stroke-[2]" />
            <h4 className="text-xs font-bold text-slate-800">Анкета при регистрации</h4>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500">Главная цель:</span>
              <span className="font-semibold text-slate-800">{currentStudent.goal || 'Общая форма'}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">Опыт тренировок:</span>
              <span className="font-semibold text-slate-800">{currentStudent.experience_level || '1-2 года'}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">График в зале:</span>
              <span className="font-semibold text-slate-800">{currentStudent.workout_time_slot || '18:00 - 20:00'}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <span className="text-slate-500">Рост / Возраст:</span>
              <span className="font-semibold text-slate-800">
                {currentStudent.height ? `${currentStudent.height} см` : '—'} • {currentStudent.age ? `${currentStudent.age} лет` : '—'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
