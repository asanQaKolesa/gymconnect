import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Search, 
  X, 
  ShieldAlert, 
  Users, 
  Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

// Безопасное извлечение списка залов вне зависимости от типа экспорта (named/default)
const GYM_LIST = GymsData.ALMATY_GYMS || GymsData.almatyGyms || GymsData.default || [];

export default function EditProfilePage({ user, onBack, onSaveSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);

  // Автоматическое получение данных текущего пользователя из Telegram WebApp API
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

  // Стейт анкеты
  const [formData, setFormData] = useState({
    first_name: user?.first_name || tgUser?.first_name || '',
    last_name: user?.last_name || tgUser?.last_name || '',
    gender: user?.gender || 'male',
    bio: user?.bio || '',

    // Контакты
    telegram_username: user?.telegram_username || user?.username || tgUser?.username || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    instagram: user?.instagram || '',

    // Локация
    city: user?.city || 'Алматы',
    district: user?.district || 'Бостандыкский',
    gym: user?.gym || (GYM_LIST[2] ? GYM_LIST[2] : 'Invictus Go | Улица Тимирязева, 42'),
    custom_gym: user?.custom_gym || '',

    // Параметры
    birth_date: defaultBirthDate,
    height: user?.height || '178',
    weight: user?.weight || '75',
    experience_level: user?.experience_level || 'Любитель',

    // График и цели
    goal: user?.goal || 'Набор массы',
    workout_days: Array.isArray(user?.workout_days) && user.workout_days.length > 0 ? user.workout_days : ['Пн', 'Ср', 'Пт'],
    workout_time_slot: user?.workout_time_slot || 'Вечер (16:00 - 21:00)',

    // GymBro Matching
    gymbro_search: user?.gymbro_search !== undefined ? Boolean(user.gymbro_search) : false,
    gymbro_radius: user?.gymbro_radius || 'club',
    gymbro_target_gender: user?.gymbro_target_gender || 'any',
    gymbro_goal: user?.gymbro_goal || 'strength',
    personality_type: user?.personality_type || 'ambivert'
  });

  // Расчет возраста
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

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Фильтр залов из базы данных репозитория
  const filteredGyms = useMemo(() => {
    if (!gymSearchQuery.trim()) return GYM_LIST.slice(0, 35);
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

  const handleInstagramChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '');
    setFormData({ ...formData, instagram: val });
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

    if (calculatedAge !== null && (calculatedAge < 18 || calculatedAge > 80)) {
      alert('Возраст пользователя должен быть в диапазоне от 18 до 80 лет.');
      return;
    }

    setIsSaving(true);

    try {
      const cleanTelegram = formData.telegram_username.trim().replace(/^@+/, '');
      const cleanInstagram = formData.instagram.trim().replace(/^@+/, '');
      const selectedGym = formData.gym === 'Другой зал (указать в профиле)' && formData.custom_gym.trim()
        ? formData.custom_gym.trim()
        : formData.gym;

      const updatedPayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        gender: formData.gender,
        bio: formData.bio.trim(),
        telegram_username: cleanTelegram,
        username: cleanTelegram,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        instagram: cleanInstagram,
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
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-20 pt-3 px-3 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Верхняя навигационная панель */}
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
            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Сохранение...' : 'Готово'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">

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
                О себе (Био) <span className="text-slate-400 font-normal">(не обязательно)</span>
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Фрилансер, тренируюсь 3 года. Люблю базу, жим 100 кг, правильное питание."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
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
                Автоматически подтягивается из Telegram Mini App для связи с напарниками.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  WhatsApp телефон <span className="text-slate-400 font-normal">(опция)</span>
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
                  Instagram профиль <span className="text-slate-400 font-normal">(опция)</span>
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

          {/* ================= 3. ЛОКАЦИЯ И ЗАЛ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                3. Локация и фитнес-клуб
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

            {/* Выбор клуба из src/data/almatyGyms.js */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Основной клуб тренировок <span className="text-rose-500">*</span>
              </label>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <span className="truncate">{formData.gym}</span>
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
                    placeholder="Начните ввод названия зала (Invictus, Adrenaline...)"
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
                    placeholder="Например: Небольшой клуб в моем ЖК"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ================= 4. ПАРАМЕТРЫ ТЕЛА И ВОЗРАСТ ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                4. Параметры тела и дата рождения
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                {calculatedAge ? `${calculatedAge} лет` : '18-80 лет'}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Дата рождения (18–80 лет) <span className="text-rose-500">*</span>
                </label>
                {calculatedAge && (
                  <span className="text-[10px] font-bold text-slate-500">
                    Возраст: {calculatedAge} лет
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={formData.birth_date}
                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
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
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Уровень подготовки в зале
              </label>
              <select
                value={formData.experience_level}
                onChange={e => setFormData({ ...formData, experience_level: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Новичок">Новичок (до 6 месяцев)</option>
                <option value="Любитель">Любитель (стаж от 6 мес до 2 лет)</option>
                <option value="Продвинутый">Продвинутый (стаж 2–5 лет)</option>
                <option value="Профессионал">Профессионал / Тренируюсь с тренером</option>
              </select>
            </div>
          </div>

          {/* ================= 5. ЦЕЛЬ И ГРАФИК ТРЕНИРОВОК ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                5. Цель и график тренировок
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

          {/* ================= 6. МОДУЛЬ ПОИСКА GYMBRO ================= */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  6. Настройки GymBro Matching
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                formData.gymbro_search ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {formData.gymbro_search ? 'Включен' : 'Отключен'}
              </span>
            </div>

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
                    <option value="club">Только в моем фитнес-клубе ({formData.gym})</option>
                    <option value="district">Во всех клубах района ({formData.district})</option>
                    <option value="city">По всем залам Алматы</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Цель совместных тренировок
                  </label>
                  <select
                    value={formData.gymbro_goal}
                    onChange={e => setFormData({ ...formData, gymbro_goal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="strength">Страховка на тяжелых подходах (жим, присед, тяга)</option>
                    <option value="discipline">Взаимная дисциплина (не пропускать тренировки)</option>
                    <option value="cardio">Совместное кардио, кроссфит и выносливость</option>
                    <option value="community">Общение, обмен опытом и спорт-комьюнити</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Ваш психотип / тренировочный вайб
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'introvert', label: 'Интроверт', desc: 'Минимум пауз' },
                      { id: 'ambivert', label: 'Амбиверт', desc: 'Баланс вайба' },
                      { id: 'extravert', label: 'Экстраверт', desc: 'Много энергии' }
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
