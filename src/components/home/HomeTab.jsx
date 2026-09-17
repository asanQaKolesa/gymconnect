import React from 'react';
import GymFeedTab from '../GymFeedTab';
import TelegramChannelBanner from '../TelegramChannelBanner';

export default function HomeTab({
  currentUser,
  onNavigateTab,
  onOpenPaywall
}) {
  const handleFindTrainer = () => {
    alert('🏋️‍♂️ Сервис тренеров Алматы готовится к запуску! Скоро здесь будет удобный подбор по 230 залам города.');
  };

  const handleIAmTrainer = () => {
    alert('💼 Регистрация тренеров открыта в тестовом режиме. Напиши нам в Telegram: @asanali_kk');
  };

  return (
    <div className="space-y-3.5 pb-4 select-none">
      {/* 1. Карточка профиля / Визитка атлета */}
      <div className="apple-glass-card p-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#121622] border border-white/15 flex-shrink-0 flex items-center justify-center shadow-md">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt="Athlete"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-white">
                {currentUser?.name?.[0] || 'A'}
              </span>
            )}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-tight truncate">
                {currentUser?.name || 'Атлет'}
              </h2>
              {currentUser?.is_pro && (
                <span className="text-[8px] bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-black">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentUser?.city || 'Алматы'} • {currentUser?.sport_type || 'Атлет'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('profile')}
          className="text-[10px] text-[#FF8C38] font-bold px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer active:scale-95 transition"
        >
          Профиль ➔
        </button>
      </div>

      {/* 2. Компактная карточка дня с мотивационной цитатой */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141926] to-[#10141f] border border-white/10 shadow-lg relative overflow-hidden">
        <div className="text-[10px] font-black text-[#FF8C38] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>🔥</span> Фокус дня
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-snug">
          «Дисциплина — это решение делать то, чего не хочется, чтобы достичь того, о чём мечтаешь.»
        </p>
      </div>

      {/* 3. Блок тренеров (Naimi-модель): 2 плашки */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Плашка: Найти тренера */}
        <div
          onClick={handleFindTrainer}
          className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#FF5A1F]/50 transition cursor-pointer active:scale-95 space-y-1 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">🏋️‍♂️</span>
            <span className="text-[9px] bg-[#FF5A1F]/15 text-[#FF8C38] font-bold px-2 py-0.5 rounded-full border border-[#FF5A1F]/30">
              Клиентам
            </span>
          </div>
          <div className="text-xs font-black text-white pt-1">Найти тренера</div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Подбор профи по залам Алматы
          </p>
        </div>

        {/* Плашка: Для тренеров */}
        <div
          onClick={handleIAmTrainer}
          className="p-3.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-amber-500/50 transition cursor-pointer active:scale-95 space-y-1 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">💼</span>
            <span className="text-[9px] bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Pro-тренерам
            </span>
          </div>
          <div className="text-xs font-black text-white pt-1">Я тренер</div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Поток клиентов из твоего зала
          </p>
        </div>
      </div>

      {/* 4. Баннер подписки на Telegram-канал */}
      <TelegramChannelBanner />

      {/* 5. Лента зала */}
      <GymFeedTab
        user={currentUser}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}
