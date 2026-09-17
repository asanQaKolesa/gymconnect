import React, { useState } from 'react';
import { ALMATY_GYMS } from '../../data/almatyGyms';

export default function GymBroProfileForm({ currentUserId, initialData, onSaved, onCancel }) {
  const gymsList = Array.isArray(ALMATY_GYMS) && ALMATY_GYMS.length > 0 
    ? ALMATY_GYMS 
    : ['Invictus Go | Навои', 'Adrenaline | Абая', 'Банзай | Сейфуллина'];

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || initialData?.name || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'Мужской',
    looking_for_gender: initialData?.looking_for_gender || initialData?.looking_for || 'Всех',
    experience_level: initialData?.experience_level || initialData?.level || 'Средний (1-3 года)',
    goals: Array.isArray(initialData?.goals) 
      ? initialData.goals 
      : (initialData?.split ? [initialData.split] : ['Набор массы']),
    preferred_days: Array.isArray(initialData?.preferred_days) 
      ? initialData.preferred_days 
      : ['Пн', 'Ср', 'Пт'],
    preferred_time: initialData?.preferred_time || initialData?.time_slot || 'Вечер (18:00 - 21:00)',
    personality_type: initialData?.personality_type || 'Амбиверт',
    home_gym: initialData?.home_gym || initialData?.weekday_gym || gymsList[0],
    bio: initialData?.bio || '',
    photo_url: initialData?.photo_url || '',
    telegram_contact: initialData?.telegram_contact || initialData?.telegram_username || ''
  });

  const [gymSearch, setGymSearch] = useState('');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);

  const TIME_OPTIONS = [
    'Утро (06:00 - 10:00)',
    'Обед (12:00 - 15:00)',
    'После обеда (15:00 - 18:00)',
    'Вечер (18:00 - 21:00)',
    'Поздний вечер (21:00+)',
    'Плавающий график'
  ];

  const LEVELS = [
    'Новичок (< 1 года)',
    'Средний (1-3 года)',
    'Опытный (3-5 лет)',
    'PRO / Выступающий'
  ];

  const PERSONALITY_OPTIONS = [
    { label: 'Интроверт', emoji: '🤫' },
    { label: 'Амбиверт', emoji: '⚖️' },
    { label: 'Экстраверт', emoji: '⚡' }
  ];

  const GOALS_LIST = [
    'Набор массы',
    'Сушка / Рельеф',
    'Сила / Пауэрлифтинг',
    'Тонус и здоровье',
    'Кроссфит',
    'Выносливость'
  ];

  const DAYS_LIST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const toggleGoal = (g) => {
    setFormData(prev => {
      const exists = prev.goals.includes(g);
      return {
        ...prev,
        goals: exists ? prev.goals.filter(x => x !== g) : [...prev.goals, g]
      };
    });
  };

  const toggleDay = (d) => {
    setFormData(prev => {
      const exists = prev.preferred_days.includes(d);
      return {
        ...prev,
        preferred_days: exists ? prev.preferred_days.filter(x => x !== d) : [...prev.preferred_days, d]
      };
    });
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      alert('Пожалуйста, укажите ваше имя');
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
      {/* Шапка формы */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
            <span>⚙️</span> Анкета GymBro
          </h3>
          <p className="text-[10px] text-slate-400">Заполни профиль для подбора напарников</p>
        </div>
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
          <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
            {formData.photo_url ? (
              <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📸</span>
            )}
          </div>
          <div className="flex-1">
            <span className="block text-slate-400 font-medium mb-1">Фотография анкеты</span>
            <label className="inline-block px-3 py-1.5 rounded-xl bg-[#FF5A1F]/15 hover:bg-[#FF5A1F]/25 text-[#FF8C38] border border-[#FF5A1F]/30 font-bold cursor-pointer transition">
              <span>Загрузить фото</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Имя */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Имя и фамилия</label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
            placeholder="Асанәли"
          />
        </div>

        {/* Возраст и Пол */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Возраст</label>
            <input
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
              placeholder="25"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block mb-1">Твой пол</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
            >
              <option value="Мужской">Мужской</option>
              <option value="Женский">Женский</option>
            </select>
          </div>
        </div>

        {/* Кого ищешь для совместных тренировок */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Кого ищешь для тренировок?</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['Парней', 'Девушек', 'Всех'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setFormData({ ...formData, looking_for_gender: g })}
                className={`py-2 rounded-xl border text-center font-bold text-[11px] transition cursor-pointer ${
                  formData.looking_for_gender === g
                    ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-md shadow-[#FF5A1F]/25'
                    : 'bg-[#181d2d] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Вайб (психотип) */}
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

        {/* Стаж */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Опыт в зале</label>
          <select
            value={formData.experience_level}
            onChange={e => setFormData({ ...formData, experience_level: e.target.value })}
            className="w-full bg-[#181d2d] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF5A1F]"
          >
            {LEVELS.map(lvl => (
              <option key={lvl} value={lvl} className="bg-[#121622]">{lvl}</option>
            ))}
          </select>
        </div>

        {/* Цели тренировок (чипсы) */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Цели (выбери несколько)</label>
          <div className="flex flex-wrap gap-1.5">
            {GOALS_LIST.map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                  formData.goals.includes(goal)
                    ? 'bg-[#FF5A1F]/20 text-[#FF9E66] border-[#FF5A1F]'
                    : 'bg-[#181d2d] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Дни недели */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Дни тренировок</label>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_LIST.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`py-1.5 rounded-lg border text-center text-[10px] font-bold transition cursor-pointer ${
                  formData.preferred_days.includes(day)
                    ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                    : 'bg-[#181d2d] text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {day}
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
            placeholder="Ищу напарника на жим, базу, страховку..."
          />
        </div>

        {/* Telegram */}
        <div>
          <label className="text-slate-400 font-medium block mb-1">Telegram username</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-500 text-xs">@</span>
            <input
              type="text"
              value={formData.telegram_contact.replace('@', '')}
              onChange={e => setFormData({ ...formData, telegram_contact: e.target.value.replace('@', '') })}
              className="w-full bg-[#181d2d] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A1F]"
              placeholder="username"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 pt-3">
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
            Сохранить анкету
          </button>
        </div>
      </form>

      {/* Модалка поиска клуба из 230 залов */}
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
                placeholder="Поиск зала (Invictus, Абая, Blitz...)"
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
