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
  ChevronRight,
  Search,
  MapPin,
  Loader2,
  Trophy,
  Info
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import * as GymsData from '../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

const defaultGym = (Array.isArray(GYMS_ARRAY) && GYMS_ARRAY.length > 2) 
  ? GYMS_ARRAY[2] 
  : 'Invictus Go | Улица Тимирязева, 42';

export default function TrainerOnboarding({ onComplete, onBack, onExitToProfile }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const currentTelegramId = tgUser?.id ? String(tgUser.id) : (localStorage.getItem('gymconnect_telegram_id') || '');

  const sportsTitlesList = [
    'Мастер спорта (МС)',
    'Кандидат в мастера спорта (КМС)',
    'Мастер спорта международного класса (МСМК)',
    'Чемпион / Призёр соревнований',
    'Сертифицированный специалист'
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

  // Все чекбоксы по умолчанию строго выключены
  const [formData, setFormData] = useState({
    photo_url: tgUser?.photo_url || '',
    first_name: tgUser?.first_name || '',
    last_name: tgUser?.last_name || '',
    username: tgUser?.username ? tgUser.username.replace('@', '') : '',
    phone: '',
    instagram: '',
    bio: '',

    is_competing_athlete: false,
    athletic_titles: [],
    sports_title_custom: '',

    gym: defaultGym,
    secondary_gym: '',

    experience_years: 3,
    specializations: ['Набор массы и гипертрофия'],
    work_format: 'hybrid',
    target_audience: 'all',

    has_free_trial: false,
    has_free_consultation: false,
    show_in_catalog: false,

    services_offered: {
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

      consultation_price: 10000,
      consultation_duration: 60
    },

    certificates_link: '',
    gym_contact: '',
    education_contact: '',
    education_place: ''
  });

  const filteredPrimaryGyms = useMemo(() => {
    const list = Array.isArray(GYMS_ARRAY) ? GYMS_ARRAY : [];
    if (!gymSearchQuery.trim()) return list.slice(0, 35);
    return list.filter(g => typeof g === 'string' && g.toLowerCase().includes(gymSearchQuery.toLowerCase()));
  }, [gymSearchQuery]);

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

  const toggleSportsTitle = (title) => {
    setFormData(prev => {
      const exists = prev.athletic_titles.includes(title);
      const updated = exists 
        ? prev.athletic_titles.filter(t => t !== title)
        : [...prev.athletic_titles, title];
      return { ...prev, athletic_titles: updated };
    });
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
      console.warn('Загрузка в Storage не удалась, fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
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
        gym: formData.gym ? formData.gym : defaultGym,
        secondary_gym: formData.secondary_gym || null,
        experience_years: Number(formData.experience_years) || 1,

        is_competing_athlete: formData.is_competing_athlete,
        athletic_titles: formData.athletic_titles,
        sports_title_custom: formData.sports_title_custom.trim(),

        specializations: formData.specializations,
        specialization: formData.specializations.join(', '),
        work_format: formData.work_format,
        target_audience: formData.target_audience,

        has_free_trial: formData.has_free_trial,
        has_free_consultation: formData.has_free_consultation,
        show_in_catalog: formData.show_in_catalog,

        services_offered: formData.services_offered,
        pricing: formData.pricing,
        certificates_link: formData.certificates_link ? formData.certificates_link.trim() : '',
        education_place: formData.education_place.trim(),
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
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-3.5 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-3.5 pt-1 pb-16">
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700 active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Назад в профиль</span>
          </button>

          <span className="text-[10px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            GymConnect CoachOS
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 text-center space-y-1.5">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-1 shadow-sm">
            <Dumbbell className="w-5 h-5 stroke-[2]" />
          </div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Регистрация тренера CoachOS
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
            Telegram ID <span className="font-mono text-blue-600 font-bold">{currentTelegramId || 'определен'}</span> будет привязан автоматически для мгновенных пуш-уведомлений.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pb-8">
          
          {/* Фото */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center relative">
                {isUploadingPhoto ? (
                  <div className="flex flex-col items-center justify-center gap-1 bg-slate-50 w-full h-full">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-[8.5px] font-bold text-slate-500">Загрузка...</span>
                  </div>
                ) : formData.photo_url ? (
                  <img src={formData.photo_url} alt="Аватар тренера" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-8 h-8 text-slate-400 stroke-[1.6]" />
                )}
              </div>
              {!isUploadingPhoto && (
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full shadow-md">
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
            <p className="text-[10px] text-slate-400 mt-2">
              {isUploadingPhoto ? 'Загрузка фото в облако...' : 'Нажмите для выбора фотографии'}
            </p>
          </div>

          {/* Имя и Фамилия */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
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
                  Telegram никнейм
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
          </div>

          {/* Спортивные звания (Опционально) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800">Спортивные звания и статус (опционально)</h3>
            </div>

            <div 
              onClick={() => setFormData(prev => ({ ...prev, is_competing_athlete: !prev.is_competing_athlete }))}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-99 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Выступающий соревнующийся атлет</p>
                <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">Бодибилдинг, Менс Физик, Фитнес-бикини, Пауэрлифтинг</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                formData.is_competing_athlete ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
              }`}>
                {formData.is_competing_athlete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="space-y-1">
              {sportsTitlesList.map(title => {
                const isSelected = formData.athletic_titles.includes(title);
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => toggleSportsTitle(title)}
                    className={`w-full p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs font-bold' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{title}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Зал */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Основной фитнес-клуб работы
            </label>
            <select
              value={formData.gym}
              onChange={e => setFormData({ ...formData, gym: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              {filteredPrimaryGyms.slice(0, 60).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Ссылка на диск с понятной плашкой */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5">
            <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-950 leading-relaxed font-medium">
                Загрузите фото дипломов и сертификатов на онлайн-диск (Google Drive, Яндекс Диск или iCloud) и поделитесь ссылкой для подтверждения квалификации.
              </p>
            </div>

            <input
              type="url"
              value={formData.certificates_link}
              onChange={e => setFormData({ ...formData, certificates_link: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingPhoto}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Сохранение...' : 'Завершить регистрацию в CoachOS'}</span>
          </button>

        </form>
      </div>
    </div>
  );
}
