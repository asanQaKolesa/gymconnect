// src/components/trainer/components/modals/TrainerSubscriptionModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Tag, CheckCircle2, AlertCircle, Check } from 'lucide-react';

export default function TrainerSubscriptionModal({ isOpen, onClose }) {
  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'basic' | 'pro'
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState(1); // 1, 3, 6, 12

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    setPromoError('');
    const cleanPromo = promoInput.trim().toUpperCase();
    const validPromos = ['PROMO7', 'START2026', 'COACH7', 'ALMATY7', 'GYM7'];

    if (validPromos.includes(cleanPromo)) {
      setPromoSuccess(true);
    } else {
      setPromoError('Неверный или устаревший промокод. Проверьте правильность ввода.');
    }
  };

  const basePricePerMonth = selectedPlan === 'basic' ? 4990 : 9990;
  const discounts = { 1: 0, 3: 0.15, 6: 0.25, 12: 0.35 };
  const totalMonthsPrice = Math.round(
    basePricePerMonth * selectedBillingPeriod * (1 - discounts[selectedBillingPeriod])
  );

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
        <h2 className="text-xs font-bold text-slate-900">Управление подпиской CoachOS</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28">
        {/* Блок промокода */}
        <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">Есть промокод на доступ?</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Введите промокод от куратора GymConnect и получите <span className="font-bold text-blue-600">7 дней Pro-доступа</span> бесплатно.
          </p>
          
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value)}
              placeholder="Например: PROMO7"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
            >
              Применить
            </button>
          </div>

          {promoSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Тариф PRO на 7 дней успешно активирован!</span>
            </div>
          )}

          {promoError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{promoError}</span>
            </div>
          )}
        </div>

        {/* Переключатель тарифа */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedPlan('basic')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedPlan === 'basic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            До 10 учеников
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlan('pro')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              selectedPlan === 'pro' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Безлимит учеников
          </button>
        </div>

        {/* Выбор периода с дисконтом */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <p className="text-xs font-bold text-slate-900">Выберите период подписки:</p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { m: 1, label: '1 мес', disc: '' },
              { m: 3, label: '3 мес', disc: '-15%' },
              { m: 6, label: '6 мес', disc: '-25%' },
              { m: 12, label: '1 год', disc: '-35%' }
            ].map(item => (
              <button
                key={item.m}
                type="button"
                onClick={() => setSelectedBillingPeriod(item.m)}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  selectedBillingPeriod === item.m
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <p className="text-xs">{item.label}</p>
                {item.disc && (
                  <span className={`text-[9px] block font-mono ${selectedBillingPeriod === item.m ? 'text-blue-100' : 'text-emerald-600 font-bold'}`}>
                    {item.disc}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Карточка выбранного тарифа */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedPlan === 'basic' ? 'Тариф «Базовый старт»' : 'Тариф «Профи безлимит»'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {selectedPlan === 'basic' ? 'Лимит до 10 активных подопечных' : 'Без ограничений по количеству учеников'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 font-mono">{totalMonthsPrice.toLocaleString()} ₸</p>
              <p className="text-[10px] text-slate-400">за {selectedBillingPeriod} мес.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{selectedPlan === 'basic' ? 'До 10 активных учеников в базе' : 'Безлимитная база подопечных'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Учет и списание занятий в 1 клик</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Конструктор программ тренировок и питания</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Касса, учет оплат и аналитика доходов</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>QR-визитка, шаблоны WhatsApp и анкета здоровья</span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка оплаты через Kaspi Pay */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <a
          href="https://pay.kaspi.kz/pay/sblxzk95"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>Оплатить пакет ({totalMonthsPrice.toLocaleString()} ₸) через Kaspi Pay</span>
        </a>
      </div>
    </div>
  );
}
