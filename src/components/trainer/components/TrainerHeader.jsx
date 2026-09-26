// src/components/trainer/components/modals/TrainerQrModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react';

export default function TrainerQrModal({ isOpen, onClose, coachName, cleanUsername }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(publicCoachLink)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent('Записывайтесь ко мне на персональные тренировки в GymConnect:');
    const url = encodeURIComponent(publicCoachLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

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
        <h2 className="text-xs font-bold text-slate-900">QR-код визитки</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">{coachName}</h3>
          <p className="text-xs text-slate-500">
            Покажите этот экран атлету в зале или распечатайте для шкафчика. Камера телефона сразу откроет вашу визитку.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
            <img src={qrCodeApiUrl} alt="QR визитки тренера" className="w-56 h-56 mx-auto rounded-lg" />
          </div>

          <p className="text-[11px] font-mono text-slate-500 break-all">{publicCoachLink}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg flex gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? 'Скопировано' : 'Копировать ссылку'}</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Поделиться</span>
        </button>
      </div>
    </div>
  );
}
