import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ALMATY_GYMS } from '../../data/almatyGyms';

export default function GymBroProfileForm({ currentUserId, initialData, onSaved, onCancel }) {
  const gymsList = Array.isArray(ALMATY_GYMS) && ALMATY_GYMS.length > 0 
    ? ALMATY_GYMS 
    : ['Invictus Go | Навои', 'Adrenaline | Абая', 'Банзай | Сейфуллина'];

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    gender: initialData?.gender || 'Мужской',
    looking_for_gender: initialData?.looking_for_gender || 'Всех',
    home_gym: initialData?.home_gym || gymsList[0],
    preferred_time: initialData?.preferred_time || 'Вечер (18:00 - 21:00)',
    personality_type: initialData?.personality_type || 'Амбиверт',
    experience_level: initialData?.experience_level || 'Средний (1-3 года)',
    bio: initialData?.bio || '',
    photo_url: initialData?.photo_url || '',
    telegram_contact: initialData?.telegram_contact || ''
  });

  const [gymSearch, setGymSearch] = useState('');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);

  const TIME_OPTIONS = [
    'Утро (07:00 - 10:00)',
    'День (12:00 - 16:00)',
    'Вечер (18:00 - 21:00)',
    'Поздний вечер (21:00+)'
  ];

  const PERSONALITY_OPTIONS = [
    { label: 'Интроверт', emoji: '🤫' },
    { label: 'Амбиверт', emoji: '⚖️' },
    { label: 'Экстраверт', emoji: '⚡' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Максимальный размер фото — 5 МБ');
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
      alert('Пожалуйста, укажите имя');
      return;
    }

    if (onSaved) {
      onSaved(formData);
    }
  };

  const filteredGyms = gymsList.filter(g =>
    g.toLowerCase().includes(gymSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-sm mx-auto bg-[#121622] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Шапка формы с кнопкой выхода */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
          <span>⚙️</span> Моя анкета GymBro
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Фото */}
        <div className="flex items-center gap-3.5 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {formData.photo_url ? (
              <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">📸</span>
            )}
          </div>
          <div className="flex-1">
            <span className="block text-slate-400 font-medium mb-1">Фото в карточке</span>
            <label className="inline-block px-3 py-1.5 rounded-xl bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF8C38] border border-[#FF5A1F]/30 font-bold cursor-pointer transition">
              <span>Загрузить фото</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Имя */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Имя</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
            placeholder="Твое имя"
          />
        </div>

        {/* Психотип */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Вайб (психотип)</label>
          <div className="grid grid-cols-3 gap-1.5">
            {PERSONALITY_OPTIONS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setFormData({ ...formData, personality_type: p.label })}
                className={`py-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  formData.personality_type === p.label
                    ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] font-bold shadow-md shadow-[#FF5A1F]/25'
                    : 'bg-[#181d2d] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>{p.emoji}</span>
                <span className="text-[10px]">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Время */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Время тренировок</label>
          <select
            value={formData.preferred_time}
            onChange={e => setFormData({ ...formData, preferred_time: e.target.value })}
            className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
          >
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t} className="bg-[#121622]">{t}</option>
            ))}
          </select>
        </div>

        {/* Зал */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Твой фитнес-клуб</label>
          <button
            type="button"
            onClick={() => setIsGymModalOpen(true)}
            className="w-full bg-[#181d2d] border border-white/10 hover:border-[#FF5A1F] rounded-xl px-3 py-2 text-left flex items-center justify-between text-white transition cursor-pointer"
          >
            <span className="truncate text-[#FF8C38] font-medium">
              {formData.home_gym || 'Выбрать зал...'}
            </span>
            <span className="text-[10px] text-slate-400 ml-2 shrink-0">🔍 Поиск</span>
          </button>
        </div>

        {/* Био */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">О себе</label>
          <textarea
            rows="2"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-[#181d2d] border border-white/10 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
            placeholder="Ищу бро на жим, базу, сушку..."
          />
        </div>

        {/* Кнопки сохранения и отмены */}
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold transition cursor-pointer"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FF8C38] text-white font-black shadow-lg shadow-[#FF5A1F]/25 hover:brightness-110 transition cursor-pointer"
          >
            Сохранить
          </button>
        </div>
      </form>

      {/* Модалка выбора зала */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121622] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-sm max-h-[75vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-bold text-white text-xs">📍 Выберите зал ({filteredGyms.length})</h4>
              <button
                type="button"
                onClick={() => setIsGymModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="py-2">
              <input
                type="text"
                value={gymSearch}
                onChange={e => setGymSearch(e.target.value)}
                placeholder="Поиск зала (Invictus, Абая...)"
                className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 divide-y divide-white/5">
              {filteredGyms.map((gym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, home_gym: gym }));
                    setIsGymModalOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-xs text-slate-200 hover:bg-white/[0.06] transition cursor-pointer"
                >
                  {gym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
