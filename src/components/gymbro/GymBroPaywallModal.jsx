import React from 'react';

export default function GymBroPaywallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-base cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-1.5 pt-2">
          <span className="text-3xl">👑</span>
          <h3 className="text-base font-black text-white">GymConnect PRO</h3>
          <p className="text-xs text-slate-300">
            Разблокируй прямые контакты напарников и персональный план питания
          </p>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <p className="flex items-center gap-2">
            <span className="text-amber-400">✓</span> Прямые ссылки на Telegram и Instagram напарников
          </p>
          <p className="flex items-center gap-2">
            <span className="text-amber-400">✓</span> Умные фильтры по филиалам и времени
          </p>
          <p className="flex items-center gap-2">
            <span className="text-amber-400">✓</span> Персональный расчет КБЖУ и меню на 7 дней
          </p>
        </div>

        <div className="text-center pt-1">
          <p className="text-2xl font-black text-amber-400">2 990 ₸ <span className="text-xs font-normal text-slate-400">/ месяц</span></p>
          <p className="text-[10px] text-slate-500 mt-0.5">Оплата через Kaspi Pay</p>
        </div>

        <a
          href="https://t.me/asanali_kk"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 no-underline shadow-lg shadow-amber-500/20"
        >
          Оформить подписку через Kaspi 💳
        </a>
      </div>
    </div>
  );
}
