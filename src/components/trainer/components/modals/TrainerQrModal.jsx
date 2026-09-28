// src/components/trainer/components/modals/TrainerQrModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Share2 } from 'lucide-react';

export default function TrainerQrModal({ isOpen, onClose, coachName = 'Тренер', cleanUsername = 'coach' }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  // Точный адрес рабочего бота с Deep Link
  const publicCoachLink = `https://t.me/gymconnect_ala_bot?start=coach_${cleanUsername}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(publicCoachLink)}`;

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
      
      {/* Шапка */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">QR-код визитки</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28 text-center">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{coachName}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Покажите этот экран атлету в зале или распечатайте для шкафчика. Камера смартфона сразу откроет вашу визитку и свяжет ученика с вашей CRM.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl inline-block shadow-inner">
            <img src={qrCodeApiUrl} alt="QR визитки тренера" className="w-60 h-60 mx-auto rounded-xl shadow-2xs" />
          </div>

          <p className="text-[11px] font-mono font-bold text-blue-600 break-all bg-blue-50 py-1.5 px-3 rounded-xl border border-blue-100">
            {publicCoachLink}
          </p>
        </div>
      </div>

      {/* Нижние кнопки */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg flex gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? 'Скопировано!' : 'Копировать ссылку'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-md shadow-blue-600/30"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Поделиться</span>
        </button>
      </div>

    </div>
  );
}
