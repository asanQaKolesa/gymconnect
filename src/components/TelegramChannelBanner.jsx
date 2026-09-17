import React, { useState, useEffect } from 'react';

const CHANNEL_URL = 'https://t.me/+QRvCVzzxHUpkMjAy';

export default function TelegramChannelBanner({ compact = false }) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('gymconnect_channel_dismissed');
    if (dismissed === 'true' && compact) {
      setIsDismissed(true);
    }
  }, [compact]);

  function handleDismiss() {
    setIsDismissed(true);
    localStorage.setItem('gymconnect_channel_dismissed', 'true');
  }

  if (isDismissed) return null;

  if (compact) {
    return (
      <div className="relative p-3 rounded-2xl bg-gradient-to-r from-[#FF5A1F]/15 via-black/40 to-[#FF5A1F]/10 border border-[#FF5A1F]/30 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-amber-500 flex items-center justify-center text-lg shadow-md flex-shrink-0">
            📢
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate">Комьюнити в Telegram</h4>
            <p className="text-[10px] text-slate-400 truncate">Анонсы тренировок и сходок Invictus</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl gymshark-btn-electric text-[11px] font-bold no-underline whitespace-nowrap shadow-sm"
          >
            Вступить ➔
          </a>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            title="Скрыть"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c1613] via-[#10141f] to-[#0a0d14] border border-[#FF5A1F]/30 shadow-xl space-y-3 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#FF5A1F]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/20 border border-[#FF5A1F]/40 flex items-center justify-center text-xl shadow-inner">
            ⚡️
          </div>
          <div>
            <span className="text-[9px] font-black text-[#FF8C38] uppercase tracking-widest block">
              Официальный канал
            </span>
            <h3 className="text-sm font-black text-white">GymConnect Kazakhstan</h3>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-slate-300">
          Закрытый чат
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Совместные выезды, тренировки выходного дня, обмен опытом и закрытые ивенты для резидентов комьюнити.
      </p>

      <a
        href={CHANNEL_URL}
        target="_blank"
        rel="noreferrer"
        className="w-full gymshark-btn-electric py-2.5 text-xs font-bold flex items-center justify-center gap-2 no-underline block text-center shadow-lg shadow-[#FF5A1F]/20"
      >
        <span>Присоединиться к каналу ➔</span>
      </a>
    </div>
  );
}
