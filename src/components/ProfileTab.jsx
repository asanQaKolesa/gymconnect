import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AthleteStats from './profile/AthleteStats';

// Список админов (твой username и ID)
const ADMIN_USERNAMES = ['asanali_kk'];

export default function ProfileTab({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('athlete');
  const [saving, setSaving] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  // Стейты Админ-панели
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || 'Алматы',
    sport_type: user?.sport_type || 'Атлет',
    instagram: user?.instagram || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || ''
  });

  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);
  const myTgUsername = (user?.telegram_username || window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '').toLowerCase();

  // Проверка прав администратора
  const isAdmin = ADMIN_USERNAMES.includes(myTgUsername) || user?.is_admin === true;

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        city: user.city || 'Алматы',
        sport_type: user.sport_type || 'Атлет',
        instagram: user.instagram || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
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

  // Загрузка списка пользователей для админки
  async function openAdminPanel() {
    setShowAdminModal(true);
    setLoadingUsers(true);
    const { data } = await supabase
      .from('users')
      .select('id, telegram_id, telegram_username, name, city, is_pro, created_at')
      .order('created_at', { ascending: false });

    if (data) setAllUsers(data);
    setLoadingUsers(false);
  }

  // Переключение PRO-статуса пользователя
  async function toggleProAccess(targetUser) {
    setUpdatingUserId(targetUser.id);
    const newStatus = !targetUser.is_pro;

    const { error } = await supabase
      .from('users')
      .update({ is_pro: newStatus })
      .eq('id', targetUser.id);

    if (!error) {
      setAllUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, is_pro: newStatus } : u))
      );
      if (user?.id === targetUser.id) {
        onUpdateUser({ ...user, is_pro: newStatus });
      }
    } else {
      alert('Ошибка обновления статуса: ' + error.message);
    }
    setUpdatingUserId(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Укажите имя');
    setSaving(true);

    const payload = {
      telegram_id: myTgId,
      telegram_username: myTgUsername,
      name: form.name.trim(),
      city: form.city,
      sport_type: form.sport_type,
      instagram: form.instagram ? form.instagram.replace('@', '').trim() : null,
      bio: form.bio ? form.bio.trim() : null
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'telegram_id' })
        .select()
        .single();

      if (!error && data) {
        onUpdateUser(data);
        alert('Профиль сохранен! ✅');
      } else {
        alert('Ошибка при сохранении');
      }
    } finally {
      setSaving(false);
    }
  }

  // Фильтрация пользователей в поиске админки
  const filteredUsers = allUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.telegram_username && u.telegram_username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* МОДАЛЬНОЕ ОКНО АДМИН-ПАНЕЛИ (ТОЛЬКО ДЛЯ ТЕБЯ) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="apple-glass w-full max-w-md h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Хедер админки */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/95">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <h3 className="text-sm font-black text-white tracking-tight">Админ-панель GymConnect</h3>
                </div>
                <p className="text-[10px] text-[#FF8C38] font-semibold mt-0.5">Управление PRO-доступом (Kaspi Pay)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Поиск атлета */}
            <div className="p-3 border-b border-white/10 bg-[#0C101A]/60">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или @username..."
                className="w-full apple-input text-xs"
              />
            </div>

            {/* Список пользователей */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              {loadingUsers ? (
                <div className="text-center py-10 text-xs text-slate-400">Загрузка базы пользователей...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">Пользователи не найдены</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{u.name || 'Без имени'}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            u.is_pro
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/[0.05] text-slate-400'
                          }`}
                        >
                          {u.is_pro ? 'PRO' : 'Free'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.telegram_username ? `@${u.telegram_username}` : `ID: ${u.telegram_id}`} • {u.city || 'Алматы'}
                      </p>
                    </div>

                    {/* Тумблер выдачи PRO */}
                    <button
                      type="button"
                      disabled={updatingUserId === u.id}
                      onClick={() => toggleProAccess(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition cursor-pointer flex-shrink-0 ${
                        u.is_pro
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600'
                      }`}
                    >
                      {updatingUserId === u.id ? '...' : u.is_pro ? 'Отключить PRO' : '✓ Включить PRO'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#0C101A]">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold cursor-pointer"
              >
                Закрыть панель
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Верхний таб-бар */}
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

      {activeTab === 'athlete' && (
        <div className="space-y-4">
          {/* СЕКРЕТНАЯ КНОПКА АДМИНИСТРАТОРА (ВИДНА ТОЛЬКО ТЕБЕ) */}
          {isAdmin && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FF5A1F]/20 to-amber-500/20 border border-[#FF5A1F]/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Режим Создателя (Admin)</h4>
                  <p className="text-[10px] text-[#FF8C38]">Управление PRO-доступами пользователей</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAdminPanel}
                className="gymshark-btn-electric px-3 py-1.5 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                Панель ➔
              </button>
            </div>
          )}

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
                <span className="text-xs font-black text-emerald-400 mt-2 block">
                  {user?.is_pro ? 'PRO Активен' : 'Free Beta'}
                </span>
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
        </div>
      )}

      {activeTab === 'stats' && <AthleteStats user={user} />}
    </div>
  );
}
