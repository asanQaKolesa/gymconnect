// src/components/trainer/components/modals/TrainerEditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Minus, Check } from 'lucide-react';
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
  const [searchGymQuery, setSearchGymQuery] = useState('');
  const [searchSecGymQuery, setSearchSecGymQuery] = useState('');

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
    first_name: '',
    last_name: '',
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
        first_name: trainer.first_name || '',
        last_name: trainer.last_name || '',
        phone: trainer.phone || '',
        instagram: trainer.instagram || '',
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
  }, [trainer]);

  if (!isOpen) return null;

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
          certificates_link: editForm.certificates_link.trim(),
          public_settings: editForm.public_settings
        })
        .eq('username', cleanUsername);

      if (error) throw error;
      alert('Анкета тренера успешно сохранена!');
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
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">Редактирование анкеты</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24">
        {/* Личные данные */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Личные данные и контакты</p>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Имя *</label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                placeholder="Данияр"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Фамилия *</label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                placeholder="Сериков"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">WhatsApp для связи (+7) *</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium"
              placeholder="+7 (701) 000-00-00"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Instagram username (без @)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">@</span>
              <input
                type="text"
                value={editForm.instagram}
                onChange={e => setEditForm({ ...editForm, instagram: e.target.value })}
                className="w-full p-2.5 pl-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium"
                placeholder="coach_almaty"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-800">Опыт работы тренером</p>
              <p className="text-[10px] text-slate-400">Тренерский стаж в годах</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, experience_years: Math.max(1, prev.experience_years - 1) }))}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-xs active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono w-14 text-center text-slate-900">{editForm.experience_years} года</span>
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, experience_years: prev.experience_years + 1 }))}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-slate-700 shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Залы */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Фитнес-клубы в Алматы</p>
          
          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Основной клуб работы *</label>
            <input
              type="text"
              placeholder="🔍 Поиск основного клуба..."
              value={searchGymQuery}
              onChange={e => setSearchGymQuery(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] mb-1.5"
            />
            <select
              value={editForm.gym}
              onChange={e => setEditForm({ ...editForm, gym: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs truncate font-medium text-slate-800"
            >
              {filteredPrimaryGyms.slice(0, 80).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Второй зал (опционально)</label>
            <input
              type="text"
              placeholder="🔍 Поиск второго клуба..."
              value={searchSecGymQuery}
              onChange={e => setSearchSecGymQuery(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] mb-1.5"
            />
            <select
              value={editForm.secondary_gym}
              onChange={e => setEditForm({ ...editForm, secondary_gym: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs truncate font-medium text-slate-800"
            >
              <option value="">Не указан (только один клуб)</option>
              {filteredSecondaryGyms.slice(0, 80).map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Специализации и форматы */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Специализации и форматы работы</p>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Направления (выберите от 1 до 8):</label>
            <div className="space-y-1">
              {specializationList.map((spec) => {
                const isSelected = editForm.specializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span>{spec}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Формат ведения:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {workFormats.map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, work_format: fmt.id })}
                  className={`p-2 rounded-xl text-center text-[10.5px] font-medium border transition-all ${
                    editForm.work_format === fmt.id
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Целевая аудитория:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {targetAudiences.map(aud => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, target_audience: aud.id })}
                  className={`p-2 rounded-xl text-center text-[10.5px] font-medium border transition-all ${
                    editForm.target_audience === aud.id
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Прайс-лист */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Прайс-лист и абонементы (₸)</p>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5">Разовая (₸)</label>
              <input
                type="number"
                value={editForm.pricing.personal_single}
                onChange={e => setEditForm({
                  ...editForm,
                  pricing: { ...editForm.pricing, personal_single: Number(e.target.value) }
                })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5">Кол-во зан.</label>
              <input
                type="number"
                value={editForm.pricing.personal_count}
                onChange={e => setEditForm({
                  ...editForm,
                  pricing: { ...editForm.pricing, personal_count: Number(e.target.value) }
                })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[9.5px] text-slate-400 block mb-0.5">Абонемент (₸)</label>
              <input
                type="number"
                value={editForm.pricing.personal_block}
                onChange={e => setEditForm({
                  ...editForm,
                  pricing: { ...editForm.pricing, personal_block: Number(e.target.value) }
                })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold text-xs text-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[9.5px] text-slate-400 block mb-0.5">Онлайн-ведение в месяц (₸)</label>
            <input
              type="number"
              value={editForm.pricing.online_month}
              onChange={e => setEditForm({
                ...editForm,
                pricing: { ...editForm.pricing, online_month: Number(e.target.value) }
              })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-blue-600"
            />
          </div>
        </div>

        {/* О себе */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">О себе и сертификаты</p>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">О себе и методике</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Расскажите о вашем тренерском опыте, принципах и достижениях..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Ссылка на сертификаты (Google Диск)</label>
            <input
              type="url"
              value={editForm.certificates_link}
              onChange={e => setEditForm({ ...editForm, certificates_link: e.target.value })}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveFullProfile}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Сохранение изменений...' : 'Сохранить анкету'}</span>
        </button>
      </div>
    </div>
  );
}
