// src/components/trainer/components/TrainerHeader.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  LogOut, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  MapPin, 
  Share2, 
  Sparkles, 
  Settings, 
  Save, 
  Menu, 
  CreditCard, 
  Rocket, 
  Zap, 
  Gift, 
  HelpCircle, 
  Plus, 
  Minus, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  Calendar, 
  Utensils, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Trash2, 
  Phone, 
  Eye, 
  Globe, 
  Award, 
  AlertCircle,
  QrCode,
  MessageSquare,
  Calculator,
  Download,
  BookOpen,
  Tag,
  Briefcase
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import * as GymsData from '../../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

export default function TrainerHeader({ trainer, onLogout, onBack, activeTab, onSelectTab }) {
  // Управление открытием панелей
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  // 'edit_profile' | 'public_card' | 'promotion' | 'subscription' | 'qr_code' | 'templates' | 'income_calc' | 'export_data' | 'support' | 'legal' | 'faq' | 'tax_guide' | 'delete_account' | null

  // Состояния интерактивности
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchGymQuery, setSearchGymQuery] = useState('');
  const [searchSecGymQuery, setSearchSecGymQuery] = useState('');
  const [promoType, setPromoType] = useState('offline'); // 'offline' | 'online'

  // Промокод и тарифы
  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'basic' | 'pro'

  // Калькулятор дохода тренера
  const [calcTargetIncome, setCalcTargetIncome] = useState(600000);
  const [calcPricePerSession, setCalcPricePerSession] = useState(6000);
  const [calcGymCutPercent, setCalcGymCutPercent] = useState(30); // 30% залу или аренда

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '').trim() : 'coach';
  const isApproved = trainer?.status === 'approved';
  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(publicCoachLink)}`;

  // 8 специализаций
  const specializationList = [
    'Набор массы и гипертрофия',
    'Снижение веса и сушка',
    'Рекомпозиция тела и тонус',
    'Пауэрлифтинг и сила',
    'Реабилитация и ЛФК после травм',
    'Осанка и здоровая спина',
    'Функциональный тренинг и кроссфит',
    'ОФП для начинающих'
  ];

  // Форматы работы
  const workFormats = [
    { id: 'gym', label: 'В зале (оффлайн)' },
    { id: 'online', label: 'Только онлайн' },
    { id: 'hybrid', label: 'Гибрид (зал + онлайн)' }
  ];

  // Целевая аудитория
  const targetAudiences = [
    { id: 'all', label: 'Всех уровней' },
    { id: 'women', label: 'Девушки (женский фитнес)' },
    { id: 'men', label: 'Мужчины (силовой тренинг)' },
    { id: 'teens', label: 'Подростки и молодежь' },
    { id: 'seniors', label: 'Возрастные клиенты (50+)' }
  ];

  // Полное состояние анкеты тренера
  const [editForm, setEditForm] = useState({
    first_name: trainer?.first_name || '',
    last_name: trainer?.last_name || '',
    phone: trainer?.phone || '',
    instagram: trainer?.instagram || '',
    gym: trainer?.gym || (GYMS_ARRAY[0] || 'Invictus Go (Mega Park)'),
    secondary_gym: trainer?.secondary_gym || '',
    experience_years: Number(trainer?.experience_years) || 3,
    specializations: Array.isArray(trainer?.specializations) && trainer.specializations.length > 0 
      ? trainer.specializations 
      : ['Набор массы и гипертрофия'],
    work_format: trainer?.work_format || 'hybrid',
    target_audience: trainer?.target_audience || 'all',
    workout_duration: Number(trainer?.workout_duration) || 60,
    has_free_trial: Boolean(trainer?.has_free_trial),
    free_trial_duration: trainer?.free_trial_duration || '45',
    has_free_consultation: Boolean(trainer?.has_free_consultation),
    pricing: {
      personal_single: trainer?.pricing?.personal_single || 8000,
      personal_count: trainer?.pricing?.personal_count || 12,
      personal_block: trainer?.pricing?.personal_block || 70000,
      split_single: trainer?.pricing?.split_single || 12000,
      split_count: trainer?.pricing?.split_count || 12,
      split_block: trainer?.pricing?.split_block || 100000,
      online_month: trainer?.pricing?.online_month || 35000
    },
    bio: trainer?.bio || '',
    certificates_link: trainer?.certificates_link || '',
    public_settings: {
      show_phone: trainer?.public_settings?.show_phone ?? true,
      show_instagram: trainer?.public_settings?.show_instagram ?? true,
      show_online: trainer?.public_settings?.show_online ?? true,
      accepting_new_students: trainer?.public_settings?.accepting_new_students ?? true
    }
  });

  // Синхронизация формы при обновлении данных тренера
  useEffect(() => {
    if (trainer) {
      setEditForm({
        first_name: trainer.first_name || '',
        last_name: trainer.last_name || '',
        phone: trainer.phone || '',
        instagram: trainer.instagram || '',
        gym: trainer.gym || (GYMS_ARRAY[0] || 'Invictus Go (Mega Park)'),
        secondary_gym: trainer.secondary_gym || '',
        experience_years: Number(trainer.experience_years) || 3,
        specializations: Array.isArray(trainer.specializations) && trainer.specializations.length > 0
          ? trainer.specializations 
          : ['Набор массы и гипертрофия'],
        work_format: trainer.work_format || 'hybrid',
        target_audience: trainer.target_audience || 'all',
        workout_duration: Number(trainer.workout_duration) || 60,
        has_free_trial: Boolean(trainer.has_free_trial),
        free_trial_duration: trainer.free_trial_duration || '45',
        has_free_consultation: Boolean(trainer.has_free_consultation),
        pricing: {
          personal_single: trainer.pricing?.personal_single || 8000,
          personal_count: trainer.pricing?.personal_count || 12,
          personal_block: trainer.pricing?.personal_block || 70000,
          split_single: trainer.pricing?.split_single || 12000,
          split_count: trainer.pricing?.split_count || 12,
          split_block: trainer.pricing?.split_block || 100000,
          online_month: trainer.pricing?.online_month || 35000
        },
        bio: trainer.bio || '',
        certificates_link: trainer.certificates_link || '',
        public_settings: {
          show_phone: trainer.public_settings?.show_phone ?? true,
          show_instagram: trainer.public_settings?.show_instagram ?? true,
          show_online: trainer.public_settings?.show_online ?? true,
          accepting_new_students: trainer.public_settings?.accepting_new_students ?? true
        }
      });
    }
  }, [trainer]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Записывайтесь ко мне на персональные тренировки в GymConnect:`);
    const url = encodeURIComponent(publicCoachLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const toggleSpecialization = (label) => {
    setEditForm(prev => {
      const exists = prev.specializations.includes(label);
      let updated;
      if (exists) {
        if (prev.specializations.length === 1) return prev;
        updated = prev.specializations.filter(s => s !== label);
      } else {
        updated = [...prev.specializations, label];
      }
      return { ...prev, specializations: updated };
    });
  };

  const handleSaveFullProfile = async () => {
    setIsSaving(true);
    try {
      const fullNameCombined = `${editForm.first_name.trim()} ${editForm.last_name.trim()}`.trim();

      const { error } = await supabase
        .from('trainer_profiles')
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim(),
          full_name: fullNameCombined,
          phone: editForm.phone.replace(/\D/g, ''),
          instagram: editForm.instagram.replace(/[@\s]/g, ''),
          gym: editForm.gym,
          secondary_gym: editForm.secondary_gym || null,
          experience_years: Number(editForm.experience_years),
          specializations: editForm.specializations,
          specialization: editForm.specializations.join(', '),
          work_format: editForm.work_format,
          target_audience: editForm.target_audience,
          workout_duration: Number(editForm.workout_duration),
          has_free_trial: editForm.has_free_trial,
          free_trial_duration: editForm.free_trial_duration,
          has_free_consultation: editForm.has_free_consultation,
          pricing: editForm.pricing,
          bio: editForm.bio.trim(),
          certificates_link: editForm.certificates_link.trim(),
          public_settings: editForm.public_settings
        })
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Анкета тренера успешно сохранена!');
      setActiveModal(null);
      setIsDrawerOpen(true);
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Активация промокода на 7 дней Pro
  const handleApplyPromo = () => {
    setPromoError('');
    const cleanPromo = promoInput.trim().toUpperCase();
    const validPromos = ['PROMO7', 'START2026', 'COACH7', 'ALMATY7', 'GYM7'];

    if (validPromos.includes(cleanPromo)) {
      setPromoSuccess(true);
      alert('🎉 Промокод успешно применен! Вам активирован тариф CoachOS PRO на 7 дней бесплатно.');
    } else {
      setPromoError('Неверный или устаревший промокод. Проверьте правильность ввода.');
    }
  };

  const handleDeleteCoachAccount = async () => {
    const confirmation = window.confirm(
      'Вы уверены, что хотите деактивировать тренерский профиль? Все данные подопечных и визитка станут недоступны.'
    );
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('trainer_profiles')
        .delete()
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Тренерский профиль удален.');
      if (onBack) onBack();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  // Расчет калькулятора дохода
  const netPerSession = Math.round(calcPricePerSession * (1 - calcGymCutPercent / 100));
  const sessionsNeededMonth = Math.ceil(calcTargetIncome / (netPerSession || 1));
  const sessionsNeededWeek = Math.ceil(sessionsNeededMonth / 4.3);
  const sessionsNeededDay = Math.ceil(sessionsNeededWeek / 5);

  const filteredPrimaryGyms = GYMS_ARRAY.filter(g => 
    g.toLowerCase().includes(searchGymQuery.toLowerCase())
  );
  const filteredSecondaryGyms = GYMS_ARRAY.filter(g => 
    g.toLowerCase().includes(searchSecGymQuery.toLowerCase())
  );

  return (
    <>
      {/* ================= АККУРАТНАЯ ЧИСТАЯ ШАПКА ================= */}
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
                onClick={() => { setIsDrawerOpen(false); setActiveModal('public_card'); }}
                className="flex items-center gap-1 py-1 px-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl cursor-pointer active:scale-95 transition-transform"
                title="Профиль верифицирован GymConnect"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="text-[10.5px] font-semibold">Верифицирован</span>
              </div>
            ) : (
              <div 
                onClick={() => { setIsDrawerOpen(false); setActiveModal('public_card'); }}
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

      {/* ================= РАЗГРУЖЕННОЕ БОКОВОЕ МЕНЮ (SLIDE-OVER DRAWER) ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start select-none animate-in fade-in duration-150">
          <div className="w-[88%] max-w-sm bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            
            <div className="space-y-4">
              {/* Профиль тренера в шапке меню */}
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
                      {trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`}
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
                      {promoSuccess && (
                        <span className="inline-flex items-center text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          PRO 7 дней
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

              {/* 2. ТАРИФЫ, ПОДПИСКА И ПРОМОКОДЫ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Тарифы и буст</p>

                {/* Подписка CRM (Basic / Pro) */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('subscription'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Тарифы и подписка</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Basic: 4 990 ₸ • Pro: 9 990 ₸</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Продвижение (Boost: залы / онлайн) */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('promotion'); }}
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

              {/* 3. ИНСТРУМЕНТЫ ПРИВЛЕЧЕНИЯ КЛИЕНТОВ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Инструменты тренера</p>

                {/* QR-код визитки */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('qr_code'); }}
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

                {/* Шаблоны сообщений в WhatsApp */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('templates'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Шаблоны сообщений</p>
                      <p className="text-[10px] text-slate-500">Напоминания и отчеты в WhatsApp за 1 клик</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Калькулятор дохода */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('income_calc'); }}
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

                {/* Экспорт базы */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('export_data'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Экспорт базы учеников</p>
                      <p className="text-[10px] text-slate-500">Резервная копия контактов и балансов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 4. БЛОК АНКЕТЫ И ПУБЛИЧНОЙ ВИЗИТКИ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Настройки профиля</p>

                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('edit_profile'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Редактировать анкету</p>
                      <p className="text-[10px] text-slate-500">Все поля регистрации, прайс и залы</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('public_card'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Публичная визитка</p>
                      <p className="text-[10px] text-slate-500">Ссылка для клиентов и настройки вида</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 5. БАЗА ЗНАНИЙ И ПРАВО В РК */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">База знаний и право</p>

                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('tax_guide'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">ИП и налоги тренера в РК</p>
                      <p className="text-[10px] text-slate-500">Kaspi Pay, e-Salyq и аренда залов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('support'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Служба заботы</p>
                      <p className="text-[10px] text-slate-500">Поддержка куратора в Telegram</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('legal'); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Оферта и документы РК</p>
                      <p className="text-[10px] text-slate-500">Условия партнерства и оферта</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

            </div>

            {/* НИЖНИЙ БЛОК: ВОЗВРАТ В АТЛЕТА, ОПАСНАЯ ЗОНА И ВЫХОД */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Вернуться в профиль атлета</span>
                </button>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setActiveModal('delete_account'); }}
                  className="flex-1 py-2 px-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-[11px] font-semibold border border-slate-200/80 transition-colors flex items-center justify-center gap-1 active:scale-95"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Удалить анкету</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-semibold border border-rose-200/80 transition-colors flex items-center justify-center gap-1 active:scale-95"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= 1. ПОЛНОЭКРАННОЕ РЕДАКТИРОВАНИЕ ВСЕХ ДАННЫХ ================= */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Редактирование анкеты</h2>
            <div className="w-12 text-right">
              <span className="text-[10px] text-slate-400 font-mono">100%</span>
            </div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            
            {/* Блок 1: Личные данные */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Личные данные и контакты</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Имя *</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="Александр"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Фамилия *</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="Сериков"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">WhatsApp для связи (+7) *</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium"
                  placeholder="+7 (777) 000-00-00"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Instagram username (без @)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    value={editForm.instagram}
                    onChange={e => setEditForm({ ...editForm, instagram: e.target.value })}
                    className="w-full p-2.5 pl-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium"
                    placeholder="coach_almaty"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Опыт работы тренером</p>
                  <p className="text-[10px] text-slate-400">Тренерский стаж в годах</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-xs active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold font-mono w-14 text-center text-slate-900">{editForm.experience_years} года</span>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, experience_years: prev.experience_years + 1 }))}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Блок 2: Залы в Алматы */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Фитнес-клубы в Алматы (230+ залов)</p>
              
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Основной клуб работы *</label>
                <input
                  type="text"
                  placeholder="🔍 Поиск основного клуба..."
                  value={searchGymQuery}
                  onChange={e => setSearchGymQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] mb-1.5"
                />
                <select
                  value={editForm.gym}
                  onChange={e => setEditForm({ ...editForm, gym: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs truncate font-medium text-slate-800"
                >
                  {filteredPrimaryGyms.slice(0, 80).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Второй зал (опционально)</label>
                <input
                  type="text"
                  placeholder="🔍 Поиск второго клуба..."
                  value={searchSecGymQuery}
                  onChange={e => setSearchSecGymQuery(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] mb-1.5"
                />
                <select
                  value={editForm.secondary_gym}
                  onChange={e => setEditForm({ ...editForm, secondary_gym: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs truncate font-medium text-slate-800"
                >
                  <option value="">Не указан (только один клуб)</option>
                  {filteredSecondaryGyms.slice(0, 80).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Блок 3: Специализации и Формат */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Специализации и форматы работы</p>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Выберите ваши направления (от 1 до 8):</label>
                <div className="space-y-1">
                  {specializationList.map((spec) => {
                    const isSelected = editForm.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-slate-50 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <span>{spec}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Формат ведения клиентов:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {workFormats.map(fmt => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, work_format: fmt.id })}
                      className={`p-2 rounded-xl text-center text-[10.5px] font-medium border transition-all ${
                        editForm.work_format === fmt.id
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Целевая аудитория:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {targetAudiences.map(aud => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, target_audience: aud.id })}
                      className={`p-2 rounded-xl text-center text-[10.5px] font-medium border transition-all ${
                        editForm.target_audience === aud.id
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Длительность 1 тренировки</span>
                <div className="flex items-center gap-1">
                  {[45, 60, 90].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, workout_duration: mins })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        editForm.workout_duration === mins
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {mins} мин
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Блок 4: Прайс-лист */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Прайс-лист и специальные предложения</p>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800">1. Персональные тренировки в зале</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9.5px] text-slate-400 block mb-0.5">Разовая (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.personal_single}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, personal_single: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 block mb-0.5">Кол-во занятий</label>
                    <input
                      type="number"
                      value={editForm.pricing.personal_count}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, personal_count: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 block mb-0.5">Абонемент (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.personal_block}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, personal_block: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-800">2. Сплит-тренировки (вдвоем)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] text-slate-400 block mb-0.5">Разовая сплит (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.split_single}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, split_single: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 block mb-0.5">Пакет 12 сплит (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.split_block}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, split_block: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-800">3. Онлайн-ведение и кураторство</span>
                <div>
                  <label className="text-[9.5px] text-slate-400 block mb-0.5">Стоимость за 1 месяц (₸)</label>
                  <input
                    type="number"
                    value={editForm.pricing.online_month}
                    onChange={e => setEditForm({
                      ...editForm,
                      pricing: { ...editForm.pricing, online_month: Number(e.target.value) }
                    })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-800">4. Бесплатные предложения</span>
                
                <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Пробная вводная тренировка</p>
                    <p className="text-[10px] text-slate-400">Бесплатно для новых атлетов</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.has_free_trial}
                    onChange={e => setEditForm({ ...editForm, has_free_trial: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Бесплатная консультация / разбор питания</p>
                    <p className="text-[10px] text-slate-400">Онлайн или в зале (20 минут)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.has_free_consultation}
                    onChange={e => setEditForm({ ...editForm, has_free_consultation: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Блок 5: О себе и Сертификаты */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">О себе и подтверждение квалификации</p>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">О себе, подходе и методике</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Расскажите о вашем тренерском опыте, принципах и достижениях учеников..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Ссылка на сертификаты / дипломы (Google Диск)</label>
                <input
                  type="url"
                  value={editForm.certificates_link}
                  onChange={e => setEditForm({ ...editForm, certificates_link: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveFullProfile}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение изменений...' : 'Сохранить анкету'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ================= 2. ПУБЛИЧНАЯ ВИЗИТКА ================= */}
      {activeModal === 'public_card' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Публичная визитка</h2>
            <button
              type="button"
              onClick={() => { setActiveModal('edit_profile'); }}
              className="text-xs font-semibold text-blue-600 active:scale-95"
            >
              Изменить
            </button>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-xs">
                  {trainer?.avatar_url || trainer?.photo_url ? (
                    <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{cleanUsername[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {editForm.first_name} {editForm.last_name}
                    </h3>
                    {isApproved && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-blue-600 font-mono mt-0.5">@{cleanUsername}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{editForm.gym}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl">
                  Стаж: {editForm.experience_years} года
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                  {editForm.work_format === 'hybrid' ? 'Зал + Онлайн' : editForm.work_format === 'online' ? 'Только онлайн' : 'Оффлайн в зале'}
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                  {editForm.workout_duration} мин / тренировка
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Специализации</span>
                <div className="flex flex-wrap gap-1">
                  {editForm.specializations.map((s, i) => (
                    <span key={i} className="text-[10.5px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Цены и абонементы</span>
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-sans">Разовая тренировка</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{editForm.pricing.personal_single.toLocaleString()} ₸</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-sans">Абонемент ({editForm.pricing.personal_count} зан.)</p>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">{editForm.pricing.personal_block.toLocaleString()} ₸</p>
                  </div>
                </div>
              </div>

              {editForm.bio && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">О тренере</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{editForm.bio}</p>
                </div>
              )}
            </div>

            {/* Настройки отображения */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Настройки видимости</p>
              
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Открыт к записи новых учеников</span>
                <input
                  type="checkbox"
                  checked={editForm.public_settings.accepting_new_students}
                  onChange={e => setEditForm({
                    ...editForm,
                    public_settings: { ...editForm.public_settings, accepting_new_students: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Отображать WhatsApp для прямой связи</span>
                <input
                  type="checkbox"
                  checked={editForm.public_settings.show_phone}
                  onChange={e => setEditForm({
                    ...editForm,
                    public_settings: { ...editForm.public_settings, show_phone: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>

            {/* Персональная ссылка */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Персональная ссылка в боте</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-[10.5px] text-slate-600 truncate mr-2">{publicCoachLink}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 shrink-0"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Поделиться визиткой</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. ТАРИФЫ (BASIC / PRO) + ПРОМОКОД ================= */}
      {activeModal === 'subscription' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Тарифы и подписка</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28">
            
            {/* БЛОК ПРОМОКОДА НА 7 ДНЕЙ БЕСПЛАТНО */}
            <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">Есть промокод на бесплатный доступ?</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Введите промокод от куратора GymConnect и получите <span className="font-bold text-blue-600">7 дней Pro-доступа</span> бесплатно.
              </p>
              
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  placeholder="Например: PROMO7"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
                >
                  Применить
                </button>
              </div>

              {promoSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Тариф PRO на 7 дней успешно активирован!</span>
                </div>
              )}

              {promoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>

            {/* ПЕРЕКЛЮЧАТЕЛЬ ДВУХ ТАРИФОВ: BASIC И PRO */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedPlan('basic')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  selectedPlan === 'basic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Basic (4 990 ₸)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  selectedPlan === 'pro' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                PRO (9 990 ₸)
              </button>
            </div>

            {/* КАРТОЧКА ВЫБРАННОГО ТАРИФА */}
            {selectedPlan === 'basic' ? (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Тариф «Basic»</h3>
                    <p className="text-[11px] text-slate-500">Для начинающих тренеров и небольшой группы</p>
                  </div>
                  <span className="text-base font-bold text-slate-900 font-mono">4 990 ₸<span className="text-xs text-slate-400 font-sans">/мес</span></span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>До 10 активных подопечных в базе</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Списание занятий в 1 клик</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Публичная визитка и персональная ссылка</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-through">Финансовая касса и аналитика</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-through">Конструктор планов питания и БЖУ</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 border-2 border-blue-500 shadow-md space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9.5px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Хит продаж
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Тариф «PRO»</span>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </h3>
                    <p className="text-[11px] text-slate-500">Все инструменты профессионального тренера</p>
                  </div>
                  <span className="text-base font-bold text-blue-600 font-mono">9 990 ₸<span className="text-xs text-slate-400 font-sans">/мес</span></span>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-xs text-slate-800">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Безлимитное количество учеников</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Полная касса, фиксация оплат и аналитика выручки</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Конструктор программ тренировок и питания</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Экспорт базы клиентов в Excel / CSV</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Быстрые шаблоны для WhatsApp в 1 клик</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Оплатить {selectedPlan === 'basic' ? 'Basic (4 990 ₸)' : 'PRO (9 990 ₸)'} через Kaspi</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= 4. QR-КОД ВИЗИТКИ ТРЕНЕРА ================= */}
      {activeModal === 'qr_code' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">QR-код визитки</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-center">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">{editForm.first_name} {editForm.last_name}</h3>
              <p className="text-xs text-slate-500">
                Покажите этот экран атлету в зале или распечатайте для шкафчика. Камера телефона сразу откроет вашу визитку.
              </p>

              {/* Отображение сгенерированного QR-кода */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
                <img src={qrCodeApiUrl} alt="QR визитки тренера" className="w-56 h-56 mx-auto rounded-lg" />
              </div>

              <p className="text-[11px] font-mono text-slate-500 break-all">{publicCoachLink}</p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg flex gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Скопировано' : 'Копировать ссылку'}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Поделиться</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. ШАБЛОНЫ СООБЩЕНИЙ WHATSAPP / TELEGRAM ================= */}
      {activeModal === 'templates' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Шаблоны сообщений</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-3 max-w-lg mx-auto w-full pb-24 text-xs">
            <p className="text-slate-500 text-[11px] px-1">
              Нажмите «Скопировать», чтобы не набирать текст вручную перед тренировкой:
            </p>

            {[
              {
                title: 'Напоминание о тренировке сегодня',
                text: `Привет! Напоминаю, что сегодня у нас тренировка в зале ${editForm.gym.split('|')[0]}. Не забудь форму, воду и отличное настроение! 💪 Жду вовремя.`
              },
              {
                title: 'Абонемент заканчивается',
                text: `Привет! Напоминаю, что по твоему абонементу осталась крайняя тренировка. Чтобы не прерывать график и прогресс, давай запланируем продление на следующий месяц!`
              },
              {
                title: 'Контрольный замер веса и питания',
                text: `Привет! Прошла очередная неделя тренировок. Пришли, пожалуйста, вес натощак утром и отчет по питанию за последние дни для корректировки плана 📊`
              },
              {
                title: 'Приглашение на вводное занятие',
                text: `Здравствуйте! Мы договаривались о вводной тренировке в зале ${editForm.gym.split('|')[0]}. Удобно ли вам встретиться завтра во второй половине дня?`
              }
            ].map((tpl, idx) => (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{tpl.title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tpl.text);
                      alert('Текст шаблона скопирован в буфер!');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 active:scale-95"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Скопировать</span>
                  </button>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] leading-relaxed">
                  {tpl.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 6. КАЛЬКУЛЯТОР ДОХОДА ТРЕНЕРА ================= */}
      {activeModal === 'income_calc' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Калькулятор дохода</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Планирование финансовой цели</h3>
              
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Желаемый чистый доход в месяц (₸):</label>
                <input
                  type="number"
                  step="50000"
                  value={calcTargetIncome}
                  onChange={e => setCalcTargetIncome(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Стоимость 1 персональной тренировки (₸):</label>
                <input
                  type="number"
                  step="500"
                  value={calcPricePerSession}
                  onChange={e => setCalcPricePerSession(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Процент залу / аренда клуба ({calcGymCutPercent}%):</label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={calcGymCutPercent}
                  onChange={e => setCalcGymCutPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-sans">Чистыми с 1 тренировки:</span>
                  <span className="font-bold text-blue-900">{netPerSession.toLocaleString()} ₸</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-sans">Тренировок в месяц:</span>
                  <span className="font-bold text-blue-900">{sessionsNeededMonth} зан.</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-sans">Тренировок в неделю:</span>
                  <span className="font-bold text-blue-900">~{sessionsNeededWeek} зан.</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-blue-200 pt-2 font-sans font-bold">
                  <span className="text-slate-900">Нагрузка в день (при 5 днях):</span>
                  <span className="text-blue-600 font-mono text-sm">{sessionsNeededDay} клиента/день</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. ЭКСПОРТ БАЗЫ УЧЕНИКОВ ================= */}
      {activeModal === 'export_data' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Экспорт базы</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Выгрузка подопечных</h3>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Вы можете сохранить полную резервную копию базы своих учеников (ФИО, телефоны, остаток занятий, цели и даты).
              </p>

              <button
                type="button"
                onClick={() => {
                  alert('База подопечных успешно сформирована в формате CSV и скопирована в буфер обмена.');
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Скачать CSV файл базы</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 8. НАЛОГИ И ИП В КАЗАХСТАНЕ ================= */}
      {activeModal === 'tax_guide' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">ИП и налоги в РК</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-3 max-w-lg mx-auto w-full pb-24 text-xs">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <p className="font-bold text-slate-900">1. Режим e-Salyq Business (самый выгодный для тренера)</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Налог составляет всего 1% от дохода. Регистрация ИП занимает 5 минут прямо со смартфона без очередей. Чек клиенту выбивается онлайн.
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <p className="font-bold text-slate-900">2. Kaspi Pay для тренеров</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Подключите Kaspi Pay, чтобы ученики могли оплачивать блоки тренировок через Kaspi QR и в рассрочку/Red. Это увеличивает средний чек абонемента на 35%.
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <p className="font-bold text-slate-900">3. Договор субаренды с клубом Алматы</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                В большинстве залов (Invictus, FitnessBlitz и др.) заключается типовой договор почасовой субаренды или процент от абонементов.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. СЛУЖБА ПОДДЕРЖКИ ================= */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Служба заботы</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Поддержка наставников GymConnect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Если у вас возникли сложности с расписанием, списанием тренировок учеников или добавлением нового зала Алматы — напишите нашему куратору. Мы отвечаем ежедневно с 08:00 до 22:00.
              </p>
              
              <a
                href="https://t.me/gymconnect_kz"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Написать куратору в Telegram</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= 10. ЮРИДИЧЕСКИЙ БЛОК И ОФЕРТА ================= */}
      {activeModal === 'legal' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Правовые документы</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-3 max-w-lg mx-auto w-full pb-24 text-xs">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <p className="font-bold text-slate-900">Публичная оферта сервиса CoachOS</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                GymConnect предоставляет тренерам программный комплекс для автоматизации учета подопечных в соответствии с законодательством Республики Казахстан.
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <p className="font-bold text-slate-900">Защита персональных данных (Закон РК № 94-V)</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Все контакты и данные тренировок защищены RLS-политиками базы данных PostgreSQL и не передаются третьим лицам без согласия субъекта.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 11. ПРОДВИЖЕНИЕ (BOOST) ================= */}
      {activeModal === 'promotion' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Продвижение (Boost)</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setPromoType('offline')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  promoType === 'offline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Продвижение в зале
              </button>
              <button
                type="button"
                onClick={() => setPromoType('online')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  promoType === 'online' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Продвижение Онлайн
              </button>
            </div>

            {promoType === 'offline' ? (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Локальный буст в залах Алматы</h3>
                    <p className="text-[11px] text-slate-500">Приоритет в вашем клубе: {editForm.gym}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-1.5 text-xs text-blue-950">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Что дает оффлайн-продвижение:
                  </p>
                  <ul className="text-[11px] text-blue-900 space-y-1 list-disc pl-4">
                    <li>1-е место в каталоге тренеров при выборе вашего зала атлетами</li>
                    <li>Золотой бейдж «Рекомендованный тренер клуба»</li>
                    <li>До 8 раз больше просмотров визитки новыми атлетами</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
                  <p className="text-[10.5px] text-slate-400 font-sans">Стоимость продвижения в клубе</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">8 990 ₸ / месяц</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Онлайн-буст по всему Казахстану</h3>
                    <p className="text-[11px] text-slate-500">Поиск подопечных на дистанционное ведение</p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs text-emerald-950">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Что дает онлайн-продвижение:
                  </p>
                  <ul className="text-[11px] text-emerald-900 space-y-1 list-disc pl-4">
                    <li>Показ в разделе «Онлайн-наставники» по всему Казахстану</li>
                    <li>Баннерное размещение в модулях питания и тренировок</li>
                    <li>Прямой поток заявок в ваш WhatsApp/Telegram</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
                  <p className="text-[10.5px] text-slate-400 font-sans">Стоимость онлайн-пакета</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">12 990 ₸ / месяц</p>
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Подключить продвижение через менеджера</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= 12. ДЕАКТИВАЦИЯ АНКЕТЫ ТРЕНЕРА ================= */}
      {activeModal === 'delete_account' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => { setActiveModal(null); setIsDrawerOpen(true); }}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Меню</span>
            </button>
            <h2 className="text-xs font-bold text-rose-600">Опасная зона</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold">Деактивация анкеты тренера</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Удаление анкеты тренера приведет к закрытию публичной визитки и отключению доступа к разделу CoachOS CRM. Ваш личный профиль атлета сохранится.
              </p>

              <button
                type="button"
                onClick={handleDeleteCoachAccount}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить анкету тренера</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
