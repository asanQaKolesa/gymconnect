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
  TrendingUp, 
  FileText, 
  Trash2, 
  QrCode, 
  MessageSquare, 
  Calculator, 
  Shield, 
  HeartPulse, 
  Scale, 
  Headphones, 
  Settings, 
  Bell,
  Star,
  Building2,
  FileCheck2,
  Sparkles,
  Globe,
  Camera,
  Snowflake,
  Inbox,
  UserCheck
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

  return (
    <>
      {/* ================= АККУРАТНАЯ СИММЕТРИЧНАЯ ШАПКА ================= */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 sticky top-0 z-40 select-none shadow-2xs">
        <div className="relative flex items-center justify-between max-w-md mx-auto w-full">
          
          {/* Левая часть: квадратная иконка меню 36×36px */}
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

          {/* Центр: СТРОГО ПО ЦЕНТРУ ЭКРАНА С ТОЧНОСТЬЮ ДО ПИКСЕЛЯ */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <div className="w-7 h-7 rounded-xl bg-[#1E60D5] text-white flex items-center justify-center shadow-xs shrink-0">
                <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
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

      {/* ================= СВЕТЛОЕ БОКОВОЕ МЕНЮ (DRAWER) ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex justify-start select-none animate-in fade-in duration-150">
          <div className="w-[88%] max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              
              {/* ШАПКА ПРОФИЛЯ ТРЕНЕРА */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E60D5] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs overflow-hidden">
                    {trainer?.avatar_url || trainer?.photo_url ? (
                      <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanUsername[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-slate-900 truncate leading-snug">
                        {coachFullName}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleMenuClick('edit_profile')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Настройки профиля"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">@{cleanUsername}</p>
                    
                    {/* Статус верификации: спокойный бейдж */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Верифицирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" /> Не верифицирован
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition-transform cursor-pointer shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ================= 1. ОПЕРАЦИОННАЯ СИСТЕМА CRM (ОСНОВНЫЕ ТАБЫ) ================= */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 px-1">Операционная система</p>
                <div className="divide-y divide-slate-100 bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden px-3">
                  
                  {/* Главный обзор */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('overview');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'overview' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Dumbbell className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Главный обзор дня</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">План тренировок на сегодня и ключевые метрики</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* База подопечных */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('students');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'students' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Users className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">База подопечных</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Список атлетов, анкеты и история занятий</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Программы тренировок */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('workouts');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'workouts' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <FileText className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Программы тренировок</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Конструктор сплитов и каталог упражнений</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Расписание занятий */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('schedule');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'schedule' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Calendar className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Расписание занятий</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Сетка тренировок и запись по часам</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Касса и абонементы */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('finance');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'finance' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Wallet className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Касса и абонементы</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Учет оплат, сгорания занятий и чистый доход</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                  {/* Рационы и питание */}
                  <div
                    onClick={() => {
                      if (onSelectTab) onSelectTab('nutrition');
                      setIsDrawerOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        activeTab === 'nutrition' ? 'bg-[#1E60D5] text-white shadow-xs' : 'bg-white border border-slate-200/80 text-slate-700'
                      }`}>
                        <Utensils className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Рационы и питание</h4>
                        <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Расчет КБЖУ и планы питания атлетов</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                  </div>

                </div>
              </div>

              {/* ================= 2. РАБОТА С КЛИЕНТАМИ ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Работа с клиентами</p>

                {/* Входящие заявки на тренировки */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('notifications')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Заявки на тренировки</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Входящие лиды из каталога залов Алматы</p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-[#1E60D5] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg shrink-0">
                      +{unreadCount}
                    </span>
                  )}
                </button>

                {/* Заморозка абонементов */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Snowflake className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Заморозка абонементов</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Пауза на отпуск или больничный с фиксацией</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Регламент для клиентов (Перенесен сюда!) */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Регламент для клиентов</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Правила отмены и сгорания занятий</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Анкета здоровья PAR-Q */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('health_parq')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Анкета здоровья (PAR-Q)</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Опросник травм и противопоказаний</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* ================= 3. ФИНАНСЫ ТРЕНЕРА ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Финансы тренера</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('subscription')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Реквизиты и оплата Kaspi</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Kaspi Gold / Pay • Выставление счета в бот</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('income_calc')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Калькулятор дохода</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Декомпозиция целей и выручки в месяц</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* ================= 4. ПОДПИСКА И РОСТ (PRO) ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Подписка и рост (Pro)</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('subscription')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Управление подпиской Pro</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Тариф CoachOS Pro, продление и условия</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('promotion')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Продвижение (Boost)</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Поднятие анкеты в топ каталога клубов города</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('templates')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Создать онлайн-продукт</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Платные марафоны, чек-листы и курсы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('referral')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Пригласить коллегу-тренера</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">+1 месяц Pro в подарок за рекомендацию</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* ================= 5. ПУБЛИЧНЫЙ ПРОФИЛЬ И БРЕНД ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Публичный профиль и бренд</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('public_card')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Публичная визитка</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Как видят вашу страницу атлеты</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('public_card')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Star className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Мои отзывы и рейтинг</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Оценки подопечных и репутация</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('edit_profile')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Мои залы и прайс</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Клубы работы и стоимость тренировок</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('qr_code')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">QR-код визитки</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Быстрая запись клиента прямо в зале с камеры</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* ================= 6. ПРАВОВОЙ БЛОК И ПОДДЕРЖКА ================= */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Правовой блок и сервис</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Защита независимости базы</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Гарантия: база учеников не передается клубам</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Оферта и соглашение тренера</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Партнерский договор использования IT-платформы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Язык приложения */}
                <div className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Язык приложения</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Язык интерфейса платформы</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                    Русский
                  </span>
                </div>

                {/* Техподдержка 24/7 */}
                <button
                  type="button"
                  onClick={() => handleMenuClick('support')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">Техподдержка 24/7</p>
                      <p className="text-[10.5px] text-slate-500 font-normal truncate mt-0.5">Служба заботы о наставниках</p>
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
