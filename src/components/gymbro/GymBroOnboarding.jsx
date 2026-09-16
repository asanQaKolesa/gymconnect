import React, { useState } from 'react';

export default function GymBroOnboarding({
  gyms = [],
  userCity = 'Алматы',
  userName = '',
  userGender = 'Парень',
  onComplete,
  isSaving
}) {
  const [city, setCity] = useState(userCity);
  const [formData, setFormData] = useState({
    name: userName || '',
    gender: userGender || 'Парень',
    lookingFor: 'all', // 'bro' | 'girl' | 'all'
    level: 'Средний (1-3 года)',
    weekdayGym: '',
    weekendGym: '',
    split: 'Ноги / Спина (акцент на базу)',
    timeSlot: '19:00 - 21:00',
    instagram: '',
    bio: ''
  });

  const cityGyms = gyms.filter(g => (g.city || 'Алматы') === city);
  const defaultGym = cityGyms[0]?.name || 'Invictus Go';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Пожалуйста, укажи имя в анкете');

    onComplete({
      name: formData.name.trim(),
      gender: formData.gender,
      looking_for: formData.lookingFor,
      city,
      weekday_gym: formData.weekdayGym || defaultGym,
      weekend_gym: formData.weekendGym || defaultGym,
      level: formData.level,
      split: formData.split,
      time_slot: formData.timeSlot,
      instagram: formData.instagram.replace('@', '').trim(),
      bio: formData.bio.trim()
    });
  };

  return (
    <div className="space-y-4">
      <header className="text-center py-2 space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <span className="text-amber-500 text-sm">🤝</span>
          <span className="text-xs font-bold text-amber-400">Анкета поиска GymBro</span>
        </div>
        <h2 className="text-lg font-black text-white mt-1">Кого и где ты ищешь?</h2>
        <p className="text-[11px] text-slate-400">
          Заполни карточку напарника, чтобы видеть подходящих людей и появиться в поиске своего зала.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город тренировок</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCity('Алматы');
                  setFormData(prev => ({ ...prev, weekdayGym: '', weekendGym: '' }));
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  city === 'Алматы'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🍎 Алматы
              </button>
              <button
                type="button"
                onClick={() => {
                  setCity('Астана');
                  setFormData(prev => ({ ...prev, weekdayGym: '', weekendGym: '' }));
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  city === 'Астана'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🏛 Астана
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя в карточке</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Как тебя подписать?"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Твой пол</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'Парень' })}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  formData.gender === 'Парень'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🧔 Парень
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'Девушка' })}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  formData.gender === 'Девушка'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                👩 Девушка
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Кого ты ищешь для тренировок?</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, lookingFor: 'bro' })}
                className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                  formData.lookingFor === 'bro'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🧔 Парня
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, lookingFor: 'girl' })}
                className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                  formData.lookingFor === 'girl'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                👩 Девушку
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, lookingFor: 'all' })}
                className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                  formData.lookingFor === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                🤝 Без разницы
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏢 Твой зал в будни ({city})</label>
            <select
              value={formData.weekdayGym || defaultGym}
              onChange={e => setFormData({ ...formData, weekdayGym: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {cityGyms.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏙 Твой зал на выходных ({city})</label>
            <select
              value={formData.weekendGym || defaultGym}
              onChange={e => setFormData({ ...formData, weekendGym: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {cityGyms.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Твой стаж в зале</label>
            <select
              value={formData.level}
              onChange={e => setFormData({ ...formData, level: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Новичок (до 1 года)">Новичок (до 1 года)</option>
              <option value="Средний (1-3 года)">Средний (1-3 года)</option>
              <option value="Опытный (3+ года)">Опытный (3+ года)</option>
              <option value="Продвинутый лифтер">Продвинутый лифтер</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Фокус / Сплит тренировок</label>
            <select
              value={formData.split}
              onChange={e => setFormData({ ...formData, split: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Ноги / Спина (акцент на базу)">Ноги / Спина (акцент на базу)</option>
              <option value="Грудь / Плечи / Руки">Грудь / Плечи / Руки</option>
              <option value="Full Body (все тело)">Full Body (все тело)</option>
              <option value="Пауэрлифтинг (присед / жим / тяга)">Пауэрлифтинг (присед / жим / тяга)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">⏰ Удобное время для тренировок</label>
            <input
              type="text"
              value={formData.timeSlot}
              onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
              placeholder="Будни 19:30, Выходные 12:00"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">📸 Твой Instagram (без @, по желанию)</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={e => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="username"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">💬 О себе / Цель напарника</label>
            <input
              type="text"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Ищу страховку на рабочий жим или напарника на базу"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/20"
        >
          {isSaving ? 'Публикуем карточку...' : 'Опубликовать карточку и войти в поиск 🚀'}
        </button>
      </form>
    </div>
  );
}
