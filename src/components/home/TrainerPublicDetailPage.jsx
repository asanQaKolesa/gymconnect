// src/components/home/TrainerPublicDetailPage.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Dumbbell, 
  Send, 
  MessageCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Building,
  Video,
  Users
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../utils/telegramNotifications';

export default function TrainerPublicDetailPage({ 
  trainer, 
  onBack, 
  userProfile, 
  onLinkedSuccess,
  isPreviewMode = false 
}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkedSuccess, setLinkedSuccess] = useState(false);

  if (!trainer) return null;

  const fullName = trainer.full_name || `${trainer.first_name || 'Тренер'} ${trainer.last_name || ''}`.trim();
  const cleanUsername = (trainer.username || '').replace(/[@\s]/g, '').trim().toLowerCase();
  const cleanPhone = (trainer.phone || '').replace(/\D/g, '');
  const isVerified = trainer.is_verified || trainer.status === 'approved' || trainer.verification_status === 'verified';
  const gymLocation = trainer.gym ? trainer.gym.split('|')[0].trim() : 'Алматы';

  // Цены на пакеты
  const pricing = trainer.pricing || {};
  const singlePrice = Number(pricing.personal_single) || 8000;
  const blockPrice = Number(pricing.personal_block) || 70000;
  const blockCount = Number(pricing.personal_count) || 12;
  const pricePerSessionInBlock = Math.round(blockPrice / (blockCount || 1));

  // Пакет 8 занятий
  const block8Price = Math.round(blockPrice * (8 / 12));
  const pricePerSessionInBlock8 = Math.round(block8Price / 8);

  // Бонусы
  const hasTrial = Boolean(trainer.has_free_trial);
  const hasConsultation = Boolean(trainer.has_free_consultation);

  // Специализации
  const specs = Array.isArray(trainer.specializations) && trainer.specializations.length > 0
    ? trainer.specializations
    : (typeof trainer.specialization === 'string' ? trainer.specialization.split(',').map(s => s.trim()) : ['Силовой тренинг', 'Тонус', 'Рекомпозиция']);

  // Запись и автопривязка атлета к тренеру
  const handleEnrollToCoach = async () => {
    if (isPreviewMode) {
      alert('В режиме предпросмотра запись отключена.');
      return;
    }

    setIsLinking(true);
    try {
      const tgId = userProfile?.telegram_id || localStorage.getItem('gymconnect_telegram_id');
      const userId = userProfile?.id;

      if (!cleanUsername) {
        throw new Error('Telegram тренера не указан.');
      }

      const updatePayload = {
        trainer_username: cleanUsername,
        trainer_telegram: cleanUsername,
        updated_at: new Date().toISOString()
      };

      if (userId) {
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId);
      } else if (tgId) {
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('telegram_id', tgId);
      }

      // Обновляем локальный профиль
      try {
        const saved = localStorage.getItem('gymconnect_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('gymconnect_user_profile', JSON.stringify({ ...parsed, ...updatePayload }));
        }
      } catch (e) {}

      // Отправляем уведомление тренеру в Telegram
      if (trainer.telegram_id) {
        const studentName = `${userProfile?.first_name || 'Атлет'} ${userProfile?.last_name || ''}`.trim();
        const studentContact = userProfile?.username ? `@${userProfile.username}` : (userProfile?.phone || 'контакт в профиле');
        
        const notifyText = `🎉 <b>Новый ученик записался через публичную визитку!</b>\n\nАтлет: <b>${escapeHtml(studentName)}</b> (${studentContact})\nЗал: <b>${escapeHtml(gymLocation)}</b>\n\nАтлет автоматически привязан к вашему кабинету CoachOS.`;
        sendTelegramMessage(trainer.telegram_id, notifyText).catch(() => {});
      }

      setLinkedSuccess(true);
      if (onLinkedSuccess) {
        onLinkedSuccess(cleanUsername);
      }
    } catch (err) {
      alert('Ошибка при записи: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-between overflow-hidden select-none pb-28">
      
      {/* 1. ВЕРХНИЙ БАР */}
      {!isPreviewMode && (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60 shrink-0"
              title="Назад"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>

            <div className="text-center flex-1 min-w-0">
              <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
                Визитка наставника
              </h1>
              <p className="text-[10px] text-neutral-400 font-medium truncate">
                {gymLocation} • GymConnect CoachOS
              </p>
            </div>

            <div className="w-9" />
          </div>
        </header>
      )}

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">
        
        {/* Карточка профиля тренера */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-neutral-100 border border-neutral-200/80 overflow-hidden flex items-center justify-center font-bold text-neutral-700 text-lg shadow-2xs">
                  {trainer.avatar_url || trainer.photo_url ? (
                    <img src={trainer.avatar_url || trainer.photo_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {isVerified && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.8]" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="text-base font-bold text-neutral-900 leading-tight truncate">
                  {fullName}
                </h2>
                
                <p className="text-xs text-blue-600 font-mono font-semibold">
                  @{cleanUsername || 'coach'}
                </p>

                <p className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{gymLocation}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Быстрые кнопки мессенджеров (Telegram / WhatsApp) */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100">
            {cleanUsername && (
              <a
                href={`https://t.me/${cleanUsername}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-blue-200 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Написать в TG</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/7${cleanPhone.slice(-10)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-200 active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Бейдж бонуса для нового атлета */}
        {(hasTrial || hasConsultation) && (
          <div className="p-3.5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 shadow-xs">
            <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Бонус для новых подопечных:</span>
            </span>
            <p className="text-[11.5px] leading-snug">
              {hasTrial 
                ? 'Наставник проводит бесплатное вводное занятие в зале для постановки техники и целей.' 
                : 'Доступна бесплатная первичная онлайн-консультация и разбор программы.'}
            </p>
          </div>
        )}

        {/* О тренере и методологии */}
        {trainer.bio && (
          <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-neutral-900 block">О тренере и методике</span>
            
            <p className={`text-xs text-neutral-600 leading-relaxed ${bioExpanded ? '' : 'line-clamp-3'}`}>
              {trainer.bio}
            </p>

            {trainer.bio.length > 140 && (
              <button
                type="button"
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-xs font-semibold text-blue-600 flex items-center gap-1 cursor-pointer pt-0.5 active:scale-95"
              >
                <span>{bioExpanded ? 'Свернуть' : 'Читать подробнее'}</span>
                {bioExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}

        {/* Форматы занятий */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
          <span className="text-xs font-bold text-neutral-900 block">Доступные форматы ведения</span>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-1">
              <Building className="w-4 h-4 text-neutral-600 mx-auto" />
              <span className="font-bold text-neutral-800 block text-[11px]">Офлайн в зале</span>
              <span className="text-[9.5px] text-neutral-400 block">1 на 1</span>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-1">
              <Users className="w-4 h-4 text-neutral-600 mx-auto" />
              <span className="font-bold text-neutral-800 block text-[11px]">Сплит-пара</span>
              <span className="text-[9.5px] text-neutral-400 block">Вдвоем</span>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 space-y-1">
              <Video className="w-4 h-4 text-neutral-600 mx-auto" />
              <span className="font-bold text-neutral-800 block text-[11px]">Онлайн-куратор</span>
              <span className="text-[9.5px] text-neutral-400 block">Дистанционно</span>
            </div>
          </div>
        </div>

        {/* Абонементы и стоимость тренировок */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="text-xs font-bold text-neutral-900">Стоимость и блоки занятий</span>
            <span className="text-[10px] text-neutral-400 font-mono">₸ (тенге)</span>
          </div>

          <div className="space-y-2 font-mono">
            {/* Разовая тренировка */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 block font-sans">Разовая тренировка</span>
                <span className="text-[10.5px] text-neutral-400 font-sans">Оплата за 1 посещение</span>
              </div>
              <span className="text-sm font-bold text-neutral-900">
                {singlePrice.toLocaleString()} ₸
              </span>
            </div>

            {/* Пакет 8 занятий */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 block font-sans">Блок 8 занятий</span>
                <span className="text-[10.5px] text-neutral-400 font-sans">~{pricePerSessionInBlock8.toLocaleString()} ₸ / занятие</span>
              </div>
              <span className="text-sm font-bold text-neutral-900">
                {block8Price.toLocaleString()} ₸
              </span>
            </div>

            {/* Пакет 12 занятий (Хит) */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-900 block font-sans">Блок 12 занятий</span>
                  <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-md font-sans">Хит</span>
                </div>
                <span className="text-[10.5px] text-blue-700 font-sans">~{pricePerSessionInBlock.toLocaleString()} ₸ / занятие</span>
              </div>
              <span className="text-sm font-bold text-blue-700">
                {blockPrice.toLocaleString()} ₸
              </span>
            </div>
          </div>
        </div>

        {/* Специализации и навыки */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-900 block">Направления работы</span>
          <div className="flex flex-wrap gap-1.5">
            {specs.map((spec, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200/80 px-2.5 py-1 rounded-xl"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Локация и фитнес-клуб */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-900 block">Локация тренировок</span>
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 flex items-center gap-2.5 text-xs text-neutral-700">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{trainer.gym || 'Фитнес-клуб в Алматы'}</span>
          </div>
        </div>

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          {linkedSuccess ? (
            <div className="w-full py-3.5 px-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Вы успешно привязаны к тренеру!</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isLinking}
              onClick={handleEnrollToCoach}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Dumbbell className="w-4 h-4" />
              <span>{isLinking ? 'Запись в систему...' : 'Записаться к тренеру'}</span>
            </button>
          )}
        </div>
      </footer>

    </div>
  );
}
