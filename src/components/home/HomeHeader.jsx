// src/components/home/HomeHeader.jsx
import React, { useState } from 'react';
import { ArrowRight, Bell, Sparkles, ArrowLeft, ShieldCheck, Users } from 'lucide-react';

export default function HomeHeader({ onOpenSub }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notificationsList = [
    {
      id: 1,
      title: 'Сегодня тренировка по плану',
      desc: 'В 18:00 у вас запланирован день спины и базы в зале. Не забудьте воду!',
      time: 'Сегодня, 10:30',
      isUnread: true
    },
    {
      id: 2,
      title: 'Новый GymBro в вашем клубе',
      desc: 'Атлет Тимур ищет напарника на жим и присед в вашем районе.',
      time: 'Вчера, 19:15',
      isUnread: true
    },
    {
      id: 3,
      title: 'Скидка на продление абонементов',
      desc: 'Партнерские цены на годовые карты в Invictus Go до конца недели.',
      time: '23 сен',
      isUnread: false
    }
  ];

  return (
    <>
      <div className="mb-3.5 select-none space-y-2">
        
        {/* Премиальная карточка Apple Wallet Pass */}
        <div className="flex items-center gap-2">
          <div 
            onClick={onOpenSub}
            className="flex-1 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-99 border border-slate-800"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight">GymConnect PRO Pass</span>
                <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.2 rounded text-slate-200">
                  All-Access
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300">
                Безлимитный GymBro, скидки на абонементы и спортпит
              </p>
            </div>

            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 ml-2">
              <ArrowRight className="w-4 h-4 text-white stroke-[2]" />
            </div>
          </div>

          {/* Монохромный колокольчик центра уведомлений */}
          <button 
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="w-12 h-12 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-3xl flex items-center justify-center text-slate-700 shadow-xs transition-colors relative shrink-0 active:scale-95"
            title="Центр уведомлений"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full" />
          </button>
        </div>

        {/* Социальное доказательство с аватарами атлетов */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            {/* Стек аватаров */}
            <div className="flex -space-x-1.5 overflow-hidden">
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="" />
            </div>

            <p className="text-[11px] text-slate-600">
              <strong>30+ атлетов</strong> на тренировках в залах Алматы
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-slate-400">онлайн</span>
          </div>
        </div>

      </div>

      {/* ПОЛНОЭКРАННЫЙ ЦЕНТР УВЕДОМЛЕНИЙ */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => setIsNotifOpen(false)}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Центр уведомлений</h2>
            <button
              type="button"
              onClick={() => alert('Все уведомления прочитаны')}
              className="text-[11px] font-semibold text-blue-600"
            >
              Очистить
            </button>
          </div>

          <div className="p-4 space-y-2.5 max-w-md mx-auto w-full pb-20">
            {notificationsList.map((notif) => (
              <div 
                key={notif.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {notif.isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-3.5">
                  {notif.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}
    </>
  );
}
