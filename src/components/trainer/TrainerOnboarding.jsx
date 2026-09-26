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
  Gift, 
  Link as LinkIcon, 
  FileText, 
  HelpCircle, 
  X, 
  Search,
  MapPin
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null);
  const fileInputRef = useRef(null);

  // Стейты живого поиска залов
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);

  const [secondaryGymSearchQuery, setSecondaryGymSearchQuery] = useState('');
  const [isSecondaryGymDropdownOpen, setIsSecondaryGymDropdownOpen] = useState(false);

  // Данные из Telegram Mini App
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  // 8 специализаций тренера
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

  // 10 онлайн-продуктов
  const onlineProductsList = [
    'Индивидуальный план питания и расчет КБЖУ',
    'Готовая программа тренировок для дома (без инвентаря)',
    'Программа тренировок в зале (Full Body / Split)',
    'Марафон похудения и сушки (с чатом поддержки)',
    'Курс силового набора мышечной массы',
    'Комплекс «Здоровая спина и осанка»',
    'Подготовка к соревнованиям (Бодибилдинг / Фитнес-бикини)',
    'Комплекс растяжки, мобильности суставов и МФР',
    'Интенсивная программа жиросжигания (HIIT / Табата)',
    'Личный онлайн-коучинг с ежедневным контролем 24/7'
  ];

  // Партнерские документы
  const trainerLegalDocs = [
    {
      id: 'trainer_offer',
      title: 'Публичный партнерский договор-оферта для тренеров',
      content: `ПУБЛИЧНЫЙ ПАРТНЕРСКИЙ ДОГОВОР-ОФЕРТА GYMCONNECT COACHOS
г. Алматы, Республика Казахстан

1. ПРЕДМЕТ ДОГОВОРА
1.1. GymConnect предоставляет сертифицированному тренеру доступ к экосистеме CoachOS: ведению расписания, размещению в каталоге проверенных наставников и учету клиентов.
1.2. Тренер обязуется оказывать услуги качественно, соблюдать спортивную этику и правила залов Алматы.`
    },
    {
      id: 'trainer_privacy',
      title: 'Политика обработки и защиты данных тренеров',
      content: `ПОЛИТИКА ОБРАБОТКИ ДАННЫХ ТРЕНЕРОВ
В соответствии с Законом РК «О персональных данных и их защите»

1. ОБРАБАТЫВАЕМЫЕ ДАННЫЕ
1.1. GymConnect обрабатывает ФИО, контакты, сертификаты, фотографии и сведения о квалификации тренера.
1.2. Данные хранятся в защищенном облаке Supabase с использованием RLS.`
    },
    {
      id: 'media_consent',
      title: 'Согласие на публикацию анкеты, фото и материалов в GymConnect',
      content: `СОГЛАСИЕ НА ПУБЛИКАЦИЮ И МЕДИА-ИСПОЛЬЗОВАНИЕ

1. Настоящим тренер дает безоговорочное согласие сервису GymConnect на:
1.1. Размещение профиля, фотографии, регалий и прайс-листа в публичном каталоге Telegram Mini App.
1.2. Использование материалов анкеты в официальных социальных сетях и каналах GymConnect для продвижения тренерских услуг.`
    }
  ];

  // Основной стейт анкеты
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    first_name: tgUser?.first_name || '',
    last_name: tgUser?.last_name || '',
    username: tgUser?.username ? tgUser.username.replace('@', '') : '',
    phone: '',
    instagram: '',
    bio: '',

    // Залы (не обязательно)
    gym: '',
    secondary_gym: '',

    // Опыт и направления (не обязательно)
    experience_years: 3,
    specializations: ['Набор массы и гипертрофия'],
    work_format: 'hybrid',
    target_audience: 'all',

    // Длительность и бонусы
    workout_duration: 60,
    has_free_trial: false,
    free_trial_duration: '45',
    free_trial_format: 'both',
    has_free_consultation: false,

    // Услуги и прайс
    services_offered: {
      personal: true,
      split: false,
      group: false,
      online: true
    },

    pricing: {
      personal_single: 8000,
      personal_count: 12,
      personal_block: 70000,

      split_single: 12000,
      split_count: 12,
      split_block: 100000,

      group_single: 5000,
      group_count: 12,
      group_block: 45000,

      online_sessions: 8,
      online_month: 35000
    },

    // Онлайн-продукты
    online_products: ['Индивидуальный план питания и расчет КБЖУ'],
    promote_online_products: false,

    // Верификация
    certificates_link: '',
    gym_phone: '',
    education_phone: '',
    verification_consent: false,
    legal_accepted: false
  });

  const filteredPrimaryGyms = useMemo(() => {
    if (!gymSearchQuery.trim()) return GYMS_ARRAY.slice(0, 35);
    return GYMS_ARRAY.filter(g => typeof g === 'string' && g.toLowerCase().includes(gymSearchQuery.toLowerCase()));
  }, [gymSearchQuery]);

  const filteredSecondaryGyms = useMemo(() => {
    if (!secondaryGymSearchQuery.trim()) return GYMS_ARRAY.slice(0, 35);
    return GYMS_ARRAY.filter(g => typeof g === 'string' && g.toLowerCase().includes(secondaryGymSearchQuery.toLowerCase()));
  }, [secondaryGymSearchQuery]);

  const handleBackAction = () => {
    if (typeof onExitToProfile === 'function') {
      onExitToProfile();
    } else if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.href = window.location.pathname + '?tab=profile';
    }
  };

  const toggleSpecialization = (label) => {
    setFormData(prev => {
      const exists = prev.specializations.includes(label);
      const updated = exists 
        ? prev.specializations.filter(s => s !== label) 
        : [...prev.specializations, label];
      return { ...prev, specializations: updated };
    });
  };

  const toggleOnlineProduct = (product) => {
    setFormData(prev => {
      const exists = prev.online_products.includes(product);
      const updated = exists 
        ? prev.online_products.filter(p => p !== product) 
        : [...prev.online_products, product];
      return { ...prev, online_products: updated };
    });
  };

  const toggleServiceOffered = (serviceKey) => {
    setFormData(prev => ({
      ...prev,
      services_offered: {
        ...prev.services_offered,
        [serviceKey]: !prev.services_offered[serviceKey]
      }
    }));
  };

  const handlePriceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: Number(value) || 0
      }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5 МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // СТРОГО ОБЯЗАТЕЛЬНЫЕ ПОЛЯ: Имя, Фамилия, WhatsApp
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
      const fullNameCombined = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

      // Базовый полный объект для сохранения
      let payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: fullNameCombined,
        username: cleanUsername,
        phone: fullPhone,
        photo_url: formData.photo_url || null,
        avatar_url: formData.photo_url || null,
        instagram: cleanInstagram,
        bio: formData.bio ? formData.bio.trim() : '',
        gym: formData.gym ? formData.gym : (GYMS_ARRAY[2] || 'Invictus Go'),
        secondary_gym: formData.secondary_gym || null,
        experience_years: Number(formData.experience_years) || 1,
        specializations: formData.specializations,
        specialization: formData.specializations.join(', '),
        work_format: formData.work_format,
        target_audience: formData.target_audience,
        workout_duration: Number(formData.workout_duration) || 60,
        has_free_trial: formData.has_free_trial,
        free_trial_duration: formData.free_trial_duration,
        free_trial_format: formData.free_trial_format,
        has_free_consultation: formData.has_free_consultation,
        services_offered: formData.services_offered,
        pricing: formData.pricing,
        online_products: formData.online_products,
        promote_online_products: formData.promote_online_products,
        certificates_link: formData.certificates_link ? formData.certificates_link.trim() : '',
        gym_contact: formData.gym_phone ? formData.gym_phone.trim() : '',
        education_contact: formData.education_phone ? formData.education_phone.trim() : '',
        verification_consent: formData.verification_consent,
        legal_accepted: formData.legal_accepted,
        verification_status: 'unverified',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // САМОВОССТАНАВЛИВАЮЩИЙСЯ ЦИКЛ СОХРАНЕНИЯ:
      // Если в таблице Supabase не хватает какой-то колонки, мы автоматически убираем ее и сохраняем без ошибок!
      let saveSuccess = false;
      for (let attempt = 0; attempt < 12; attempt++) {
        const { error } = await supabase
          .from('trainer_profiles')
          .upsert([payload], { onConflict: 'username' });

        if (!error) {
          saveSuccess = true;
          break;
        }

        // Поиск отсутствующей колонки в сообщении ошибки PostgREST
        const missingMatch = error.message.match(/Could not find the '([^']+)' column/i);
        if (missingMatch && missingMatch[1] && payload[missingMatch[1]] !== undefined) {
          console.warn(`Колонка "${missingMatch[1]}" отсутствует в таблице trainer_profiles, пропускаем её...`);
          delete payload[missingMatch[1]];
        } else {
          // Другая ошибка (например RLS или сеть)
          throw error;
        }
      }

      if (!saveSuccess) {
        throw new Error('Не удалось согласовать поля с базой данных.');
      }

      alert('Ваша заявка в CoachOS успешно зарегистрирована! Профиль будет проверен администратором.');
      
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
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-3.5 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-3.5 pt-1 pb-16">
        
        {/* Кнопка Назад */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700 active:scale-95 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Назад в профиль</span>
          </button>

          <span className="text-[10px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            GymConnect CoachOS
          </span>
        </div>

        {/* Заголовок */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-1.5">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-1 shadow-sm">
            <Dumbbell className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Анкета фитнес-тренера
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-normal">
            Добавьтесь в единую базу GymConnect и зарабатывайте вместе с нами. Держите под полным контролем учет ваших финансов, посещения ваших учеников и тренировочный прогресс через CRM-систему CoachOS.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

          {/* 1. ПРОФИЛЬ ТРЕНЕРА — ИМЯ, ФАМИЛИЯ И WHATSAPP ОБЯЗАТЕЛЬНЫ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Профиль тренера
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Обязательный блок
              </span>
            </div>

            {/* Фото */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Аватар тренера" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-slate-400 stroke-[1.6]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Имя и Фамилия — оба обязательные */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Имя тренера <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Данияр"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Фамилия тренера <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Сериков"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Telegram Username
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[@\s]/g, '') })}
                    placeholder="coach_nick"
                    className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-mono text-xs font-semibold select-none">+7</span>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="701 123 45 67"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Instagram профиль <span className="text-slate-400 font-normal">(не обязательно)</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value.replace(/[@\s]/g, '') })}
                  placeholder="coach_fit"
                  className="w-full pl-6 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                О себе, спортивных званиях и методиках <span className="text-slate-400 font-normal">(не обязательно)</span>
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Мастер спорта РК, специализируюсь на силовом тренинге и рекомпозиции. Ставлю идеальную биомеханику базы, довожу до результата без срывов и жестких голодовок..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:border-blue-600 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 2. ЗАЛЫ ДЛЯ ТРЕНИРОВОК (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 whitespace-nowrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                2. Залы проведения тренировок
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                По желанию
              </span>
            </div>

            {/* Выбор основного зала */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Основной фитнес-клуб
              </label>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">{formData.gym || 'Клуб не выбран — найдите в списке'}</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={gymSearchQuery}
                    onFocus={() => setIsGymDropdownOpen(true)}
                    onChange={e => {
                      setGymSearchQuery(e.target.value);
                      setIsGymDropdownOpen(true);
                    }}
                    placeholder="Поиск зала по названию (Invictus, Adrenaline...)"
                    className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  {gymSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGymSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isGymDropdownOpen && (
                  <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 z-30">
                    {filteredPrimaryGyms.map((gymName, index) => {
                      const isSelected = formData.gym === gymName;
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setFormData({ ...formData, gym: gymName });
                            setIsGymDropdownOpen(false);
                            setGymSearchQuery('');
                          }}
                          className={`p-2.5 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                            isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <span className="line-clamp-1">{gymName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Выбор второго зала */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Второй зал для тренировок
              </label>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{formData.secondary_gym || 'Не указан'}</span>
                  </div>
                  {formData.secondary_gym && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, secondary_gym: '' })}
                      className="text-[10px] text-rose-500 hover:underline font-semibold"
                    >
                      Очистить
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={secondaryGymSearchQuery}
                    onFocus={() => setIsSecondaryGymDropdownOpen(true)}
                    onChange={e => {
                      setSecondaryGymSearchQuery(e.target.value);
                      setIsSecondaryGymDropdownOpen(true);
                    }}
                    placeholder="Поиск второго зала по названию..."
                    className="w-full pl-8 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  {secondaryGymSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSecondaryGymSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isSecondaryGymDropdownOpen && (
                  <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 z-30">
                    <div
                      onClick={() => {
                        setFormData({ ...formData, secondary_gym: '' });
                        setIsSecondaryGymDropdownOpen(false);
                        setSecondaryGymSearchQuery('');
                      }}
                      className="p-2.5 text-xs cursor-pointer text-slate-400 hover:bg-slate-50 italic"
                    >
                      — Не указывать второй зал
                    </div>
                    {filteredSecondaryGyms.map((gymName, index) => {
                      const isSelected = formData.secondary_gym === gymName;
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setFormData({ ...formData, secondary_gym: gymName });
                            setIsSecondaryGymDropdownOpen(false);
                            setSecondaryGymSearchQuery('');
                          }}
                          className={`p-2.5 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                            isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <span className="line-clamp-1">{gymName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. СТАЖ И СПЕЦИАЛИЗАЦИЯ (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Стаж и направления
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                По желанию
              </span>
            </div>

            {/* Степпер опыта */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Опыт работы тренером</p>
                <p className="text-[10px] text-slate-500">Стаж ведения атлетов</p>
              </div>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 active:scale-90 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900 font-mono w-14 text-center">
                  {formData.experience_years} {formData.experience_years === 1 ? 'год' : formData.experience_years < 5 ? 'года' : 'лет'}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, experience_years: Math.min(35, prev.experience_years + 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 active:scale-90 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Специализации */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Специализации (выберите профильные направления)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {specializationList.map((spec) => {
                  const isSelected = formData.specializations.includes(spec);
                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/25' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{spec}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Формат ведения: 2 строки */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Формат ведения клиентов
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'offline', title: 'Офлайн', sub: 'в зале' },
                  { id: 'online', title: 'Онлайн', sub: 'ведение' },
                  { id: 'hybrid', title: 'Гибрид', sub: 'зал + чат' }
                ].map(fmt => (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => setFormData({ ...formData, work_format: fmt.id })}
                    className={`py-2 px-1 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                      formData.work_format === fmt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/25'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{fmt.title}</span>
                    <span className={`text-[10px] leading-tight ${formData.work_format === fmt.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {fmt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Аудитория */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                С кем вы работаете
              </label>
              <select
                value={formData.target_audience}
                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Со всеми (и мужчины, и женщины)</option>
                <option value="women">Только девушки и женщины</option>
                <option value="men">Только мужчины</option>
              </select>
            </div>
          </div>

          {/* 4. УСЛОВИЯ И БОНУСЫ (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                4. Условия и промо-бонусы
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                По желанию
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 leading-relaxed font-normal space-y-1">
              <p className="font-semibold text-slate-900">Размещение в каталоге наставников:</p>
              <p>
                Мы публикуем вашу анкету в каталоге тренеров Алматы. Проведение бесплатного вводного занятия не обязательно, но позволяет презентовать свой подход и быстрее привлечь постоянных клиентов.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Длительность стандартной тренировки
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[45, 60, 75, 90].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, workout_duration: mins })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.workout_duration === mins
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/25'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mins} мин
                  </button>
                ))}
              </div>
            </div>

            {/* Бесплатная тренировка */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div 
                onClick={() => setFormData({ ...formData, has_free_trial: !formData.has_free_trial })}
                className="flex items-center justify-between cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Бесплатная пробная тренировка</p>
                    <p className="text-[10px] text-slate-500">Знакомство с атлетом в зале или онлайн</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.has_free_trial ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-300'
                }`}>
                  {formData.has_free_trial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {formData.has_free_trial && (
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Длительность пробы</label>
                    <select
                      value={formData.free_trial_duration}
                      onChange={e => setFormData({ ...formData, free_trial_duration: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value="30">30 минут</option>
                      <option value="45">45 минут</option>
                      <option value="60">60 минут</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Где проводите</label>
                    <select
                      value={formData.free_trial_format}
                      onChange={e => setFormData({ ...formData, free_trial_format: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    >
                      <option value="gym">В моем зале</option>
                      <option value="online">Онлайн</option>
                      <option value="both">И в зале, и онлайн</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Бесплатная консультация */}
            <div 
              onClick={() => setFormData({ ...formData, has_free_consultation: !formData.has_free_consultation })}
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Бесплатная разовая консультация</p>
                  <p className="text-[10px] text-slate-500">Разбор текущего питания, замеры и цели</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                formData.has_free_consultation ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-300'
              }`}>
                {formData.has_free_consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* 5. УСЛУГИ И ПРАЙС-ЛИСТ (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                5. Услуги и стоимость (₸)
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                По желанию
              </span>
            </div>

            {/* 1. Персональные */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div 
                onClick={() => toggleServiceOffered('personal')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">1. Персональные тренировки (1 на 1)</p>
                  <p className="text-[10px] text-slate-500">Индивидуальное ведение в тренажерном зале</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_offered.personal ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.personal && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.personal && (
                <div className="space-y-2 pt-1 border-t border-slate-200/70">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Стоимость разового занятия (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.personal_single}
                      onChange={e => handlePriceChange('personal_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600">Пакетный абонемент</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Кол-во занятий</label>
                        <input
                          type="number"
                          value={formData.pricing.personal_count}
                          onChange={e => handlePriceChange('personal_count', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Цена пакета (₸)</label>
                        <input
                          type="number"
                          value={formData.pricing.personal_block}
                          onChange={e => handlePriceChange('personal_block', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Сплит-тренировки */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div 
                onClick={() => toggleServiceOffered('split')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">2. Сплит-тренировки (для двоих)</p>
                  <p className="text-[10px] text-slate-500">Занятия для пар, мужа и жены или двух друзей</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_offered.split ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.split && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.split && (
                <div className="space-y-2 pt-1 border-t border-slate-200/70">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Разовая тренировка за двоих (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.split_single}
                      onChange={e => handlePriceChange('split_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600">Абонемент за двоих</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Кол-во занятий</label>
                        <input
                          type="number"
                          value={formData.pricing.split_count}
                          onChange={e => handlePriceChange('split_count', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Цена пакета (₸)</label>
                        <input
                          type="number"
                          value={formData.pricing.split_block}
                          onChange={e => handlePriceChange('split_block', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Мини-группы */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div 
                onClick={() => toggleServiceOffered('group')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">3. Мини-группы (до 3–5 человек)</p>
                  <p className="text-[10px] text-slate-500">Групповой формат с индивидуальным вниманием</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_offered.group ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.group && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.group && (
                <div className="space-y-2 pt-1 border-t border-slate-200/70">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Разовое занятие с 1 человека (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.group_single}
                      onChange={e => handlePriceChange('group_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-600">Абонемент в мини-группе</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Кол-во занятий</label>
                        <input
                          type="number"
                          value={formData.pricing.group_count}
                          onChange={e => handlePriceChange('group_count', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Цена абонемента (₸)</label>
                        <input
                          type="number"
                          value={formData.pricing.group_block}
                          onChange={e => handlePriceChange('group_block', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Онлайн ведение */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div 
                onClick={() => toggleServiceOffered('online')}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">4. Онлайн-ведение и сопровождение</p>
                  <p className="text-[10px] text-slate-500">Дистанционный план питания, контроль техники и чат</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  formData.services_offered.online ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.online && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.online && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Видео-разборов в мес.</label>
                    <input
                      type="number"
                      value={formData.pricing.online_sessions}
                      onChange={e => handlePriceChange('online_sessions', e.target.value)}
                      placeholder="8 созвонов"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Стоимость в месяц (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.online_month}
                      onChange={e => handlePriceChange('online_month', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 6. ОНЛАЙН-ПРОДУКТЫ ТРЕНЕРА (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                6. Ваши онлайн-продукты
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold border border-slate-200">
                Маркетплейс
              </span>
            </div>

            <div className="space-y-1.5">
              {onlineProductsList.map((product) => {
                const isSelected = formData.online_products.includes(product);
                return (
                  <div
                    key={product}
                    onClick={() => toggleOnlineProduct(product)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition-all ${
                      isSelected ? 'bg-blue-50/70 border-blue-400 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{product}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ml-2 transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. ВЕРИФИКАЦИЯ (НЕОБЯЗАТЕЛЬНО) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                7. Верификация квалификации
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                По желанию
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 leading-relaxed font-normal space-y-1">
              <p className="font-semibold text-slate-900">Статус подтвержденного тренера:</p>
              <p>
                Заполнение данного раздела не является обязательным. Без ссылок на документы ваш профиль получит базовый статус <b>«Не верифицирован»</b>. При предоставлении дипломов и контактов заведений вы получаете отметку <b>«Верифицирован ✔️»</b> и приоритет в каталоге.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Ссылка на Google Диск / облако с сертификатами
              </label>
              <div className="relative flex items-center">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="url"
                  value={formData.certificates_link}
                  onChange={e => setFormData({ ...formData, certificates_link: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Откройте доступ «Все, у кого есть ссылка» для модерации</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Телефон фитнес-клуба
                </label>
                <input
                  type="text"
                  value={formData.gym_phone}
                  onChange={e => setFormData({ ...formData, gym_phone: e.target.value })}
                  placeholder="Рецепция / Админ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Телефон школы / академии
                </label>
                <input
                  type="text"
                  value={formData.education_phone}
                  onChange={e => setFormData({ ...formData, education_phone: e.target.value })}
                  placeholder="Академия / Федерация"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div 
              onClick={() => setFormData({ ...formData, verification_consent: !formData.verification_consent })}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all"
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                formData.verification_consent ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-300'
              }`}>
                {formData.verification_consent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="text-left leading-snug">
                <p className="text-xs font-semibold text-slate-900">
                  Согласие на подтверждение квалификации
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Даю согласие администрации GymConnect на проверку предоставленных сертификатов и уточнение статуса резидента в фитнес-клубе.
                </p>
              </div>
            </div>
          </div>

          {/* 8. ПАРТНЕРСКИЕ ДОКУМЕНТЫ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                8. Партнерские документы
              </span>
            </div>

            <div className="space-y-1.5">
              {trainerLegalDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveLegalModal(doc)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="font-semibold text-slate-800 line-clamp-1">{doc.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </div>
              ))}
            </div>

            <div 
              onClick={() => setFormData({ ...formData, legal_accepted: !formData.legal_accepted })}
              className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all"
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 transition-colors ${
                formData.legal_accepted ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-300'
              }`}>
                {formData.legal_accepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="text-left leading-snug">
                <p className="text-xs font-bold text-blue-950">
                  Принимаю условия партнерских документов
                </p>
                <p className="text-[10px] text-blue-900 mt-0.5">
                  Подтверждаю достоверность данных и <b>даю согласие на размещение анкеты, фото и материалов</b> в каталоге и социальных сетях GymConnect.
                </p>
              </div>
            </div>
          </div>

          {/* Финальная кнопка */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Отправка заявки...' : 'Завершить регистрацию в CoachOS'}</span>
            </button>
          </div>

        </form>

      </div>

      {/* Модальное окно чтения документов тренера */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{activeLegalModal.title}</h3>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {activeLegalModal.content}
            </div>

            <button
              type="button"
              onClick={() => setActiveLegalModal(null)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-98"
            >
              Понятно, закрыть
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
