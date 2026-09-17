import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { ALMATY_GYMS } from '../../data/almatyGyms';

export default function GymBroProfileForm({ currentUserId, initialData, onSaved, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    full_name: '',
    age: '',
    gender: 'Мужской',
    looking_for_gender: 'Всех',
    experience_level: 'Средний (1-3 года)',
    goals: [],
    preferred_days: [],
    preferred_time: 'Вечер (18:00 - 21:00)',
    personality_type: 'Амбиверт',
    home_gym: ALMATY_GYMS[0],
    bio: '',
    photo_url: '',
    telegram_contact: ''
  });

  const [gymSearch, setGymSearch] = useState('');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const TIME_SLOTS = [
    'Утро (06:00 - 10:00)',
    'Обед (12:00 - 15:00)',
    'После обеда (15:00 - 18:00)',
    'Вечер (18:00 - 21:00)',
    'Поздний вечер (21:00+)',
    'Плавающий график / В любое время'
  ];

  const PERSONALITY_TYPES = [
    { label: 'Интроверт', emoji: '🤫' },
    { label: 'Экстраверт', emoji: '⚡' },
    { label: 'Амбиверт', emoji: '⚖️' }
  ];

  const GOALS_LIST = ['Набор массы', 'Похудение / Сушка', 'Пауэрлифтинг', 'Поддержание формы', 'Кроссфит', 'Выносливость'];
  const DAYS_LIST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.telegram_contact.trim()) {
      alert('Укажите ваш Telegram username для связи');
      return;
    }

    try {
      const payload = {
        user_id: currentUserId,
        ...formData,
        telegram_contact: formData.telegram_contact.replace('@', '').trim(),
        age: parseInt(formData.age, 10) || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('gymbro_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      alert('✅ Анкета сохранена!');
      if (onSaved) onSaved(payload);
    } catch (err) {
      alert('Ошибка при сохранении: ' + err.message);
    }
  };

  const toggleGoal = (g) => {
    setFormData(p => ({
      ...p,
      goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g]
    }));
  };

  const toggleDay = (d) => {
    setFormData(p => ({
      ...p,
      preferred_days: p.preferred_days.includes(d) ? p.preferred_days.filter(x => x !== d) : [...p.preferred_days, d]
    }));
  };

  const filteredGyms = ALMATY_GYMS.filter(g =>
    g.toLowerCase().includes(gymSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSave} className="space-y-4 bg-[#111827] p-5 rounded-2xl border border-gray-800">
      {/* Согласие / Правила */}
      <div 
        onClick={() => setIsRulesModalOpen(true)}
        className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-3 transition"
      >
        <span className="text-base shrink-0">🛡️</span>
        <div className="text-xs">
          <p className="font-bold text-emerald-300">Правила сообщества и согласие</p>
          <p className="text-gray-400 text-[11px]">Нажмите, чтобы прочитать условия публикации профиля</p>
        </div>
      </div>

      {/* Фото */}
      <div className="flex items-center gap-4 bg-[#1f2937]/60 p-3 rounded-2xl border border-gray-700/60">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
          {formData.photo_url ? (
            <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📸</span>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-gray-300 block">Фото анкеты</label>
          <label className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold cursor-pointer transition">
            <span>📁 Загрузить фото</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium">Имя и фамилия</label>
        <input
          type="text"
          required
          value={formData.full_name}
          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 font-medium">Возраст</label>
          <input
            type="number"
            required
            value={formData.age}
            onChange={e => setFormData({ ...formData, age: e.target.value })}
            className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium">Твой пол</label>
          <select
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium mb-1 block">Кого ищешь для тренировок?</label>
        <div className="grid grid-cols-3 gap-2">
          {['Парней', 'Девушек', 'Всех'].map(target => (
            <button
              key={target}
              type="button"
              onClick={() => setFormData({ ...formData, looking_for_gender: target })}
              className={`py-2 rounded-xl border text-xs font-bold transition ${
                formData.looking_for_gender === target
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-[#1f2937] text-gray-300 border-gray-700'
              }`}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium mb-1 block">Психотип (вайб)</label>
        <div className="grid grid-cols-3 gap-2">
          {PERSONALITY_TYPES.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setFormData({ ...formData, personality_type: p.label })}
              className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                formData.personality_type === p.label
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                  : 'bg-[#1f2937] border-gray-700 text-gray-400'
              }`}
            >
              <span>{p.emoji}</span>
              <span className="text-xs">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium">Время тренировок</label>
        <select
          value={formData.preferred_time}
          onChange={e => setFormData({ ...formData, preferred_time: e.target.value })}
          className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:border-emerald-500 focus:outline-none"
        >
          {TIME_SLOTS.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400 font-medium">Твой фитнес-клуб / филиал</label>
        <button
          type="button"
          onClick={() => setIsGymModalOpen(true)}
          className="w-full bg-[#1f2937] border border-gray-700 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between text-white transition"
        >
          <span className="truncate text-xs font-medium text-emerald-300">
            {formData.home_gym || 'Выбрать зал из списка...'}
          </span>
          <span className="text-xs text-gray-400 ml-2 shrink-0">🔍 Найти</span>
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium mb-1 block">Цели</label>
        <div className="flex flex-wrap gap-1.5">
          {GOALS_LIST.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGoal(g)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                formData.goals.includes(g)
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium mb-1 block">Дни тренировок</label>
        <div className="flex gap-1">
          {DAYS_LIST.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition ${
                formData.preferred_days.includes(d)
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium">О себе</label>
        <textarea
          rows="2"
          value={formData.bio}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
          className="w-full bg-[#1f2937] border border-gray-700 rounded-xl p-3 text-xs mt-1 text-white focus:border-emerald-500 focus:outline-none"
          placeholder="Ищу напарника для базы, страховка на жиме..."
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 font-medium">Telegram Username</label>
        <div className="relative mt-1">
          <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm">@</span>
          <input
            type="text"
            required
            value={formData.telegram_contact}
            onChange={e => setFormData({ ...formData, telegram_contact: e.target.value.replace('@', '') })}
            className="w-full bg-[#1f2937] border border-gray-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            placeholder="username"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition shadow-lg shadow-emerald-500/20"
        >
          💾 Сохранить анкету
        </button>
      </div>

      {/* Модалка зала */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-xs font-bold text-white">📍 Выберите зал ({filteredGyms.length})</h3>
              <button type="button" onClick={() => setIsGymModalOpen(false)} className="text-gray-400 text-xs font-bold">✕</button>
            </div>
            <div className="py-2">
              <input
                type="text"
                value={gymSearch}
                onChange={e => setGymSearch(e.target.value)}
                placeholder="Поиск зала (Invictus, Абая, Blitz...)"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 pr-1 divide-y divide-gray-800/40">
              {filteredGyms.map((gym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, home_gym: gym }));
                    setIsGymModalOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg text-xs text-gray-200 hover:bg-gray-800 transition"
                >
                  {gym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модалка правил */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl w-full max-w-md p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">🛡️ Правила сообщества</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Заполняя анкету, вы даете согласие на размещение вашего профиля в каталоге GymBro. Номера телефонов не распространяются, связь идет через Telegram username.
            </p>
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(false)}
              className="w-full py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
