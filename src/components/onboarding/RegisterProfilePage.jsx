import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  X, 
  ShieldAlert, 
  Users, 
  Check, 
  Camera, 
  UserCheck, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const GYM_LIST = GymsData.ALMATY_GYMS || GymsData.almatyGyms || GymsData.default || [];

export default function RegisterProfilePage({ currentLang = 'ru', onComplete }) {
  const [isSaving, setIsSaving] = useState(false);
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Автоматические данные пользователя из Telegram Mini App
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  // Ограничение возраста от 18 до 80 лет
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const defaultBirthDate = new Date(today.getFullYear() - 24, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  // Основной стейт первичной анкеты
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    first_name: tgUser?.first_name || '',
    last_name: tgUser?.last_name || '',
    gender: 'male',
    bio: '',

    telegram_username: tgUser?.username || '',
    whatsapp: '',
    instagram: '',

    training_format: 'alone',
    trainer_telegram: '',

    city: 'Алматы',
    district: 'Бостандыкский',
    gym: '',
    custom_gym: '',

    birth_date: defaultBirthDate,
    height: '178',
    weight: '75',
    experience_level: 'regular',

    goal: 'Набор массы',
    workout_days: ['Пн', 'Ср', 'Пт'],
    workout_time_slot: 'Вечер (16:00 - 21:00)',

    gymbro_search: false,
    gymbro_radius: 'club',
    gymbro_target_gender: 'any',
    gymbro_goal: 'strength',
    personality_type: 'ambivert'
  });

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

  const kzCities = [
    { id: 'Алматы', name: 'Алматы', available: true },
    { id: 'Астана', name: 'Астана (Скоро)', available: false },
    { id: 'Шымкент', name: 'Шымкент (Скоро)', available: false },
    { id: 'Караганда', name: 'Караганда (Скоро)', available: false },
    { id: 'Актобе', name: 'Актобе (Скоро)', available: false }
  ];

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

  const experienceOptions = [
    { id: 'first_time', title: 'Первый раз в зале', desc: 'Осматриваюсь и изучаю тренажеры' },
    { id: 'scared_beginner', title: 'Пару раз заходил, было страшно', desc: 'Делаю первые уверенные шаги' },
    { id: 'beginner', title: 'Новичок', desc: 'Освоил базу, стаж до 6 месяцев' },
    { id: 'regular', title: 'Уверенный любитель', desc: 'Регулярно жму и тяну, стаж 1–2 года' },
    { id: 'advanced', title: 'Опытный атлет', desc: 'Знаю каждую мышцу, стаж 2–5 лет' },
    { id: 'pro_monster', title: 'Профи / Монстр базы', desc: 'Выступающий атлет или машина зала' }
  ];

  const gymbroGoals = [
    { id: 'strength', title: 'Страховка на тяжелой базе', desc: 'Жим, присед, тяга до отказа без страха' },
    { id: 'discipline', title: 'Взаимная дисциплина', desc: 'Не сливаться с тренировок в 7 утра' },
    { id: 'pump_burn', title: 'Хардкорный пампинг и сушка', desc: 'Высокий темп, дропсеты и огонь в мышцах' },
    { id: 'cardio_cross', title: 'Кардио и функционал', desc: 'Сжигать калории и бегать кроссы вместе' },
    { id: 'vibe_coffee', title: 'Спорт-вайб и кофе после зала', desc: 'Тренировки в удовольствие и дружба' },
    { id: 'technique_learning', title: 'Обмен опытом и техникой', desc: 'Помогать друг другу расти и ставить углы' }
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
      alert(currentLang === 'kk' ? 'Аты-жөніңізді енгізіңіз' : 'Пожалуйста, укажите имя и фамилию.');
      return;
    }

    if (!formData.telegram_username.trim()) {
      alert(currentLang === 'kk' ? 'Telegram никнейміңізді көрсетіңіз' : 'Пожалуйста, укажите Telegram Username для связи.');
      return;
    }

    if (!formData.gym.trim()) {
      alert(currentLang === 'kk' ? 'Негізгі жаттығу залыңызды таңдаңыз' : 'Пожалуйста, выберите ваш фитнес-клуб.');
      return;
    }

    if (calculatedAge !== null && (calculatedAge < 18 || calculatedAge > 80)) {
      alert(currentLang === 'kk' ? 'Жас 18 бен 80 аралығында болуы тиіс' : 'Возраст атлета должен быть в диапазоне от 18 до 80 лет.');
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

      const tgId = tgUser?.id ? String(tgUser.id) : (localStorage.getItem('gymconnect_telegram_id') || `web_${Date.now()}`);

      const newProfilePayload = {
        telegram_id: tgId,
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
        trainer_username: cleanTrainerTelegram,
        city: formData.city,
        district: formData.district,
        gym: selectedGym,
        custom_gym: formData.custom_gym,
        birth_date: formData.birth_date,
        age: calculatedAge || 24,
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
        is_pro: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Сохраняем в Supabase
      const { data, error } = await supabase
        .from('profiles')
        .upsert([newProfilePayload], { onConflict: 'telegram_id' })
        .select()
        .single();

      if (error) {
        console.warn('Supabase upsert warning, fallback to local:', error.message);
      }

      // Фиксируем регистрацию в localStorage для мгновенного входа в будущем
      localStorage.setItem('gymconnect_profile_filled', 'true');
      localStorage.setItem('gymconnect_telegram_id', tgId);
      localStorage.setItem('gymconnect_user_profile', JSON.stringify(data || newProfilePayload));

      if (onComplete) {
        onComplete(data || newProfilePayload);
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-24 pt-4 px-3 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Приветственный блок онбординга */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            <Flame className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            {currentLang === 'kk' ? 'GymConnect қауымдастығына қош келдіңіз!' : 'Добро пожаловать в GymConnect!'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {currentLang === 'kk' 
              ? 'Алматы залдарынан GymBro табу және жеке жоспар құру үшін атлет сауалнамасын толтырыңыз.' 
              : 'Заполните анкету атлета, чтобы находить напарников по базе и тренироваться в залах Алматы.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

          {/* Фото профиля */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 shadow-md bg-slate-100 flex items-center justify-center relative">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Аватар" className="w-full h-full object-cover" />
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
              {formData.first_name ? `${formData.first_name} ${formData.last_name}` : (currentLang === 'kk' ? 'Атлет фотосы' : 'Фотография атлета')}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {currentLang === 'kk' ? 'Telegram-нан алынды немесе құрылғыдан жүктеңіз' : 'Синхронизировано с Telegram • нажмите для замены'}
            </p>
          </div>

          {/* 1. Личные данные */}
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
                placeholder="Фрилансер, тренируюсь 2 года, жму 100 кг, правильное питание."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          {/* 2. Контактные данные */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Контакты
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
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  WhatsApp <span className="text-slate-400 font-normal text-[10px]">(не обязательно)</span>
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

          {/* 3. Формат тренировок и тренер */}
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
                { id: 'coach_gym', label: 'Тренируюсь с тренером в зале' },
                { id: 'coach_online', label: 'Тренируюсь с тренером онлайн' },
                { id: 'looking_for_coach', label: 'Ищу персонального тренера' }
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

            {(formData.training_format === 'coach_gym' || formData.training_format === 'coach_online') && (
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Укажите Telegram вашего тренера</span>
                </div>
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

          {/* 4. Локация и клуб */}
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

            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Основной клуб тренировок <span className="text-rose-500">*</span>
              </label>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">
                    {formData.gym ? formData.gym : 'Выберите зал из выпадающего списка'}
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
                    placeholder="Поиск по названию (Invictus, Adrenaline...)"
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
                  <input
                    type="text"
                    value={formData.custom_gym}
                    onChange={e => setFormData({ ...formData, custom_gym: e.target.value })}
                    placeholder="Например: Небольшой фитнес-клуб в моем ЖК"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 5. Параметры тела */}
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

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Дата рождения <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={formData.birth_date}
                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full max-w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
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

          {/* 6. Цель и график */}
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
                Дни тренировок
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
