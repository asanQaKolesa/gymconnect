import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function FriendsTab({
  friends = [],
  user,
  onRemoveFriend,
  onOpenProfile,
  onRefreshFriends
}) {
  const [gymBroMap, setGymBroMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'gymbro'

  const myTgId = Number(user?.telegram_id || 0);

  // Извлекаем все возможные ID друзей из входящего массива
  const friendIds = friends.map(f => {
    if (typeof f === 'number' || typeof f === 'string') return Number(f);
    return Number(f.telegram_id || f.friend_id || f.id || (f.friend && f.friend.telegram_id) || 0);
  }).filter(id => id && id !== myTgId);

  // Подгружаем недостающие профили и данные gymbro_cards напрямую из базы
  useEffect(() => {
    async function loadData() {
      if (friendIds.length === 0) return;

      try {
        // 1. Профили пользователей
        const { data: userData } = await supabase
          .from('users')
          .select('telegram_id, telegram_username, name, avatar_url, city')
          .in('telegram_id', friendIds);

        if (userData) {
          const uMap = {};
          userData.forEach(u => {
            uMap[Number(u.telegram_id)] = u;
          });
          setUsersMap(uMap);
        }

        // 2. Карточки GymBro
        const { data: cards } = await supabase
          .from('gymbro_cards')
          .select('telegram_id, weekday_gym, split, time_slot, search_goal')
          .in('telegram_id', friendIds);

        if (cards) {
          const bMap = {};
          cards.forEach(c => {
            bMap[Number(c.telegram_id)] = c;
          });
          setGymBroMap(bMap);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных друзей:', err);
      }
    }

    loadData();
  }, [JSON.stringify(friendIds)]);

  // Собираем нормализованный список друзей
  const normalizedList = friendIds.map(fId => {
    const rawFriend = friends.find(f => {
      const id = typeof f === 'object' ? Number(f.telegram_id || f.friend_id || f.id || 0) : Number(f);
      return id === fId;
    });

    const dbUser = usersMap[fId] || {};
    const gymBroInfo = gymBroMap[fId] || null;

    return {
      telegram_id: fId,
      name: dbUser.name || rawFriend?.name || 'Атлет',
      telegram_username: dbUser.telegram_username || rawFriend?.telegram_username || '',
      avatar_url: dbUser.avatar_url || rawFriend?.avatar_url || rawFriend?.photo_url || '',
      city: dbUser.city || rawFriend?.city || 'Алматы',
      gymBroInfo: gymBroInfo,
      isGymBro: Boolean(gymBroInfo)
    };
  });

  // Фильтруем по вкладкам и строке поиска
  const displayedFriends = normalizedList.filter(item => {
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

  const gymBroCount = normalizedList.filter(item => item.isGymBro).length;

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
            Твои контакты ({normalizedList.length})
          </h2>
          <p className="text-[10px] text-slate-400">
            Напарники по залу и атлеты в твоей сети
          </p>
        </div>

        {onRefreshFriends && (
          <button
            type="button"
            onClick={onRefreshFriends}
            className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer active:scale-95 transition"
            title="Обновить список"
          >
            🔄
          </button>
        )}
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
            Все атлеты ({normalizedList.length})
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
      {displayedFriends.length > 0 ? (
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

                      {/* Филиал и сплит */}
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

                  {/* Удаление */}
                  {onRemoveFriend && (
                    <button
                      type="button"
                      onClick={() => onRemoveFriend(friend.telegram_id)}
                      className="text-slate-500 hover:text-red-400 p-1 text-xs cursor-pointer transition flex-shrink-0"
                      title="Удалить из друзей"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Кнопки вызова на тренировку */}
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
                : 'Знакомься с атлетами через ленту GymBro или добавляй друзей по юзернейму.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
