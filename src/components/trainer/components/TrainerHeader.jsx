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
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import * as GymsData from '../../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

export default function TrainerHeader({ trainer, onLogout, onBack }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const cleanUsername = trainer?.username ? trainer.username.replace('@', '').trim() : 'coach';
  const isApproved = trainer?.status === 'approved';
  const publicCoachLink = `https://t.me/gymconnect_almaty_bot?start=coach_${cleanUsername}`;

  // 8 специализаций для редактирования
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

  // Стейт полного редактирования анкеты
  const [editForm, setEditForm] = useState({
    first_name: trainer?.first_name || '',
    last_name: trainer?.last_name || '',
    phone: trainer?.phone || '',
    instagram: trainer?.instagram || '',
    gym: trainer?.gym || (GYMS_ARRAY[2] || 'Invictus Go'),
    secondary_gym: trainer?.secondary_gym || '',
    experience_years: Number(trainer?.experience_years) || 3,
    specializations: Array.isArray(trainer?.specializations) ? trainer.specializations : ['Набор массы и гипертрофия'],
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
    certificates_link: trainer?.certificates_link || ''
  });

  // Синхронизация формы при обновлении пропса trainer
  useEffect(() => {
    if (trainer) {
      setEditForm({
        first_name: trainer.first_name || '',
        last_name: trainer.last_name || '',
        phone: trainer.phone || '',
        instagram: trainer.instagram || '',
        gym: trainer.gym || (GYMS_ARRAY[2] || 'Invictus Go'),
        secondary_gym: trainer.secondary_gym || '',
        experience_years: Number(trainer.experience_years) || 3,
        specializations: Array.isArray(trainer.specializations) ? trainer.specializations : ['Набор массы и гипертрофия'],
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
        certificates_link: trainer.certificates_link || ''
      });
    }
  }, [trainer]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicCoachLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Записывайтесь ко мне на тренировки в GymConnect:`);
    const url = encodeURIComponent(publicCoachLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const toggleSpecialization = (label) => {
    setEditForm(prev => {
      const exists = prev.specializations.includes(label);
      const updated = exists 
        ? prev.specializations.filter(s => s !== label) 
        : [...prev.specializations, label];
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
          certificates_link: editForm.certificates_link.trim()
        })
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Все данные анкеты успешно обновлены в базе!');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* ================= АККУРАТНАЯ ВЕРХНЯЯ ШАПКА ================= */}
      <header className="bg-white border-b border-slate-200/70 p-3 sticky top-0 z-30 select-none shadow-sm">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          
          {/* Левая часть: кнопка вызова бокового меню */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 active:scale-95 transition-all flex items-center gap-1.5"
            title="Открыть меню тренера"
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span className="text-[11px] font-semibold text-slate-800">Меню</span>
          </button>

          {/* Центральный заголовок с индикатором статуса */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-bold text-slate-900 tracking-tight">CoachOS CRM</h1>
                {isApproved && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
              </div>
              <p className="text-[9.5px] text-slate-400 font-mono">@{cleanUsername}</p>
            </div>
          </div>

          {/* Правая часть: кнопка «Визитка ↗» */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPublicModalOpen(true)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[11px] font-semibold border border-blue-200/70 flex items-center gap-1 active:scale-95 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Визитка</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= БОКОВОЕ МЕНЮ (SLIDE-OVER DRAWER) ================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start select-none animate-in fade-in duration-200">
          <div className="w-[85%] max-w-xs bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            
            <div className="space-y-4">
              {/* Шапка бокового меню: аватар и имя без обрезания */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm overflow-hidden">
                    {trainer?.avatar_url || trainer?.photo_url ? (
                      <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{cleanUsername[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`}
                    </p>
                    <p className="text-[10px] text-blue-600 font-mono mt-0.5">@{cleanUsername}</p>
                    <span className="inline-block text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                      {trainer?.gym ? trainer.gym.split('|')[0] : 'Алматы'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. БЛОК ОПЛАТ: ПОДПИСКА CRM И ПРОДВИЖЕНИЕ */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Тарифы и буст</p>
                
                {/* Кнопка подписки на CRM */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setIsSubscriptionModalOpen(true); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight">Подписка CoachOS</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Доступ к CRM активен</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Кнопка платного продвижения профиля */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setIsPromotionModalOpen(true); }}
                  className="w-full p-2.5 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-950 leading-tight">Продвижение в залах</p>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">Поток новых клиентов</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>

              {/* 2. БЛОК УПРАВЛЕНИЯ ПРОФИЛЕМ */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Настройки визитки</p>

                {/* Открыть визитку */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setIsPublicModalOpen(true); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight">Публичная визитка</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ссылка и внешний вид профиля</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Редактирование всех полей анкеты */}
                <button
                  type="button"
                  onClick={() => { setIsDrawerOpen(false); setIsEditModalOpen(true); }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight">Редактировать анкету</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Цены, залы, опыт, услуги</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

            </div>

            {/* НИЖНИЙ БЛОК: ВОЗВРАТ В АТЛЕТА И ВЫХОД */}
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

              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold text-rose-600 flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Выйти из CoachOS</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 1. МОДАЛКА ОПЛАТЫ ПОДПИСКИ CRM ================= */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Подписка на CoachOS CRM</h3>
                  <p className="text-[10px] text-slate-400">Доступ к системе учета и ученикам</p>
                </div>
              </div>
              <button onClick={() => setIsSubscriptionModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center font-medium">
                <span className="text-slate-500">Текущий тариф:</span>
                <span className="text-slate-900 font-bold">Trainer Standard</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span className="text-slate-500">Срок действия:</span>
                <span className="text-emerald-700 font-bold font-mono">до 25.10.2026</span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span className="text-slate-500">Стоимость продления:</span>
                <span className="text-blue-600 font-bold font-mono">4 990 ₸ / месяц</span>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-98"
            >
              <span>Оплатить продление через Kaspi</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= 2. МОДАЛКА ПЛАТНОГО ПРОДВИЖЕНИЯ (BOOST) ================= */}
      {isPromotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Продвижение профиля (Boost)</h3>
                  <p className="text-[10px] text-slate-400">Привлечение новых клиентов в клубах</p>
                </div>
              </div>
              <button onClick={() => setIsPromotionModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-slate-600">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1">
                <p className="font-bold text-blue-950 text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Преимущества продвижения:
                </p>
                <ul className="text-[11px] text-blue-900 space-y-0.5 list-disc pl-3.5">
                  <li>Закрепление в топе каталога тренеров в ваших залах Алматы</li>
                  <li>Выделенный бейдж «Рекомендованный наставник»</li>
                  <li>Приоритетный показ атлетам при поиске тренера в боте</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
                <p className="text-[10px] text-slate-400 font-sans">Стоимость рекламного пакета</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">9 990 ₸ / 30 дней</p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-98"
            >
              <span>Подключить продвижение через менеджера</span>
            </a>
          </div>
        </div>
      )}

      {/* ================= 3. МОДАЛКА ПУБЛИЧНОЙ ВИЗИТКИ ================= */}
      {isPublicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Публичная визитка тренера</h3>
                  <p className="text-[10px] text-slate-400">Так ваш профиль видят клиенты</p>
                </div>
              </div>
              <button onClick={() => setIsPublicModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {trainer?.avatar_url || trainer?.photo_url ? (
                    <img src={trainer.avatar_url || trainer.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{cleanUsername[0]?.toUpperCase()}</div>
                  )}
                </div>
                <div className="overflow-hidden space-y-0.5">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {trainer?.full_name || `${trainer?.first_name || ''} ${trainer?.last_name || ''}`}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Стаж: {trainer?.experience_years || 3} года • {trainer?.gym?.split('|')[0] || 'Алматы'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-mono">@{cleanUsername}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-sans">Разовая тренировка</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{trainer?.pricing?.personal_single || 8000} ₸</p>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-sans">Абонемент ({trainer?.pricing?.personal_count || 12} зан.)</p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">{trainer?.pricing?.personal_block || 70000} ₸</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-500 truncate mr-2">{publicCoachLink}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 shrink-0"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Отправить визитку клиенту</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. ПОЛНОЕ РЕДАКТИРОВАНИЕ ВСЕХ ДАННЫХ АНКЕТЫ ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Редактирование анкеты</h3>
                  <p className="text-[10px] text-slate-400">Все параметры тренера CoachOS</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              
              {/* ФИО */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Имя</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Фамилия</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Залы */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Основной клуб</label>
                <select
                  value={editForm.gym}
                  onChange={e => setEditForm({ ...editForm, gym: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl truncate"
                >
                  {GYMS_ARRAY.slice(0, 70).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Второй зал (опционально)</label>
                <select
                  value={editForm.secondary_gym}
                  onChange={e => setEditForm({ ...editForm, secondary_gym: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl truncate"
                >
                  <option value="">Не указан</option>
                  {GYMS_ARRAY.slice(0, 70).map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Стаж со степпером */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Опыт работы</p>
                  <p className="text-[10px] text-slate-400">Тренерский стаж</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                    className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono w-12 text-center">{editForm.experience_years} года</span>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, experience_years: prev.experience_years + 1 }))}
                    className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Специализации */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Специализации</label>
                <div className="grid grid-cols-1 gap-1">
                  {specializationList.map((spec) => {
                    const isSelected = editForm.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`p-2 rounded-xl border text-left text-[11px] font-medium flex items-center justify-between ${
                          isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{spec}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Прайс-лист персональных тренировок */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-900">Прайс на персональные занятия</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Разовое (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.personal_single}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, personal_single: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Абонемент 12 зан. (₸)</label>
                    <input
                      type="number"
                      value={editForm.pricing.personal_block}
                      onChange={e => setEditForm({
                        ...editForm,
                        pricing: { ...editForm.pricing, personal_block: Number(e.target.value) }
                      })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* О себе */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">О себе и методике</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              {/* Ссылка на сертификаты */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Ссылка на сертификаты (Google Диск)</label>
                <input
                  type="url"
                  value={editForm.certificates_link}
                  onChange={e => setEditForm({ ...editForm, certificates_link: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveFullProfile}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить все изменения'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
