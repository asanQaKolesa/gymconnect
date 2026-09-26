// src/components/trainer/TrainerOnboarding.jsx
import React, { useState, useRef } from 'react';
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
  Gift, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const ALMATY_GYMS = GymsData.ALMATY_GYMS || GymsData.almatyGyms || GymsData.default || [];

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null);
  const fileInputRef = useRef(null);

  // Автоматические данные из Telegram Mini App
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  // 8 специализаций (отображаются без обрезания текста)
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

  // 10 онлайн-продуктов тренера
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

  // Документы партнерского регламента тренера
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
    },
    {
      id: 'pricing_terms',
      title: 'Регламент оказания услуг и взаимодействия с клиентами',
      content: `РЕГЛАМЕНТ ТРЕНЕРСКОЙ ДЕЯТЕЛЬНОСТИ

1. ВЗАИМОРАСЧЕТЫ
1.1. Тренер самостоятельно определяет стоимость персональных и групповых занятий согласно своему прайс-листу.
1.2. При согласии на бесплатную пробную тренировку тренер обязуется провести полноценную вводную консультацию атлету.`
    }
  ];

  // Основной стейт анкеты тренера
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    full_name: tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : '',
    username: tgUser?.username ? tgUser.username.replace('@', '') : '',
    phone: '',
    instagram: '',
    bio: '',

    // Залы
    gym: ALMATY_GYMS[2] || 'Invictus Go | Улица Тимирязева, 42',
    secondary_gym: '',

    // Опыт и направления
    experience_years: 3,
    specializations: ['Набор массы и гипертрофия', 'Снижение веса и сушка'],
    work_format: 'hybrid', // 'offline' | 'online' | 'hybrid'
    target_audience: 'all', // 'all' | 'women' | 'men'

    // Длительность и бесплатные бонусы
    workout_duration: 60,
    has_free_trial: true,
    free_trial_duration: '45',
    free_trial_format: 'both', // 'gym' | 'online' | 'both'
    has_free_consultation: true,

    // Включение услуг
    services_offered: {
      personal: true,
      split: false,
      group: false,
      online: true
    },

    // Прайс-лист
    pricing: {
      personal_single: 8000,
      personal_block: 70000,
      split_single: 12000,
      split_block: 100000,
      group_single: 5000,
      group_block: 45000,
      online_month: 35000
    },

    // Онлайн-продукты
    online_products: ['Индивидуальный план питания и расчет КБЖУ'],
    promote_online_products: true,

    // Верификация
    certificates_link: '',
    gym_phone: '',
    education_phone: '',
    verification_consent: true,
    legal_accepted: false
  });

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

    if (!formData.full_name.trim()) {
      alert('Пожалуйста, укажите ФИО тренера');
      return;
    }

    if (!formData.username.trim()) {
      alert('Пожалуйста, укажите Telegram Username');
      return;
    }

    if (!formData.phone.trim()) {
      alert('Пожалуйста, укажите контактный номер WhatsApp');
      return;
    }

    if (!formData.gym.trim()) {
      alert('Пожалуйста, выберите основной фитнес-клуб');
      return;
    }

    if (!formData.legal_accepted) {
      alert('Для завершения регистрации необходимо подтвердить согласие с партнерскими документами GymConnect.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanUsername = formData.username.trim().replace(/^@+/, '');
      const cleanInstagram = formData.instagram.trim().replace(/^@+/, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Если указаны ссылки и контакты — статус verified, иначе unverified (пока проверяется)
      const hasVerificationData = Boolean(formData.certificates_link.trim() || formData.gym_phone.trim() || formData.education_phone.trim());

      const payload = {
        full_name: formData.full_name.trim(),
        username: cleanUsername,
        phone: cleanPhone,
        photo_url: formData.photo_url,
        avatar_url: formData.photo_url,
        instagram: cleanInstagram,
        bio: formData.bio.trim(),
        gym: formData.gym,
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
        certificates_link: formData.certificates_link.trim(),
        gym_contact: formData.gym_phone.trim(),
        education_contact: formData.education_phone.trim(),
        verification_consent: formData.verification_consent,
        legal_accepted: formData.legal_accepted,
        verification_status: hasVerificationData ? 'pending_verification' : 'unverified',
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('trainer_profiles')
        .upsert([payload], { onConflict: 'username' });

      if (error) throw error;

      alert('Ваша анкета в CoachOS успешно отправлена! Профиль появится в каталоге после проверки администратором.');
      
      if (onComplete) {
        onComplete(cleanUsername);
      } else {
        handleBackAction();
      }
    } catch (err) {
      console.error('Ошибка отправки анкеты тренера:', err);
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-3.5 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-3.5 pt-1 pb-16">
        
        {/* 1. ОТДЕЛЬНАЯ НЕЗАВИСИМАЯ КНОПКА ВОЗВРАТА */}
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

        {/* 2. ЕДИНЫЙ ЛАКОНИЧНЫЙ ЗАГОЛОВОК (БЕЗ ДУБЛИРОВАНИЯ) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-1">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-1.5 shadow-sm">
            <Dumbbell className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Анкета фитнес-тренера
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Официальная аккредитация тренеров в клубах Алматы и подключение к CoachOS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

          {/* 3. ПРОФИЛЬ ТРЕНЕРА + О СЕБЕ СРАЗУ ЗДЕСЬ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Профиль тренера
              </span>
            </div>

            {/* Фото с кнопкой замены */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md bg-slate-100 flex items-center justify-center">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Аватар тренера" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-slate-400" />
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
              <p className="text-[10px] text-slate-400 mt-1.5 font-normal">Синхронизировано с Telegram • нажмите для замены</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                ФИО тренера <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Данияр Сериков"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Telegram Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[@\s]/g, '') })}
                    placeholder="coach_nick"
                    className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  WhatsApp (+7) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="7011234567"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
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

            {/* Блок «О себе» поднят сюда */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                О себе, спортивных званиях и методике
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="КМС по пауэрлифтингу, диплом академии фитнеса. Веду клиентов с фокусом на здоровье суставов и чистую технику..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:outline-none focus:border-blue-600 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 4. ЗАЛЫ ДЛЯ ТРЕНИРОВОК (БЕЙДЖ В ОДНУ СТРОКУ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 whitespace-nowrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                2. Залы проведения тренировок
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200 shrink-0">
                База 230+ клубов
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Основной фитнес-клуб <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gym}
                onChange={e => setFormData({ ...formData, gym: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 truncate"
              >
                {ALMATY_GYMS.slice(0, 80).map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Второй зал для тренировок <span className="text-slate-400 font-normal">(не обязательно)</span>
              </label>
              <select
                value={formData.secondary_gym}
                onChange={e => setFormData({ ...formData, secondary_gym: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 truncate"
              >
                <option value="">Не указан (тренирую в одном зале)</option>
                {ALMATY_GYMS.slice(0, 80).map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. СТАЖ И СПЕЦИАЛИЗАЦИЯ (БЕЗ ТРОЕТОЧИЯ, ПОЛНЫЙ ТЕКСТ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Стаж и направления
              </span>
            </div>

            {/* Apple Степпер опыта */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Опыт работы тренером</p>
                <p className="text-[10px] text-slate-500">Подтвержденный стаж ведения атлетов</p>
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

            {/* Специализации без троеточия (полная видимость) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Специализации (выберите ваши профильные направления)
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
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
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

            {/* Формат ведения: заголовок сверху, пояснение снизу в 2 строки */}
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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

            {/* С кем вы работаете (3 варианта) */}
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

          {/* 6. УСЛОВИЯ И БОНУСЫ (ПРОБНЫЕ ТРЕНИРОВКИ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                4. Условия и промо-бонусы
              </span>
            </div>

            {/* Разъясняющий текст */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
              Мы публикуем вас в каталоге проверенных тренеров. Вы не обязаны проводить бесплатные тренировки, но атлеты охотнее выбирают наставников, готовых провести первичное знакомство.
            </div>

            {/* Длительность обычной тренировки */}
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mins} мин
                  </button>
                ))}
              </div>
            </div>

            {/* Тумблер: Бесплатная пробная тренировка */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div 
                onClick={() => setFormData({ ...formData, has_free_trial: !formData.has_free_trial })}
                className="flex items-center justify-between cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Бесплатная пробная тренировка</p>
                    <p className="text-[10px] text-slate-500">Знакомство с атлетом в зале или онлайн</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  formData.has_free_trial ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
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
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
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
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="gym">В моем зале</option>
                      <option value="online">Онлайн</option>
                      <option value="both">И в зале, и онлайн</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Тумблер: Бесплатная консультация */}
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
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                formData.has_free_consultation ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.has_free_consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* 7. УСЛУГИ И ПРАЙС-ЛИСТ (ПО ВЫБОРУ С ЦЕНОЙ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                5. Услуги и прайс-лист (₸)
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                По желанию
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Отметьте галочками только те форматы, которые вы фактически проводите, и укажите стоимость:
            </p>

            {/* Персональные 1 на 1 */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div 
                onClick={() => toggleServiceOffered('personal')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900">1. Персональные тренировки (1 на 1)</span>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  formData.services_offered.personal ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.personal && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.personal && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Разовое занятие (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.personal_single}
                      onChange={e => handlePriceChange('personal_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Абонемент 10-12 зан. (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.personal_block}
                      onChange={e => handlePriceChange('personal_block', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Сплит тренировки */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div 
                onClick={() => toggleServiceOffered('split')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900">2. Сплит-тренировки (пара, 2 друга)</span>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  formData.services_offered.split ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.split && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.split && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Разовое за двоих (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.split_single}
                      onChange={e => handlePriceChange('split_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Абонемент за двоих (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.split_block}
                      onChange={e => handlePriceChange('split_block', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Мини-группы */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div 
                onClick={() => toggleServiceOffered('group')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900">3. Мини-группы (до 3–5 человек)</span>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  formData.services_offered.group ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.group && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.group && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">С человека / занятие (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.group_single}
                      onChange={e => handlePriceChange('group_single', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Абонемент группы (₸)</label>
                    <input
                      type="number"
                      value={formData.pricing.group_block}
                      onChange={e => handlePriceChange('group_block', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Онлайн ведение */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div 
                onClick={() => toggleServiceOffered('online')}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900">4. Онлайн-ведение (месяц)</span>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  formData.services_offered.online ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.services_offered.online && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {formData.services_offered.online && (
                <div className="pt-1">
                  <label className="text-[10px] text-slate-500 block mb-0.5">Стоимость ведения за 1 месяц (₸)</label>
                  <input
                    type="number"
                    value={formData.pricing.online_month}
                    onChange={e => handlePriceChange('online_month', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 8. ОНЛАЙН-ПРОДУКТЫ ТРЕНЕРА (ДО 10 ПРОДУКТОВ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                6. Ваши онлайн-продукты
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                Маркетплейс
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Отметьте готовые продукты, которые вы продаете атлетам в Алматы и онлайн:
            </p>

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
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ml-2 ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div 
              onClick={() => setFormData({ ...formData, promote_online_products: !formData.promote_online_products })}
              className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-950">Продвигать мои продукты через GymConnect</span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                formData.promote_online_products ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.promote_online_products && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* 9. ВЕРИФИКАЦИЯ (НЕОБЯЗАТЕЛЬНО: ВЕРИФИЦИРОВАН / НЕ ВЕРИФИЦИРОВАН) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                7. Верификация квалификации
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                По желанию
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed">
              Вы можете не указывать дипломы и телефоны — тогда профиль получит статус <b>«Не верифицирован»</b>. При предоставлении открытой ссылки на сертификаты и контактов зала ваш профиль получит статус <b>«Верифицирован ✔️»</b> и приоритет в каталоге.
            </div>

            {/* Google Drive ссылка */}
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
              <p className="text-[10px] text-slate-400 mt-1">Откройте доступ «Все, у кого есть ссылка» для проверки</p>
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
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 cursor-pointer active:scale-98"
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                formData.verification_consent ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.verification_consent && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <p className="text-[10px] text-slate-700 leading-snug">
                Даю согласие администрации GymConnect на проверку квалификации, сертификатов и статуса резидента в указанном зале и академии.
              </p>
            </div>
          </div>

          {/* 10. ДОКУМЕНТЫ ДЛЯ ОЗНАКОМЛЕНИЯ ПАРТНЕРА И СОГЛАСИЕ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                8. Партнерские документы
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Обязательно
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Ознакомьтесь с условиями партнерской оферты тренера перед отправкой:
            </p>

            <div className="space-y-1.5">
              {trainerLegalDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveLegalModal(doc)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-slate-800 line-clamp-1">{doc.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </div>
              ))}
            </div>

            {/* Главный юридический чекбокс согласия */}
            <div 
              onClick={() => setFormData({ ...formData, legal_accepted: !formData.legal_accepted })}
              className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2.5 cursor-pointer active:scale-98"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
                formData.legal_accepted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.legal_accepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <p className="text-[10.5px] text-blue-950 leading-snug">
                Я подтверждаю достоверность данных, ознакомился с документами и <b>даю согласие на использование моих фото, материалов и анкеты</b> в каталоге и социальных сетях GymConnect.
              </p>
            </div>
          </div>

          {/* Финальная кнопка */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !formData.legal_accepted}
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
