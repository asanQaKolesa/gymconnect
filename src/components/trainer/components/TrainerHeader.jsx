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
  Inbox
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

      if (st.attendance_today === 'attending' && !readNotifIds.includes(checkinYesId) && !deletedMap[checkinYesId]) {
        count++;
      }
      if (st.attendance_today === 'missed' && !readNotifIds.includes(checkinNoId) && !deletedMap[checkinNoId]) {
        count++;
      }
      if (left <= 2 && !readNotifIds.includes(lowBalId) && !deletedMap[lowBalId]) {
        count++;
      }
      if (st.payment_status === 'pending' && !readNotifIds.includes(debtId) && !deletedMap[debtId]) {
        count++;
      }
    });

    return count;
  };

  const unreadCount = calculateUnreadCount();

  return (
    <>
      {/* ================= АККУРАТНАЯ СИММЕТРИЧНАЯ ШАПКА ================= */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 sticky top-0 z-40 select-none shadow-2xs">
        <div className="relative flex items-center justify-between max-w-md mx-auto w-full">
          
          {/* Левая часть: ТОЛЬКО ИКОНКА МЕНЮ (36x36px) */}
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

      {/* ================= СВЕТЛОЕ БОКОВОЕ МЕНЮ (ЕДИНЫЙ МОНОХРОМ) ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex justify-start select-none animate-in fade-in duration-150">
          <div className="w-[88%] max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              
              {/* Шапка профиля: Имя + Шестеренка настроек + Статус верификации */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E60D5] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs overflow-hidden">
                    {trainer?.avatar_url || trainer?.photo_url ? (
                      <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanUsername[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-slate-900 truncate leading-snug">
                        {coachFullName}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleMenuClick('edit_profile')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                        title="Настройки профиля"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{cleanUsername}</p>
                    
                    {/* Статус: спокойный, без лишних действий */}
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

              {/* 1. БАЗОВЫЕ РАЗДЕЛЫ CRM (ТАБЫ 2x4) */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Разделы CRM</p>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {[
                    { id: 'overview', label: 'Обзор KPI', icon: Dumbbell },
                    { id: 'students', label: 'Ученики', icon: Users },
                    { id: 'workouts', label: 'Программы', icon: FileText },
                    { id: 'nutrition', label: 'Питание', icon: Utensils },
                    { id: 'schedule', label: 'Расписание', icon: Calendar },
                    { id: 'finance', label: 'Касса', icon: Wallet },
                    { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
                    { id: 'notes', label: 'Заметки', icon: FileText }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (onSelectTab) onSelectTab(tab.id);
                          setIsDrawerOpen(false);
                        }}
                        className={`p-2 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-[#1E60D5] text-white font-semibold shadow-xs' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-xs truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. КЛИЕНТЫ И РЕЗУЛЬТАТ */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Клиенты и результат</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('notifications')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Inbox className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Заявки на тренировки</p>
                      <p className="text-[10px] text-slate-500">Входящие лиды из каталога залов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('health_parq')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Camera className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Замеры и фото До / После</p>
                      <p className="text-[10px] text-slate-500">Динамика веса, талии и фиксация прогресса</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Snowflake className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Заморозка абонементов</p>
                      <p className="text-[10px] text-slate-500">Пауза на отпуск или больничный</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('health_parq')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <HeartPulse className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Анкета здоровья (PAR-Q)</p>
                      <p className="text-[10px] text-slate-500">Опросник травм и противопоказаний</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 3. ФИНАНСЫ ТРЕНЕРА */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Финансы тренера</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('subscription')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Реквизиты и оплата Kaspi</p>
                      <p className="text-[10px] text-slate-500">Kaspi Gold и счет в бот в 1 клик</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('income_calc')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Calculator className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Калькулятор дохода</p>
                      <p className="text-[10px] text-slate-500">Декомпозиция выручки в месяц</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Scale className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Регламент для клиентов</p>
                      <p className="text-[10px] text-slate-500">Правила отмены и сгорания занятий</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 4. МОНЕТИЗАЦИЯ И РОСТ (ТАРИФЫ И BOOST) */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Монетизация и рост</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('subscription')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Управление подпиской Pro</p>
                      <p className="text-[10px] text-slate-500">Тарифы, продление и промокоды</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('promotion')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Rocket className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Продвижение (Boost)</p>
                      <p className="text-[10px] text-slate-500">Поднятие в топ каталога залов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('templates')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Sparkles className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Создать онлайн-продукт</p>
                      <p className="text-[10px] text-slate-500">Марафоны, гайды и челленджи</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('referral')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Gift className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Пригласить коллегу-тренера</p>
                      <p className="text-[10px] text-slate-500">+1 месяц Pro после первой оплаты</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 5. БРЕНД И ВИЗИТКА */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Бренд и визитка</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('public_card')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Star className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Мои отзывы и рейтинг</p>
                      <p className="text-[10px] text-slate-500">Оценки подопечных и визитка</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('edit_profile')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Building2 className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Мои залы и прайс</p>
                      <p className="text-[10px] text-slate-500">{trainer?.gym?.split('|')[0] || 'Клубы работы'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('qr_code')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <QrCode className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">QR-код визитки</p>
                      <p className="text-[10px] text-slate-500">Показать клиенту в зале для быстрой записи</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('templates')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <MessageSquare className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Шаблоны тренировок</p>
                      <p className="text-[10px] text-slate-500">Быстрое назначение плана ученикам</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 6. ПРАВОВОЙ БЛОК И ПОДДЕРЖКА */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-500 px-1">Правовой блок и сервис</p>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Shield className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Защита независимости базы</p>
                      <p className="text-[10px] text-slate-500">Контакты учеников не передаются клубам</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuClick('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <FileCheck2 className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Оферта и соглашение тренера</p>
                      <p className="text-[10px] text-slate-500">Условия партнерства GymConnect</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Выбор языка */}
                <div className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Globe className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Язык приложения</p>
                      <p className="text-[10px] text-slate-500">Русский (RU)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                    Русский
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleMenuClick('support')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Headphones className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Техподдержка 24/7</p>
                      <p className="text-[10px] text-slate-500">Онлайн-помощь и решение вопросов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* НИЖНИЙ БЛОК: ВОЗВРАТ В АТЛЕТА И ВЫХОД */}
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
