import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AthleteStats from './profile/AthleteStats';

const ADMIN_USERNAMES = ['asanali_kk'];

const VIBE_OPTIONS = [
  { id: 'in_gym', label: '🟢 В зале (на пампе)', desc: 'Тренируюсь прямо сейчас' },
  { id: 'going', label: '⚡️ Заряжен, иду в зал', desc: 'Буду через 20-30 минут' },
  { id: 'want_gym', label: '💭 Хочу в зал', desc: 'Ищу напарника на тренировку' },
  { id: 'rest', label: '🔋 Восстановление', desc: 'День отдыха / Режим' },
];

export default function ProfileTab({ user, onUpdateUser, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('card');
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  const [currentVibe, setCurrentVibe] = useState(user?.current_status || '🟢 В зале (на пампе)');
  const [showVibeDropdown, setShowVibeDropdown] = useState(false);

  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likersList, setLikersList] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  const [docModal, setDocModal] = useState(null);

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
      if (user.current_status) setCurrentVibe(user.current_status);
    }
  }, [user]);

  useEffect(() => {
    async function loadStats() {
      if (!myTgId) return;
      try {
        const { data: posts } = await supabase.from('feed_posts').select('id, likes_count').eq('user_id', myTgId);
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

  async function openLikesHistory() {
    setShowLikesModal(true);
    setLoadingLikers(true);
    try {
      const { data: posts } = await supabase.from('feed_posts').select('id').eq('user_id', myTgId);
      if (posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('user_id, created_at')
          .in('post_id', postIds)
          .order('created_at', { ascending: false });

        if (likes && likes.length > 0) {
          const userIds = [...new Set(likes.map(l => l.user_id))];
          const { data: usersData } = await supabase
            .from('users')
            .select('telegram_id, name, avatar_url, telegram_username, city')
            .in('telegram_id', userIds);

          const userMap = (usersData || []).reduce((acc, u) => {
            acc[u.telegram_id] = u;
            return acc;
          }, {});

          const formatted = likes.map(l => ({
            ...l,
            user: userMap[l.user_id] || { name: 'Атлет зала', telegram_username: '' }
          }));

          setLikersList(formatted);
        } else {
          setLikersList([]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLikers(false);
    }
  }

  async function handleSelectVibe(vibe) {
    setCurrentVibe(vibe.label);
    setShowVibeDropdown(false);
    if (!myTgId) return;

    await supabase.from('users').update({ current_status: vibe.label }).eq('telegram_id', myTgId);
    if (onUpdateUser) onUpdateUser({ current_status: vibe.label });
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setForm(prev => ({ ...prev, avatar_url: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
      bio: form.bio ? form.bio.trim() : null,
      avatar_url: form.avatar_url || null
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'telegram_id' })
        .select()
        .single();

      if (!error && data) {
        onUpdateUser(data);
        setIsEditing(false);
        setShowSettingsSheet(false);
      } else {
        alert('Ошибка при сохранении: ' + (error?.message || ''));
      }
    } finally {
      setSaving(false);
    }
  }

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
      if (user?.id === targetUser.id || Number(user?.telegram_id) === Number(targetUser.telegram_id)) {
        onUpdateUser({ is_pro: newStatus });
      }
    } else {
      alert('Ошибка обновления: ' + error.message);
    }
    setUpdatingUserId(null);
  }

  const filteredUsers = allUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.telegram_username && u.telegram_username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3 pb-8">
      {/* 1. БОКОВОЕ/НИЖНЕЕ МЕНЮ НАСТРОЕК (BOTTOM SHEET) */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center">
          <div className="apple-glass w-full max-w-md rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {isEditing ? 'Редактирование профиля' : 'Настройки & Сервис'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsSheet(false);
                  setIsEditing(false);
                }}
                className="text-slate-400 hover:text-white text-base px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Внутри шторки: либо форма редактирования, либо ссылки сервиса */}
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Имя атлета</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full apple-input text-xs py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Город</label>
                    <select
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full apple-input text-xs py-2"
                    >
                      <option value="Алматы">Алматы</option>
                      <option value="Астана">Астана</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Направление</label>
                    <input
                      type="text"
                      value={form.sport_type}
                      onChange={e => setForm({ ...form, sport_type: e.target.value })}
                      className="w-full apple-input text-xs py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                    placeholder="username"
                    className="w-full apple-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">О себе</label>
                  <textarea
                    rows={2}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    className="w-full apple-input text-xs py-2 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-xs font-semibold text-slate-300"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 gymshark-btn-electric py-2.5 text-xs font-bold"
                  >
                    {saving ? '...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-xs font-semibold text-white flex justify-between items-center transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span>✏️</span>
                    <span>Редактировать анкету</span>
                  </span>
                  <span className="text-slate-500">➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsSheet(false);
                    setDocModal('terms');
                  }}
                  className="w-full p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-left text-xs text-slate-300 flex justify-between items-center transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span>📜</span>
                    <span>Публичная оферта</span>
                  </span>
                  <span className="text-slate-500">➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsSheet(false);
                    setDocModal('privacy');
                  }}
                  className="w-full p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-left text-xs text-slate-300 flex justify-between items-center transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span>🔒</span>
                    <span>Политика конфиденциальности</span>
                  </span>
                  <span className="text-slate-500">➔</span>
                </button>

                <a
                  href="https://t.me/asanali_kk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] text-left text-xs text-[#FF8C38] flex justify-between items-center transition no-underline block"
                >
                  <span className="flex items-center gap-2.5">
                    <span>💬</span>
                    <span>Поддержка / Основатель</span>
                  </span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. МОДАЛКА: КТО ПОСТАВИЛ ОГОНЬ 🔥 */}
      {showLikesModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-4 space-y-3 border border-white/10 rounded-3xl max-h-[70vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🔥</span> Реакции на пруфы
              </span>
              <button
                type="button"
                onClick={() => setShowLikesModal(false)}
                className="text-slate-400 hover:text-white text-sm px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingLikers ? (
                <div className="text-center py-6 text-xs text-slate-400">Загрузка...</div>
              ) : likersList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">Пока никто не поставил реакцию</div>
              ) : (
                likersList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                        {item.user?.avatar_url ? (
                          <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-white">{item.user?.name?.[0] || 'A'}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{item.user?.name || 'Атлет'}</p>
                    </div>
                    {item.user?.telegram_username && (
                      <a
                        href={`https://t.me/${item.user.telegram_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-[#FF8C38] px-2 py-1 rounded-lg bg-white/[0.05] no-underline"
                      >
                        Чат ↗
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. МОДАЛКА ДОКУМЕНТОВ */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-4 space-y-3 border border-white/10 rounded-3xl max-h-[75vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {docModal === 'terms' ? 'Публичная оферта' : 'Политика конфиденциальности'}
              </h3>
              <button
                type="button"
                onClick={() => setDocModal(null)}
                className="text-slate-400 hover:text-white text-sm px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-[11px] text-slate-300 space-y-2 pr-1 leading-relaxed">
              {docModal === 'terms' ? (
                <>
                  <p><strong>1. Общие положения:</strong> GymConnect — сервис для поиска напарников по залу и обмена тренировочным прогрессом.</p>
                  <p><strong>2. Безопасность:</strong> Пользователь самостоятельно контролирует тренировочные нагрузки и состояние здоровья.</p>
                  <p><strong>3. VIP доступ:</strong> Предоставляет полный функционал на 30 дней с момента подключения.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Данные:</strong> Собираются базовые данные Telegram профиля для авторизации.</p>
                  <p><strong>2. Защита:</strong> Данные хранятся в защищенной облачной БД и не передаются третьим лицам.</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDocModal(null)}
              className="w-full gymshark-btn-electric py-2 text-xs font-bold"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* 4. МОДАЛКА АДМИНКИ (ТОЛЬКО ДЛЯ ОСНОВАТЕЛЯ) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="apple-glass w-full max-w-md h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-3.5 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/95">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>👑</span> Управление VIP PRO
              </span>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 border-b border-white/10 bg-[#0C101A]/60">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или @username..."
                className="w-full apple-input text-xs py-1.5"
              />
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {loadingUsers ? (
                <div className="text-center py-6 text-xs text-slate-400">Загрузка...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">Не найдено</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{u.name || 'Без имени'}</p>
                      <p className="text-[10px] text-slate-400">
                        {u.telegram_username ? `@${u.telegram_username}` : `ID: ${u.telegram_id}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={updatingUserId === u.id}
                      onClick={() => toggleProAccess(u)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition cursor-pointer flex-shrink-0 ${
                        u.is_pro
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {updatingUserId === u.id ? '...' : u.is_pro ? 'Выключить' : 'Включить'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ТОНКАЯ МИНИМАЛИСТИЧНАЯ СТРОКА АДМИНА (ЕСЛИ ТЫ ОСНОВАТЕЛЬ) */}
      {isAdmin && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span>👑</span> Панель основателя
          </span>
          <button
            type="button"
            onClick={openAdminPanel}
            className="text-[10px] text-[#FF8C38] font-bold hover:underline cursor-pointer"
          >
            Управление ➔
          </button>
        </div>
      )}

      {/* АККУРАТНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ТАБОВ ПРОФИЛЯ */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.05]">
        <button
          type="button"
          onClick={() => setActiveTab('card')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeTab === 'card' ? 'bg-[#FF5A1F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Визитка
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            activeTab === 'stats' ? 'bg-[#FF5A1F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Статистика
        </button>
      </div>

      {activeTab === 'card' && (
        <div className="space-y-3">
          {/* ЧИСТАЯ ЭЛЕГАНТНАЯ КАРТОЧКА АТЛЕТА */}
          <div className="apple-glass p-4 space-y-3.5 border border-white/[0.06]">
            {/* Аватар, имя и иконка настроек */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center shadow-md">
                    {form.avatar_url ? (
                      <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-white">{form.name?.[0] || 'A'}</span>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center cursor-pointer shadow">
                    <span className="text-[9px]">📷</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-0.5 truncate">
                  <h2 className="text-sm font-bold text-white truncate tracking-tight">
                    {form.name || 'Атлет'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal truncate">
                    {myTgUsername ? `@${myTgUsername}` : 'Без юзернейма'} • {form.city}
                  </p>
                  <p className="text-[10px] text-[#FF8C38] font-medium">
                    {form.sport_type}
                  </p>
                </div>
              </div>

              {/* КНОПКА ШЕСТЕРЁНКИ (ОТКРЫВАЕТ НИЖНЮЮ ШТОРКУ) */}
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setShowSettingsSheet(true);
                }}
                className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-95 flex-shrink-0"
                title="Настройки"
              >
                ⚙️
              </button>
            </div>

            {/* ВАЙБ АТЛЕТА */}
            <div className="pt-2 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => setShowVibeDropdown(!showVibeDropdown)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 flex items-center justify-between text-left transition cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-200">{currentVibe}</span>
                <span className="text-[10px] text-slate-500">
                  {showVibeDropdown ? '▲' : '▼'}
                </span>
              </button>

              {showVibeDropdown && (
                <div className="p-1 bg-[#0b0e17] border border-white/10 rounded-xl space-y-0.5 mt-1.5 shadow-xl">
                  {VIBE_OPTIONS.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVibe(v)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer flex justify-between items-center ${
                        currentVibe === v.label
                          ? 'bg-[#FF5A1F]/15 text-[#FF8C38] font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.03]'
                      }`}
                    >
                      <span>{v.label}</span>
                      {currentVibe === v.label && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* МИНИМАЛИСТИЧНЫЕ МЕТРИКИ (ДРУЗЬЯ И ОГОНЬ) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('friends')}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/15 active:scale-95 transition cursor-pointer text-center"
              >
                <span className="text-[10px] text-slate-500 font-medium block">Друзья</span>
                <span className="text-base font-black text-white mt-0.5 block">{friendsCount}</span>
              </button>

              <button
                type="button"
                onClick={openLikesHistory}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#FF5A1F]/30 active:scale-95 transition cursor-pointer text-center"
              >
                <span className="text-[10px] text-slate-500 font-medium block">Реакции</span>
                <span className="text-base font-black text-[#FF8C38] mt-0.5 block">🔥 {totalLikes}</span>
              </button>
            </div>

            {/* БИО И ИНСТАГРАМ */}
            {form.bio && (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{form.bio}</p>
              </div>
            )}

            {form.instagram && (
              <a
                href={`https://instagram.com/${form.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs text-slate-300 hover:text-white transition no-underline block"
              >
                <span className="text-slate-400">Instagram:</span>
                <span className="font-semibold text-[#FF8C38]">@{form.instagram} ↗</span>
              </a>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && <AthleteStats user={user} />}
    </div>
  );
}
