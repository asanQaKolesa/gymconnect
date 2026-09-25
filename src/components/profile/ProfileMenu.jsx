// src/components/profile/ProfileMenu.jsx
import React, { useState } from 'react';
import { 
  Ticket, 
  CreditCard, 
  BarChart3, 
  Dumbbell, 
  Share2, 
  ChevronRight, 
  X, 
  Calendar,
  Check
} from 'lucide-react';

export default function ProfileMenu({ user }) {
  const [activeModal, setActiveModal] = useState(null); // 'pass' | 'pro' | 'stats' | 'workouts'

  const handleShareApp = () => {
    const text = encodeURIComponent('Присоединяйся к GymConnect — комьюнити атлетов и залов Алматы!');
    const url = encodeURIComponent('https://t.me/gymconnect_almaty_bot');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5 select-none">
      
      {/* Заголовок блока */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Основное меню
        </span>
        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200">
          Управление
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
                {user?.gym ? user.gym.split('|')[0] : 'Зал не выбран'} • Статус карты
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 2. PRO-подписка (БЕЗ ПЛАШКИ KASPI) */}
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
              <p className="text-xs font-bold text-slate-900 leading-tight">
                PRO-подписка
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {user?.is_pro ? 'Премиум-статус активен' : 'Безлимитный GymBro и скидки в залах'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 3. Статистика посещений (переименовано) */}
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
                Статистика посещений
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Регулярность тренировок и стрик занятий
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 4. Мои тренировки (НОВЫЙ РАЗДЕЛ) */}
        <button
          type="button"
          onClick={() => setActiveModal('workouts')}
          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
              <Dumbbell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Мои тренировки
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                График: {Array.isArray(user?.workout_days) && user.workout_days.length > 0 ? user.workout_days.join(', ') : 'Пн, Ср, Пт'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* 5. Пригласить напарника в GymBro */}
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
                Поделиться ссылкой на GymConnect в Telegram
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
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Основной зал</p>
                <p className="text-xs font-black text-slate-900">{user?.gym || 'Зал не выбран'}</p>
                <p className="text-[10px] text-slate-500">{user?.district ? `${user.district} район, Алматы` : 'г. Алматы'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400">Статус абонемента</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Активен</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400">Остаток занятий</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 font-mono">Безлимит</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-98"
            >
              Понятно
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

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                <p className="font-bold text-slate-900 text-xs">Возможности PRO-аккаунта:</p>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-3.5">
                  <li>Поиск напарников GymBro без ограничений по всем залам Алматы</li>
                  <li>Доступ к специальным скидкам на спортпит и абонементы</li>
                  <li>Прямая связь с персональными тренерами</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center font-mono">
                <p className="text-[10px] text-slate-400">Стоимость подписки</p>
                <p className="text-base font-black text-slate-900 mt-0.5">2 990 ₸ / месяц</p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98"
            >
              <span>Подключить PRO-статус</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: СТАТИСТИКА ПОСЕЩЕНИЙ ================= */}
      {activeModal === 'stats' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Статистика посещений</h3>
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
                <p className="text-[10px] text-slate-400 font-semibold">Регулярность</p>
                <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                  {Array.isArray(user?.workout_days) ? `${user.workout_days.length} дня/нед` : '3 дня/нед'}
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

      {/* ================= МОДАЛКА: МОИ ТРЕНИРОВКИ ================= */}
      {activeModal === 'workouts' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Мои тренировки</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Цель занятий</p>
                <p className="text-xs font-black text-slate-900">{user?.goal || 'Набор массы и тонус'}</p>
                <p className="text-[10px] text-slate-500 mt-1">Время: {user?.workout_time_slot || 'Вечер (16:00 - 21:00)'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Формат занятий</p>
                <p className="text-xs font-bold text-slate-800">
                  {user?.training_format === 'coach_gym' ? 'С персональным тренером в зале' : 
                   user?.training_format === 'coach_online' ? 'С тренером онлайн' : 
                   user?.training_format === 'looking_for_coach' ? 'В поиске тренера' : 'Самостоятельные тренировки'}
                </p>
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

    </div>
  );
}
