// src/components/trainer/components/modals/TrainerSupportModal.jsx
import React from 'react';
import { ArrowLeft, Headphones, Send } from 'lucide-react';

export default function TrainerSupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">Техподдержка</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Служба технической поддержки</h3>
              <p className="text-[10px] text-slate-400">GymConnect CoachOS Assistance</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Если у вас возникли технические сбои, вопросы по списанию тренировок, добавлению новых залов или отправке уведомлений ученикам — специалисты техподдержки помогут решить любой вопрос.
          </p>
          
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-500">
              <span>Режим работы:</span>
              <span className="font-semibold text-slate-800">Ежедневно 08:00 – 22:00</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Среднее время ответа:</span>
              <span className="font-semibold text-emerald-600">до 10 минут</span>
            </div>
          </div>

          <a
            href="https://t.me/asanali_kk"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Написать куратору в Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
