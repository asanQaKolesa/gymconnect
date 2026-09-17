import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function FriendsTab({ user }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectedFriend, setInspectedFriend] = useState(null);

  const myTgId = Number(user?.telegram_id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0);

  useEffect(() => {
    loadFriendsData();
  }, [myTgId]);

  async function loadFriendsData() {
    if (!myTgId) return;
    setLoading(true);

    try {
      // 1. Загружаем входящие заявки (pending)
      const { data: reqData } = await supabase
        .from('friendships')
        .select('id, user_id, created_at')
        .eq('friend_id', myTgId)
        .eq('status', 'pending');

      if (reqData && reqData.length > 0) {
        const senderIds = reqData.map(r => Number(r.user_id));
        const { data: senders } = await supabase
          .from('users')
          .select('telegram_id, name, avatar_url, city, sport_type')
          .in('telegram_id', senderIds);

        setRequests(
          reqData.map(r => ({
            ...r,
            sender: senders?.find(s => Number(s.telegram_id) === Number(r.user_id)) || {
              name: 'Атлет',
              city: 'Алматы',
              sport_type: 'Атлет'
            }
          }))
        );
      } else {
        setRequests([]);
      }

      // 2. Загружаем подтвержденных друзей (accepted)
      const { data: f1 } = await supabase
        .from('friendships')
        .select('id, friend_id')
        .eq('user_id', myTgId)
        .eq('status', 'accepted');

      const { data: f2 } = await supabase
        .from('friendships')
        .select('id, user_id')
        .eq('friend_id', myTgId)
        .eq('status', 'accepted');

      const friendPairs = [
        ...(f1 || []).map(x => ({ friendship_id: x.id, target_id: Number(x.friend_id) })),
        ...(f2 || []).map(x => ({ friendship_id: x.id, target_id: Number(x.user_id) }))
      ];

      if (friendPairs.length > 0) {
        const targetIds = friendPairs.map(x => x.target_id);
        const { data: profiles } = await supabase
          .from('users')
          .select('telegram_id, telegram_username, name, avatar_url, city, sport_type, instagram, bio')
          .in('telegram_id', targetIds);

        const { data: cards } = await supabase
          .from('gymbro_cards')
          .select('*')
          .in('telegram_id', targetIds);

        const list = friendPairs.map(p => {
          const profile = profiles?.find(u => Number(u.telegram_id) === p.target_id);
          const card = cards?.find(c => Number(c.telegram_id) === p.target_id);
          return {
            friendship_id: p.friendship_id,
            telegram_id: p.target_id,
            name: profile?.name || 'Атлет GymConnect',
            telegram_username: profile?.telegram_username || '',
            avatar_url: profile?.avatar_url || '',
            city: profile?.city || 'Алматы',
            sport_type: profile?.sport_type || 'Атлет',
            instagram: profile?.instagram || '',
            bio: profile?.bio || '',
            card: card || null
          };
        });

        setFriends(list);
      } else {
        setFriends([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки друзей:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
    await loadFriendsData();
  }

  async function handleDecline(id) {
    await supabase.from('friendships').delete().eq('id', id);
    setRequests(prev => prev.filter(r => r.id !== id));
  }

  async function handleBlock(id) {
    if (!window.confirm('Заблокировать пользователя?')) return;
    await supabase.from('friendships').update({ status: 'blocked' }).eq('id', id);
    setRequests(prev => prev.filter(r => r.id !== id));
  }

  async function handleRemoveFriend(friendshipId) {
    if (!window.confirm('Удалить атлета из друзей?')) return;
    await supabase.from('friendships').delete().eq('id', friendshipId);
    setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId));
    if (inspectedFriend?.friendship_id === friendshipId) {
      setInspectedFriend(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. ДЕТАЛЬНАЯ АНКЕТА ДРУГА (ПРИ КЛИКЕ) */}
      {inspectedFriend && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/10 overflow-hidden rounded-3xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0C101A]/95">
              <span className="text-[10px] font-bold text-[#FF8C38] uppercase tracking-wider">
                Профиль напарника
              </span>
              <button
                type="button"
                onClick={() => setInspectedFriend(null)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#151926] border border-white/10 flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-lg">
                  {inspectedFriend.avatar_url ? (
                    <img src={inspectedFriend.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    inspectedFriend.name?.[0] || 'A'
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {inspectedFriend.name}
                  </h3>
                  <p className="text-slate-400">
                    {inspectedFriend.city} • {inspectedFriend.sport_type}
                  </p>
                  {inspectedFriend.instagram && (
                    <a
                      href={`https://instagram.com/${inspectedFriend.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF8C38] font-semibold mt-1 inline-block"
                    >
                      📸 @{inspectedFriend.instagram}
                    </a>
                  )}
                </div>
              </div>

              {inspectedFriend.bio && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">О себе</span>
                  {inspectedFriend.bio}
                </div>
              )}

              {/* Данные GymBro */}
              {inspectedFriend.card && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#FF5A1F] block">
                    Параметры тренировок
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Будни:</span>
                      <span className="text-white font-medium">{inspectedFriend.card.weekday_gym}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Выходные:</span>
                      <span className="text-white font-medium">{inspectedFriend.card.weekend_gym || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Сплит:</span>
                      <span className="text-white font-medium">{inspectedFriend.card.split}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Время:</span>
                      <span className="text-white font-medium">{inspectedFriend.card.time_slot}</span>
                    </div>
                  </div>
                </div>
              )}

              {inspectedFriend.telegram_username ? (
                <a
                  href={`https://t.me/${inspectedFriend.telegram_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 no-underline cursor-pointer shadow-lg shadow-[#FF5A1F]/20"
                >
                  <span>💬 Написать в Telegram (@{inspectedFriend.telegram_username})</span>
                  <span>➔</span>
                </a>
              ) : (
                <div className="text-center p-2 rounded-xl bg-white/[0.03] text-slate-400 text-[11px]">
                  У атлета закрытый username в Telegram
                </div>
              )}

              <button
                type="button"
                onClick={() => handleRemoveFriend(inspectedFriend.friendship_id)}
                className="w-full text-center text-[11px] text-red-400 hover:text-red-300 py-1 cursor-pointer pt-2"
              >
                Удалить из друзей
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ШАПКА РАЗДЕЛА ДРУЗЬЯ */}
      <div className="apple-glass p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-tight">Друзья & Напарники</h2>
            <span className="text-[10px] bg-[#FF5A1F]/20 text-[#FF8C38] border border-[#FF5A1F]/30 px-2 py-0.5 rounded-full font-bold">
              {friends.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            Твоё личное фитнес-окружение
          </p>
        </div>
        <button
          onClick={loadFriendsData}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] active:scale-95 transition"
        >
          Обновить
        </button>
      </div>

      {/* 3. ВХОДЯЩИЕ ЗАЯВКИ (ЕСЛИ ЕСТЬ) */}
      {requests.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/25 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🤝</span>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Входящие заявки ({requests.length})
              </h4>
            </div>
            <span className="text-[9px] bg-[#FF5A1F] text-white px-2 py-0.5 rounded-full font-bold">
              Новые
            </span>
          </div>

          <div className="space-y-2">
            {requests.map(req => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-black/50 border border-white/[0.08] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
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
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold active:scale-95 cursor-pointer"
                  >
                    ✓ Принять
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(req.id)}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 text-xs active:scale-95 cursor-pointer"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlock(req.id)}
                    className="px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs active:scale-95 cursor-pointer"
                  >
                    🚫
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. СПИСОК ПОДТВЕРЖДЕННЫХ ДРУЗЕЙ */}
      {loading ? (
        <div className="apple-glass p-8 text-center text-xs text-slate-400">
          Загрузка списка друзей...
        </div>
      ) : friends.length === 0 ? (
        <div className="apple-glass p-10 text-center space-y-2.5">
          <span className="text-4xl">👥</span>
          <h3 className="text-sm font-bold text-white">Список друзей пока пуст</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Отправляй запросы атлетам из ленты на Главной или через раздел GymBro!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {friends.map(friend => (
            <div
              key={friend.friendship_id}
              className="apple-glass p-3.5 flex items-center justify-between gap-3 hover:border-[#FF5A1F]/40 transition"
            >
              <div
                onClick={() => setInspectedFriend(friend)}
                className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer active:opacity-80"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A1F]/20 to-[#FF8C38]/20 border border-white/10 flex items-center justify-center flex-shrink-0 text-base font-bold text-white overflow-hidden shadow-md">
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
                    {friend.city} • {friend.sport_type}
                  </p>
                  <span className="text-[9px] text-[#FF5A1F] font-semibold block mt-0.5">
                    Смотреть анкету ➔
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {friend.telegram_username && (
                  <a
                    href={`https://t.me/${friend.telegram_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#FF5A1F] text-white text-[11px] font-bold active:scale-95 transition no-underline flex items-center gap-1 shadow-md shadow-[#FF5A1F]/20"
                  >
                    💬 Чат
                  </a>
                )}
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
          ))}
        </div>
      )}
    </div>
  );
}
