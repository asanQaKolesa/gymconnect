// src/components/trainer/components/TrainerHeader.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  LogOut, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Sparkles 
} from 'lucide-react';

export default function TrainerHeader({ trainer, onLogout, onBack }) {
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '') : 'coach';
  const isApproved = trainer?.status === 'approved';

  // Персональная ссылка на визитку тренера в Telegram-боте
  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Записывайтесь ко мне на персональные тренировки в GymConnect:`);
    const url = encodeURIComponent(publicCoachLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 p-3.5 sticky top-0 z-30 select-none shadow-xs">
        <div className="flex items-center justify-between gap-2">
          
          {/* Левая часть: Кнопка «Атлет» и профиль тренера */}
          <div className="flex items-center gap-2 overflow-hidden">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold border border-slate-200/70 shrink-0"
                title="Вернуться в профиль атлета"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Атлет</span>
              </button>
            )}

            {/* Аватар и статус */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                {trainer?.avatar_url || trainer?.photo_url ? (
                  <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{trainer?.first_name?.[0] || trainer?.full_name?.[0] || 'T'}</span>
                )}
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <h1 className="text-xs font-bold text-slate-900 truncate">
                    {trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`.trim()}
                  </h1>
                  {isApproved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  @{cleanUsername} • CoachOS
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть: Кнопка визитки и выход */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Кнопка открытия визитки / публичного профиля */}
            <button
              type="button"
              onClick={() => setIsPublicModalOpen(true)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold border border-blue-200/80 flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Визитка</span>
            </button>

            {/* Выход из CRM */}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
              title="Выйти из аккаунта тренера"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ================= МОДАЛЬНОЕ ОКНО ПУБЛИЧНОГО ПРОФИЛЯ ТРЕНЕРА ================= */}
      {isPublicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            
            {/* Шапка модалки */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Публичная визитка тренера</h3>
                  <p className="text-[10px] text-slate-400">Так ваш профиль видят клиенты</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublicModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Карточка-превью профиля */}
            <div className="space-y-3">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                  {trainer?.avatar_url || trainer?.photo_url ? (
                    <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                      {cleanUsername[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden space-y-0.5">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {trainer?.full_name || `${trainer?.first_name || ''} ${trainer?.last_name || ''}`}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Стаж: <b className="text-slate-800 font-semibold">{trainer?.experience_years || 3} года</b> • {trainer?.work_format === 'online' ? 'Онлайн' : trainer?.work_format === 'offline' ? 'Офлайн' : 'Зал + Онлайн'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">@{cleanUsername}</p>
                </div>
              </div>

              {/* Залы */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{trainer?.gym || 'Зал не привязан'}</span>
                </div>
                {trainer?.secondary_gym && (
                  <p className="text-[10px] text-slate-500 pl-5 truncate">
                    Второй зал: {trainer.secondary_gym}
                  </p>
                )}
              </div>

              {/* Прайс-лист тренера */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400">Разовая тренировка</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
                    {trainer?.pricing?.personal_single ? `${Number(trainer.pricing.personal_single).toLocaleString()} ₸` : '8 000 ₸'}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400">Абонемент (12 зан.)</p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5 font-mono">
                    {trainer?.pricing?.personal_block ? `${Number(trainer.pricing.personal_block).toLocaleString()} ₸` : '70 000 ₸'}
                  </p>
                </div>
              </div>

              {/* Бонусы */}
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 font-semibold">
                <span>Пробная тренировка:</span>
                <span>{trainer?.has_free_trial ? 'Бесплатно (30 мин)' : 'По тарифу'}</span>
              </div>

            </div>

            {/* Персональная ссылка и кнопки шаринга */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500 truncate mr-2">
                  {publicCoachLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Отправить визитку клиенту в Telegram</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
