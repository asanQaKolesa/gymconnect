// src/components/home/ActionGrid.jsx
import React, { useState } from 'react';
import { 
  Search, 
  Ticket, 
  Repeat, 
  Stethoscope, 
  ShoppingBag, 
  Shirt, 
  X, 
  Send, 
  Sparkles 
} from 'lucide-react';

export default function ActionGrid({ onNavigateTab }) {
  const [activeModal, setActiveModal] = useState(null); 
  // 'coach' | 'buy_pass' | 'sell_pass' | 'specialists' | 'nutrition_shop' | 'wear_shop'

  const services = [
    {
      id: 'coach',
      title: 'Найти тренера',
      sub: 'Каталог наставников Алматы',
      icon: Search,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      id: 'buy_pass',
      title: 'Купить абонемент',
      sub: 'В любой зал со скидкой',
      icon: Ticket,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      id: 'sell_pass',
      title: 'Продать абонемент',
      sub: 'Вторичный рынок карт',
      icon: Repeat,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    },
    {
      id: 'specialists',
      title: 'Спорт-специалисты',
      sub: 'Массаж, нутрициология, ЛФК',
      icon: Stethoscope,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    },
    {
      id: 'nutrition_shop',
      title: 'Спортивное питание',
      sub: 'Протеин, креатин, витамины',
      icon: ShoppingBag,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50'
    },
    {
      id: 'wear_shop',
      title: 'Спортивная одежда',
      sub: 'Экипировка и форма для зала',
      icon: Shirt,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50'
    }
  ];

  return (
    <>
      <div className="mb-3 select-none">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-900 tracking-tight">Сервисы GymConnect</span>
          <span className="text-[10.5px] text-slate-400 font-medium">Алматы</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setActiveModal(srv.id)}
                className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl text-left shadow-xs transition-all active:scale-98 flex flex-col justify-between h-24"
              >
                <div className={`w-8 h-8 rounded-xl ${srv.iconBg} ${srv.iconColor} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {srv.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                    {srv.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* МОДАЛЬНЫЕ ОКНА ДЛЯ КАЖДОГО СЕРВИСА */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {activeModal === 'coach' && 'Поиск персонального тренера'}
                    {activeModal === 'buy_pass' && 'Покупка абонемента в зал'}
                    {activeModal === 'sell_pass' && 'Вторичный рынок: продать абонемент'}
                    {activeModal === 'specialists' && 'Спортивные специалисты и эксперты'}
                    {activeModal === 'nutrition_shop' && 'Спортивное питание с доставкой'}
                    {activeModal === 'wear_shop' && 'Спортивная экипировка и одежда'}
                  </h3>
                  <p className="text-[10px] text-slate-400">GymConnect Алматы</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              {activeModal === 'coach' && (
                <div className="space-y-2">
                  <p>В единой базе GymConnect собраны проверенные наставники из 230+ клубов Алматы с дипломами и подтвержденным стажем.</p>
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-950 space-y-1">
                    <p className="font-bold">Бесплатный подбор под вашу цель:</p>
                    <p>Наш бот поможет подобрать специалиста по вашему залу, бюджету и графику занятий.</p>
                  </div>
                </div>
              )}

              {activeModal === 'buy_pass' && (
                <div className="space-y-2">
                  <p>Оформляйте клубные карты в Invictus, FitnessBlitz, 1Fit и другие фитнес-центры города со специальными скидками комьюнити.</p>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 space-y-1">
                    <p className="font-bold">Кэшбэк и заморозка:</p>
                    <p>Дополнительные дни бесплатной заморозки для резидентов GymConnect.</p>
                  </div>
                </div>
              )}

              {activeModal === 'sell_pass' && (
                <div className="space-y-2">
                  <p>Переезжаете или сменили клуб? Разместите объявление о перепродаже оставшихся месяцев абонемента атлетам из вашего района.</p>
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 space-y-1">
                    <p className="font-bold">Безопасная переоформка:</p>
                    <p>Помогаем быстро найти покупателя и официально переоформить договор на рецепции клуба.</p>
                  </div>
                </div>
              )}

              {activeModal === 'specialists' && (
                <div className="space-y-2">
                  <p>Проверенные эксперты спортивной медицины и реабилитации в Алматы:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                    <li>Спортивные массажисты и остеопаты</li>
                    <li>Диетологи и сертифицированные нутрициологи</li>
                    <li>Спортивные психологи и тренеры привычек</li>
                    <li>Реабилитологи (ЛФК и восстановление после травм)</li>
                  </ul>
                </div>
              )}

              {activeModal === 'nutrition_shop' && (
                <div className="space-y-2">
                  <p>Заказывайте оригинальный спортпит (Optimum Nutrition, Dymatize, Kevin Levrone) с экспресс-доставкой по Алматы за 2 часа.</p>
                  <p className="text-[11px] text-slate-500 font-mono">Промокод «GYMCONNECT» дает скидку 10% на первый заказ.</p>
                </div>
              )}

              {activeModal === 'wear_shop' && (
                <div className="space-y-2">
                  <p>Качественная одежда для зала, компрессионные комплекты, пояса, лямки и шейкеры от проверенных партнеров.</p>
                  <p className="text-[11px] text-slate-500 font-mono">Шоурумы в центре Алматы с примеркой и гарантией.</p>
                </div>
              )}
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Перейти в Telegram-каталог</span>
            </a>

          </div>
        </div>
      )}
    </>
  );
}
