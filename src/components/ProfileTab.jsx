import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LEGAL_DOCS_DATA, LEGAL_DOCS_KEYS } from '../legalDocs';
import AthleteStats from './profile/AthleteStats';

const PROFILE_SECTIONS = [
  { id: 'athlete', label: 'Атлет', icon: '👤' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'support', label: 'Поддержка', icon: '💬' },
  { id: 'legal', label: 'Документы', icon: '📄' }
];

const SPORT_TYPES = [
  'Атлет',
  'Бодибилдер',
  'Пауэрлифтер',
  'Кроссфитер',
  'Фитнес',
  'Калистеника'
];

export default function ProfileTab({ user, onUpdateUser }) {
  const [activeSection, setActiveSection] = useState('athlete');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Живые счетчики
  const [totalLikes, setTotalLikes] = useState(user?.likes_count || 0);
  const [friendsCount, setFriendsCount] = useState(0);

  // Друзья и заявки
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Форма профиля
  const [form, setForm] = useState({
    name: user?.name || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '',
    gender: user?.gender || 'Парень',
    city: user?.city || 'Алматы',
    sport_type: user?.sport_type || 'Атлет',
    avatar_url: user?.avatar_url || '',
    instagram: user?.instagram || '',
    bio: user?.bio || ''
  });

  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '',
        gender: user.gender || 'Парень',
        city: user.city || 'Алматы',
        sport_type: user.sport_type || 'Атлет',
        avatar_url: user.avatar_url || '',
        instagram: user.instagram || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    syncCommunityStats();
  }, [myTgId, activeSection]);

  async function syncCommunityStats() {
    if (!myTgId) return;

    try {
      // 1. Считаем лайки
      const { data: postsData } = await supabase
        .from('feed_posts')
        .select('likes_count')
        .eq('user_id', myTgId);

      if (postsData && postsData.length > 0) {
        const sum = postsData.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);
        setTotalLikes(sum);
      } else {
        setTotalLikes(0);
      }

      // 2. Считаем подтверждённых друзей
      const { data: acceptedFriendships } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${myTgId},friend_id.eq.${myTgId}`);

      setFriendsCount(acceptedFriendships?.length || 0);

      // 3. Загружаем входящие заявки со статусом 'pending'
      const { data: requests } = await supabase
        .from('friendships')
        .select('id, user_id, created_at')
        .eq('friend_id', myTgId)
        .eq('status', 'pending');

      if (requests && requests.length > 0) {
        const senderIds = requests.map(r => r.user_id);
        const { data: senders } = await supabase
          .from('users')
          .select('telegram_id, name, avatar_url, city, sport_type')
          .in('telegram_id', senderIds);

        const merged = requests.map(req => {
          const senderInfo = senders?.find(s => Number(s.telegram_id) === Number(req.user_id));
          return {
            ...req,
            sender: senderInfo || { name: 'Атлет', city: 'Алматы', sport_type: 'Атлет' }
          };
        });

        setPendingRequests(merged);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Ошибка синхронизации:', err);
    }
  }

  // Загрузка детального списка друзей при открытии модалки
  async function handleOpenFriendsList() {
    setShowFriendsModal(true);
    setLoadingFriends(true);

    try {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${myTgId},friend_id.eq.${myTgId}`);

      if (friendships && friendships.length > 0) {
        // Находим ID всех друзей (противоположная сторона связи)
        const targetIds = friendships.map(f =>
          Number(f.user_id) === myTgId ? Number(f.friend_id) : Number(f.user_id)
        );

        const { data: friendsData } = await supabase
          .from('users')
          .select('telegram_id, telegram_username, name, avatar_url, city, sport_type, instagram')
          .in('telegram_id', targetIds);

        const list = friendships.map(f => {
          const friendTgId = Number(f.user_id) === myTgId ? Number(f.friend_id) : Number(f.user_id);
          const friendProfile = friendsData?.find(u => Number(u.telegram_id) === friendTgId);
          return {
            friendship_id: f.id,
            ...friendProfile,
            telegram_id: friendTgId,
            name: friendProfile?.name || 'Атлет GymConnect'
          };
        });

        setFriendsList(list);
      } else {
        setFriendsList([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки списка друзей:', err);
    } finally {
      setLoadingFriends(false);
    }
  }

  // Удаление из друзей
  async function handleRemoveFriend(friendshipId) {
    const confirmed = window.confirm('Удалить атлета из друзей?');
    if (!confirmed) return;

    await supabase.from('friendships').delete().eq('id', friendshipId);
    setFriendsList(prev => prev.filter(f => f.friendship_id !== friendshipId));
    setFriendsCount(prev => Math.max(0, prev - 1));
  }

  // Принять заявку
  async function handleAcceptFriend(requestId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    setFriendsCount(prev => prev + 1);
  }

  // Отклонить заявку
  async function handleDeclineFriend(requestId) {
    await supabase.from('friendships').delete().eq('id', requestId);
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  }

  // Блокировка
  async function handleBlockUser(requestId) {
    const confirmed = window.confirm('Заблокировать этого пользователя?');
    if (!confirmed) return;

    await supabase.from('friendships').update({ status: 'blocked' }).eq('id', requestId);
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
  }

  // Сжатие фото
  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setForm(prev => ({ ...prev, avatar_url: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Сохранение изменений профиля
  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Укажи имя атлета');

    setSaving(true);
    if (!myTgId) {
      setSaving(false);
      return alert('Ошибка: Telegram ID не найден.');
    }

    const payload = {
      telegram_id: myTgId,
      name: form.name.trim(),
      gender: form.gender,
      city: form.city,
      sport_type: form.sport_type,
      avatar_url: form.avatar_url || null,
      instagram: form.instagram ? form.instagram.replace('@', '').trim() : null,
      bio: form.bio ? form.bio.trim() : null
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'telegram_id' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onUpdateUser(data);
        setIsEditing(false);
        alert('Профиль успешно сохранен! ✅');
      }
    } catch (err) {
      alert('Ошибка при сохранении: ' + (err.message || 'Попробуйте снова'));
    } finally {
      setSaving(false);
    }
  }

  // Удаление анкеты
  async function handleDeleteProfile() {
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить свою анкету? Все данные будут удалены.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      if (myTgId) {
        await supabase.from('gymbro_cards').delete().eq('telegram_id', myTgId);
        await supabase.from('feed_posts').delete().eq('user_id', myTgId);
        await supabase.from('friendships').delete().or(`user_id.eq.${myTgId},friend_id.eq.${myTgId}`);
        await supabase.from('users').delete().eq('telegram_id', myTgId);
      }
      alert('Анкета успешно удалена.');
      window.location.reload();
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* МОДАЛКА ПРОСМОТРА СПИСКА ДРУЗЕЙ В СТИЛЕ APPLE */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="apple-glass w-full max-w-md h-[75vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Заголовок */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/95">
              <div className="flex items-center gap-2">
                <span className="text-base">🤝</span>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Мои друзья ({friendsList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFriendsModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Список друзей */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              {loadingFriends ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Загрузка друзей...
                </div>
              ) : friendsList.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <span className="text-3xl">👥</span>
                  <h4 className="text-sm font-bold text-white">Список друзей пока пуст</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Заходи в ленту тренировок или поиск GymBro, чтобы отправлять заявки атлетам своего зала.
                  </p>
                </div>
              ) : (
                friendsList.map(friend => (
                  <div
                    key={friend.friendship_id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.05] transition"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF5A1F]/30 to-[#FF8C38]/30 border border-white/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white overflow-hidden shadow-sm">
                        {friend.avatar_url ? (
                          <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          friend.name?.[0] || 'A'
                        )}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate leading-snug">
                          {friend.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {friend.city || 'Алматы'} • {friend.sport_type || 'Атлет'}
                        </p>
                        {friend.instagram && (
                          <span className="text-[9px] text-[#FF8C38] font-medium block">
                            @{friend.instagram}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Написать в Telegram */}
                      {friend.telegram_username ? (
                        <a
                          href={`https://t.me/${friend.telegram_username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-[#FF5A1F] text-white text-[11px] font-bold active:scale-95 transition no-underline flex items-center gap-1 shadow-md shadow-[#FF5A1F]/20"
                        >
                          <span>💬</span>
                          <span>Чат</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-white/[0.04] px-2 py-1 rounded-lg">
                          В друзьях
                        </span>
                      )}

                      {/* Удалить из друзей */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.friendship_id)}
                        title="Удалить из друзей"
                        className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 flex items-center justify-center text-xs active:scale-95 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#0C101A]">
              <button
                type="button"
                onClick={() => setShowFriendsModal(false)}
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра документов */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/90">
              <div className="flex items-center gap-2 pr-2">
                <span className="text-base">{selectedDoc.icon}</span>
                <h3 className="text-xs font-bold text-white tracking-tight leading-snug truncate">
                  {selectedDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedDoc.content}
            </div>
            <div className="p-3 border-t border-white/10 bg-black/40">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Верхний таб-бар профиля */}
      <div className="apple-glass p-1.5 grid grid-cols-4 gap-1">
        {PROFILE_SECTIONS.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`py-2 px-1 text-[11px] font-bold rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              activeSection === section.id
                ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                : 'text-slate-400 hover:text-slate-200 bg-white/[0.02]'
            }`}
          >
            <span className="text-xs">{section.icon}</span>
            <span className="truncate w-full text-center">{section.label}</span>
          </button>
        ))}
      </div>

      {/* ================= 1. ПОДРАЗДЕЛ: АТЛЕТ ================= */}
      {activeSection === 'athlete' && (
        <div className="apple-glass p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <h2 className="text-sm font-bold text-white tracking-tight">Карточка атлета</h2>
            <button
              type="button"
              onClick={() => {
                setForm({
                  name: user?.name || '',
                  gender: user?.gender || 'Парень',
                  city: user?.city || 'Алматы',
                  sport_type: user?.sport_type || 'Атлет',
                  avatar_url: user?.avatar_url || '',
                  instagram: user?.instagram || '',
                  bio: user?.bio || ''
                });
                setIsEditing(!isEditing);
              }}
              className="text-xs text-[#FF5A1F] font-semibold hover:underline cursor-pointer"
            >
              {isEditing ? 'Отмена' : 'Редактировать'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3.5 pt-1">
              {/* Фото аватара */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-md">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-400">{form.name?.[0] || 'A'}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 transition">
                    <span>📸 Сменить фото</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, avatar_url: '' }))}
                      className="block text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Удалить фото
                    </button>
                  )}
                </div>
              </div>

              {/* Имя */}
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

              {/* Направление */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Направление</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SPORT_TYPES.map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm({ ...form, sport_type: st })}
                      className={`py-1.5 px-1 text-[11px] font-semibold rounded-xl border transition cursor-pointer text-center ${
                        form.sport_type === st
                          ? 'bg-[#FF5A1F]/20 text-[#FF8C38] border-[#FF5A1F]/60'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Пол */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Пол</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Парень', 'Девушка'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                        form.gender === g
                          ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
                          : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Город */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Город</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Алматы', 'Астана'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, city: c })}
                      className={`py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
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

              {/* Instagram */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Instagram username</label>
                <input
                  type="text"
                  placeholder="username без @"
                  value={form.instagram}
                  onChange={e => setForm({ ...form, instagram: e.target.value })}
                  className="w-full apple-input"
                />
              </div>

              {/* Био */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">О себе / Фокус</label>
                <textarea
                  rows={2}
                  placeholder="Например: Силовой тренинг, сплит Ноги/Спина, ищу напарника для жима"
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
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

              {/* Удаление анкеты */}
              <div className="pt-3 border-t border-red-500/20 text-center">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteProfile}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer underline active:opacity-70 transition"
                >
                  {deleting ? 'Удаление...' : '🗑 Удалить мою анкету атлета'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-[#FF5A1F]/20 flex-shrink-0">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || 'A'
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white leading-tight">{user?.name}</h3>
                    <span className="text-[10px] bg-[#FF5A1F]/20 text-[#FF8C38] border border-[#FF5A1F]/30 px-2 py-0.5 rounded-md font-bold">
                      {user?.sport_type || 'Атлет'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {user?.city} • {user?.gender}
                  </p>
                  {user?.instagram && (
                    <a
                      href={`https://instagram.com/${user.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#FF8C38] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>📸</span> @{user.instagram}
                    </a>
                  )}
                </div>
              </div>

              {user?.bio && (
                <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">О себе:</span>
                  {user.bio}
                </div>
              )}

              {/* КЛИКАБЕЛЬНЫЙ БЛОК СЧЕТЧИКОВ (ТАП ПО «ДРУЗЬЯ» ОТКРЫВАЕТ СПИСОК) */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <button
                  type="button"
                  onClick={handleOpenFriendsList}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/[0.08] hover:border-[#FF5A1F]/40 active:scale-95 transition cursor-pointer flex flex-col items-center justify-center group"
                >
                  <p className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold uppercase">Друзья ➔</p>
                  <p className="text-base font-black text-white mt-0.5">{friendsCount}</p>
                </button>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Реакции</p>
                  <p className="text-base font-black text-[#FF8C38] mt-0.5">🔥 {totalLikes}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.05]">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Статус</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1">{user?.is_pro ? 'PRO' : 'Free Beta'}</p>
                </div>
              </div>

              {/* ВХОДЯЩИЕ ЗАЯВКИ В ДРУЗЬЯ */}
              {pendingRequests.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/25 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🤝</span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Заявки в друзья ({pendingRequests.length})
                      </h4>
                    </div>
                    <span className="text-[9px] bg-[#FF5A1F] text-white px-2 py-0.5 rounded-full font-bold">
                      Новые
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingRequests.map(req => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                            {req.sender?.avatar_url ? (
                              <img src={req.sender.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              req.sender?.name?.[0] || 'A'
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{req.sender?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {req.sender?.city} • {req.sender?.sport_type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleAcceptFriend(req.id)}
                            title="Принять"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold active:scale-95 transition cursor-pointer"
                          >
                            ✓ Принять
                          </button>
                          <button
                            onClick={() => handleDeclineFriend(req.id)}
                            title="Отклонить"
                            className="px-2 py-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 text-xs active:scale-95 transition cursor-pointer"
                          >
                            ✕
                          </button>
                          <button
                            onClick={() => handleBlockUser(req.id)}
                            title="Заблокировать"
                            className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs active:scale-95 transition cursor-pointer"
                          >
                            🚫
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= 2. ПОДРАЗДЕЛ: СТАТИСТИКА ================= */}
      {activeSection === 'stats' && (
        <AthleteStats user={user} />
      )}

      {/* ================= 3. ПОДРАЗДЕЛ: ПОДДЕРЖКА ================= */}
      {activeSection === 'support' && (
        <div className="apple-glass p-5 space-y-4">
          <div className="pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white tracking-tight">Служба заботы GymConnect</h3>
            <p className="text-xs text-slate-400 mt-0.5">Связь напрямую с основателем</p>
          </div>
          <div className="space-y-2.5">
            <a
              href="https://t.me/asanali_kk"
              target="_blank"
              rel="noreferrer"
              className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <span>💬 Чат с основателем (@asanali_kk)</span>
              <span>➔</span>
            </a>
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-1 text-xs">
              <p className="font-semibold text-slate-200">Время ответа:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Отвечаем лично в течение 15–30 минут с 09:00 до 22:00 по времени Алматы/Астаны.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. ПОДРАЗДЕЛ: ДОКУМЕНТЫ ================= */}
      {activeSection === 'legal' && (
        <div className="apple-glass p-5 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white tracking-tight">Правовая информация</h3>
            <span className="text-[10px] text-[#FF8C38] font-bold">Официальные документы</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {LEGAL_DOCS_KEYS.map((key) => {
              const doc = LEGAL_DOCS_DATA[key];
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] text-slate-300 flex justify-between items-center active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="text-base">{doc.icon}</span>
                    <span className="leading-snug text-[11px] font-medium">{doc.title}</span>
                  </div>
                  <span className="text-slate-500 text-xs">➔</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
