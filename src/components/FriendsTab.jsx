import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function FriendsTab({
  friends = [],
  user,
  onRemoveFriend,
  onOpenProfile,
  onRefreshFriends
}) {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'gymbro'

  const myTgId = Number(user?.telegram_id || 0);

  // Самостоятельная гарантированная загрузка друзей напрямую из Supabase
  async function fetchFriendsDirectly() {
    if (!myTgId) return;
    setLoading(true);

    try {
      // 1. Ищем все подтвержденные связи, где я либо инициатор, либо получатель
      const { data: outFriends, error: err1 } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', myTgId)
        .eq('status', 'accepted');

      const { data: inFriends, error: err2 } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('friend_id', myTgId)
        .eq('status', 'accepted');

      const ids = [
        ...(outFriends || []).map(r => Number(r.friend_id)),
        ...(inFriends || []).map(r => Number(r.user_id))
      ].filter(id => id && id !== myTgId);

      // Убираем дубликаты
      const uniqueIds = [...new Set(ids)];

      if (uniqueIds.length === 0) {
        setFriendsList([]);
        setLoading(false);
        return;
      }

      // 2. Получаем профили пользователей
      const { data: usersData } = await supabase
        .from('users')
        .select('telegram_id, telegram_username, name, avatar_url, city')
        .in('telegram_id', uniqueIds);

      // 3. Получаем их анкеты GymBro
      const { data: gymbroData } = await supabase
        .from('gymbro_cards')
        .select('telegram_id, weekday_gym, split, time_slot, search_goal')
        .in('telegram_id', uniqueIds);

      const gymBroMap = {};
      (gymbroData || []).forEach(c => {
        gymBroMap[Number(c.telegram_id)] = c;
      });

      const fullList = uniqueIds.map(fId => {
        const u = (usersData || []).find(item => Number(item.telegram_id) === fId) || {};
        const g = gymBroMap[fId] || null;

        return {
          telegram_id: fId,
          name: u.name || 'Атлет',
          telegram_username: u.telegram_username || '',
          avatar_url: u.avatar_url || '',
          city: u.city || 'Алматы',
          gymBroInfo: g,
          isGymBro: Boolean(g)
        };
      });

      setFriendsList(fullList);
    } catch (err) {
      console.error('Ошибка в FriendsTab:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFriendsDirectly();
  }, [myTgId]);

  async function handleRemove(targetTgId) {
    if (!window.confirm('Удалить из друзей?')) return;
    try {
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${myTgId},friend_id.eq.${targetTgId}),and(user_id.eq.${targetTgId},friend_id.eq.${myTgId})`);

      setFriendsList(prev => prev.filter(f => f.telegram_id !== targetTgId));
      if (onRefreshFriends) onRefreshFriends();
    } catch (e) {
      console.error(e);
    }
  }

  // Фильтрация
  const displayedFriends = friendsList.filter(item => {
    if (filterType === 'gymbro' && !item.isGymBro) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchUser = item.telegram_username.toLowerCase().includes(q);
      const matchGym = (item.gymBroInfo?.weekday_gym || '').toLowerCase().includes(q);
      return matchName || matchUser || matchGym;
    }

    return true;
  });

  const gymBroCount = friendsList.filter(item => item.isGymBro).length;

  function handleInviteWorkout(friend) {
    if (!friend.telegram_username) {
      alert('У напарника скрыт юзернейм в Telegram.');
      return;
    }
    const gym = friend.gymBroInfo?.weekday_gym
      ? friend.gymBroInfo.weekday_gym.split('(')[0].trim()
      : 'зал';
    const text = encodeURIComponent(`Салам, бро! 🔥 Го сегодня на тренировку в ${gym}? Какой сплит у тебя по плану?`);
    window.open(`https://t.me/${friend.telegram_username}?text=${text}`, '_blank');
  }

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Твои контакты ({friendsList.length})
          </h2>
          <p className="text-[10px] text-slate-400">
            Напарники по залу и друзья в GymConnect
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFriendsDirectly}
          className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer active:scale-95 transition"
          title="Обновить список"
        >
          🔄
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Поиск по имени, юзернейму или залу..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full apple-input text-xs py-2 pl-3 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white shadow-sm'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
            }`}
          >
            Все атлеты ({friendsList.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('gymbro')}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex-shrink-0 flex items-center gap-1 ${
              filterType === 'gymbro'
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
            }`}
          >
            <span>⚡️ Напарники GymBro</span>
            <span>({gymBroCount})</span>
          </button>
        </div>
      </div>

      {/* Список */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Загрузка напарников...
        </div>
      ) : displayedFriends.length > 0 ? (
        <div className="space-y-2.5">
          {displayedFriends.map(friend => {
            const isGymBro = friend.isGymBro;
            const gymBroInfo = friend.gymBroInfo;

            return (
              <div
                key={friend.telegram_id}
                className={`p-3.5 rounded-3xl transition duration-200 border ${
                  isGymBro
                    ? 'bg-gradient-to-br from-[#1c1613] via-[#10141f] to-[#0a0d14] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'apple-glass border-white/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => onOpenProfile && onOpenProfile(friend)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-black text-white">
                            {friend.name?.[0] || 'A'}
                          </span>
                        )}
                      </div>
                      {isGymBro && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF5A1F] border-2 border-black flex items-center justify-center text-[9px] shadow">
                          ⚡️
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white truncate">
                          {friend.name}
                        </h4>
                        {isGymBro && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[8px] font-black text-amber-300 uppercase tracking-wider flex-shrink-0">
                            GymBro Match
                          </span>
                        )}
                      </div>

                      {friend.telegram_username && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          @{friend.telegram_username}
                        </span>
                      )}

                      {/* Филиал и сплит напарника */}
                      {isGymBro && gymBroInfo && (
                        <div className="pt-1.5 space-y-0.5">
                          <span className="text-[10px] text-amber-300 font-semibold block truncate">
                            📍 {gymBroInfo.weekday_gym}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate">
                            💪 {gymBroInfo.split} • ⏰ {gymBroInfo.time_slot?.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    type="button"
                    onClick={() => handleRemove(friend.telegram_id)}
                    className="text-slate-500 hover:text-red-400 p-1 text-xs cursor-pointer transition flex-shrink-0"
                    title="Удалить из друзей"
                  >
                    ✕
                  </button>
                </div>

                {/* Действия: позвать на тренировку и чат */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-2">
                  {friend.telegram_username ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleInviteWorkout(friend)}
                        className="flex-1 gymshark-btn-electric py-2 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>🏋️‍♂️ Позвать в зал</span>
                      </button>

                      <a
                        href={`https://t.me/${friend.telegram_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-semibold text-slate-200 no-underline flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <span>💬 Чат</span>
                      </a>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">
                      Юзернейм Telegram скрыт
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center apple-glass border border-white/[0.08] rounded-3xl space-y-3 py-12">
          <span className="text-3xl block">🤝</span>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              {filterType === 'gymbro' ? 'Пока нет мэтчей GymBro' : 'Список контактов пуст'}
            </h3>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              {filterType === 'gymbro'
                ? 'Свайпай анкеты атлетов во вкладке GymBro, чтобы находить напарников по тренировкам!'
                : 'Знакомься с атлетами через ленту GymBro или принимай входящие запросы.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
