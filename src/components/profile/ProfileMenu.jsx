// src/components/profile/ProfileMenu.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  HelpCircle, 
  Share2, 
  ChevronRight, 
  Sparkles, 
  X, 
  Send 
} from 'lucide-react';

export default function ProfileMenu() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Переход в тренерский раздел
  const handleOpenTrainerPortal = () => {
    window.location.href = window.location.pathname + '?trainer=true';
  };

  // Поделиться приложением в Telegram
  const handleShareApp = () => {
    const text = encodeURIComponent('Присоединяйся к GymConnect — спортивному комьюнити залов Алматы!');
    const url = encodeURIComponent('https://t.me/gymconnect_almaty_bot');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2 select-none">
      
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Сервисы и поддержка
        </span>
        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
          GymConnect Hub
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        
        {/* 1. Сотрудничество для тренеров (Trainer CRM) */}
        <button
          type="button"
          onClick={handleOpenTrainerPortal}
          className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Dumbbell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Для тренеров (Trainer CRM)
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Личный кабинет, расписание и база подопечных
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 2. Восстановленный раздел: Помощь и техподдержка */}
        <button
          type="button"
          onClick={() => setIsSupportModalOpen(true)}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <HelpCircle className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Служба поддержки и помощь
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Частые вопросы, связь с оператором 24/7
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 3. Поделиться приложением */}
        <button
          type="button"
          onClick={handleShareApp}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Пригласить друга в GymBro
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Отправить ссылку на бота в Telegram
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

      </div>

      {/* Модальное окно техподдержки */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Поддержка GymConnect</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Возникли вопросы по фитнес-залам, подбору напарников GymBro или работе приложения? Наша служба заботы всегда на связи.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <p>📍 Город: <b>Алматы, Казахстан</b></p>
                <p>⏰ Режим работы: <b>24/7 онлайн</b></p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8ec3] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/30 active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Написать в поддержку Telegram</span>
            </a>

          </div>
        </div>
      )}

    </div>
  );
}
