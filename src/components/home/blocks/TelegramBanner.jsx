import React from 'react';

export default function TelegramBanner() {
  return (
    <a
      href="https://t.me/gymconnect_almaty"
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#181d2c] to-[#121622] border border-white/10 hover:border-[#FF5A1F]/40 transition active:scale-98 shadow-sm no-underline"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">📢</span>
        <div>
          <div className="text-[11px] font-bold text-white leading-none">GymConnect Kazakhstan</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Ивенты, выезды и комьюнити залов</div>
        </div>
      </div>
      <span className="text-[10px] font-bold text-[#FF8C38] px-2 py-0.5 rounded-md bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 shrink-0">
        Канал ➔
      </span>
    </a>
  );
}
