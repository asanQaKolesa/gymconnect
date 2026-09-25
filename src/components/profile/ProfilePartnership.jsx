// src/components/profile/ProfilePartnership.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Building2, 
  ShoppingBag, 
  Stethoscope, 
  ChevronRight, 
  X, 
  Send 
} from 'lucide-react';

export default function ProfilePartnership({ onOpenTrainer }) {
  const [partnerModal, setPartnerModal] = useState(null); // 'gyms' | 'shops' | 'specialists'

  const handleOpenTrainerPortal = () => {
    if (typeof onOpenTrainer === 'function') {
      onOpenTrainer();
    } else {
      window.location.href = window.location.pathname + '?trainer=true';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5 select-none">
      
      {/* Заголовок строго в одну строку */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 whitespace-nowrap">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
          Сотрудничество
        </span>
        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200 shrink-0">
          B2B программа
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        
        {/* 1. Для тренеров (Trainer CRM) — гарантированный переход */}
        <button
          type="button"
          onClick={handleOpenTrainerPortal}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Dumbbell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Для тренеров (Trainer CRM)
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Личный кабинет, расписание тренировок и база подопечных
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 2. Для фитнес-клубов и залов */}
        <button
          type="button"
          onClick={() => setPartnerModal('gyms')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Building2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Фитнес-клубам и залам
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Интеграция в базу 230+ залов Алматы и привлечение атлетов
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 3. Для спортивных магазинов */}
        <button
          type="button"
          onClick={() => setPartnerModal('shops')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Спортивным магазинам и брендам
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Размещение промокодов, скидки на экипировку и питание
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 4. Для спортивных специалистов */}
        <button
          type="button"
          onClick={() => setPartnerModal('specialists')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Stethoscope className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Спортивным специалистам
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Массажисты, нутрициологи, реабилитологи и коучи
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

      </div>

      {/* Модальное окно B2B сотрудничества */}
      {partnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  {partnerModal === 'gyms' && <Building2 className="w-4 h-4" />}
                  {partnerModal === 'shops' && <ShoppingBag className="w-4 h-4" />}
                  {partnerModal === 'specialists' && <Stethoscope className="w-4 h-4" />}
                </div>
                <h3 className="text-xs font-bold text-slate-900">
                  {partnerModal === 'gyms' && 'Сотрудничество с залами'}
                  {partnerModal === 'shops' && 'Сотрудничество с магазинами'}
                  {partnerModal === 'specialists' && 'Сотрудничество со специалистами'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPartnerModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                {partnerModal === 'gyms' && 'Хотите подключить ваш фитнес-клуб к экосистеме GymConnect в Алматы, продавать абонементы и привлекать новых клиентов?'}
                {partnerModal === 'shops' && 'Хотите предложить спортивное питание, одежду или экипировку для активных атлетов сообщества GymConnect?'}
                {partnerModal === 'specialists' && 'Вы спортивный массажист, коуч, спортивный психолог или нутрициолог в Алматы? Присоединяйтесь к базе проверенных специалистов.'}
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] font-mono space-y-1">
                <p>📍 Город: <b>Алматы, Казахстан</b></p>
                <p>🤝 Формат: <b>Партнерская программа GymConnect</b></p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Обсудить условия в Telegram</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
