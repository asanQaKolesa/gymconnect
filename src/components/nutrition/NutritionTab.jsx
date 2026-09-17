import React from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function ProfileTab() {
  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-4 space-y-5 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* Шапка профиля */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center text-2xl font-bold shadow-md">
          АЕ
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-black tracking-tight">Асанәли Ерікұлы</h1>
          <p className="text-[12px] text-[#8E8E93]">Алматы • Invictus Go</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold text-[#34C759] bg-green-50 px-2.5 py-0.5 rounded-full">
            ✓ PRO Атлет GymConnect
          </span>
        </div>
      </div>

      {/* Статус подписки */}
      <div className="bg-gradient-to-r from-[#007AFF] to-[#0056B3] text-white rounded-[22px] p-5 shadow-[0_6px_20px_rgba(0,122,255,0.2)] space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Активная подписка</span>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Безлимит</span>
        </div>
        <div>
          <div className="text-[18px] font-bold">GymConnect All-Access</div>
          <p className="text-[12px] text-blue-100 mt-0.5">Доступ ко всем залам Алматы и маркетплейсу • Действует до 18.10.2026</p>
        </div>
        <button 
          onClick={() => alert('Управление подпиской и продление.')}
          className="w-full py-2.5 rounded-[14px] bg-white text-[#007AFF] font-bold text-[13px] shadow-sm hover:bg-blue-50 transition-all"
        >
          Продлить подписку
        </button>
      </div>

      {/* Статистика вызовов и достижений */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] text-center">
          <div className="text-[24px] font-bold text-[#007AFF]">14</div>
          <div className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Выполненных вызовов</div>
        </div>
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] text-center">
          <div className="text-[24px] font-bold text-[#34C759]">3</div>
          <div className="text-[11px] text-[#8E8E93] font-medium mt-0.5">Верифицированных отзыва</div>
        </div>
      </div>

      {/* Меню настроек */}
      <div className="bg-white rounded-[24px] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] divide-y divide-zinc-100">
        <div onClick={() => alert('Настройки уведомлений')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-zinc-50 rounded-xl">
          <span className="text-[14px] font-semibold text-zinc-800">🔔 Уведомления и напоминания</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div onClick={() => alert('Связь с поддержкой GymConnect')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-zinc-50 rounded-xl">
          <span className="text-[14px] font-semibold text-zinc-800">💬 Поддержка в Telegram</span>
          <span className="text-zinc-400">→</span>
        </div>
        <div onClick={() => alert('Выход из аккаунта')} className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-zinc-50 rounded-xl">
          <span className="text-[14px] font-semibold text-[#FF3B30]">🚪 Выйти из профиля</span>
          <span className="text-zinc-400">→</span>
        </div>
      </div>

    </div>
  );
}
