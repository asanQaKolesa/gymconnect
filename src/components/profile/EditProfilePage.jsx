import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Search, 
  X, 
  ShieldAlert, 
  Users, 
  Check,
  Camera,
  UserCheck,
  Calendar,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

// Безопасное извлечение списка залов из src/data/almatyGyms.js
const GYM_LIST = GymsData.ALMATY_GYMS || GymsData.almatyGyms || GymsData.default || [];

export default function EditProfilePage({ user, onBack, onSaveSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Автоматические данные пользователя из Telegram WebApp API
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  // Ограничение возраста от 18 до 80 лет
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  const defaultBirthDate = useMemo(() => {
    if (user?.birth_date) return user.birth_date;
    const defaultDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
    return defaultDate.toISOString().split('T')[0];
  }, [user?.birth_date]);

  // Основной стейт формы анкеты
  const [formData, setFormData] = useState({
    // Фотография
    photo_url: user?.photo_url || user?.avatar_url || tgUser?.photo_url || '',

    // 1. Личные данные
    first_name: user?.first_name || tgUser?.first_name || '',
    last_name: user?.last_name || tgUser?.last_name || '',
    gender: user?.gender || 'male',
    bio: user?.bio || '',

    // 2. Контактные данные
    telegram_username: user?.telegram_username || user?.username || tgUser?.username || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    instagram: user?.instagram || '',

    // 3. Формат тренировок и связь с тренером
    training_format: user?.training_format || 'alone', // 'alone' | 'coach_gym' | 'coach_online' | 'looking_for_coach'
    trainer_telegram: user?.trainer_telegram || '',

    // 4. Локация и фитнес-клуб
    city: user?.city || 'Алматы',
    district: user?.district || 'Бостандыкский',
    gym: user?.gym || '',
    custom_gym: user?.custom_gym || '',

    // 5. Параметры тела и дата рождения
    birth_date: defaultBirthDate,
    height: user?.height || '178',
    weight: user?.weight || '75',
    experience_level: user?.experience_level || 'regular',

    // 6. Цель и график
    goal: user?.goal || 'Набор массы',
    workout_days: Array.isArray(user?.workout_days) && user.workout_days.length > 0 ? user.workout_days : ['Пн', 'Ср', 'Пт'],
    workout_time_slot: user?.workout_time_slot || 'Вечер (16:00 - 21:00)',

    // 7. GymBro Matching
    gymbro_search: user?.gymbro_search !== undefined ? Boolean(user.gymbro_search) : false,
    gymbro_radius: user?.gymbro_radius || 'club',
    gymbro_target_gender: user?.gymbro_target_gender || 'any',
    gymbro_goal: user?.gymbro_goal || 'strength',
    personality_type: user?.personality_type || 'ambivert'
  });

  // Автоматический расчет возраста
  const calculatedAge = useMemo(() => {
    if (!formData.birth_date) return null;
    const birth = new Date(formData.birth_date);
    const ageDiff = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      return ageDiff - 1;
    }
    return ageDiff;
  }, [formData.birth_date]);

  // Города Казахстана (активен Алматы)
  const kzCities = [
    { id: 'Алматы', name: 'Алматы', available: true },
    { id: 'Астана', name: 'Астана (Скоро)', available: false },
    { id: 'Шымкент', name: 'Шымкент (Скоро)', available: false },
    { id: 'Караганда', name: 'Караганда (Скоро)', available: false },
    { id: 'Актобе', name: 'Актобе (Скоро)', available: false }
  ];

  // Районы Алматы
  const almatyDistricts = [
    'Бостандыкский',
    'Медеуский',
    'Алмалинский',
    'Ауэзовский',
    'Турксибский',
    'Жетысуский',
    'Наурызбайский',
    'Алатауский'
  ];

  // Креативные градации стажа тренировок
  const experienceOptions = [
    { id: 'first_time', title: 'Первый раз в зале', desc: 'Осматриваюсь и изучаю тренажеры' },
    { id: 'scared_beginner', title: 'Пару раз заходил, было страшно', desc: 'Делаю первые уверенные шаги' },
    { id: 'beginner', title: 'Новичок', desc: 'Освоил базу, стаж до 6 месяцев' },
    { id: 'regular', title: 'Уверенный любитель', desc: 'Регулярно жму и тяну, стаж 1–2 года' },
    { id: 'advanced', title: 'Опытный атлет', desc: 'Знаю каждую мышцу, стаж 2–5 лет' },
    { id: 'pro_monster', title: 'Профи / Монстр базы', desc: 'Выступающий атлет или машина зала' }
  ];

  // Креативные цели совместных тренировок для GymBro
  const gymbroGoals = [
    { id: 'strength', title: 'Страховка на тяжелой базе', desc: 'Жим, присед, тяга до отказа без страха' },
    { id: 'discipline', title: 'Взаимная дисциплина', desc: 'Не сливаться с тренировок в 7 утра' },
    { id: 'pump_burn', title: 'Хардкорный пампинг и сушка', desc: 'Высокий темп, дропсеты и огонь в мышцах' },
    { id: 'cardio_cross', title: 'Кардио и функционал', desc: 'Сжигать калории и бегать кроссы вместе' },
    { id: 'vibe_coffee', title: 'Спорт-вайб и кофе после зала', desc: 'Тренировки в удовольствие и дружба' },
    { id: 'technique_learning', title: 'Обмен опытом и техникой', desc: 'Помогать друг другу расти и ставить углы' }
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Фильтр залов из базы
  const filteredGyms = useMemo(() => {
    if (!gymSearchQuery.trim()) return GYM_LIST.slice(0, 40);
    return GYM_LIST.filter(g => typeof g === 'string' && g.toLowerCase().includes(gymSearchQuery.toLowerCase()));
  }, [gymSearchQuery]);

  const toggleDay = (day) => {
    setFormData(prev => {
      const exists = prev.workout_days.includes(day);
      const updated = exists 
        ? prev.workout_days.filter(d => d !== day) 
        : [...prev.workout_days, day];
      return { ...prev, workout_days: updated };
    });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, whatsapp: val });
  };

  const handleTelegramChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '');
    setFormData({ ...formData, telegram_username: val });
  };

  const handleTrainerTelegramChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '');
    setFormData({ ...formData, trainer_telegram: val });
  };

  const handleInstagramChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '');
    setFormData({ ...formData, instagram: val });
  };

  // Обработка загрузки локального фото
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

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      alert('Пожалуйста, укажите имя и фамилию.');
      return;
    }

    if (!formData.telegram_username.trim()) {
      alert('Пожалуйста, укажите Telegram Username для связи.');
      return;
    }

    if (!formData.gym.trim()) {
      alert('Пожалуйста, выберите ваш основной фитнес-клуб.');
      return;
    }

    if (calculatedAge !== null && (calculatedAge < 18 || calculatedAge > 80)) {
      alert('Возраст атлета должен быть в диапазоне от 18 до 80 лет.');
      return;
    }

    setIsSaving(true);

    try {
      const cleanTelegram = formData.telegram_username.trim().replace(/^@+/, '');
      const cleanTrainerTelegram = formData.trainer_telegram.trim().replace(/^@+/, '');
      const cleanInstagram = formData.instagram.trim().replace(/^@+/, '');
      
      const selectedGym = formData.gym === 'Другой зал (указать в профиле)' && formData.custom_gym.trim()
        ? formData.custom_gym.trim()
        : formData.gym;

      const updatedPayload = {
        photo_url: formData.photo_url,
        avatar_url: formData.photo_url,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        gender: formData.gender,
        bio: formData.bio.trim(),
        telegram_username: cleanTelegram,
        username: cleanTelegram,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        instagram: cleanInstagram,
        training_format: formData.training_format,
        trainer_telegram: cleanTrainerTelegram,
        city: formData.city,
        district: formData.district,
        gym: selectedGym,
        custom_gym: formData.custom_gym,
        birth_date: formData.birth_date,
        age: calculatedAge || Number(user?.age) || 25,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        experience_level: formData.experience_level,
        goal: formData.goal,
        workout_days: formData.workout_days,
        workout_time_slot: formData.workout_time_slot,
        gymbro_search: formData.gymbro_search,
        gymbro_radius: formData.gymbro_radius,
        gymbro_target_gender: formData.gymbro_target_gender,
        gymbro_goal: formData.gymbro_goal,
        personality_type: formData.personality_type,
        updated_at: new Date().toISOString()
      };

      // Сохраняем в Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updatedPayload)
          .eq('id', user.id);

        if (error) throw error;
      } else if (tgUser?.id || localStorage.getItem('gymconnect_telegram_id')) {
        const tgId = tgUser?.id || localStorage.getItem('gymconnect_telegram_id');
        const { error } = await supabase
          .from('profiles')
          .upsert([{ ...updatedPayload, telegram_id: tgId }], { onConflict: 'telegram_id' });

        if (error) throw error;
      }

      // Сохраняем локальное состояние профиля
      localStorage.setItem('gymconnect_profile_filled', 'true');
      localStorage.setItem('gymconnect_user_profile', JSON.stringify(updatedPayload));

      if (onSaveSuccess) {
        onSaveSuccess(updatedPayload);
      }
    } catch (err) {
      console.error('Ошибка сохранения профиля:', err);
      alert('Ошибка при сохранении: ' + err.message);
      if (onSaveSuccess) {
        onSaveSuccess(formData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-24 pt-3 px-3 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Верхняя панель (App Bar) */}
        <div className="bg-white rounded-2xl py-3 px-4 shadow-sm border border-slate-100 flex items-center justify-between sticky top-0 z-40">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Назад</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-xs font-bold text-slate-900">Анкета атлета</h2>
            <p className="text-[10px] text-slate-400">GymConnect Almaty</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Сохранение...' : 'Готово'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

          {/* ================= ФОТО ПРОФИЛЯ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 shadow-md bg-slate-100 flex items-center justify-center relative">
                {formData.photo_url ? (
                  <img 
                    src={formData.photo_url} 
                    alt="Аватар" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <Users className="w-10 h-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md active:scale-90 transition-transform"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            <p className="text-xs font-bold text-slate-800 mt-2.5">
              {formData.first_name ? `${formData.first_name} ${formData.last_name}` : 'Фотография профиля'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Подтягивается из Telegram или загружается с устройства
            </p>
          </div>

          {/* ================= 1. ЛИЧНЫЕ ДАННЫЕ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Личные данные
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Обязательно
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Имя <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Асанәли"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Фамилия <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Құсайынов"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Пол <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    formData.gender === 'male'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Мужской
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    formData.gender === 'female'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Женский
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                О себе (Био) <span className="text-slate-400 font-normal text-[10px]">(не обязательно)</span>
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Фрилансер, тренируюсь 3 года. Люблю базу, жим 100 кг, правильное питание."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          {/* ================= 2. КОНТАКТНЫЕ ДАННЫЕ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Контактные данные
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Telegram обязателен
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Telegram Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono text-xs font-bold">@</span>
                <input
                  type="text"
                  required
                  value={formData.telegram_username}
                  onChange={handleTelegramChange}
                  placeholder="username"
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Автоматически подтягивается из Telegram Mini App для быстрой связи.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  WhatsApp телефон <span className="text-slate-400 font-normal text-[10px]">(не обязательно)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-slate-500 font-mono text-xs font-semibold">+7</span>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    placeholder="7011234567"
                    className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Instagram <span className="text-slate-400 font-normal text-[10px]">(не обязательно)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={handleInstagramChange}
                    placeholder="username"
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= 3. ФОРМАТ ТРЕНИРОВОК И ТРЕНЕР ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Формат тренировок
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Trainer CRM
              </span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'alone', label: 'Тренируюсь сам' },
                { id: 'coach_gym', label: 'Тренируюсь с персональным тренером в зале' },
                { id: 'coach_online', label: 'Тренируюсь с тренером онлайн' },
                { id: 'looking_for_coach', label: 'Ищу персонального тренера в Алматы' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, training_format: opt.id })}
                  className={`w-full p-2.5 text-left rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                    formData.training_format === opt.id
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt.label}</span>
                  {formData.training_format === opt.id && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Поле добавления тренера через Telegram для привязки к CRM */}
            {(formData.training_format === 'coach_gym' || formData.training_format === 'coach_online') && (
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Привязка к тренеру</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Укажите Telegram вашего тренера. Вы автоматически появитесь в его расписании и списке учеников Trainer CRM.
                </p>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-mono text-xs font-bold">@</span>
                  <input
                    type="text"
                    value={formData.trainer_telegram}
                    onChange={handleTrainerTelegramChange}
                    placeholder="coach_telegram"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= 4. ЛОКАЦИЯ И КЛУБ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                4. Локация и фитнес-клуб
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                База 230+ залов
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Город</label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {kzCities.map(c => (
                    <option key={c.id} value={c.id} disabled={!c.available}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Район Алматы</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {almatyDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Выбор клуба с чистым пустым состоянием для первичной регистрации */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Основной клуб тренировок <span className="text-rose-500">*</span>
              </label>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">
                    {formData.gym ? formData.gym : 'Клуб еще не выбран — выберите ниже'}
                  </span>
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
                    placeholder="Начните ввод зала (Invictus, Adrenaline, 1Fit...)"
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
                    {filteredGyms.map((gymName, index) => {
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
                            isSelected ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-slate-700'
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

              {formData.gym === 'Другой зал (указать в профиле)' && (
                <div className="mt-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Укажите название вашего зала
                  </label>
                  <input
                    type="text"
                    value={formData.custom_gym}
                    onChange={e => setFormData({ ...formData, custom_gym: e.target.value })}
                    placeholder="Например: Фитнес-зал в моем жилом комплексе"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ================= 5. ПАРАМЕТРЫ ТЕЛА И ВОЗРАСТ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                5. Параметры тела
              </span>
              {calculatedAge && (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                  {calculatedAge} лет
                </span>
              )}
            </div>

            {/* Дата рождения с защитой от вылета за контейнер на смартфонах */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Дата рождения <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="w-full overflow-hidden">
                <input
                  type="date"
                  required
                  min={minDate}
                  max={maxDate}
                  value={formData.birth_date}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full max-w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Доступ открыт только совершеннолетним атлетам согласно правилам сервиса.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Рост (см)</label>
                <input
                  type="number"
                  min="130"
                  max="230"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Вес (кг)</label>
                <input
                  type="number"
                  min="35"
                  max="200"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-center"
                />
              </div>
            </div>

            {/* Креативные градации стажа */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Уровень подготовки в зале
              </label>
              <div className="space-y-1.5">
                {experienceOptions.map(exp => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, experience_level: exp.id })}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      formData.experience_level === exp.id
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{exp.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{exp.desc}</p>
                    </div>
                    {formData.experience_level === exp.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= 6. ЦЕЛЬ И ГРАФИК ТРЕНИРОВОК ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                6. Цель и график тренировок
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Главная цель занятий
              </label>
              <select
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Набор массы">Набор мышечной массы и гипертрофия</option>
                <option value="Сушка и рельеф">Снижение веса, сушка и рельеф</option>
                <option value="Поддержание тонуса">Тонус, выносливость и здоровье</option>
                <option value="Силовые показатели">Развитие абсолютной силы (пауэрлифтинг)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Дни тренировок (выберите дни)
              </label>
              <div className="flex gap-1">
                {daysOfWeek.map(d => {
                  const isSelected = formData.workout_days.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Предпочитаемое время тренировок
              </label>
              <select
                value={formData.workout_time_slot}
                onChange={e => setFormData({ ...formData, workout_time_slot: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Утро (07:00 - 12:00)">Утро (07:00 - 12:00)</option>
                <option value="День / Обед (12:00 - 16:00)">День / Обед (12:00 - 16:00)</option>
                <option value="Вечер (16:00 - 21:00)">Вечер (16:00 - 21:00)</option>
                <option value="Поздний вечер (после 21:00)">Поздний вечер (после 21:00)</option>
              </select>
            </div>
          </div>

          {/* ================= 7. НАСТРОЙКИ GYMBRO MATCHING ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  7. Настройки GymBro Matching
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                formData.gymbro_search ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {formData.gymbro_search ? 'Включен' : 'Отключен'}
              </span>
            </div>

            {/* Главный тумблер участия в тиндере */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Показывать анкету в GymBro</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Другие атлеты смогут находить вас для совместных тренировок
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gymbro_search: !formData.gymbro_search })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  formData.gymbro_search ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.gymbro_search ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {formData.gymbro_search && (
              <div className="space-y-3 pt-1">
                
                {/* Информационный бейдж авто-синхронизации графика */}
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2 text-[10px] text-blue-900 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Синхронизировано: дни <b>({formData.workout_days.join(', ')})</b> и время <b>({formData.workout_time_slot.split(' ')[0]})</b> берутся из вашего графика выше.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Кого вы ищете в качестве напарника?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'any', label: 'Всех (Любой пол)' },
                      { id: 'male', label: 'GymBro (Парня)' },
                      { id: 'female', label: 'GymGirl (Девушку)' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, gymbro_target_gender: item.id })}
                        className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                          formData.gymbro_target_gender === item.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Охват поиска напарников
                  </label>
                  <select
                    value={formData.gymbro_radius}
                    onChange={e => setFormData({ ...formData, gymbro_radius: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="club">Только в моем зале ({formData.gym || 'клуб не выбран'})</option>
                    <option value="district">Во всех клубах района ({formData.district})</option>
                    <option value="city">По всем залам Алматы</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Цель совместных тренировок
                  </label>
                  <div className="space-y-1.5">
                    {gymbroGoals.map(goal => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, gymbro_goal: goal.id })}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          formData.gymbro_goal === goal.id
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{goal.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{goal.desc}</p>
                        </div>
                        {formData.gymbro_goal === goal.id && (
                          <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ваш тренировочный психотип
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'introvert', label: 'Интроверт', desc: 'Фокус и работа' },
                      { id: 'ambivert', label: 'Амбиверт', desc: 'Баланс и вайб' },
                      { id: 'extravert', label: 'Экстраверт', desc: 'Энергия зала' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, personality_type: type.id })}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          formData.personality_type === type.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">{type.label}</p>
                        <p className={`text-[9px] ${formData.personality_type === type.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {type.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Юридический дисклеймер */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-[11px] text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-bold mb-0.5">Безопасность и спортивная этика:</p>
                    <p className="text-[10px] text-amber-800">
                      GymConnect — исключительно спортивная платформа для тренировок и поиска спортивных партнеров. Администрация не несет ответственности за личное поведение участников вне приложения. Соблюдайте взаимное уважение, этикет и безопасность в залах Алматы.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Кнопка отправки формы */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение профиля в базе...' : 'Сохранить анкету'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
