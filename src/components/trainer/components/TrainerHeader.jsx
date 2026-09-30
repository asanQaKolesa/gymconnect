// src/components/trainer/components/TrainerHeader.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  LogOut, 
  CheckCircle2, 
  ArrowLeft, 
  X, 
  Menu, 
  CreditCard, 
  Rocket, 
  Gift, 
  ChevronRight, 
  Clock, 
  Users, 
  Calendar, 
  Utensils, 
  Wallet, 
  FileText, 
  Trash2, 
  QrCode, 
  Shield, 
  HeartPulse, 
  Scale, 
  Headphones, 
  Settings, 
  Bell, 
  Star, 
  Building2, 
  FileCheck2, 
  Inbox, 
  UserCheck,
  Activity,
  Bot,
  Snowflake,
  FolderLock
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function TrainerHeader({ 
  trainer, 
  students = [], 
  onLogout, 
  onBack, 
  activeTab, 
  onSelectTab, 
  onOpenScreen,
  initialDrawerOpen = false 
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(initialDrawerOpen);
  const [studentsList, setStudentsList] = useState([]);

  // Чтение прочитанных уведомлений
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deletedMap, setDeletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_deleted_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (initialDrawerOpen) {
      setIsDrawerOpen(true);
    }
  }, [initialDrawerOpen]);

  // Блокировка скролла фона при открытом Drawer (overscroll-contain + body overflow)
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDrawerOpen]);

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '').trim().toLowerCase() : 'coach';
  const isVerified = trainer?.verification_status === 'verified';
  const coachFullName = trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`.trim();

  // Резервная загрузка подопечных
  useEffect(() => {
    async function loadBackupStudents() {
      if (students && students.length > 0) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, username, attendance_today, left_trainings, remaining_workouts, payment_status, status')
          .or(`trainer_username.ilike.${cleanUsername},trainer_username.ilike.@${cleanUsername},trainer_telegram.ilike.${cleanUsername},trainer_telegram.ilike.@${cleanUsername}`);

        if (!error && data) {
          setStudentsList(data);
        }
      } catch (e) {
        console.warn('Ошибка загрузки подопечных в шапку:', e);
      }
    }
    loadBackupStudents();
  }, [cleanUsername, students.length]);

  const handleMenuClick = (screenId) => {
    setIsDrawerOpen(false);
    if (typeof onOpenScreen === 'function') {
      onOpenScreen(screenId);
    }
  };

  const handleTabClick = (tabId) => {
    setIsDrawerOpen(false);
    if (typeof onSelectTab === 'function') {
      onSelectTab(tabId);
    }
  };

  const effectiveList = students && students.length > 0 ? students : studentsList;

  const calculateUnreadCount = () => {
    let count = 0;

    effectiveList.forEach(st => {
      const left = st.left_trainings !== undefined ? st.left_trainings : (st.remaining_workouts !== undefined ? st.remaining_workouts : 12);
      const checkinYesId = `checkin_yes_${st.id}`;
      const checkinNoId = `checkin_no_${st.id}`;
      const lowBalId = `low_balance_${st.id}`;
      const debtId = `pending_pay_${st.id}`;

      if (st.attendance_today === 'attending' && !readNotifIds.includes(checkinYesId) && !deletedMap[checkinYesId]) count++;
      if (st.attendance_today === 'missed' && !readNotifIds.includes(checkinNoId) && !deletedMap[checkinNoId]) count++;
      if (left <= 2 && !readNotifIds.includes(lowBalId) && !deletedMap[lowBalId]) count++;
      if (st.payment_status === 'pending' && !readNotifIds.includes(debtId) && !deletedMap[debtId]) count++;
    });

    return count;
  };

  const unreadCount = calculateUnreadCount();

  // Получаем динамический клуб из анкеты тренера (club_name или gym)
  const currentGymDisplay = trainer?.club_name || trainer?.gym?.split('|')[0]?.trim() || 'Фитнес-клуб не указан';

  return (
    <>
      {/* ================= АККУРАТНАЯ СИММЕТРИЧНАЯ ШАПКА ================= */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 sticky top-0 z-40 select-none shadow-2xs">
        <div className="relative flex items-center justify-between max-w-md mx-auto w-full">
          
          {/* Левая часть: кнопка меню 36×36px */}
          <div className="z-10 flex items-center">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center active:scale-90 transition-all border border-slate-200/60 shadow-2xs cursor-pointer"
              title="Меню"
            >
              <Menu className="w-4 h-4 text-slate-700 stroke-[2.2]" />
            </button>
          </div>

          {/* Центр: строго по оси экрана */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <div className="w-7 h-7 rounded-xl bg-[#1E60D5] text-white flex items-center justify-center shadow-xs shrink-0">
                <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">
                CoachOS CRM
              </h1>
            </div>
          </div>

          {/* Правая часть: колокольчик уведомлений */}
          <div className="z-10 flex items-center">
            <button
              type="button"
              onClick={() => handleMenuClick('notifications')}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center border active:scale-90 transition-all cursor-pointer shrink-0 ${
                unreadCount > 0 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200/80 text-slate-700'
              }`}
              title="Уведомления"
            >
              <Bell className={`w-4 h-4 stroke-[2.2] ${unreadCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-700'}`} />
              
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-bold text-[9.5px] flex items-center justify-center font-mono shadow-md border-2 border-white animate-pulse">
                  +{unreadCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ================= БОКОВОЕ МЕНЮ (DRAWER) ================= */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-start select-none animate-in fade-in duration-150 overscroll-contain"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-[88%] max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto overscroll-contain"
          >
            <div className="space-y-4">
              
              {/* ШАПКА ПРОФИЛЯ ТРЕНЕРА: БЕЗ TG-НИКА, БЕЙДЖ ПОДНЯТ, ШЕСТЕРЕНКА 36×36 */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E60D5] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs overflow-hidden">
                    {trainer?.avatar_url || trainer?.photo_url ? (
                      <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanUsername[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="overflow-hidden flex-1 min-w-0 space-y-1">
                    <p className="text-[14px] font-bold text-slate-800 truncate leading-tight">
                      {coachFullName}
                    </p>
                    
                    <div className="flex items-center gap-1.5">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 leading-none">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Верифицирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 leading-none">
                          <Clock className="w-3 h-3 text-slate-500" /> Базовый аккаунт
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleMenuClick('edit_profile')}
                    className="w-9 h-9 rounded-xl text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer border border-slate-200/60"
                    title="Настройки профиля"
                  >
                    <Settings className="w-4 h-4 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ================= 1. ОПЕРАЦИОННАЯ ПАНЕЛЬ ================= */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 px-1">Операционная панель</p>
                <div className="divide-y divide-slate-100 bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden px-3">
                  
                  {/* Главный обзор */}
                  <div
                    onClick={() => handleTabClick('overview')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'overview' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Dumbbell className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'overview' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Главный обзор
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">План на сегодня и контроль явок</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* База атлетов */}
                  <div
                    onClick={() => handleTabClick('students')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'students' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Users className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'students' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          База атлетов
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Досье подопечных, история и замеры</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Расписание занятий */}
                  <div
                    onClick={() => handleTabClick('schedule')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'schedule' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Calendar className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'schedule' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Расписание занятий
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Сетка по часам и свободные окна</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Конструктор тренировок */}
                  <div
                    onClick={() => handleTabClick('workouts')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'workouts' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <FileText className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'workouts' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Конструктор тренировок
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Сплиты, веса и каталог упражнений</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Касса и финансы */}
                  <div
                    onClick={() => handleTabClick('finance')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'finance' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Wallet className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'finance' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Касса и финансы
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Выручка, аренда зала и счета Kaspi</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Качество ведения */}
                  <div
                    onClick={() => handleTabClick('analytics')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'analytics' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Activity className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'analytics' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Качество ведения
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Оценки атлетов, стрик и доходимость</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Рационы и питание */}
                  <div
                    onClick={() => handleTabClick('nutrition')}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'nutrition' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Utensils className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[13px] truncate leading-tight ${activeTab === 'nutrition' ? 'font-bold text-[#1E60D5]' : 'font-semibold text-slate-800'}`}>
                          Рационы и питание
                        </h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">КБЖУ, приемы пищи и БАДы</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                </div>
              </div>

              {/* ================= 2. КЛИЕНТСКИЙ СЕРВИС (ЕДИНЫЙ ХАБ С МИКРО-КНОПКАМИ) ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 px-1">Клиентский сервис</p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
                  {/* Основное действие: Заявки */}
                  <div 
                    onClick={() => handleMenuClick('notifications')}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Заявки из клубов города</p>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Входящие лиды на пробные тренировки</p>
                      </div>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] font-bold text-[#1E60D5] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg shrink-0">
                        +{unreadCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                  </div>

                  {/* Микро-действия сервиса */}
                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMenuClick('templates')}
                      className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10.5px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Рассылки</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick('client_rules')}
                      className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10.5px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Snowflake className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Заморозка</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick('health_parq')}
                      className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10.5px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <HeartPulse className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">PAR-Q</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= 3. ПУБЛИЧНЫЙ ПРОФИЛЬ И БРЕНД (МОНОХРОМНАЯ ИКОНКА) ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 px-1">Публичный профиль и бренд</p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
                  <div 
                    onClick={() => handleMenuClick('public_card')}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Анкета в каталоге тренеров</p>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">5.0 рейтинг • {currentGymDisplay}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMenuClick('edit_profile')}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Прайс и залы</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick('qr_code')}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-500" />
                      <span>QR-визитка</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= 4. РАЗВИТИЕ ПРАКТИКИ (ХАБ: ТАРИФЫ + ПРОДВИЖЕНИЕ + РЕФЕРАЛ) ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 px-1">Развитие практики</p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
                  <div 
                    onClick={() => handleMenuClick('subscription')}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Тарифы подписки</p>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Управление планом CoachOS Pro</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMenuClick('promotion')}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5 text-slate-500" />
                      <span>Продвижение</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuClick('referral')}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 text-slate-500" />
                      <span>+1 мес. Pro</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= 5. ДОКУМЕНТАЦИЯ И СЕРВИС (ПОЛНОРАЗМЕРНЫЕ БЛОКИ) ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 px-1">Правовой блок и сервис</p>

                {/* Документация и оферта (Большая кнопка) */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Документация и оферта</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Партнерский договор, регламенты и защита базы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Поддержка 24/7 (Большая кнопка) */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('support')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">Служба заботы 24/7</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Прямой чат поддержки с куратором платформы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

            </div>

            {/* ПОДВАЛ МЕНЮ */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Вернуться в профиль атлета</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleMenuClick('delete_account')}
                  className="flex-1 py-2 px-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-[11px] font-semibold border border-slate-200/80 transition-colors flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Удалить анкету</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-semibold border border-rose-200/80 transition-colors flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
