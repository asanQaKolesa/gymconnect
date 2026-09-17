import React from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function GymBroLikes({ onBack }) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#007AFF] hover:opacity-80 transition-all"
        >
          ← Назад к поиску
        </button>
        <span className="text-[12px] font-bold text-[#8E8E93] uppercase tracking-wider">Кто вас лайкнул</span>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-[#007AFF] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ❤️
        </div>
        <div>
          <h3 className="font-bold text-black text-[17px] tracking-tight">У вас 5 новых симпатий</h3>
          <p className="text-[13px] text-[#8E8E93] mt-1">Атлеты из залов Алматы хотят с вами тренироваться.</p>
        </div>
        <div className="p-4 bg-blue-50/60 rounded-[16px] text-xs text-[#007AFF] font-medium leading-relaxed">
          🔒 Оформите PRO-подписку GymConnect All-Access, чтобы мгновенно видеть всех взаимных и входящих кандидатов без ожидания!
        </div>
        <button 
          onClick={() => alert('Переход к оформлению PRO подписки')}
          className={appleTheme.styles.buttonPrimary}
        >
          Открыть PRO-доступ
        </button>
      </div>
    </div>
  );
}
