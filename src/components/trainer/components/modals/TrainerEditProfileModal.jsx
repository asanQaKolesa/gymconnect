// src/components/trainer/components/modals/TrainerEditProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus, 
  Check, 
  Camera, 
  Users, 
  Dumbbell, 
  Clock, 
  FileText, 
  DollarSign, 
  Sparkles, 
  Search, 
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '../../../../supabaseClient';
import * as GymsData from '../../../../data/almatyGyms';

const GYMS_ARRAY = Array.isArray(GymsData.ALMATY_GYMS) 
  ? GymsData.ALMATY_GYMS 
  : (Array.isArray(GymsData.almatyGyms) ? GymsData.almatyGyms : (Array.isArray(GymsData.default) ? GymsData.default : []));

export default function TrainerEditProfileModal({ 
  isOpen, 
  onClose, 
  trainer, 
  cleanUsername, 
  onSaved 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [searchGymQuery, setSearchGymQuery] = useState('');
  const [searchSecGymQuery, setSearchSecGymQuery] = useState('');
  const fileInputRef = useRef(null);

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
    { id: 'gym', label: 'В зале (оффлайн)' },
    { id: 'online', label: 'Только онлайн' },
    { id: 'hybrid', label: 'Гибрид (зал + онлайн)' }
  ];

  const targetAudiences = [
    { id: 'all', label: 'Всех уровней' },
    { id: 'women', label: 'Девушки (женский фитнес)' },
    { id: 'men', label: 'Мужчины (силовой тренинг)' },
    { id: 'teens', label: 'Подростки и молодежь' },
    { id: 'seniors', label: 'Возрастные клиенты (50+)' }
  ];

  const [editForm, setEditForm] = useState({
    photo_url: '',
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    instagram: '',
    gym: GYMS_ARRAY[0] || 'Invictus Go (Mega Park)',
    secondary_gym: '',
    experience_years: 3,
    specializations: ['Набор массы и гипертрофия'],
    work_format: 'hybrid',
    target_audience: 'all',
    workout_duration: 60,
    has_free_trial: false,
    free_trial_duration: '45',
    has_free_consultation: false,
    pricing: {
      personal_single: 8000,
      personal_count: 12,
      personal_block: 70000,
      split_single: 12000,
      split_count: 12,
      split_block: 100000,
      online_month: 35000
    },
    bio: '',
    certificates_link: '',
    public_settings: {
      show_phone: true,
      show_instagram: true,
      show_online: true,
      accepting_new_students: true
    }
  });

  useEffect(() => {
    if (trainer) {
      setEditForm({
        photo_url: trainer.avatar_url || trainer.photo_url || '',
        first_name: trainer.first_name || '',
        last_name: trainer.last_name || '',
        username: (trainer.username || cleanUsername || '').replace('@', ''),
        phone: (trainer.phone || '').replace(/^7/, ''),
        instagram: (trainer.instagram || '').replace('@', ''),
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
  }, [trainer, cleanUsername]);

  if (!isOpen) return null;

  // Безопасная загрузка нового фото в бакет avatars
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
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setEditForm(prev => ({ ...prev, photo_url: urlData.publicUrl }));
      }
    } catch (err) {
      console.warn('Загрузка в Storage не удалась, fallback:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
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

  const handlePriceInput = (field, raw) => {
    const clean = String(raw).replace(/\D/g, '');
    const num = clean === '' ? '' : Number(clean);
    setEditForm(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: num }
    }));
  };

  const handleSaveFullProfile = async () => {
    if (!editForm.first_name.trim()) {
      alert('Пожалуйста, укажите имя');
      return;
    }

    setIsSaving(true);
    try {
      const fullNameCombined = `${editForm.first_name.trim()} ${editForm.last_name.trim()}`.trim();
      const fullPhone = editForm.phone ? `7${editForm.phone.replace(/\D/g, '')}` : '';
      const cleanNick = editForm.username ? editForm.username.replace(/[@\s]/g, '').trim().toLowerCase() : cleanUsername;

      const payload = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        full_name: fullNameCombined,
        username: cleanNick,
        photo_url: editForm.photo_url || null,
        avatar_url: editForm.photo_url || null,
        phone: fullPhone,
        whatsapp: fullPhone,
        instagram: editForm.instagram.replace(/[@\s]/g, '').trim(),
        gym: editForm.gym,
        secondary_gym: editForm.secondary_gym || null,
        experience_years: Number(editForm.experience_years) || 1,
        specializations: editForm.specializations,
        specialization: editForm.specializations.join(', '),
        work_format: editForm.work_format,
        target_audience: editForm.target_audience,
        workout_duration: Number(editForm.workout_duration) || 60,
        has_free_trial: editForm.has_free_trial,
        free_trial_duration: editForm.free_trial_duration,
        has_free_consultation: editForm.has_free_consultation,
        pricing: {
          personal_single: Number(editForm.pricing.personal_single) || 8000,
          personal_count: Number(editForm.pricing.personal_count) || 12,
          personal_block: Number(editForm.pricing.personal_block) || 70000,
          split_single: Number(editForm.pricing.split_single) || 12000,
          split_count: Number(editForm.pricing.split_count) || 12,
          split_block: Number(editForm.pricing.split_block) || 100000,
          online_month: Number(editForm.pricing.online_month) || 35000
        },
        bio: editForm.bio.trim(),
        certificates_link: editForm.certificates_link.trim(),
        public_settings: editForm.public_settings
      };

      const { error } = await supabase
        .from('trainer_profiles')
        .update(payload)
        .eq('username', cleanUsername);

      if (error) throw error;

      alert('✅ Анкета тренера успешно сохранена!');
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrimaryGyms = GYMS_ARRAY.filter(g => 
    g.toLowerCase().includes(searchGymQuery.toLowerCase())
  );
  const filteredSecondaryGyms = GYMS_ARRAY.filter(g => 
    g.toLowerCase().includes(searchSecGymQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-150">
      
      {/* 1. ФИКСИРОВАННАЯ ШАПКА */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold text-xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Назад в меню</span>
        </button>

        <h2 className="text-xs font-bold text-slate-900">Редактирование анкеты</h2>

        <div className="w-16" />
      </div>

      {/* 2. СКРОЛЛИРУЕМАЯ ОБЛАСТЬ (КОНТЕНТ СКРОЛЛИТСЯ СТРОГО ВНУТРИ) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full pb-8">
        
        {/* Фото тренера с загрузкой в Supabase Storage */}
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
              ) : editForm.photo_url ? (
                <img src={editForm.photo_url} alt="Аватар" className="w-full h-full object-cover" />
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
            {editForm.first_name ? `${editForm.first_name} ${editForm.last_name || ''}` : 'Фотография тренера'}
          </p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">
            {isUploadingPhoto ? 'Загрузка в облако...' : 'Нажмите на фото для замены'}
          </p>
        </div>

        {/* Личные данные и контакты */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Личные данные и контакты
          </h3>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Имя *</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                placeholder="Данияр"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Фамилия</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                placeholder="Сериков"
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
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value.replace(/[@\s]/g, '') })}
                  className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                  placeholder="coach_nick"
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">WhatsApp (+7)</label>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-slate-500 font-mono text-xs font-semibold select-none">+7</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-7 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                  placeholder="7011234567"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Instagram username</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 font-mono text-xs font-bold">@</span>
              <input
                type="text"
                value={editForm.instagram}
                onChange={e => setEditForm({ ...editForm, instagram: e.target.value.replace(/[@\s]/g, '') })}
                className="w-full pl-6 pr-2.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#1E60D5]"
                placeholder="coach_almaty"
              />
            </div>
          </div>

          {/* Стаж работы в годах со степпером */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-900">Опыт работы тренером</p>
              <p className="text-[10.5px] text-slate-400">Тренерский стаж в годах</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                className="w-8 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-2xs active:scale-90 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono w-12 text-center text-slate-900">{editForm.experience_years} года</span>
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, experience_years: prev.experience_years + 1 }))}
                className="w-8 h-7 bg-[#1E60D5] text-white rounded-lg flex items-center justify-center font-bold shadow-2xs active:scale-90 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Фитнес-клубы Алматы */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Фитнес-клубы работы в Алматы
          </h3>
          
          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Основной клуб работы *</label>
            <input
              type="text"
              placeholder="🔍 Быстрый поиск клуба..."
              value={searchGymQuery}
              onChange={e => setSearchGymQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs mb-1.5 outline-none focus:bg-white"
            />
            <select
              value={editForm.gym}
              onChange={e => setEditForm({ ...editForm, gym: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 truncate outline-none"
            >
              {filteredPrimaryGyms.slice(0, 80).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">Второй клуб (опционально)</label>
            <input
              type="text"
              placeholder="🔍 Поиск второго зала..."
              value={searchSecGymQuery}
              onChange={e => setSearchSecGymQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs mb-1.5 outline-none focus:bg-white"
            />
            <select
              value={editForm.secondary_gym}
              onChange={e => setEditForm({ ...editForm, secondary_gym: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 truncate outline-none"
            >
              <option value="">Не указан (работаю только в одном зале)</option>
              {filteredSecondaryGyms.slice(0, 80).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Форматы, пробная тренировка и время */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Формат ведения и условия
          </h3>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1.5">Формат ведения:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {workFormats.map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, work_format: fmt.id })}
                  className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                    editForm.work_format === fmt.id
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
            <div className="grid grid-cols-2 gap-1.5">
              {targetAudiences.map(aud => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, target_audience: aud.id })}
                  className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                    editForm.target_audience === aud.id
                      ? 'bg-[#1E60D5] text-white border-[#1E60D5] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Тумблеры пробной тренировки и консультации */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div 
              onClick={() => setEditForm(prev => ({ ...prev, has_free_trial: !prev.has_free_trial }))}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-98 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Бесплатная пробная тренировка</p>
                <p className="text-[10.5px] text-slate-400">Привлекает в 3 раза больше заявок из каталога</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                editForm.has_free_trial ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
              }`}>
                {editForm.has_free_trial && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div 
              onClick={() => setEditForm(prev => ({ ...prev, has_free_consultation: !prev.has_free_consultation }))}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 cursor-pointer active:scale-98 transition-all"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Бесплатная онлайн-консультация</p>
                <p className="text-[10.5px] text-slate-400">Созвон на 15 мин перед началом тренировок</p>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                editForm.has_free_consultation ? 'bg-[#1E60D5] border-[#1E60D5] text-white' : 'bg-white border-slate-300'
              }`}>
                {editForm.has_free_consultation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>

        {/* Прайс-лист и абонементы (₸) — Без залипания нуля */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Прайс-лист и стоимость тренировок (₸)
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Разовая (₸)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.pricing.personal_single}
                onChange={e => handlePriceInput('personal_single', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center font-mono font-bold text-xs text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Занятий в блоке</label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.pricing.personal_count}
                onChange={e => handlePriceInput('personal_count', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center font-mono font-bold text-xs text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Блок 12 зан. (₸)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.pricing.personal_block}
                onChange={e => handlePriceInput('personal_block', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5] outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Сплит (пара) блок (₸)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.pricing.split_block}
                onChange={e => handlePriceInput('split_block', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center font-mono font-bold text-xs text-slate-900 outline-none focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Онлайн-ведение/мес (₸)</label>
              <input
                type="text"
                inputMode="numeric"
                value={editForm.pricing.online_month}
                onChange={e => handlePriceInput('online_month', e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-center font-mono font-bold text-xs text-[#1E60D5] outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Направления и специализации */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            Специализации (от 1 до 8)
          </h3>

          <div className="space-y-1">
            {specializationList.map((spec) => {
              const isSelected = editForm.specializations.includes(spec);
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

        {/* О себе и верификация */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            О себе и подтверждение дипломов
          </h3>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">О себе и принципах работы</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Расскажите о ваших методиках, успехах учеников и подходе к тренировкам..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs resize-none outline-none focus:bg-white focus:border-[#1E60D5]"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">
              Ссылка на сертификаты / диплом (для верификации)
            </label>
            <input
              type="url"
              value={editForm.certificates_link}
              onChange={e => setEditForm({ ...editForm, certificates_link: e.target.value })}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-mono text-[11px] outline-none focus:bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Прикрепите ссылку на фото дипломов для получения бейджа «Верифицирован ⭐»
            </p>
          </div>
        </div>

      </div>

      {/* 3. ЖЁСТКО ПРИЖАТЫЙ НИЖНИЙ ДОК (БОЛЬШЕ НЕ КАТАЕТСЯ ПО ЭКРАНУ!) */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3.5 max-w-md mx-auto w-full shadow-lg">
        <button
          type="button"
          disabled={isSaving || isUploadingPhoto}
          onClick={handleSaveFullProfile}
          className="w-full py-3.5 px-5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Сохранение изменений...' : 'Сохранить анкету'}</span>
        </button>
      </div>

    </div>
  );
}
