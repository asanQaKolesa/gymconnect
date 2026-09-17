import React, { useState } from 'react';

const SPLITS = ['Ноги / Спина', 'Грудь / Руки', 'FullBody', 'Кардио / Функционал', 'CrossFit'];
const TIME_SLOTS = ['Утро (07:00 - 10:00)', 'День (12:00 - 16:00)', 'Вечер (18:00 - 21:00)', 'Поздний вечер (21:00+)'];

export default function GymBroOnboarding({ initialData, gyms, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    gender: initialData?.gender || 'Парень',
    looking_for: initialData?.looking_for || 'Всех',
    city: initialData?.city || 'Алматы',
    weekday_gym: initialData?.weekday_gym || (gyms[0]?.name || 'Invictus Go'),
    weekend_gym: initialData?.weekend_gym || (gyms[0]?.name || 'Invictus Go'),
    level: initialData?.level || 'Средний (1-3 года)',
    split: initialData?.split || SPLITS[0],
    time_slot: initialData?.time_slot || TIME_SLOTS[2],
    instagram: initialData?.instagram || '',
    bio: initialData?.bio || ''
  });

  const cityGyms = gyms.filter(g => !g.city || g.city === form.city);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Укажи имя');
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="apple-glass p-5 space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white tracking-tight">Анкета поиска GymBro</h2>
        <p className="text-xs text-slate-400">Напарники будут подбираться по твоему расписанию и залам.</p>
      </div>

      <div className="space-y-3 pt-1">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя в профиле</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full apple-input"
            placeholder="Как к тебе обращаться"
          />
        </div>

        {/* Кого ищешь */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Кого ты ищешь в напарники?</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['Парня', 'Девушку', 'Всех'].map(target => (
              <button
                key={target}
                type="button"
                onClick={() => setForm({ ...form, looking_for: target })}
                className={`py-2 text-xs font-semibold rounded-xl transition ${
                  form.looking_for === target
                    ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                }`}
              >
                {target}
              </button>
            ))}
          </div>
        </div>

        {/* Город */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город тренировок</label>
          <div className="grid grid-cols-2 gap-2">
            {['Алматы', 'Астана'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, city: c })}
                className={`py-2 text-xs font-semibold rounded-xl transition ${
                  form.city === c
                    ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Зал в будни */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Зал в будни</label>
          <select
            value={form.weekday_gym}
            onChange={e => setForm({ ...form, weekday_gym: e.target.value })}
            className="w-full apple-input"
          >
            {cityGyms.map(g => (
              <option key={g.id || g.name} value={g.name} className="bg-[#0A0D14] text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Зал в выходные */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Зал в выходные</label>
          <select
            value={form.weekend_gym}
            onChange={e => setForm({ ...form, weekend_gym: e.target.value })}
            className="w-full apple-input"
          >
            {cityGyms.map(g => (
              <option key={g.id || g.name} value={g.name} className="bg-[#0A0D14] text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Сплит */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Основной фокус тренировок</label>
          <select
            value={form.split}
            onChange={e => setForm({ ...form, split: e.target.value })}
            className="w-full apple-input"
          >
            {SPLITS.map(s => (
              <option key={s} value={s} className="bg-[#0A0D14] text-white">{s}</option>
            ))}
          </select>
        </div>

        {/* Время */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Удобное время</label>
          <select
            value={form.time_slot}
            onChange={e => setForm({ ...form, time_slot: e.target.value })}
            className="w-full apple-input"
          >
            {TIME_SLOTS.map(t => (
              <option key={t} value={t} className="bg-[#0A0D14] text-white">{t}</option>
            ))}
          </select>
        </div>

        {/* Instagram */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Instagram (по желанию)</label>
          <input
            type="text"
            value={form.instagram}
            onChange={e => setForm({ ...form, instagram: e.target.value.replace('@', '') })}
            placeholder="username"
            className="w-full apple-input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full gymshark-btn-electric py-3 text-xs mt-2"
      >
        {isSaving ? 'Сохраняем...' : 'Опубликовать анкету GymBro 🔥'}
      </button>
    </form>
  );
}
