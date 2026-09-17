import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AthleteStats from './profile/AthleteStats';

// Твой юзернейм основателя
const ADMIN_USERNAMES = ['asanali_kk'];

const STATUS_OPTIONS = [
  { id: 'in_gym', label: '🟢 В зале', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  { id: 'going', label: '🟡 Иду в зал', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'rest', label: '⚪️ Отдых / Восстановление', color: 'border-slate-500/40 bg-white/[0.03] text-slate-400' },
];

export default function ProfileTab({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'stats'
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(user?.current_status || 'Отдых');

  // Модалка оферты / документов
  const [docModal, setDocModal] = useState(null); // 'terms' | 'privacy' | null

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
      if (user.current_status) setCurrentStatus(user.current_status);
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

  // Быстрая смена статуса (В зале / Иду / Отдых)
  async function handleChangeStatus(newStatusText) {
    setCurrentStatus(newStatusText);
    if (!myTgId) return;
    await supabase.from('users').update({ current_status: newStatusText }).eq('telegram_id', myTgId);
    if (onUpdateUser) onUpdateUser({ current_status: newStatusText });
  }

  // Загрузка аватарки с сжатием
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
        alert('Профиль обновлен! ✅');
      } else {
        alert('Ошибка при сохранении: ' + (error?.message || ''));
      }
    } finally {
      setSaving(false);
    }
  }

  // Админ-панель
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
    <div className="space-y-4">
      {/* 1. МОДАЛКА ЮРИДИЧЕСКИХ ДОКУМЕНТОВ */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-3.5 border border-white/10 rounded-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {docModal === 'terms' ? 'Публичная оферта' : 'Политика конфиденциальности'}
              </h3>
              <button
                type="button"
                onClick={() => setDocModal(null)}
                className="text-slate-400 hover:text-white text-sm px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto text-[11px] text-slate-300 space-y-2 leading-relaxed pr-1">
              {docModal === 'terms' ? (
                <>
                  <p><strong>1. Общие положения</strong></p>
                  <p>GymConnect — цифровая платформа для коммуникации атлетов, поиска напарников и обмена тренировочным опытом.</p>
                  <p><strong>2. Ответственность атлета</strong></p>
                  <p>Каждый пользователь самостоятельно несет ответственность за уровень физической нагрузки, правильность техники выполнения упражнений и состояние своего здоровья в залах.</p>
                  <p><strong>3. Платные функции</strong></p>
                  <p>VIP PRO доступ предоставляет расширенный функционал платформы на период 30 календарных дней с момента активации.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Сбор данных</strong></p>
                  <p>Сервис собирает публичные данные профиля Telegram (ID, имя, username) и данные анкеты, добровольно внесенные атлетом.</p>
                  <p><strong>2. Защита информации</strong></p>
                  <p>Данные хранятся в защищенной облачной базе данных и не передаются третьим лицам без согласия пользователя.</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDocModal(null)}
              className="w-full gymshark-btn-electric py-2.5 text-xs font-bold cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* 2. МОДАЛЬНОЕ ОКНО АДМИН-ПАНЕЛИ (ТОЛЬКО ДЛЯ ТЕБЯ) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="apple-glass w-full max-w-md h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/95">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <h3 className="text-sm font-black text-white tracking-tight">Админ-панель GymConnect</h3>
                </div>
                <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Управление VIP PRO (Kaspi Pay)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-white/10 bg-[#0C101A]/60">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск атлета по имени или @username..."
                className="w-full apple-input text-xs"
              />
            </div>

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
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-white/[0.05] text-slate-400'
                          }`}
                        >
                          {u.is_pro ? '👑 VIP PRO' : 'Free'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {u.telegram_username ? `@${u.telegram_username}` : `ID: ${u.telegram_id}`} • {u.city || 'Алматы'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={updatingUserId === u.id}
                      onClick={() => toggleProAccess(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition cursor-pointer flex-shrink-0 ${
                        u.is_pro
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-[#FF5A1F] text-white shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {updatingUserId === u.id ? '...' : u.is_pro ? 'Отключить PRO' : '✓ Выдать VIP PRO'}
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

      {/* Верхний таб-бар: Визитка атлета / Статистика */}
      <div className="apple-glass p-1.5 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('card')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'card' ? 'bg-[#FF5A1F] text-white shadow-md' : 'text-slate-400 bg-white/[0.02]'
          }`}
        >
          👤 Визитка атлета
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'stats' ? 'bg-[#FF5A1F] text-white shadow-md' : 'text-slate-400 bg-white/[0.02]'
          }`}
        >
          📊 Статистика & Зал
        </button>
      </div>

      {activeTab === 'card' && (
        <div className="space-y-4">
          {/* СЕКРЕТНЫЙ БЛОК АДМИНИСТРАТОРА (ТОЛЬКО ДЛЯ ТЕБЯ) */}
          {isAdmin && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#FF5A1F]/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Панель Основателя</h4>
                  <p className="text-[10px] text-amber-300">Управление VIP-подписками пользователей</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAdminPanel}
                className="gymshark-btn-electric px-3 py-1.5 text-xs font-bold active:scale-95 transition cursor-pointer"
              >
                Админка ➔
              </button>
            </div>
          )}

          {/* ОСНОВНАЯ КАРТОЧКА ПРОФИЛЯ */}
          <div className="apple-glass p-5 space-y-4">
            {/* Хедер визитки: Аватарка, Имя, Статус и кнопка Редактировать */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden bg-[#121622] border-2 border-white/15 flex items-center justify-center shadow-xl">
                    {form.avatar_url ? (
                      <img src={form.avatar_url} alt="Athlete" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{form.name?.[0] || 'A'}</span>
                    )}
                  </div>
                  {/* Кнопка смены аватарки прямо с фото */}
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition">
                    <span className="text-[11px]">📷</span>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-white tracking-tight">
                      {form.name || 'Атлет'}
                    </h2>
                    {user?.is_pro ? (
                      <span className="text-[9px] bg-gradient-to-r from-amber-500/30 to-[#FF5A1F]/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black uppercase">
                        👑 VIP
                      </span>
                    ) : (
                      <span className="text-[9px] bg-white/[0.05] text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {myTgUsername ? `@${myTgUsername}` : 'Без юзернейма'} • {form.city}
                  </p>
                  <p className="text-[11px] text-[#FF8C38] font-semibold">
                    {form.sport_type}
                  </p>
                </div>
              </div>

              {/* Кнопка переключения режима Редактирования */}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isEditing
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Настройки"
              >
                {isEditing ? '✕ Отмена' : '⚙️ Редакт.'}
              </button>
            </div>

            {/* Быстрый статус атлета в зале */}
            <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Мой статус сегодня:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChangeStatus(opt.label)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center truncate ${
                      currentStatus === opt.label
                        ? opt.color + ' shadow-md scale-[1.02]'
                        : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Статусные счетчики */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Друзья</span>
                <span className="text-lg font-black text-white mt-0.5 block">{friendsCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Реакции</span>
                <span className="text-lg font-black text-[#FF8C38] mt-0.5 block">🔥 {totalLikes}</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06]">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Тариф</span>
                <span className="text-[11px] font-black text-emerald-400 mt-1.5 block truncate">
                  {user?.is_pro ? 'PRO Активен' : 'Бета-тест'}
                </span>
              </div>
            </div>

            {/* РЕЖИМ 1: АККУРАТНАЯ ЧИСТАЯ ВИЗИТКА (ПО УМОЛЧАНИЮ) */}
            {!isEditing && (
              <div className="space-y-3 pt-2">
                {form.bio && (
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">О себе</span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{form.bio}</p>
                  </div>
                )}

                {form.instagram && (
                  <a
                    href={`https://instagram.com/${form.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs text-slate-300 hover:text-white transition no-underline"
                  >
                    <span className="text-slate-400">Instagram:</span>
                    <span className="font-bold text-[#FF8C38]">@{form.instagram} ↗</span>
                  </a>
                )}
              </div>
            )}

            {/* РЕЖИМ 2: ФОРМА РЕДАКТИРОВАНИЯ (ОТКРЫВАЕТСЯ ТОЛЬКО ПО КНОПКЕ) */}
            {isEditing && (
              <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-white/[0.08]">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя атлета</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full apple-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город</label>
                    <select
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full apple-input text-xs"
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
                      placeholder="Бодибилдинг"
                      className="w-full apple-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                    placeholder="username"
                    className="w-full apple-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">О себе (сплит, цели)</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Например: Жму 100 кг, сплит Пн/Ср/Пт, ищу напарника на день ног..."
                    className="w-full apple-input text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full gymshark-btn-electric py-3 text-xs font-bold mt-2 cursor-pointer shadow-lg shadow-[#FF5A1F]/20"
                >
                  {saving ? 'Сохраняем...' : 'Сохранить профиль'}
                </button>
              </form>
            )}
          </div>

          {/* БЛОК 3: ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ И ПОДДЕРЖКА */}
          <div className="apple-glass p-4 space-y-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Сервис и поддержка
            </span>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setDocModal('terms')}
                className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
              >
                <span>📜 Публичная оферта сервиса</span>
                <span className="text-slate-500">➔</span>
              </button>

              <button
                type="button"
                onClick={() => setDocModal('privacy')}
                className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left text-xs text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
              >
                <span>🔒 Политика конфиденциальности</span>
                <span className="text-slate-500">➔</span>
              </button>

              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#FF5A1F]/10 to-amber-500/10 border border-[#FF5A1F]/25 text-left text-xs text-amber-300 hover:text-amber-200 flex justify-between items-center no-underline cursor-pointer"
              >
                <span className="font-semibold">💬 Связаться с основателем / Поддержка</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && <AthleteStats user={user} />}
    </div>
  );
}
