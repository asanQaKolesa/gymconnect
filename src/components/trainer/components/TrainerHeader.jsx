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
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import * as GymsData from '../../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

export default function TrainerHeader({ trainer, onLogout, onBack, activeTab, onSelectTab }) {
  // Управление открытием панелей
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'edit_profile' | 'public_card' | 'promotion' | 'subscription' | 'support' | 'legal' | 'delete_account' | null

  // Состояния интерактивности
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchGymQuery, setSearchGymQuery] = useState('');
  const [searchSecGymQuery, setSearchSecGymQuery] = useState('');
  const [promoType, setPromoType] = useState('offline'); // 'offline' | 'online'

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '').trim() : 'coach';
  const isApproved = trainer?.status === 'approved';
  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;

  // 8 утвержденных специализаций
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

  // Полное состояние анкеты тренера (все поля онбординга)
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
    // Настройки отображения публичной карточки
    public_settings: {
      show_phone: trainer?.public_settings?.show_phone ?? true,
      show_instagram: trainer?.public_settings?.show_instagram ?? true,
      show_online: trainer?.public_settings?.show_online ?? true,
      accepting_new_students: trainer?.public_settings?.accepting_new_students ?? true
    }
  });

  // Синхронизация формы при обновлении пропса trainer
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
      setIsDrawerOpen(true); // Возврат обратно в открытое меню
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    } finally {
      setIsSaving(false);
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

  // Фильтрация залов по поиску
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
          
          {/* Кнопка вызова бокового меню с нативным стилем iOS */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 py-1.5 px-3 bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 rounded-xl active:scale-95 transition-all"
            title="Открыть меню тренера"
          >
            <Menu className="w-4 h-4 text-slate-800" />
            <span className="text-xs font-semibold">Меню</span>
          </button>

          {/* Центральный аккуратный заголовок без повторения юзернейма */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">CoachOS CRM</h1>
          </div>

          {/* Правая часть: бейдж верификации */}
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

      {/* ================= БОКОВОЕ МЕНЮ (SLIDE-OVER DRAWER) ================= */}
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

              {/* 1. БЫСТРАЯ НАВИГАЦИЯ ПО CRM ТАБАМ (перенос всех табов в меню) */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Разделы системы</p>
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

              {/* 2. БЛОК АНКЕТЫ И ПУБЛИЧНОЙ ВИЗИТКИ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Управление профилем</p>

                {/* Редактирование всех параметров анкеты */}
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

                {/* Публичная визитка тренера */}
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

              {/* 3. БЛОК ТАРИФОВ И ПРОДВИЖЕНИЯ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Тарифы и буст</p>

                {/* Продвижение профиля (зал + онлайн) */}
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

                {/* Подписка CRM */}
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
                      <p className="text-xs font-semibold text-slate-900">Подписка CoachOS</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Активна до 25.10.2026</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 4. БЛОК ПОДДЕРЖКИ И ЮРИДИЧЕСКОЙ ИНФОРМАЦИИ */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Помощь и право</p>

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
                      <p className="text-[10px] text-slate-500">Поддержка тренеров в Telegram</p>
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

      {/* ================= 1. ПОЛНОЭКРАННОЕ РЕДАКТИРОВАНИЕ АНКЕТЫ ================= */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          
          {/* Верхний фиксированный бар iOS с кнопкой Назад в Меню */}
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

          {/* Контент формы: все поля из онбординга */}
          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            
            {/* Блок 1: Основные данные */}
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

              {/* Степпер опыта работы */}
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

            {/* Блок 2: Клубы в Алматы */}
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

              {/* Формат работы */}
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

              {/* Аудитория */}
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

              {/* Длительность занятия */}
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

            {/* Блок 4: Прайс-лист и бесплатные бонусы */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Прайс-лист и специальные предложения</p>

              {/* Персональные */}
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

              {/* Сплит */}
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

              {/* Онлайн */}
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

              {/* Бесплатные бонусы для привлечения */}
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

          {/* Нижний фиксированный бар с кнопкой Сохранить */}
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

      {/* ================= 2. ПОЛНОЭКРАННАЯ ПУБЛИЧНАЯ ВИЗИТКА ================= */}
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
            
            {/* Карточка визитки (как видит клиент) */}
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

              {/* Бейджи опыта и аудитории */}
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

              {/* Специализации */}
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

              {/* Прайс-лист */}
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

              {/* Описание */}
              {editForm.bio && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">О тренере</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{editForm.bio}</p>
                </div>
              )}
            </div>

            {/* Настройки визитки */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Настройки публичной визитки</p>
              
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

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-slate-700">Отображать блок онлайн-ведения</span>
                <input
                  type="checkbox"
                  checked={editForm.public_settings.show_online}
                  onChange={e => setEditForm({
                    ...editForm,
                    public_settings: { ...editForm.public_settings, show_online: e.target.checked }
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

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Поделиться визиткой</span>
            </button>
          </div>

        </div>
      )}

      {/* ================= 3. ПОЛНОЭКРАННОЕ ПРОДВИЖЕНИЕ (BOOST) ================= */}
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
            
            {/* Переключатель Зал / Онлайн */}
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
                    <li>1-е место в списке тренеров при выборе вашего зала атлетами</li>
                    <li>Специальный золотой бейдж «Рекомендован клубом»</li>
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
                    <li>Показ в разделе «Онлайн-наставники» для пользователей всех городов РК</li>
                    <li>Баннерное размещение в модулях питания и тренировок</li>
                    <li>Прямой поток заявок в ваш Telegram/WhatsApp</li>
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

      {/* ================= 4. ПОДПИСКА COACHOS ================= */}
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
            <h2 className="text-xs font-bold text-slate-900">Подписка CoachOS CRM</h2>
            <div className="w-12"></div>
          </div>

          <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Тариф Trainer Pro</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold">Доступ активен до 25.10.2026</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ученики в базе:</span>
                  <span className="font-bold text-slate-900">Без ограничений</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Списание занятий:</span>
                  <span className="font-bold text-slate-900">Автоматически</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Касса и аналитика:</span>
                  <span className="font-bold text-emerald-600">Включены</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
                <p className="text-[10px] text-slate-400 font-sans">Стоимость продления</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">4 990 ₸ / месяц</p>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Продлить подписку через Kaspi Pay</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= 5. СЛУЖБА ПОДДЕРЖКИ ================= */}
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
                className="w-full py-3 bg-blue-600 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Написать в Telegram куратору</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. ЮРИДИЧЕСКИЙ БЛОК И ОФЕРТА ================= */}
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

      {/* ================= 7. УДАЛЕНИЕ ПРОФИЛЯ ТРЕНЕРА ================= */}
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
