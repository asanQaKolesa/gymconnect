// src/components/trainer/components/modals/TrainerPromotionModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Globe, Sparkles, Send } from 'lucide-react';

export default function TrainerPromotionModal({ isOpen, onClose, gymName = 'Алматы' }) {
  const [promoType, setPromoType] = useState('offline'); // 'offline' | 'online'

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
        <h2 className="text-xs font-bold text-slate-900">Продвижение (Boost)</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
        {/* Переключатель Офлайн / Онлайн */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setPromoType('offline')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              promoType === 'offline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Продвижение в зале
          </button>
          <button
            type="button"
            onClick={() => setPromoType('online')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              promoType === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Продвижение Онлайн
          </button>
        </div>

        {promoType === 'offline' ? (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Локальный буст в залах Алматы</h3>
                <p className="text-[11px] text-slate-500">Приоритет в вашем клубе: {gymName}</p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1.5 text-xs text-blue-950">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Что дает оффлайн-продвижение:
              </p>
              <ul className="text-[11px] text-blue-900 space-y-1 list-disc pl-4">
                <li>1-е место в каталоге тренеров при выборе вашего зала атлетами</li>
                <li>Золотой бейдж «Рекомендованный тренер клуба»</li>
                <li>До 8 раз больше просмотров визитки новыми атлетами</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
              <p className="text-[10.5px] text-slate-400 font-sans">Тариф продвижения</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Индивидуальный расчет по клубу</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Онлайн-буст по всему Казахстану</h3>
                <p className="text-[11px] text-slate-500">Поиск подопечных на дистанционное ведение</p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs text-emerald-950">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Что дает онлайн-продвижение:
              </p>
              <ul className="text-[11px] text-emerald-900 space-y-1 list-disc pl-4">
                <li>Показ в разделе «Онлайн-наставники» по всему Казахстану</li>
                <li>Баннерное размещение в модулях питания и тренировок</li>
                <li>Прямой поток заявок в ваш WhatsApp/Telegram</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
              <p className="text-[10.5px] text-slate-400 font-sans">Тариф онлайн-пакета</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Индивидуальный расчет по охвату</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <a
          href="https://t.me/asanali_kk"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Оставить заявку куратору на продвижение</span>
        </a>
      </div>
    </div>
  );
}
