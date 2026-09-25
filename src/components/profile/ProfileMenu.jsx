// src/components/profile/ProfileMenu.jsx
import React, { useState } from 'react';
import { 
  CreditCard, 
  BarChart3, 
  Ticket, 
  Dumbbell, 
  HelpCircle, 
  Share2, 
  ChevronRight, 
  X, 
  Send, 
  Flame, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ProfileMenu({ user, onOpenTrainer }) {
  const [activeModal, setActiveModal] = useState(null); // 'pass' | 'pro' | 'stats' | 'support'

  const handleShareApp = () => {
    const text = encodeURIComponent('Присоединяйся к GymConnect — спортивному комьюнити залов Алматы!');
    const url = encodeURIComponent('https://t.me/gymconnect_almaty_bot');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5 select-none">
      
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Основное меню
        </span>
        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200">
          GymConnect
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        
        {/* 1. Мой абонемент и клуб */}
        <button
          type="button"
          onClick={() => setActiveModal('pass')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Ticket className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Мой абонемент и клуб
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {user?.gym ? user.gym.split('|')[0] : 'Зал не выбран'} • Детали карты
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 2. PRO-подписка (Kaspi) */}
        <button
          type="button"
          onClick={() => setActiveModal('pro')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <CreditCard className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-900 leading-tight">PRO-подписка</p>
                <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                  KASPI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {user?.is_pro ? 'PRO-статус активен' : 'Безлимитный поиск GymBro и скидки'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 3. Статистика и стрик тренировок */}
        <button
          type="button"
          onClick={() => setActiveModal('stats')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <BarChart3 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Статистика тренировок
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Регулярность, график и спортивный прогресс
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 4. Для тренеров (Trainer CRM) — мгновенный переход без перезагрузки */}
        <button
          type="button"
          onClick={onOpenTrainer}
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
                Личный кабинет, расписание и база подопечных
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 5. Служба поддержки и помощь */}
        <button
          type="button"
          onClick={() => setActiveModal('support')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <HelpCircle className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Служба поддержки и помощь
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Операторы в Алматы 24/7, ответы на вопросы
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 6. Пригласить напарника в GymBro */}
        <button
          type="button"
          onClick={handleShareApp}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Share2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Пригласить напарника в GymBro
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Поделиться ссылкой на сервис в Telegram
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

      </div>

      {/* ================= МОДАЛКА: МОЙ АБОНЕМЕНТ ================= */}
      {activeModal === 'pass' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Ticket className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Абонемент в клуб</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Основной зал</p>
                <p className="text-xs font-black text-slate-900">{user?.gym || 'Зал не привязан'}</p>
                <p className="text-[10px] text-slate-500">{user?.district ? `${user.district} район, Алматы` : 'г. Алматы'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400">Статус карты</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Активен</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400">Остаток дней</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">24 дня</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-98"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: PRO-ПОДПИСКА ================= */}
      {activeModal === 'pro' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">PRO-подписка GymConnect</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                <p className="font-bold text-amber-900 text-xs">Преимущества PRO-статуса:</p>
                <ul className="text-[10px] text-amber-800 space-y-0.5 list-disc pl-3.5">
                  <li>Безлимитный подбор напарников GymBro по всем залам Алматы</li>
                  <li>Эксклюзивные скидки на абонементы в клубах-партнерах</li>
                  <li>Прямой чат с сертифицированными тренерами</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center font-mono">
                <p className="text-[10px] text-slate-400">Стоимость тарифа</p>
                <p className="text-base font-black text-slate-900 mt-0.5">2 990 ₸ / месяц</p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98"
            >
              <span>Оформить через Kaspi Pay</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: СТАТИСТИКА ================= */}
      {activeModal === 'stats' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Спортивная статистика</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold">Стрик занятий</p>
                <p className="text-base font-black text-blue-600 mt-0.5 font-mono">12 дней</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold">В неделю</p>
                <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                  {Array.isArray(user?.workout_days) ? user.workout_days.length : 3} дня
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400 block mb-1">Выбранный график:</span>
              <p className="font-bold text-slate-800">
                {Array.isArray(user?.workout_days) && user.workout_days.length > 0 
                  ? user.workout_days.join(' • ') 
                  : 'Пн • Ср • Пт'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-98"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: ПОДДЕРЖКА ================= */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Поддержка GymConnect</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Возникли вопросы по фитнес-залам, подбору напарников GymBro или работе приложения? Наша служба заботы всегда на связи в Алматы.
              </p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <p>📍 Город: <b>Алматы, Казахстан</b></p>
                <p>⏰ Режим работы: <b>24/7 онлайн</b></p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8ec3] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/30 active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Написать в поддержку Telegram</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
