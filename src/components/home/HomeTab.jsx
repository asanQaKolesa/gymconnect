import React from 'react';
import GymFeedTab from '../GymFeedTab';

export default function HomeTab({
  currentUser,
  onNavigateTab,
  onOpenPaywall
}) {
  const handleFindTrainer = () => {
    alert('🏋️‍♂️ Сервис подбора тренеров по 230 залам Алматы скоро запустится!');
  };

  const handleIAmTrainer = () => {
    alert('💼 Регистрация для тренеров открыта. Напиши нам: @asanali_kk');
  };

  return (
    <div className="space-y-2.5 pb-4 select-none">
      {/* 1. Микро-баннер официального канала (сверху, без простыни текста) */}
      <a
        href="https://t.me/gymconnect_almaty"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#181d2c] to-[#121622] border border-white/10 hover:border-[#FF5A1F]/40 transition active:scale-98 shadow-sm no-underline"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📢</span>
          <div>
            <div className="text-[11px] font-bold text-white leading-none">GymConnect Kazakhstan</div>
            <div className="text-[9px] text-slate-400">Ивенты, совместные выезды и комьюнити</div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#FF8C38] px-2 py-0.5 rounded-md bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 shrink-0">
          Канал ➔
        </span>
      </a>

      {/* 2. Компактный фокус дня */}
      <div className="px-3.5 py-2 rounded-xl bg-[#121622] border border-white/5 flex items-center gap-2">
        <span className="text-sm shrink-0">🔥</span>
        <p className="text-[11px] font-medium text-slate-300 leading-snug truncate">
          «Дисциплина бьёт мотивацию в 100% случаев.»
        </p>
      </div>

      {/* 3. Компактные плашки B2B тренеров */}
      <div className="grid grid-cols-2 gap-2">
        {/* Клиентам */}
        <div
          onClick={handleFindTrainer}
          className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-[#FF5A1F]/50 transition cursor-pointer active:scale-95 space-y-0.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">🏋️‍♂️</span>
            <span className="text-[8px] bg-[#FF5A1F]/15 text-[#FF8C38] font-bold px-1.5 py-0.5 rounded-md border border-[#FF5A1F]/30">
              Клиентам
            </span>
          </div>
          <div className="text-[11px] font-black text-white pt-0.5">Найти тренера</div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Подбор под ваши запросы
          </p>
        </div>

        {/* Тренерам */}
        <div
          onClick={handleIAmTrainer}
          className="p-2.5 rounded-2xl bg-[#121622] border border-white/10 hover:border-amber-500/50 transition cursor-pointer active:scale-95 space-y-0.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-base">💼</span>
            <span className="text-[8px] bg-amber-500/15 text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30">
              Тренерам
            </span>
          </div>
          <div className="text-[11px] font-black text-white pt-0.5">Я тренер</div>
          <p className="text-[9px] text-slate-400 leading-tight">
            Привлечение новых клиентов
          </p>
        </div>
      </div>

      {/* 4. Лента зала (кнопка пруфов формы теперь сразу на первом экране!) */}
      <GymFeedTab
        user={currentUser}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}
