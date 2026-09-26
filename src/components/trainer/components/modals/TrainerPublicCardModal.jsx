// src/components/trainer/components/modals/TrainerPublicCardModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, Copy, Check, Share2 } from 'lucide-react';

export default function TrainerPublicCardModal({ 
  isOpen, 
  onClose, 
  onEditClick, 
  trainer, 
  cleanUsername 
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [acceptingStudents, setAcceptingStudents] = useState(
    trainer?.public_settings?.accepting_new_students ?? true
  );
  const [showPhone, setShowPhone] = useState(
    trainer?.public_settings?.show_phone ?? true
  );

  if (!isOpen) return null;

  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;

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

  const isApproved = trainer?.status === 'approved';
  const specializations = Array.isArray(trainer?.specializations) && trainer.specializations.length > 0
    ? trainer.specializations
    : ['Набор массы и гипертрофия'];

  const personalSingle = trainer?.pricing?.personal_single || 8000;
  const personalBlock = trainer?.pricing?.personal_block || 70000;
  const personalCount = trainer?.pricing?.personal_count || 12;

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
        <h2 className="text-xs font-bold text-slate-900">Публичная визитка</h2>
        <button
          type="button"
          onClick={onEditClick}
          className="text-xs font-semibold text-blue-600 active:scale-95"
        >
          Изменить
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
        {/* Карточка визитки */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-xs">
              {trainer?.avatar_url || trainer?.photo_url ? (
                <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{cleanUsername[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {trainer?.first_name || 'Тренер'} {trainer?.last_name || ''}
                </h3>
                {isApproved && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
              <p className="text-xs text-blue-600 font-mono mt-0.5">@{cleanUsername}</p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{trainer?.gym || 'Invictus Go'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl">
              Стаж: {trainer?.experience_years || 3} года
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
              {trainer?.work_format === 'hybrid' ? 'Зал + Онлайн' : trainer?.work_format === 'online' ? 'Только онлайн' : 'Оффлайн в зале'}
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
              {trainer?.workout_duration || 60} мин / тренировка
            </span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Специализации</span>
            <div className="flex flex-wrap gap-1">
              {specializations.map((s, i) => (
                <span key={i} className="text-[10.5px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Цены и абонементы</span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-sans">Разовая тренировка</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{Number(personalSingle).toLocaleString()} ₸</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-sans">Абонемент ({personalCount} зан.)</p>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{Number(personalBlock).toLocaleString()} ₸</p>
              </div>
            </div>
          </div>

          {trainer?.bio && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">О тренере</span>
              <p className="text-xs text-slate-600 leading-relaxed">{trainer.bio}</p>
            </div>
          )}
        </div>

        {/* Настройки видимости */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Настройки видимости</p>
          
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="text-slate-700">Открыт к записи новых учеников</span>
            <input
              type="checkbox"
              checked={acceptingStudents}
              onChange={e => setAcceptingStudents(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="text-slate-700">Отображать WhatsApp для прямой связи</span>
            <input
              type="checkbox"
              checked={showPhone}
              onChange={e => setShowPhone(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </label>
        </div>

        {/* Персональная ссылка */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Персональная ссылка в боте</span>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-mono text-[10.5px] text-slate-600 truncate mr-2">{publicCoachLink}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 shrink-0"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Поделиться визиткой</span>
        </button>
      </div>
    </div>
  );
}
