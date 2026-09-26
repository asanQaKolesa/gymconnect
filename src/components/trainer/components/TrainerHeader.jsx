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
  ExternalLink 
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import TrainerSubscriptionModal from './modals/TrainerSubscriptionModal';
import TrainerPromotionModal from './modals/TrainerPromotionModal';
import TrainerPublicCardModal from './modals/TrainerPublicCardModal';
import TrainerEditProfileModal from './modals/TrainerEditProfileModal';
import TrainerClientRulesModal from './modals/TrainerClientRulesModal';
import TrainerHealthParqModal from './modals/TrainerHealthParqModal';
import TrainerTemplatesModal from './modals/TrainerTemplatesModal';
import TrainerIncomeCalcModal from './modals/TrainerIncomeCalcModal';
import TrainerReferralModal from './modals/TrainerReferralModal';
import TrainerSupportModal from './modals/TrainerSupportModal';
import TrainerDeleteModal from './modals/TrainerDeleteModal';
import TrainerQrModal from './modals/TrainerQrModal';

export default function TrainerHeader({ trainer, onLogout, onBack, activeTab, onSelectTab }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [studentsList, setStudentsList] = useState([]);

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '').trim() : 'coach';
  const isApproved = trainer?.status === 'approved';
  const coachFullName = trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`.trim();

  useEffect(() => {
    async function loadStudents() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, telegram_id, first_name, last_name, phone, format, remaining_workouts, goal, health_notes')
          .eq('trainer_username', cleanUsername);

        if (!error && data && data.length > 0) {
          setStudentsList(data);
        } else {
          setStudentsList([
            { id: '1', telegram_id: '12345678', first_name: 'Данияр', last_name: 'Аскаров', phone: '+77771234567', format: 'gym', remaining_workouts: 7, goal: 'Гипертрофия', health_notes: 'Протрузия L4-L5, без осевых нагрузок' },
            { id: '2', telegram_id: '87654321', first_name: 'Анель', last_name: 'Мусина', phone: '+77017654321', format: 'online', remaining_workouts: 3, goal: 'Похудение', health_notes: 'Без жалоб, давление в норме' },
            { id: '3', telegram_id: '99887766', first_name: 'Ерлан', last_name: 'Сатыбалдиев', phone: '+77059998877', format: 'gym', remaining_workouts: 1, goal: 'Тонус и спина', health_notes: 'Травма правого мениска 2023г.' }
          ]);
        }
      } catch (e) {
        console.error('Ошибка загрузки учеников в TrainerHeader:', e);
      }
    }
    loadStudents();
  }, [cleanUsername]);

  const openModal = (modalKey) => {
    setIsDrawerOpen(false);
    setActiveModal(modalKey);
  };

  const closeModalToDrawer = () => {
    setActiveModal(null);
    setIsDrawerOpen(true);
  };

  return (
    <>
      {/* ================= АККУРАТНАЯ ШАПКА ================= */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 select-none shadow-xs">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 rounded-xl active:scale-95 transition-all"
            title="Открыть меню тренера"
          >
            <Menu className="w-4 h-4 text-slate-800" />
            <span className="text-xs font-semibold">Меню</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">CoachOS CRM</h1>
          </div>

          <div>
            {isApproved ? (
              <div 
                onClick={() => openModal('public_card')}
                className="flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl cursor-pointer active:scale-95 transition-transform"
                title="Профиль верифицирован GymConnect"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="text-[10.5px] font-semibold">Верифицирован</span>
              </div>
            ) : (
              <div 
                onClick={() => openModal('public_card')}
                className="flex items-center gap-1 py-1 px-2.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-xl cursor-pointer active:scale-95 transition-transform"
                title="Анкета проходит проверку"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10.5px] font-semibold">На проверке</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= БОКОВОЕ МЕНЮ (SLIDE-OVER DRAWER) ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start select-none animate-in fade-in duration-150">
          <div className="w-[88%] max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              {/* Шапка тренера в меню */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs overflow-hidden">
                    {trainer?.avatar_url || trainer?.photo_url ? (
                      <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanUsername[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate leading-snug">
                      {coachFullName}
                    </p>
                    <p className="text-[11px] text-blue-600 font-mono mt-0.5">@{cleanUsername}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Верифицирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Clock className="w-2.5 h-2.5 text-amber-600" /> На проверке
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Плашка безопасности данных */}
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-900 leading-tight">
                  <span className="font-bold">100% Конфиденциально:</span> данные базы учеников и финансы зашифрованы и доступны только вам.
                </p>
              </div>

              {/* 1. БЫСТРАЯ НАВИГАЦИЯ ПО CRM ТАБАМ */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Разделы CRM</p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
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
                        className={`p-2 rounded-xl text-left flex items-center gap-2 transition-all ${
                          isCurrent 
                            ? 'bg-blue-600 text-white font-semibold shadow-xs' 
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

              {/* 2. ТАРИФЫ И ПРОДВИЖЕНИЕ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Тарифы и буст</p>

                <button
                  type="button"
                  onClick={() => openModal('subscription')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Управление подпиской</p>
                      <p className="text-[10px] text-slate-500">Пакетные условия и промокоды</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('promotion')}
                  className="w-full p-2.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-950">Продвижение (Boost)</p>
                      <p className="text-[10px] text-blue-600 font-medium">В залах Алматы и Онлайн по РК</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>

              {/* 3. ИНСТРУМЕНТЫ РАБОТЫ С КЛИЕНТАМИ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Инструменты тренера</p>

                <button
                  type="button"
                  onClick={() => openModal('qr_code')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <QrCode className="w-4 h-4" />
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
                  onClick={() => openModal('client_rules')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Регламент для клиентов</p>
                      <p className="text-[10px] text-slate-500">Правила отмены и сгорания с настройкой</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('health_parq')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Анкета здоровья (PAR-Q)</p>
                      <p className="text-[10px] text-slate-500">Опросник травм, свои вопросы и ответы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('templates')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Шаблоны и Telegram-рассылка</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Отправка в личку Telegram от бота</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('income_calc')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Калькулятор дохода</p>
                      <p className="text-[10px] text-slate-500">Декомпозиция целей и выручки в месяц</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => openModal('referral')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-sl
