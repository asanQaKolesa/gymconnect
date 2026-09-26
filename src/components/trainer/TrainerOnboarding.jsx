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
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const ALMATY_GYMS = GymsData.ALMATY_GYMS || GymsData.almatyGyms || GymsData.default || [];

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Данные из Telegram Mini App
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  // 8 специализаций для выбора
  const specializationList = [
    { id: 'mass', label: 'Набор массы и гипертрофия' },
    { id: 'cut', label: 'Снижение веса и сушка' },
    { id: 'recomp', label: 'Рекомпозиция и тонус' },
    { id: 'power', label: 'Пауэрлифтинг и сила' },
    { id: 'rehab', label: 'Реабилитация и ЛФК (травмы)' },
    { id: 'posture', label: 'Осанка и здоровая спина' },
    { id: 'functional', label: 'Функциональный тренинг' },
    { id: 'beginners', label: 'ОФП для новичков и подростков' }
  ];

  // Стейт анкеты CoachOS
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    full_name: tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : '',
    username: tgUser?.username ? tgUser.username.replace('@', '') : '',
    phone: '',
    instagram: '',

    // Залы
    gym: ALMATY_GYMS[2] || 'Invictus Go | Улица Тимирязева, 42',
    secondary_gym: '',

    // Опыт и специализация
    experience_years: 3,
    specializations: ['Набор массы и гипертрофия'],
    work_format: 'hybrid', // 'offline' | 'online' | 'hybrid'
    target_audience: 'all', // 'all' | 'men' | 'women' | 'teens'
    languages: ['Қазақша', 'Русский'],

    // Продолжительность и бонусы
    workout_duration: 60, // 45, 60, 75, 90 мин
    has_free_trial: false,
    has_free_consultation: true,

    // Прайс-лист и услуги (тенге)
    pricing: {
      personal_single: 8000,
      personal_block: 70000, // абонемент 10-12 зан.
      split_single: 12000,
      split_block: 100000,
      group_single: 5000,
      group_block: 45000,
      online_month: 35000
    },

    // О себе и верификация
    bio: '',
    certificates_link: '',
    gym_contact: '',
    education_contact: '',
    verification_consent: true
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

  const toggleLanguage = (lang) => {
    setFormData(prev => {
      const exists = prev.languages.includes(lang);
      const updated = exists 
        ? prev.languages.filter(l => l !== lang) 
        : [...prev.languages, lang];
      return { ...prev, languages: updated };
    });
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
      alert('Пожалуйста, укажите WhatsApp номер телефона');
      return;
    }

    if (!formData.gym.trim()) {
      alert('Пожалуйста, выберите основной фитнес-клуб');
      return;
    }

    if (!formData.verification_consent) {
      alert('Необходимо подтвердить согласие на верификацию квалификации');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanUsername = formData.username.trim().replace(/^@+/, '');
      const cleanInstagram = formData.instagram.trim().replace(/^@+/, '');
      const cleanPhone = formData.phone.replace(/\D/g, '');

      const payload = {
        full_name: formData.full_name.trim(),
        username: cleanUsername,
        phone: cleanPhone,
        photo_url: formData.photo_url,
        avatar_url: formData.photo_url,
        instagram: cleanInstagram,
        gym: formData.gym,
        secondary_gym: formData.secondary_gym || null,
        experience_years: Number(formData.experience_years) || 1,
        specializations: formData.specializations,
        specialization: formData.specializations.join(', '),
        work_format: formData.work_format,
        target_audience: formData.target_audience,
        languages: formData.languages,
        workout_duration: Number(formData.workout_duration) || 60,
        has_free_trial: formData.has_free_trial,
        has_free_consultation: formData.has_free_consultation,
        pricing: formData.pricing,
        bio: formData.bio.trim(),
        certificates_link: formData.certificates_link.trim(),
        gym_contact: formData.gym_contact.trim(),
        education_contact: formData.education_contact.trim(),
        verification_consent: formData.verification_consent,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('trainer_profiles')
        .upsert([payload], { onConflict: 'username' });

      if (error) throw error;

      alert('Ваша заявка в GymConnect CoachOS успешно зарегистрирована! Модерация свяжется с вами после проверки документов.');
      
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
      <div className="max-w-md mx-auto w-full space-y-3.5 pt-2 pb-16">
        
        {/* Верхний App Bar */}
        <div className="bg-white rounded-2xl py-3 px-4 shadow-sm border border-slate-100 flex items-center justify-between sticky top-0 z-40">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Назад в профиль</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-xs font-bold text-slate-900">CoachOS Регистрация</h2>
            <p className="text-[10px] text-slate-400">GymConnect Partner</p>
          </div>

          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            PRO CRM
          </span>
        </div>

        {/* Заголовок */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-1">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Dumbbell className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            GymConnect CoachOS
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Официальная аккредитация персональных фитнес-тренеров в залах Алматы
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

          {/* 1. ФОТО И БАЗОВЫЕ ДАННЫЕ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Профиль тренера
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Авто-подтяжка
              </span>
            </div>

            {/* Фото с кнопкой замены */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md bg-slate-100 flex items-center justify-center">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Аватар тренера" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-9 h-9 text-slate-400" />
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
              <p className="text-[10px] text-slate-400 mt-1.5">Синхронизировано с Telegram • нажмите для замены</p>
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
                    placeholder="coach_username"
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
                  placeholder="coach_almaty_fit"
                  className="w-full pl-6 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* 2. ЛОКАЦИИ (ОСНОВНОЙ И ВТОРОЙ ЗАЛ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Залы проведения тренировок
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 truncate"
              >
                {ALMATY_GYMS.slice(0, 70).map((g, idx) => (
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
                <option value="">Не указан (тренирую в одном клубе)</option>
                {ALMATY_GYMS.slice(0, 70).map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. ОПЫТ РАБОТЫ (APPLE СТЕППЕР) И СПЕЦИАЛИЗАЦИЯ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Стаж и направления
              </span>
            </div>

            {/* Степпер опыта [ - ] [ N лет ] [ + ] */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Опыт работы тренером</p>
                <p className="text-[10px] text-slate-500">Подтвержденный тренерский стаж</p>
              </div>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 active:scale-90 transition-transform font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900 font-mono w-14 text-center">
                  {formData.experience_years} {formData.experience_years === 1 ? 'год' : formData.experience_years < 5 ? 'года' : 'лет'}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, experience_years: Math.min(35, prev.experience_years + 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 active:scale-90 transition-transform font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 8 Специализаций мультиселект */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Специализации (выберите направления)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {specializationList.map((spec) => {
                  const isSelected = formData.specializations.includes(spec.label);
                  return (
                    <button
                      type="button"
                      key={spec.id}
                      onClick={() => toggleSpecialization(spec.label)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="line-clamp-1">{spec.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Формат работы */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Формат ведения клиентов
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'offline', label: 'Офлайн (в зале)' },
                  { id: 'online', label: 'Онлайн (ведение)' },
                  { id: 'hybrid', label: 'Гибрид (зал + чат)' }
                ].map(fmt => (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => setFormData({ ...formData, work_format: fmt.id })}
                    className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                      formData.work_format === fmt.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Аудитория */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                С кем работаете
              </label>
              <select
                value={formData.target_audience}
                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Все категории (мужчины, женщины, новички)</option>
                <option value="women">Только девушки и женщины</option>
                <option value="men">Только мужчины</option>
                <option value="teens">Подростки и юниоры</option>
              </select>
            </div>
          </div>

          {/* 4. БОНУСЫ И ДЛИТЕЛЬНОСТЬ ЗАНЯТИЯ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                4. Условия и бонусы
              </span>
            </div>

            {/* Длительность тренировки */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Длительность тренировки
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

            {/* Бесплатные бонусы */}
            <div className="space-y-2 pt-1">
              <div 
                onClick={() => setFormData({ ...formData, has_free_trial: !formData.has_free_trial })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Бесплатная пробная тренировка</p>
                    <p className="text-[10px] text-slate-500">Помогает быстрее привлекать новых атлетов</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  formData.has_free_trial ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.has_free_trial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div 
                onClick={() => setFormData({ ...formData, has_free_consultation: !formData.has_free_consultation })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Бесплатная консультация / разбор</p>
                    <p className="text-[10px] text-slate-500">Онлайн-разбор питания и замеры тела</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  formData.has_free_consultation ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                }`}>
                  {formData.has_free_consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>

          {/* 5. УСЛУГИ И ПРАЙС-ЛИСТ (В ТЕНГЕ) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                5. Услуги и стоимость (₸)
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Прайс-лист
              </span>
            </div>

            {/* Персональные */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-900">Персональные тренировки (1 на 1)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Разовая (₸)</label>
                  <input
                    type="number"
                    value={formData.pricing.personal_single}
                    onChange={e => handlePriceChange('personal_single', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Абонемент (10–12 зан.)</label>
                  <input
                    type="number"
                    value={formData.pricing.personal_block}
                    onChange={e => handlePriceChange('personal_block', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Сплит тренировки */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-900">Сплит-тренировки (пара / муж и жена / 2 друга)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Разовая за двоих (₸)</label>
                  <input
                    type="number"
                    value={formData.pricing.split_single}
                    onChange={e => handlePriceChange('split_single', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Абонемент за двоих (₸)</label>
                  <input
                    type="number"
                    value={formData.pricing.split_block}
                    onChange={e => handlePriceChange('split_block', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Онлайн-ведение */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Онлайн-ведение (сопровождение)</p>
                <p className="text-[10px] text-slate-500">План питания, тренировок и чат в месяц</p>
              </div>
              <div className="w-28">
                <input
                  type="number"
                  value={formData.pricing.online_month}
                  onChange={e => handlePriceChange('online_month', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 text-center"
                />
              </div>
            </div>
          </div>

          {/* 6. КВАЛИФИКАЦИЯ, СЕРТИФИКАТЫ И ВЕРИФИКАЦИЯ */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                6. Верификация и документы
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Google Диск
              </span>
            </div>

            {/* Ссылка на Google Drive */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Ссылка на сертификаты и дипломы
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
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Загрузите сертификаты и дипломы в папку на Google Диске и предоставьте <b>открытый доступ по ссылке</b> для модерации квалификации.
              </p>
            </div>

            {/* Контакты зала и школы */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Контакты фитнес-клуба
                </label>
                <input
                  type="text"
                  value={formData.gym_contact}
                  onChange={e => setFormData({ ...formData, gym_contact: e.target.value })}
                  placeholder="Рецепция / Админ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Где проходили обучение
                </label>
                <input
                  type="text"
                  value={formData.education_contact}
                  onChange={e => setFormData({ ...formData, education_contact: e.target.value })}
                  placeholder="Академия / Федерация"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                О себе, регалиях и методологии
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Мастер спорта, дипломированный специалист. Специализируюсь на безопасном наборе мышечной массы и технике базы..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            {/* Чекбокс согласия на проверку квалификации */}
            <div 
              onClick={() => setFormData({ ...formData, verification_consent: !formData.verification_consent })}
              className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all"
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                formData.verification_consent ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.verification_consent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <p className="text-[10px] text-blue-900 leading-snug">
                Подтверждаю достоверность сведений и <b>даю согласие администрации GymConnect</b> на проверку квалификации, сертификатов и статуса резидента в указанном фитнес-клубе.
              </p>
            </div>
          </div>

          {/* Финальная кнопка отправки заявки */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Отправка анкеты в CoachOS...' : 'Отправить заявку тренера на модерацию'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
