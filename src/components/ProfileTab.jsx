import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileTab({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('athlete');
  const [saving, setSaving] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || 'Алматы',
    sport_type: user?.sport_type || 'Атлет',
    instagram: user?.instagram || '',
    bio: user?.bio || ''
  });

  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        city: user.city || 'Алматы',
        sport_type: user.sport_type || 'Атлет',
        instagram: user.instagram || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    async function loadStats() {
      if (!myTgId) return;
      try {
        const { data: posts } = await supabase.from('feed_posts').select('likes_count').eq('user_id', myTgId);
        if (posts) setTotalLikes(posts.reduce((acc, p) => acc + (p.likes_count || 0), 0));

        const { data: f1 } = await supabase.from('friendships').select('id').eq('user_id', myTgId).eq('status', 'accepted');
        const { data: f2 } = await supabase.from('friendships').select('id').eq('friend_id', myTgId).eq('status', 'accepted');
        setFriendsCount((f1?.length || 0) + (f2?.length || 0));
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [myTgId]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Укажите имя');
    setSaving(true);

    const payload = {
      telegram_id: myTgId,
      name: form.name.trim(),
      city: form.city,
      sport_type: form.sport_type,
      instagram: form.instagram ? form.instagram.replace('@', '').trim() : null,
      bio: form.bio ? form.bio.trim() : null
    };

    try {
      const { data, error } = await supabase.from('users').upsert(payload, { onConflict: 'telegram_id' }).select().single();
      if (!error && data) {
        onUpdateUser(data);
        alert('Профиль сохранен! ✅');
      } else {
        alert('Ошибка сохранения: ' + (error?.message || 'Попробуйте позже'));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="apple-glass p-1.5 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('athlete')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'athlete' ? 'bg-[#FF5A1F] text-white' : 'text-slate-400 bg-white/[0.02]'
          }`}
        >
          👤 Профиль
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'stats' ? 'bg-[#FF5A1F] text-white' : 'text-slate-400 bg-white/[0.02]'
          }`}
        >
          📊 Статистика
        </button>
      </div>

      {activeTab === 'athlete' ? (
        <div className="apple-glass p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Друзья</span>
              <span className="text-xl font-black text-white mt-1 block">{friendsCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Реакции</span>
              <span className="text-xl font-black text-[#FF8C38] mt-1 block">🔥 {totalLikes}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Статус</span>
              <span className="text-xs font-black text-emerald-400 mt-2 block">PRO Beta</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя атлета</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full apple-input"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город</label>
              <select
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full apple-input"
              >
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Направление</label>
              <input
                type="text"
                value={form.sport_type}
                onChange={e => setForm({ ...form, sport_type: e.target.value })}
                placeholder="Бодибилдинг, Пауэрлифтинг, Фитнес"
                className="w-full apple-input"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Instagram (@)</label>
              <input
                type="text"
                value={form.instagram}
                onChange={e => setForm({ ...form, instagram: e.target.value })}
                placeholder="username"
                className="w-full apple-input"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">О себе</label>
              <textarea
                rows={2}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Сплит, силовые, цели..."
                className="w-full apple-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full gymshark-btn-electric py-3 text-xs font-bold mt-2 cursor-pointer"
            >
              {saving ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      ) : (
        <div className="apple-glass p-5 text-center space-y-2">
          <span className="text-3xl">📊</span>
          <h4 className="text-sm font-bold text-white">Статистика тренировок</h4>
          <p className="text-xs text-slate-400">
            Здесь будет отображаться активность за месяц и силовые рекорды.
          </p>
        </div>
      )}
    </div>
  );
}
