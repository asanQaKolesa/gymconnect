// src/components/profile/ProfileSupport.jsx
import React, { useState } from 'react';
import { 
  HelpCircle, 
  Send, 
  Instagram, 
  ChevronRight, 
  X, 
  ExternalLink 
} from 'lucide-react';

export default function ProfileSupport() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5 select-none">
      
      {/* Заголовок без слов «и контакты», бейдж без 24/7 */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 whitespace-nowrap">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          Служба поддержки
        </span>
        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200 shrink-0">
          На связи
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        
        {/* 1. Чат помощи */}
        <button
          type="button"
          onClick={() => setIsHelpModalOpen(true)}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <HelpCircle className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Служба поддержки и помощь
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Чат заботы в Telegram • Помощь атлетам Алматы
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 2. Официальный Telegram-канал */}
        <a
          href="https://t.me/gymconnect_almaty"
          target="_blank"
          rel="noreferrer"
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Send className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Telegram-канал комьюнити
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Новости залов Алматы, события и фитнес-челенджи
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </a>

        {/* 3. Instagram сообщества */}
        <a
          href="https://instagram.com/gymconnect_kz"
          target="_blank"
          rel="noreferrer"
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Instagram className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Instagram @gymconnect_kz
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Фотоотчеты, видеообзоры клубов и жизнь сообщества
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </a>

      </div>

      {/* Модалка поддержки без упоминания круглосуточности */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Поддержка GymConnect</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Возникли вопросы по фитнес-залам, оплате подписки или подбору напарников GymBro? Напишите нам в чат поддержки.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <p>📍 Город: <b>г. Алматы, Казахстан</b></p>
                <p>💬 Канал связи: <b>Telegram чат заботы</b></p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8ec3] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/30 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Написать оператору в Telegram</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
