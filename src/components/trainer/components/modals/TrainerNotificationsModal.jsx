// src/components/trainer/components/modals/TrainerNotificationsModal.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  Check, 
  Trash2,
  Clock,
  UserCheck
} from 'lucide-react';

export default function TrainerNotificationsModal({ 
  isOpen, 
  onClose, 
  studentsList = [] 
}) {
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Формирование динамических уведомлений из реальной базы учеников
  const generateNotifications = () => {
    const notifs = [];

    studentsList.forEach(st => {
      const studentName = `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();
      const left = st.left_trainings !== undefined 
        ? st.left_trainings 
        : (st.remaining_workouts !== undefined ? st.remaining_workouts : 12);

      // 1. Уведомление о подтверждении явки
      if (st.attendance_today === 'attending') {
        notifs.push({
          id: `checkin_yes_${st.id}`,
          type: 'attendance_yes',
          title: 'Подтверждение тренировки',
          desc: `${studentName} подтвердил: Будет на тренировке сегодня!`,
          time: 'Сегодня',
          badge: 'Явка подтверждена',
          isNew: !readNotifIds.includes(`checkin_yes_${st.id}`)
        });
      } else if (st.attendance_today === 'missed') {
        notifs.push({
          id: `checkin_no_${st.id}`,
          type: 'attendance_no',
          title: 'Пропуск тренировки',
          desc: `${studentName} предупредил: Не сможет прийти сегодня на тренировку.`,
          time: 'Сегодня',
          badge: 'Отмена занятия',
          isNew: !readNotifIds.includes(`checkin_no_${st.id}`)
        });
      }

      // 2. Уведомление об остатке занятий в абонементе
      if (left <= 1) {
        notifs.push({
          id: `low_balance_${st.id}`,
          type: 'balance',
          title: 'Абонемент заканчивается',
          desc: `У ${studentName} осталось всего ${left} зан. Пора согласовать продление блока.`,
          time: 'Внимание',
          badge: 'Остаток ≤ 1',
          isNew: !readNotifIds.includes(`low_balance_${st.id}`)
        });
      }

      // 3. Задолженность по оплате
      if (st.payment_status === 'pending') {
        notifs.push({
          id: `pending_pay_${st.id}`,
          type: 'payment',
          title: 'Ожидает оплаты',
          desc: `${studentName}: к оплате ${Number(st.monthly_price || 70000).toLocaleString()} ₸ за абонемент.`,
          time: 'Касса',
          badge: 'Долг',
          isNew: !readNotifIds.includes(`pending_pay_${st.id}`)
        });
      }
    });

    return notifs;
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => n.isNew).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('gymconnect_coach_read_notifs', JSON.stringify(allIds));
    } catch (e) {}
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] flex flex-col select-none animate-in fade-in duration-150">
      
      {/* 1. ВЕРХНИЙ БАР Apple HIG */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Назад в CRM</span>
          </button>

          <div className="text-center overflow-hidden flex-1 px-1">
            <h1 className="text-xs font-bold text-slate-900 truncate">
              Центр уведомлений
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              {unreadCount > 0 ? `${unreadCount} новых событий` : 'Все прочитаны'}
            </p>
          </div>

          <div className="shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform cursor-pointer"
              >
                Прочитано
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. ОСНОВНАЯ ЛЕНТА УВЕДОМЛЕНИЙ НА ВСЮ ВЫСОТУ */}
      <main className="p-3.5 space-y-3 max-w-md mx-auto w-full pb-20">
        
        {/* Информационный баннер */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Лента событий учеников</h3>
              <p className="text-[10px] text-slate-400">Обновляется автоматически при отметках атлетов</p>
            </div>
          </div>

          <span className="text-[10.5px] font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            {notifications.length} событий
          </span>
        </div>

        {/* Список уведомлений */}
        <div className="space-y-2.5">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-3xl border transition-all space-y-2 shadow-2xs ${
                  notif.type === 'attendance_yes' 
                    ? 'bg-emerald-50/60 border-emerald-200/80' 
                    : notif.type === 'attendance_no'
                      ? 'bg-rose-50/60 border-rose-200/80'
                      : notif.type === 'payment'
                        ? 'bg-amber-50/60 border-amber-200/80'
                        : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                    notif.type === 'attendance_yes' ? 'bg-emerald-100 text-emerald-800' :
                    notif.type === 'attendance_no' ? 'bg-rose-100 text-rose-800' :
                    notif.type === 'payment' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notif.type === 'attendance_yes' && <CheckCircle2 className="w-3 h-3" />}
                    {notif.type === 'attendance_no' && <AlertTriangle className="w-3 h-3" />}
                    {notif.type === 'payment' && <CreditCard className="w-3 h-3" />}
                    <span>{notif.badge}</span>
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    {notif.desc}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-xs text-slate-800">Новых уведомлений нет</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Когда ученики отметят явку («Буду» / «Не приду») или оплатят абонемент, события сразу появятся здесь.
              </p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
