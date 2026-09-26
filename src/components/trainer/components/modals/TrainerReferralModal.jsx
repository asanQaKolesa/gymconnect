// src/components/trainer/components/modals/TrainerReferralModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Gift, Copy, Check } from 'lucide-react';

export default function TrainerReferralModal({ isOpen, onClose, cleanUsername }) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const referralCoachLink = `https://t.me/gymconnect_almaty_bot?start=refcoach_${cleanUsername}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
        <h2 className="text-xs font-bold text-slate-900">Пригласи коллегу-тренера</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Бонус: +1 месяц PRO-тарифа</h3>
              <p className="text-[11px] text-slate-500">За каждого тренера, оплатившего подписку</p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2 text-blue-950">
            <p className="font-bold text-xs">Условия начисления бонуса:</p>
            <ol className="text-[11px] text-blue-900 space-y-1.5 list-decimal pl-4">
              <li>Отправьте персональную ссылку коллеге-тренеру.</li>
              <li>Коллега регистрируется в GymConnect и получает <strong>14 дней бесплатного триала</strong>.</li>
              <li>После окончания триала, как только коллега оплачивает свой 1-й месяц любого тарифа — вам автоматически начисляется <strong>1 месяц бесплатного PRO-тарифа</strong>!</li>
            </ol>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ваша пригласительная ссылка:</span>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-slate-600 truncate mr-2">{referralCoachLink}</span>
              <button
                type="button"
                onClick={handleCopyReferral}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
