import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function FriendsTab({ user }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'requests'

  // Модалка детального профиля напарника
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendGymBroCard, setFriendGymBroCard] = useState(null);
  const [friendStats, setFriendStats] = useState({ likes: 0, friends: 0 });
  const [loadingFriendDetails, setLoadingFriendDetails] = useState(false);

  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  useEffect(() => {
    if (myTgId) {
      loadFriendsData();
    }
  }, [myTgId]);

  async function loadFriendsData() {
    setLoading(true);
    try {
      // 1. Загрузка подтвержденных друзей
      const { data: f1 } = await supabase
        .from('friendships')
        .select('friend_id, created_at')
        .eq('user_id', myTgId)
        .eq('status', 'accepted');

      const { data: f2 } = await supabase
        .from('friendships')
        .select('user_id, created_at')
        .eq('friend_id', myTgId)
        .eq('status', 'accepted');

      const friendIds = [
        ...(f1 || []).map(f => f.friend_id),
        ...(f2 || []).map(f => f.user_id)
      ];

      if (friendIds.length > 0) {
        const { data: friendUsers } = await supabase
          .from('users')
          .select('id, telegram_id, telegram_username, name, city, sport_type, bio, instagram, avatar_url, current_status, is_pro')
          .in('telegram_id', friendIds);

        setFriends(friendUsers || []);
      } else {
        setFriends([]);
      }

      // 2. Загрузка входящих заявок
      const { data: reqData } = await supabase
        .from('friendships')
        .select('id, user_id, created_at')
        .eq('friend_id', myTgId)
        .eq('status', 'pending');

      if (reqData && reqData.length > 0) {
        const senderIds = reqData.map(r => r.user_id);
        const { data: senderUsers } = await supabase
          .from('users')
          .select('id, telegram_id, telegram_username, name, city, sport_type, avatar_url')
          .in('telegram_id', senderIds);

        const senderMap = (senderUsers || []).reduce((acc, u) => {
          acc[u.telegram_id] = u;
          return acc;
        }, {});

        const formattedRequests = reqData.map(r => ({
          friendship_id: r.id,
          user: senderMap[r.user_id] || { name: 'Атлет', telegram_username: '' }
        }));

        setRequests(formattedRequests);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Загрузка полного досье друга: GymBro-анкета + статистика
  async function handleOpenFriendProfile(targetUser) {
    setSelectedFriend(targetUser);
    setLoadingFriendDetails(true);
    setFriendGymBroCard(null);

    try {
      const targetId = Number(targetUser.telegram_id);

      // Проверяем, есть ли у друга активная карточка GymBro
      const { data: card } = await supabase
        .from('gymbro_cards')
        .select('*')
        .eq('telegram_id', targetId)
        .maybeSingle();

      if (card) {
        setFriendGymBroCard(card);
      }

      // Считаем реакции и друзей
      const { data: posts } = await supabase
        .from('feed_posts')
        .select('likes_count')
        .eq('user_id', targetId);

      const totalLikes = (posts || []).reduce((acc, p) => acc + (p.likes_count || 0), 0);

      const { data: ff1 } = await supabase.from('friendships').select('id').eq('user_id', targetId).eq('status', 'accepted');
      const { data: ff2 } = await supabase.from('friendships').select('id').eq('friend_id', targetId).eq('status', 'accepted');
      const totalFriends = (ff1?.length || 0) + (ff2?.length || 0);

      setFriendStats({ likes: totalLikes, friends: totalFriends });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFriendDetails(false);
    }
  }

  async function handleAccept(friendshipId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    loadFriendsData();
  }

  async function handleReject(friendshipId) {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    loadFriendsData();
  }

  async function handleRemoveFriend(targetTgId) {
    if (!confirm('Удалить атлета из друзей?')) return;
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${myTgId},friend_id.eq.${targetTgId}),and(user_id.eq.${targetTgId},friend_id.eq.${myTgId})`);

    setSelectedFriend(null);
    loadFriendsData();
  }

  return (
    <div className="space-y-3 pb-8">
      {/* 1. ДЕТАЛЬНАЯ КАРТОЧКА ПРОФИЛЯ ДРУГА (МОДАЛКА) */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-4 space-y-3.5 border border-white/10 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Досье напарника
              </span>
              <button
                type="button"
                onClick={() => setSelectedFriend(null)}
                className="text-slate-400 hover:text-white text-sm px-1.5 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Центрированный аватар и имя */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#121622] border-2 border-white/10 shadow-lg flex items-center justify-center">
                {selectedFriend.avatar_url ? (
                  <img src={selectedFriend.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-white">{selectedFriend.name?.[0] || 'A'}</span>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="text-sm font-black text-white tracking-tight">
                    {selectedFriend.name || 'Атлет'}
                  </h3>
                  {selectedFriend.is_pro && (
                    <span className="text-[8px] bg-gradient-to-r from-amber-500/30 to-[#FF5A1F]/30 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-black uppercase">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedFriend.city || 'Алматы'} • {selectedFriend.sport_type || 'Атлет'}
                </p>
              </div>
            </div>

            {/* Вайб атлета в зале */}
            {selectedFriend.current_status && (
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Вайб сейчас:</span>
                <span className="text-xs font-semibold text-slate-200">{selectedFriend.current_status}</span>
              </div>
            )}

            {/* ПАРАМЕТРЫ ТРЕНИРОВОК GYMBRO (ТОЛЬКО ЕСЛИ УЧАСТВУЕТ В ПОИСКЕ) */}
            {friendGymBroCard ? (
              <div className="p-3 rounded-2xl bg-[#FF5A1F]/5 border border-[#FF5A1F]/20 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#FF8C38] uppercase tracking-wider flex items-center gap-1">
                    <span>🤝</span> Профиль GymBro
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF5A1F]/15 text-[#FF5A1F] font-bold">
                    Ищет напарника
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                    <span className="text-[9px] text-slate-500 block">Зал:</span>
                    <span className="text-white font-semibold truncate block">
                      {friendGymBroCard.weekday_gym || 'Не указан'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                    <span className="text-[9px] text-slate-500 block">Сплит:</span>
                    <span className="text-white font-semibold truncate block">
                      {friendGymBroCard.split || 'Свободный'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                    <span className="text-[9px] text-slate-500 block">Время:</span>
                    <span className="text-white font-semibold truncate block">
                      {friendGymBroCard.time_slot || 'По договоренности'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                    <span className="text-[9px] text-slate-500 block">Уровень:</span>
                    <span className="text-white font-semibold truncate block">
                      {friendGymBroCard.level || 'Любитель'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                <span className="text-[10px] text-slate-500">
                  Атлет пока не участвует в поиске GymBro
                </span>
              </div>
            )}

            {/* Метрики активности */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 font-medium block">Друзья</span>
                <span className="text-sm font-black text-white mt-0.5 block">
                  {loadingFriendDetails ? '...' : friendStats.friends}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 font-medium block">Реакции</span>
                <span className="text-sm font-black text-[#FF8C38] mt-0.5 block">
                  🔥 {loadingFriendDetails ? '...' : friendStats.likes}
                </span>
              </div>
            </div>

            {/* Короткое био */}
            {selectedFriend.bio && (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedFriend.bio}</p>
              </div>
            )}

            {/* Instagram */}
            {selectedFriend.instagram && (
              <a
                href={`https://instagram.com/${selectedFriend.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs text-slate-300 hover:text-white transition no-underline block"
              >
                <span className="text-slate-400">Instagram:</span>
                <span className="font-semibold text-[#FF8C38]">@{selectedFriend.instagram} ↗</span>
              </a>
            )}

            {/* Кнопка перехода в Telegram */}
            {selectedFriend.telegram_username ? (
              <a
                href={`https://t.me/${selectedFriend.telegram_username}`}
                target="_blank"
                rel="noreferrer"
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 no-underline cursor-pointer shadow-lg shadow-[#FF5A1F]/20"
              >
                <span>💬 Написать в Telegram (@{selectedFriend.telegram_username})</span>
                <span>➔</span>
              </a>
            ) : (
              <div className="p-2 text-center text-[10px] text-slate-500 bg-white/[0.02] rounded-xl">
                У атлета скрыт username в Telegram
              </div>
            )}

            {/* Удалить из друзей */}
            <button
              type="button"
              onClick={() => handleRemoveFriend(selectedFriend.telegram_id)}
              className="w-full text-center text-[10px] text-red-400/80 hover:text-red-400 font-semibold py-1 cursor-pointer"
            >
              Удалить из друзей
            </button>
          </div>
        </div>
      )}

      {/* 2. ТАБЫ: СПИСОК ДРУЗЕЙ И ЗАЯВКИ */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/40 border border-white/[0.05]">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'all' ? 'bg-[#FF5A1F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Мои бро</span>
          <span className="text-[10px] opacity-80">({friends.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'requests' ? 'bg-[#FF5A1F] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Заявки</span>
          {requests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. СПИСОК ДРУЗЕЙ */}
      {activeSubTab === 'all' && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Загрузка напарников...</div>
          ) : friends.length === 0 ? (
            <div className="p-8 text-center apple-glass space-y-2 border border-white/[0.06] rounded-2xl">
              <span className="text-3xl block">🤝</span>
              <p className="text-xs font-bold text-white">Список друзей пока пуст</p>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Заходи во вкладку GymBro или клубную ленту, чтобы найти напарников по тренировкам.
              </p>
            </div>
          ) : (
            friends.map(f => (
              <div
                key={f.id}
                onClick={() => handleOpenFriendProfile(f)}
                className="p-3 rounded-2xl apple-glass border border-white/[0.06] hover:border-white/15 flex items-center justify-between gap-3 transition cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center flex-shrink-0">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{f.name?.[0] || 'A'}</span>
                    )}
                  </div>

                  <div className="truncate space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">{f.name || 'Атлет'}</p>
                      {f.is_pro && (
                        <span className="text-[8px] bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-black">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {f.city || 'Алматы'} • {f.sport_type || 'Атлет'}
                    </p>
                    {f.current_status && (
                      <p className="text-[9px] text-emerald-400 font-medium truncate">
                        {f.current_status}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-slate-500 text-xs flex-shrink-0 pr-1">➔</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. СПИСОК ВХОДЯЩИХ ЗАЯВОК */}
      {activeSubTab === 'requests' && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Загрузка...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center apple-glass border border-white/[0.06] rounded-2xl">
              <p className="text-xs text-slate-400">Входящих заявок нет</p>
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req.friendship_id}
                className="p-3 rounded-2xl apple-glass border border-white/[0.06] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center flex-shrink-0">
                    {req.user?.avatar_url ? (
                      <img src={req.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{req.user?.name?.[0] || 'A'}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{req.user?.name || 'Атлет'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{req.user?.city || 'Алматы'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.friendship_id)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold active:scale-95 transition cursor-pointer"
                  >
                    Принять
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.friendship_id)}
                    className="px-2 py-1.5 rounded-xl bg-white/[0.04] text-slate-400 text-[10px] hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
