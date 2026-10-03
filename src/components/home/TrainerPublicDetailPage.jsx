// src/components/trainer/components/modals/TrainerProfilePreviewModal.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Send, 
  Eye, 
  ExternalLink,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import TrainerCatalogCard from '../../../home/TrainerCatalogCard';
import TrainerPublicDetailPage from '../../../home/TrainerPublicDetailPage';

export default function TrainerProfilePreviewModal({ 
  isOpen, 
  onClose, 
  trainer, 
  cleanUsername = 'coach' 
}) {
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog' | 'full'
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !trainer) return null;

  const targetUsername = (cleanUsername || trainer.username || 'coach').replace(/[@\s]/g, '').trim().toLowerCase();
  
  // Рабочая персональная ссылка с префиксом `coach_` (перехватывается в App.jsx)
  const inviteLink = `https://t.me/gymconnect_ala_bot?start=coach_${targetUsername}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `Привет! Записывайся ко мне на персональные тренировки в GymConnect:\n${inviteLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200 h-[100dvh]">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60 shrink-0"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Предпросмотр профиля
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Так вашу визитку видят атлеты
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Переключатель вида: «В каталоге (кратко)» vs «Полная страница» */}
        <div className="max-w-md mx-auto mt-2.5 grid grid-cols-2 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setViewMode('catalog')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'catalog'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>В каталоге (кратко)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'full'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Полная визитка</span>
          </button>
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ ОБЛАСТЬ ПРЕДПРОСМОТРА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5 pb-10">
        
        {/* Информационная плашка */}
        <div className="bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs flex items-center gap-2.5 text-xs text-neutral-600 leading-snug">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {viewMode === 'catalog' 
              ? 'Компактный вид карточки в общем списке тренеров Алматы.' 
              : 'Экран, куда атлет переходит по клику или по вашей инвайт-ссылке.'}
          </span>
        </div>

        {viewMode === 'catalog' ? (
          <div className="space-y-3">
            <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
              Карточка в результатах поиска:
            </span>

            {/* Живая компактная карточка */}
            <TrainerCatalogCard 
              trainer={trainer}
              onSelect={() => setViewMode('full')}
            />

            {/* Карточка персональной ссылки */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Ваша персональная ссылка с автопривязкой:
              </span>
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs font-mono font-semibold text-neutral-800">
                <span className="truncate mr-2 text-blue-700">{inviteLink}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 rounded-lg text-[10.5px] font-bold border border-neutral-200 shrink-0 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  {isCopied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Полная интерактивная страница визитки */
          <div className="rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs bg-white">
            <TrainerPublicDetailPage 
              trainer={trainer}
              isPreviewMode={true}
              onBack={() => setViewMode('catalog')}
            />
          </div>
        )}

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР (НЕ СЪЕЗЖАЕТ ПРИ СКРОЛЛЕ) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-3.5 px-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-neutral-200/80 shadow-2xs truncate"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Скопировано!' : 'Копировать ссылку'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareTelegram}
            className="py-3.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/25 truncate"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Поделиться в TG</span>
          </button>

        </div>
      </footer>

    </div>
  );
}
