// src/components/trainer/components/modals/TrainerSubscriptionModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Tag, CheckCircle2, AlertCircle, Check, Crown, Zap, Sparkles } from 'lucide-react';

export default function TrainerSubscriptionModal({ isOpen, onClose }) {
  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState('');
  
  // 3 тарифа: 'start' (до 10), 'pro' (до 30 - ХИТ ПРОДАЖ), 'top' (до 100)
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState(1); // 1, 3, 6, 12 мес.

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

  // Базовые цены в месяц для каждого из 3 тарифов
  const basePrices = {
    start: 4990,
    pro: 8990,
    top: 14990
  };

  const discounts = { 1: 0, 3: 0.15, 6: 0.25, 12: 0.35 };
  const currentBasePrice = basePrices[selectedPlan] || 8990;
  const totalMonthsPrice = Math.round(
    currentBasePrice * selectedBillingPeriod * (1 - discounts[selectedBillingPeriod])
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* Шапка */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-slate-700 font-bold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Назад</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">Тарифные планы CoachOS</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28">
        
        {/* Блок промокода */}
        <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#1E60D5]" />
            <h4 className="text-xs font-bold text-slate-900">Есть промокод на доступ?</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Введите промокод от куратора GymConnect и получите <span className="font-bold text-[#1E60D5]">7 дней Pro-доступа</span> бесплатно.
          </p>
          
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={promoInput}
              onChange={e => setPromoInput(e.target.value)}
              placeholder="Например: PROMO7"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold text-slate-900 focus:outline-none focus:border-[#1E60D5]"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-4 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
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

        {/* 3 ТАРИФА (МОДЕЛЬ MCDONALD'S: СТАРТ / ПРОФИ [ХИТ] / ТОП) */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-800 px-1">Выберите тариф под свой масштаб:</p>
          
          <div className="grid grid-cols-3 gap-2">
            
            {/* Тариф 1: Старт */}
            <button
              type="button"
              onClick={() => setSelectedPlan('start')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'start'
                  ? 'bg-blue-50 border-[#1E60D5] shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Старт</p>
                <p className="text-[10px] text-slate-500 mt-0.5">до 10 уч.</p>
              </div>
              <p className="text-xs font-bold font-mono text-slate-900 mt-2">4 990 ₸</p>
            </button>

            {/* Тариф 2: Профи (ОСНОВНОЙ ЛОКОМОТИВ / ХИТ) */}
            <button
              type="button"
              onClick={() => setSelectedPlan('pro')}
              className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between relative ${
                selectedPlan === 'pro'
                  ? 'bg-blue-50/90 border-[#1E60D5] shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-amber-400/80 hover:bg-slate-50'
              }`}
            >
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                Хит продаж
              </span>

              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                  <span>Профи</span>
                  <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                </p>
                <p className="text-[10px] text-blue-700 font-semibold mt-0.5">до 30 уч.</p>
              </div>
              <p className="text-xs font-bold font-mono text-[#1E60D5] mt-2">8 990 ₸</p>
            </button>

            {/* Тариф 3: Топ */}
            <button
              type="button"
              onClick={() => setSelectedPlan('top')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'top'
                  ? 'bg-blue-50 border-[#1E60D5] shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Топ</p>
                <p className="text-[10px] text-slate-500 mt-0.5">до 100 уч.</p>
              </div>
              <p className="text-xs font-bold font-mono text-slate-900 mt-2">14 990 ₸</p>
            </button>

          </div>
        </div>

        {/* Выбор периода с дисконтом */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <p className="text-xs font-bold text-slate-900">Период оплаты:</p>
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
                    ? 'bg-[#1E60D5] text-white border-[#1E60D5] font-bold shadow-xs'
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

        {/* Подробное наполнение выбранного тарифа */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedPlan === 'start' && 'Тариф «Старт CRM»'}
                {selectedPlan === 'pro' && 'Тариф «Профи (Хит)»'}
                {selectedPlan === 'top' && 'Тариф «Топ Масштаб»'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedPlan === 'start' && 'Лимит: до 10 активных подопечных'}
                {selectedPlan === 'pro' && 'Лимит: до 30 подопечных + Каталог и Лидогенерация'}
                {selectedPlan === 'top' && 'Лимит: до 100 подопечных + Приоритет ТОП-1'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-[#1E60D5] font-mono">{totalMonthsPrice.toLocaleString()} ₸</p>
              <p className="text-[10px] text-slate-400">за {selectedBillingPeriod} мес.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {selectedPlan === 'start' && 'Ведение до 10 учеников в CRM'}
                {selectedPlan === 'pro' && 'Ведение до 30 активных учеников'}
                {selectedPlan === 'top' && 'Ведение до 100 активных учеников'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Списание тренировок и уведомления в 1 клик</span>
            </div>

            {/* В базовом каталога НЕТ, в Профи и Топ — ВКЛЮЧЕНО */}
            {selectedPlan !== 'start' ? (
              <>
                <div className="flex items-center gap-2 font-bold text-[#1E60D5]">
                  <Sparkles className="w-4 h-4 text-[#1E60D5] shrink-0" />
                  <span>Размещение в городском Каталоге тренеров</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Лидогенерация: бесплатные пробные тренировки и консультации</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Публичная визитка с QR-кодом для фитнес-зала</span>
                </div>
              </>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] text-slate-500 leading-snug">
                Каталог тренеров и привлечение клиентов недоступны в базовом тарифе. Доступны в пакете «Профи (до 30 уч.)».
              </div>
            )}

            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Касса, учет оплат и аналитика доходов</span>
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
          className="w-full py-3.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-blue-600/25"
        >
          <span>Оплатить {totalMonthsPrice.toLocaleString()} ₸ через Kaspi Pay</span>
        </a>
      </div>

    </div>
  );
}
