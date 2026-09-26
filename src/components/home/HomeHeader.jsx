// src/components/home/HomeHeader.jsx
import React, { useState } from 'react';
import { ArrowRight, Bell, Zap, ArrowLeft } from 'lucide-react';

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
      <div className="mb-3 select-none">
        <div className="flex items-center gap-2 mb-2">
          <button 
            type="button"
            onClick={onOpenSub}
            className="flex-1 py-3 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-between transition-all active:scale-98"
          >
            <span>Оформить подписку GymConnect PRO</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Кнопка колокольчика */}
          <button 
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="w-11 h-11 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center text-slate-700 shadow-xs transition-colors relative shrink-0 active:scale-95"
            title="Центр уведомлений"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>

        {/* Социальное доказательство */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200/70 text-[11px] text-slate-500 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <span>Уже <strong>30+ атлетов</strong> тренируются с нами в залах Алматы</span>
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
            <h2 className="text-xs font-bold text-slate-900">Уведомления</h2>
            <button
              type="button"
              onClick={() => alert('Все уведомления отмечены как прочитанные')}
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
                    {notif.isUnread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>}
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
