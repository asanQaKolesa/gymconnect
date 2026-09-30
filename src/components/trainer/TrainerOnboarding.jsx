// src/components/trainer/TrainerOnboarding.jsx
import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Dumbbell, 
  Send, 
  Check, 
  Plus, 
  Minus, 
  Camera, 
  Users, 
  Clock, 
  Search, 
  ShieldCheck, 
  Loader2, 
  X, 
  MapPin, 
  Crown, 
  Trophy, 
  Info, 
  ChevronDown 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

function formatYears(count) {
  const n = Math.abs(Number(count)) || 0;
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 19) return `${n} лет`;
  if (rem10 === 1) return `${n} год`;
  if (rem10 >= 2 && rem10 <= 4) return `${n} года`;
  return `${n} лет`;
}

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Живой поиск клубов Алматы
  const [searchPrimaryGym, setSearchPrimaryGym] = useState('');
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState(false);
  
  const [searchSecondaryGym, setSearchSecondaryGym] = useState('');
  const [isSecondaryDropdownOpen, setIsSecondaryDropdownOpen] = useState(false);

  // Выпадающие списки номинаций и разрядов
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [customDivisionInput, setCustomDivisionInput] = useState('');
  
  const [isRankDropdownOpen, setIsRankDropdownOpen] = useState(false);
  const [customRankInput, setCustomRankInput] = useState('');

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const currentTelegramId = tgUser?.id ? String(tgUser.id) : (localStorage.getItem('gymconnect_telegram_id') || '');

  // Международные соревновательные номинации
  const defaultDivisions = [
    "Men's Physique",
    "Bikini",
    "Classic Physique",
    "Wellness",
    "Bodybuilding",
    "Figure / Бодифитнес",
    "Fit-Model",
    "Powerlifting (IPF / WRPF)",
    "Streetlifting / Воркаут",
    "CrossFit / Функционал",
    "Армрестлинг"
  ];

  // Спортивные разряды и звания
  const defaultRanks = [
    "PRO Card (IFBB / NPC / WRPF Pro)",
    "Мастер спорта международного класса (МСМК)",
    "Мастер спорта (МС)",
    "Кандидат в мастера спорта (КМС)",
    "1-й взрослый разряд",
    "Чемпион Республики Казахстан",
    "Призёр чемпионата РК / Азии / Мира",
    "Сертифицированный специалист"
  ];

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

  const workFormats = [
    { id: 'gym', label: 'В зале' },
    { id: 'online', label: 'Онлайн' },
    { id: 'hybrid', label: 'Гибрид' }
  ];

  const targetAudiences = [
    { id: 'all', label: 'Все (без ограничений)' },
    { id: 'women', label: 'Девушки и женщины' },
    { id: 'men', label: 'Парни и мужчины' },
    { id: 'teens', label: 'Подростки (14–18 лет)' },
    { id: 'seniors', label: 'Пенсионеры и возрастные (50+)' }
  ];

  // Все услуги и переключатели по умолчанию строго выключены
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    first_name: tgUser?.first_name || '',
    last_name: tgUser?.last_name || '',
    username: tgUser?.username ? tgUser.username.replace('@', '') : '',
    phone: '',
    instagram: '',
    bio: '',
    experience_years: 3,

    // Спортивный статус
    is_competing_athlete: false,
    athletic_divisions: [],
    athletic_titles: [],
    sports_title_custom: '',

    gym: GYMS_ARRAY[0] || 'Invictus Go (Mega Park)',
    secondary_gym: '',

    work_format: 'gym',
    target_audience: 'all',
    specializations: ['Набор массы и гипертрофия'],

    show_in_catalog: false,
    has_free_trial: false,
    has_free_consultation: false,

    // 5 форматов услуг
    services_enabled: {
      personal: false,
      split: false,
      group: false,
      online: false,
      consultation: false
    },
    pricing: {
      personal_single: 8000,
      personal_count: 12,
      personal_block: 70000,
      personal_duration: 60,

      split_single: 12000,
      split_count: 12,
      split_block: 100000,
      split_duration: 60,

      group_single: 5000,
      group_month: 40000,
      group_duration: 60,

      online_sessions: 8,
      online_month: 35000,

      consultation_duration: 60,
      consultation_price: 10000
    },

    education_place: '',
    education_contact: '',
    gym_contact: '',
    certificates_link: ''
  });

  const filteredPrimaryGyms = useMemo(() => {
    return GYMS_ARRAY.filter(g => 
      typeof g === 'string' && g.toLowerCase().includes(searchPrimaryGym.toLowerCase())
    );
  }, [searchPrimaryGym]);

  const filteredSecondaryGyms = useMemo(() => {
    return GYMS_ARRAY.filter(g => 
      typeof g === 'string' && g.toLowerCase().includes(searchSecondaryGym.toLowerCase())
    );
  }, [searchSecondaryGym]);

  const handleBackAction = () => {
    if (typeof onExitToProfile === 'function') {
      onExitToProfile();
    } else if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.href = window.location.pathname + '?tab=profile';
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `trainer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `trainers/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setFormData(prev => ({ ...prev, photo_url: urlData.publicUrl }));
      }
    } catch (err) {
      console.warn('Ошибка загрузки фото:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const toggleSpecialization = (label) => {
    setFormData(prev => {
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

  const toggleDivision = (division) => {
    setFormData(prev => {
      const exists = prev.athletic_divisions.includes(division);
      const updated = exists 
        ? prev.athletic_divisions.filter(d => d !== division)
        : [...prev.athletic_divisions, division];
      return { ...prev, athletic_divisions: updated };
    });
  };

  const handleAddCustomDivision = () => {
    if (!customDivisionInput.trim()) return;
    const val = customDivisionInput.trim();
    if (!formData.athletic_divisions.includes(val)) {
      setFormData(prev => ({
        ...prev,
        athletic_divisions: [...prev.athletic_divisions, val]
      }));
    }
    setCustomDivisionInput('');
  };

  const toggleRank = (rank) => {
    setFormData(prev => {
      const exists = prev.athletic_titles.includes(rank);
      const updated = exists 
        ? prev.athletic_titles.filter(r => r !== rank)
        : [...prev.athletic_titles, rank];
      return { ...prev, athletic_titles: updated };
    });
  };

  const handleAddCustomRank = () => {
    if (!customRankInput.trim()) return;
    const val = customRankInput.trim();
    if (!formData.athletic_titles.includes(val)) {
      setFormData(prev => ({
        ...prev,
        athletic_titles: [...prev.athletic_titles, val]
      }));
    }
    setCustomRankInput('');
  };

  const toggleService = (key) => {
    setFormData(prev => ({
      ...prev,
      services_enabled: {
        ...prev.services_enabled,
        [key]: !prev.services_enabled[key]
      }
    }));
  };

  const handlePriceInput = (field, raw) => {
    const clean = String(raw).replace(/\D/g, '');
    const num = clean === '' ? '' : Number(clean);
    setFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: num }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      alert('Пожалуйста, укажите имя тренера');
      return;
    }

    if (!formData.last_name.trim()) {
      alert('Пожалуйста, укажите фамилию тренера');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      alert('Пожалуйста, укажите 10 цифр номера WhatsApp');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanUsername = formData.username ? formData.username.trim().replace(/^@+/, '') : (tgUser?.username || `coach_${Date.now()}`);
      const cleanInstagram = formData.instagram ? formData.instagram.trim().replace(/^@+/, '') : '';
      const fullPhone = `7${formData.phone.replace(/\D/g, '')}`;
      const fullEduPhone = formData.education_contact ? `7${formData.education_contact.replace(/\D/g, '')}` : '';
      const fullGymPhone = formData.gym_contact ? `7${formData.gym_contact.replace(/\D/g, '')}` : '';
      const fullNameCombined = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

      let payload = {
        telegram_id: currentTelegramId || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: fullNameCombined,
        username: cleanUsername,
        phone: fullPhone,
        whatsapp: fullPhone,
        photo_url: formData.photo_url || null,
        avatar_url: formData.photo_url || null,
        instagram: cleanInstagram,
        bio: formData.bio ? formData.bio.trim() : '',
        experience_years: Number(formData.experience_years) || 1,

        is_competing_athlete: formData.is_competing_athlete,
        athletic_divisions: formData.athletic_divisions,
        athletic_titles: formData.athletic_titles,
        sports_title_custom: formData.sports_title_custom.trim(),

        gym: formData.gym,
        secondary_gym: formData.secondary_gym || null,

        work_format: formData.work_format,
        target_audience: formData.target_audience,
        specializations: formData.specializations,
        specialization: formData.specializations.join(', '),

        show_in_catalog: formData.show_in_catalog,
        has_free_trial: formData.has_free_trial,
        has_free_consultation: formData.has_free_consultation,
        services_offered: formData.services_enabled,

        pricing: {
          personal_single: Number(formData.pricing.personal_single) || 8000,
          personal_count: Number(formData.pricing.personal_count) || 12,
          personal_block: Number(formData.pricing.personal_block) || 70000,
          personal_duration: Number(formData.pricing.personal_duration) || 60,

          split_single: Number(formData.pricing.split_single) || 12000,
          split_count: Number(formData.pricing.split_count) || 12,
          split_block: Number(formData.pricing.split_block) || 100000,
          split_duration: Number(formData.pricing.split_duration) || 60,

          group_single: Number(formData.pricing.group_single) || 5000,
          group_month: Number(formData.pricing.group_month) || 40000,
          group_duration: Number(formData.pricing.group_duration) || 60,

          online_sessions: Number(formData.pricing.online_sessions) || 8,
          online_month: Number(formData.pricing.online_month) || 35000,

          consultation_duration: Number(formData.pricing.consultation_duration) || 60,
          consultation_price: Number(formData.pricing.consultation_price) || 10000
        },

        education_place: formData.education_place.trim(),
        education_contact: fullEduPhone,
        gym_contact: fullGymPhone,
        certificates_link: formData.certificates_link.trim(),

        public_settings: {
          show_in_catalog: formData.show_in_catalog,
          show_phone: true,
          show_instagram: true
        },

        status: 'approved',
        created_at: new Date().toISOString()
      };

      let saveSuccess = false;
      for (let attempt = 0; attempt < 8; attempt++) {
        const { error } = await supabase
          .from('trainer_profiles')
          .upsert([payload], { onConflict: 'username' });

        if (!error) {
          saveSuccess = true;
          break;
        }

        const missingMatch = error.message.match(/column [‘'"]?([a-zA-Z0-9_]+)[’'"]?/i) 
          || error.message.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i);

        if (missingMatch && missingMatch[1] && payload[missingMatch[1]] !== undefined) {
          console.warn(`Колонка "${missingMatch[1]}" отсутствует, пропускаем...`);
          delete payload[missingMatch[1]];
        } else {
          throw error;
        }
      }

      if (!saveSuccess) {
        throw new Error('Не удалось согласовать поля с базой данных.');
      }

      alert('Ваш профиль тренера успешно зарегистрирован!');
      if (onComplete) {
        onComplete(cleanUsername);
      } else {
        handleBackAction();
      }
    } catch (err) {
      console.error('Ошибка сохранения анкеты тренера:', err);
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-150">
      
      {/* 1. ШАПКА: ТОЛЬКО ИКОНКА 36×36px БЕЗ ТЕКСТА «НАЗАД» */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 relative flex items-center justify-between shadow-2xs">
        <div className="z-10 flex items-center">
          <button
            type="button"
            onClick={handleBackAction}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer border border-slate-200/60 shadow-2xs"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 stroke-[2.2]" />
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2 className="text-xs font-bold text-slate-900 tracking-tight pointer-events-auto">
            Регистрация тренера CoachOS
          </h2>
        </div>

        <div className="w-9 z-10" />
      </div>

      {/* 2. СКРОЛЛИРУЕМАЯ ОБЛАСТЬ (ПОЛНЫЙ КОМПЛЕКТ СЕКЦИЙ) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full pb-8">
        
        {/* Приветственный блок */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 text-center space-y-1.5">
          <div className="w-11 h-11 bg-blue-50 text-[#1E60D5] rounded-2xl flex items-center justify-center mx-auto mb-1 shadow-sm">
            <Dumbbell className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Анкета наставника CoachOS
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
            Telegram ID <span className="font-mono text-[#1E60D5] font-bold">{currentTelegramId || 'определен'}</span> свяжется с профилем автоматически.
          </p>
        </div>

        {/* Аватар тренера */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs flex flex-col items-center text-center">
          <div 
            className="relative group cursor-pointer"
            onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center relative">
              {isUploadingPhoto ? (
                <div className="flex flex-col items-center justify-center gap-1 bg-slate-50 w-full h-full">
                  <Loader2 className="w-5 h-5 text-[#1E60D5] animate-spin" />
                  <span className="text-[9px] font-bold text-slate-500">Загрузка...</span>
                </div>
              ) : formData.photo_url ? (
                <img src={formData.photo_url} alt="Аватар тренера" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-8 h-8 text-slate-400 stroke-[1.6]" />
              )}
            </div>

            {!isUploadingPhoto && (
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#1E60D5] text-white rounded-xl shadow-md active:scale-90 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          <p className="text-xs font-bold text-slate-900 mt-2">
            {formData.first_name ? `${formData.first_name} ${formData.last_name || ''}` : 'Фотография профиля'}
          </p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            Нажмите для загрузки фотографии
          </p>
        </div>

        {/* 1. Личные данные, контакты и О себе */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Личные данные и контакты
          </h3>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Имя *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Данияр"
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Фамилия *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Сериков"
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Telegram ник</label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[@\s]/g, '') })}
                  placeholder="coach_nick"
                  className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">WhatsApp (+7) *</label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-slate-500 font-mono text-xs font-semibold select-none">+7</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="7010000000"
                  className="w-full pl-7 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Ваш ник в Instagram</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
              <input
                type="text"
                value={formData.instagram}
                onChange={e => setFormData({ ...formData, instagram: e.target.value.replace(/[@\s]/g, '') })}
                placeholder="coach_fit"
                className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">О себе и принципах работы</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Расскажите о вашем тренерском опыте, подходе к питанию и тренировкам..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs resize-none outline-none focus:bg-white focus:border-[#1E60D5] leading-relaxed"
            />
          </div>

          {/* Стаж со степпером */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-900">Опыт работы тренером</p>
              <p className="text-[10.5px] text-slate-400">Тренерский стаж</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                className="w-8 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-2xs active:scale-90 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono w-16 text-center text-slate-900">
                {formatYears(formData.experience_years)}
              </span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, experience_years: prev.experience_years + 1 }))}
                className="w-8 h-7 bg-[#1E60D5] text-white rounded-lg flex items-center justify-center font-bold shadow-2xs active:scale-90 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Спортивные звания, номинации и разряды */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800">
                Спортивный статус и номинации (опционально)
              </h3>
            </div>
            <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              Pro Divisions
            </span>
          </div>

          {/* Чекбокс: Выступающий атлет */}
          <div 
            onClick={() => setFormData(prev => ({ ...prev, is_competing_athlete: !prev.is_competing_athlete }))}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-99 transition-all"
          >
            <div className="pr-3">
              <p className="text-xs font-bold text-slate-900 leading-tight">Выступающий соревнующийся атлет</p>
              <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                Действующий участник турниров и соревнований
              </p>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
              formData.is_competing_athlete ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
            }`}>
              {formData.is_competing_athlete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          {/* ВЫПАДАЮЩИЙ СПИСОК 1: НОМИНАЦИИ */}
          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Номинация соревнований (Division):
            </label>
            
            {formData.athletic_divisions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.athletic_divisions.map((div, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-[#1E60D5] border border-blue-200 text-xs font-semibold"
                  >
                    <span>{div}</span>
                    <button 
                      type="button" 
                      onClick={() => toggleDivision(div)}
                      className="hover:text-rose-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div 
                onClick={() => setIsDivisionDropdownOpen(!isDivisionDropdownOpen)}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer active:scale-99 transition-all"
              >
                <span className="text-xs font-medium text-slate-700">
                  {formData.athletic_divisions.length > 0 
                    ? `Выбрано номинаций: ${formData.athletic_divisions.length}` 
                    : 'Выберите номинацию из списка...'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDivisionDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDivisionDropdownOpen && (
                <div className="mt-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1.5 animate-in fade-in z-30">
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {defaultDivisions.map((div, idx) => {
                      const isSelected = formData.athletic_divisions.includes(div);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleDivision(div)}
                          className={`p-2 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 rounded-lg ${
                            isSelected ? 'font-bold text-[#1E60D5] bg-blue-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{div}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#1E60D5]" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Свой вариант номинации..."
                      value={customDivisionInput}
                      onChange={e => setCustomDivisionInput(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDivision}
                      className="px-3 py-2 bg-[#1E60D5] text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ВЫПАДАЮЩИЙ СПИСОК 2: РАЗРЯДЫ И ЗВАНИЯ */}
          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Спортивные разряды и звания:
            </label>

            {formData.athletic_titles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.athletic_titles.map((rank, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                  >
                    <span>{rank}</span>
                    <button 
                      type="button" 
                      onClick={() => toggleRank(rank)}
                      className="hover:text-rose-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div 
                onClick={() => setIsRankDropdownOpen(!isRankDropdownOpen)}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer active:scale-99 transition-all"
              >
                <span className="text-xs font-medium text-slate-700">
                  {formData.athletic_titles.length > 0 
                    ? `Выбрано званий: ${formData.athletic_titles.length}` 
                    : 'Выберите разряд или звание...'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRankDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isRankDropdownOpen && (
                <div className="mt-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1.5 animate-in fade-in z-30">
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {defaultRanks.map((rank, idx) => {
                      const isSelected = formData.athletic_titles.includes(rank);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleRank(rank)}
                          className={`p-2 text-xs cursor-pointer flex items-center justify-between hover:bg-amber-50 rounded-lg ${
                            isSelected ? 'font-bold text-amber-900 bg-amber-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span>{rank}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Свой спортивный разряд..."
                      value={customRankInput}
                      onChange={e => setCustomRankInput(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomRank}
                      className="px-3 py-2 bg-[#1E60D5] text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Авторский титул или чемпионство (отдельной строкой):
            </label>
            <input
              type="text"
              value={formData.sports_title_custom}
              onChange={e => setFormData({ ...formData, sports_title_custom: e.target.value })}
              placeholder="Например: Абсолютный чемпион Almaty Cup 2025, Рекордсмен РК"
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
            />
          </div>
        </div>

        {/* 3. Поиск и выбор клубов Алматы */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Клубы работы в Алматы
          </h3>
          
          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Основной клуб работы *</label>
            <div className="relative">
              <div 
                onClick={() => setIsPrimaryDropdownOpen(!isPrimaryDropdownOpen)}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer active:scale-99 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MapPin className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
                  <span className="text-xs font-bold text-slate-900 truncate">{formData.gym}</span>
                </div>
                <span className="text-[10px] text-[#1E60D5] font-bold shrink-0">Выбрать</span>
              </div>

              {isPrimaryDropdownOpen && (
                <div className="mt-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1.5 animate-in fade-in z-30">
                  <input
                    type="text"
                    placeholder="Поиск клуба..."
                    value={searchPrimaryGym}
                    onChange={e => setSearchPrimaryGym(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredPrimaryGyms.slice(0, 50).map((g, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormData({ ...formData, gym: g });
                          setIsPrimaryDropdownOpen(false);
                          setSearchPrimaryGym('');
                        }}
                        className={`p-2 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 rounded-lg ${
                          formData.gym === g ? 'font-bold text-[#1E60D5] bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{g}</span>
                        {formData.gym === g && <Check className="w-3.5 h-3.5 text-[#1E60D5]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Второй клуб (опционально)</label>
            <div className="relative">
              <div 
                onClick={() => setIsSecondaryDropdownOpen(!isSecondaryDropdownOpen)}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer active:scale-99 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {formData.secondary_gym || 'Не указан (только один клуб)'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold shrink-0">Выбрать</span>
              </div>

              {isSecondaryDropdownOpen && (
                <div className="mt-1.5 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1.5 animate-in fade-in z-30">
                  <input
                    type="text"
                    placeholder="Поиск второго зала..."
                    value={searchSecondaryGym}
                    onChange={e => setSearchSecondaryGym(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    <div
                      onClick={() => {
                        setFormData({ ...formData, secondary_gym: '' });
                        setIsSecondaryDropdownOpen(false);
                      }}
                      className="p-2 text-xs text-rose-600 font-bold cursor-pointer hover:bg-rose-50 rounded-lg"
                    >
                      Очистить второй клуб
                    </div>
                    {filteredSecondaryGyms.slice(0, 50).map((g, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormData({ ...formData, secondary_gym: g });
                          setIsSecondaryDropdownOpen(false);
                          setSearchSecondaryGym('');
                        }}
                        className={`p-2 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 rounded-lg ${
                          formData.secondary_gym === g ? 'font-bold text-[#1E60D5] bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{g}</span>
                        {formData.secondary_gym === g && <Check className="w-3.5 h-3.5 text-[#1E60D5]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Формат ведения и целевая аудитория */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Формат ведения и клиенты
          </h3>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1.5">Формат ведения:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {workFormats.map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, work_format: fmt.id })}
                  className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    formData.work_format === fmt.id
                      ? 'bg-[#1E60D5] text-white border-[#1E60D5] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1.5">Целевая аудитория:</label>
            <div className="space-y-1">
              {targetAudiences.map(aud => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, target_audience: aud.id })}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                    formData.target_audience === aud.id
                      ? 'bg-blue-50 text-[#1E60D5] border-blue-200 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>{aud.label}</span>
                  {formData.target_audience === aud.id && <Check className="w-3.5 h-3.5 text-[#1E60D5] stroke-[2.5]" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Привлечение атлетов и каталог */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Привлечение атлетов и каталог
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Лидогенерация и поиск новых клиентов</p>
            </div>
          </div>

          {/* Плашка в 1 строку */}
          <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-900 font-bold leading-snug truncate">
              Доступно в тарифе Pro и выше
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div 
              onClick={() => setFormData(prev => ({ ...prev, show_in_catalog: !prev.show_in_catalog }))}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-99 transition-all"
            >
              <div className="pr-3">
                <p className="text-xs font-bold text-slate-900 leading-tight">Отображать профиль в каталоге</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">Атлеты города смогут находить вас и записываться</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                formData.show_in_catalog ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.show_in_catalog && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div 
              onClick={() => setFormData(prev => ({ ...prev, has_free_trial: !prev.has_free_trial }))}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-99 transition-all"
            >
              <div className="pr-3">
                <p className="text-xs font-bold text-slate-900 leading-tight">Бесплатная пробная тренировка</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">Вводное занятие в зале для знакомства и старта</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                formData.has_free_trial ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.has_free_trial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div 
              onClick={() => setFormData(prev => ({ ...prev, has_free_consultation: !prev.has_free_consultation }))}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-99 transition-all"
            >
              <div className="pr-3">
                <p className="text-xs font-bold text-slate-900 leading-tight">Бесплатная онлайн-консультация</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">Разбор целей и экспресс-диагностика перед стартом</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                formData.has_free_consultation ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.has_free_consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Прейскурант тренировок и услуг (5 УСЛУГ В ЕДИНОМ СТИЛЕ) */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3.5">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Стоимость тренировок и услуг (₸)
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Включите форматы, которые вы ведёте</p>
          </div>

          {/* 1. Персональные тренировки */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div 
              onClick={() => toggleService('personal')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_enabled.personal ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_enabled.personal && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Персональные тренировки</h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">Индивидуальные занятия в зале (1 на 1)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.services_enabled.personal ? 'text-[#1E60D5] bg-blue-50' : 'text-slate-400 bg-slate-200/60'
              }`}>
                {formData.services_enabled.personal ? 'Активно' : 'Отключено'}
              </span>
            </div>

            {formData.services_enabled.personal && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Время (мин)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.pricing.personal_duration}
                      onChange={e => handlePriceInput('personal_duration', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Разовая (₸)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.pricing.personal_single}
                      onChange={e => handlePriceInput('personal_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Занятий</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.pricing.personal_count}
                      onChange={e => handlePriceInput('personal_count', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Блок (₸)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.pricing.personal_block}
                      onChange={e => handlePriceInput('personal_block', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Сплит-тренировки */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div 
              onClick={() => toggleService('split')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_enabled.split ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_enabled.split && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Сплит-тренировки</h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">Занятия вдвоём с напарником (для пар)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.services_enabled.split ? 'text-[#1E60D5] bg-blue-50' : 'text-slate-400 bg-slate-200/60'
              }`}>
                {editForm => 'Отключено'}
                {formData.services_enabled.split ? 'Активно' : 'Отключено'}
              </span>
            </div>

            {formData.services_enabled.split && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Время (мин)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.split_duration}
                    onChange={e => handlePriceInput('split_duration', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Разовая (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.split_single}
                    onChange={e => handlePriceInput('split_single', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Занятий</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.split_count}
                    onChange={e => handlePriceInput('split_count', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Блок (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.split_block}
                    onChange={e => handlePriceInput('split_block', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Мини-группы */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div 
              onClick={() => toggleService('group')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_enabled.group ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_enabled.group && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Мини-группы</h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">Групповой тренинг в зале (3–5 человек)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.services_enabled.group ? 'text-[#1E60D5] bg-blue-50' : 'text-slate-400 bg-slate-200/60'
              }`}>
                {formData.services_enabled.group ? 'Активно' : 'Отключено'}
              </span>
            </div>

            {formData.services_enabled.group && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Время (мин)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.group_duration}
                    onChange={e => handlePriceInput('group_duration', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Разовая (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.group_single}
                    onChange={e => handlePriceInput('group_single', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Месяц (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.group_month}
                    onChange={e => handlePriceInput('group_month', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Онлайн-ведение */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div 
              onClick={() => toggleService('online')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_enabled.online ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_enabled.online && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Онлайн-ведение</h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">Дистанционный тренинг и КБЖУ (месячный тариф)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.services_enabled.online ? 'text-[#1E60D5] bg-blue-50' : 'text-slate-400 bg-slate-200/60'
              }`}>
                {formData.services_enabled.online ? 'Активно' : 'Отключено'}
              </span>
            </div>

            {formData.services_enabled.online && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div>
                  <label className="text-[9.5px] text-slate-500 block mb-1">Занятий / созвонов в мес</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.online_sessions}
                    onChange={e => handlePriceInput('online_sessions', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-500 block mb-1">Стоимость в месяц (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.online_month}
                    onChange={e => handlePriceInput('online_month', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Онлайн-консультация */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div 
              onClick={() => toggleService('consultation')}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_enabled.consultation ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_enabled.consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Онлайн-консультация</h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">Экспресс-разбор питания, техники и целей (разово)</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                formData.services_enabled.consultation ? 'text-[#1E60D5] bg-blue-50' : 'text-slate-400 bg-slate-200/60'
              }`}>
                {formData.services_enabled.consultation ? 'Активно' : 'Отключено'}
              </span>
            </div>

            {formData.services_enabled.consultation && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 animate-in fade-in">
                <div>
                  <label className="text-[9.5px] text-slate-500 block mb-1">Длительность (мин)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.consultation_duration}
                    onChange={e => handlePriceInput('consultation_duration', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-slate-500 block mb-1">Стоимость консультации (₸)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.pricing.consultation_price}
                    onChange={e => handlePriceInput('consultation_price', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5]"
                    placeholder="10000"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 7. Направления работы и специализации */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2.5">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">
              Направления работы и специализации
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Отметьте цели, с которыми помогаете подопечным</p>
          </div>

          <div className="space-y-1">
            {specializationList.map((spec) => {
              const isSelected = formData.specializations.includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialization(spec)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 text-[#1E60D5] border-blue-200 shadow-2xs font-bold' 
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>{spec}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#1E60D5] stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Подтверждение дипломов и верификация */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E60D5]" />
              <h3 className="text-xs font-bold text-slate-800">
                Верификация и дипломы
              </h3>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-0.5">
              Данные для получения бейджа «Верифицирован ⭐»
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#1E60D5] shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-950 leading-relaxed font-medium">
              Загрузите фото дипломов и сертификатов на онлайн-диск (Google Drive, Яндекс Диск или iCloud) и поделитесь открытой ссылкой для проверки модератором.
            </p>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Ссылка на диск с дипломами / сертификатами
            </label>
            <input
              type="url"
              value={formData.certificates_link}
              onChange={e => setFormData({ ...formData, certificates_link: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-[11px] outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Где проходили обучение (Вуз, Федерация, Школа фитнеса)
            </label>
            <input
              type="text"
              value={formData.education_place}
              onChange={e => setFormData({ ...formData, education_place: e.target.value })}
              placeholder="Название школы, академии или вуза"
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Телефон учебного центра (+7)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-500 font-mono text-xs font-semibold select-none">+7</span>
              <input
                type="tel"
                maxLength={10}
                value={formData.education_contact}
                onChange={e => setFormData({ ...formData, education_contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="7010000000"
                className="w-full pl-7 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Телефон фитнес-зала (+7)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-500 font-mono text-xs font-semibold select-none">+7</span>
              <input
                type="tel"
                maxLength={10}
                value={formData.gym_contact}
                onChange={e => setFormData({ ...formData, gym_contact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="7010000000"
                className="w-full pl-7 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. ЖЁСТКО ПРИЖАТЫЙ НИЖНИЙ ДОК */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3.5 max-w-md mx-auto w-full shadow-lg">
        <button
          type="button"
          disabled={isSubmitting || isUploadingPhoto}
          onClick={handleSubmit}
          className="w-full py-3.5 px-5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Сохранение...' : 'Завершить регистрацию в CoachOS'}</span>
        </button>
      </div>

    </div>
  );
}
