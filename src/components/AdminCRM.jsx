import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminCRM({ onClose }) {
  const [users, setUsers] = useState([]);
  const [gymBroMap, setGymBroMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pro' | 'verified' | 'blocked' | 'gymbro'
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Загрузка всех пользователей и их анкет
  async function loadAllData() {
    setLoading(true);
    try {
      // 1. Все пользователи
      const { data: usersData, error: uErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (uErr) throw uErr;

      // 2. Все анкеты GymBro
      const { data: cardsData } = await supabase
        .from('gymbro_cards')
        .select('*');

      const cardMap = {};
      (cardsData || []).forEach(c => {
        cardMap[Number(c.telegram_id)] = c;
      });

      setUsers(usersData || []);
      setGymBroMap(cardMap);
    } catch (err) {
      console.error('Ошибка загрузки CRM:', err);
      alert('Не удалось загрузить данные CRM');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Переключение PRO-статуса
  async function togglePro(targetUser) {
    setActionLoading(true);
    const newStatus = !targetUser.is_pro;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_pro: newStatus })
        .eq('telegram_id', targetUser.telegram_id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.telegram_id === targetUser.telegram_id ? { ...u, is_pro: newStatus } : u));
      if (selectedUser?.telegram_id === targetUser.telegram_id) {
        setSelectedUser(prev => ({ ...prev, is_pro: newStatus }));
      }
    } catch (e) {
      alert('Ошибка изменения PRO-статуса: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Переключение Верификации (Синяя галочка)
  async function toggleVerified(targetUser) {
    setActionLoading(true);
    const newStatus = !targetUser.is_verified;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: newStatus })
        .eq('telegram_id', targetUser.telegram_id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.telegram_id === targetUser.telegram_id ? { ...u, is_verified: newStatus } : u));
      if (selectedUser?.telegram_id === targetUser.telegram_id) {
        setSelectedUser(prev => ({ ...prev, is_verified: newStatus }));
      }
    } catch (e) {
      alert('Ошибка верификации: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Переключение Блокировки
  async function toggleBlock(targetUser) {
    const isBlocking = !targetUser.is_blocked;
    if (!window.confirm(isBlocking ? `Заблокировать атлета ${targetUser.name}?` : `Разблокировать ${targetUser.name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: isBlocking })
        .eq('telegram_id', targetUser.telegram_id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.telegram_id === targetUser.telegram_id ? { ...u, is_blocked: isBlocking } : u));
      if (selectedUser?.telegram_id === targetUser.telegram_id) {
        setSelectedUser(prev => ({ ...prev, is_blocked: isBlocking }));
      }
    } catch (e) {
      alert('Ошибка смены блокировки: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Метрики
  const totalCount = users.length;
  const proCount = users.filter(u => u.is_pro).length;
  const verifiedCount = users.filter(u => u.is_verified).length;
  const blockedCount = users.filter(u => u.is_blocked).length;
  const gymBroCount = Object.keys(gymBroMap).length;

  // Фильтрация
  const filteredUsers = users.filter(u => {
    const card = gymBroMap[Number(u.telegram_id)];

    if (filter === 'pro' && !u.is_pro) return false;
    if (filter === 'verified' && !u.is_verified) return false;
    if (filter === 'blocked' && !u.is_blocked) return false;
    if (filter === 'gymbro' && !card) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchUser = (u.telegram_username || '').toLowerCase().includes(q);
      const matchId = String(u.telegram_id).includes(q);
      const matchGym = (card?.weekday_gym || '').toLowerCase().includes(q);
      return matchName || matchUser || matchId || matchGym;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-4 overflow-hidden select-none animate-in fade-in duration-200">
      {/* Шапка админки */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <div>
            <h2 className="text-sm font-black text-white tracking-wide uppercase">
              GymConnect CRM & База
            </h2>
            <p className="text-[10px] text-slate-400">Управление атлетами и доступом</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Метрики в реальном времени */}
      <div className="grid grid-cols-4 gap-2 pt-3 pb-2">
        <div className="p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
          <span className="text-[9px] text-slate-400 block">Всего</span>
          <span className="text-sm font-black text-white">{totalCount}</span>
        </div>
        <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
          <span className="text-[9px] text-amber-300 block">PRO</span>
          <span className="text-sm font-black text-amber-400">{proCount}</span>
        </div>
        <div className="p-2 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-center">
          <span className="text-[9px] text-[#FF8C38] block">GymBro</span>
          <span className="text-sm font-black text-white">{gymBroCount}</span>
        </div>
        <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <span className="text-[9px] text-emerald-300 block">Verified</span>
          <span className="text-sm font-black text-emerald-400">{verifiedCount}</span>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="space-y-2 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Поиск: имя, @username, ID или филиал зала..."
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

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-xl font-bold border transition cursor-pointer flex-shrink-0 ${
              filter === 'all' ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white' : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            Все ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pro')}
            className={`px-2.5 py-1 rounded-xl font-bold border transition cursor-pointer flex-shrink-0 ${
              filter === 'pro' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            PRO ({proCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('gymbro')}
            className={`px-2.5 py-1 rounded-xl font-bold border transition cursor-pointer flex-shrink-0 ${
              filter === 'gymbro' ? 'bg-[#FF8C38] border-[#FF8C38] text-white' : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            С анкетой ({gymBroCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`px-2.5 py-1 rounded-xl font-bold border transition cursor-pointer flex-shrink-0 ${
              filter === 'verified' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            Верифицированные ({verifiedCount})
          </button>
          {blockedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('blocked')}
              className={`px-2.5 py-1 rounded-xl font-bold border transition cursor-pointer flex-shrink-0 ${
                filter === 'blocked' ? 'bg-red-500 border-red-500 text-white' : 'bg-white/[0.03] border-white/10 text-red-400'
              }`}
            >
              Заблокированные ({blockedCount})
            </button>
          )}
        </div>
      </div>

      {/* Список карточек пользователей */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Загрузка базы пользователей...
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(u => {
            const card = gymBroMap[Number(u.telegram_id)];

            return (
              <div
                key={u.telegram_id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 rounded-2xl border transition cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
                  u.is_blocked
                    ? 'bg-red-950/20 border-red-500/40 opacity-70'
                    : u.is_pro
                    ? 'bg-gradient-to-r from-amber-500/10 via-black/40 to-transparent border-amber-500/30'
                    : 'apple-glass border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center flex-shrink-0">
                    {u.avatar_url || card?.photo_url ? (
                      <img src={u.avatar_url || card?.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">{u.name?.[0] || 'A'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-black text-white truncate">{u.name}</span>
                      {u.is_verified && <span className="text-[10px] text-blue-400" title="Верифицирован">☑️</span>}
                      {u.is_pro && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[8px] font-black uppercase">
                          PRO
                        </span>
                      )}
                      {u.is_blocked && (
                        <span className="px-1.5 py-0.2 rounded bg-red-500 text-white text-[8px] font-black uppercase">
                          BANNED
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      {u.telegram_username ? `@${u.telegram_username}` : `ID: ${u.telegram_id}`}
                      {card?.weekday_gym && (
                        <span className="text-amber-300 ml-1.5 truncate">
                          • 📍 {card.weekday_gym.split('(')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 text-xs flex-shrink-0">
                  ➔
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Никого не найдено
          </div>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДЕТАЛЬНОГО ДОСЬЕ И УПРАВЛЕНИЯ */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-3.5 border border-white/10 rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Инспектор атлета
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-base px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Карточка профиля */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#121622] border border-white/10 flex-shrink-0">
                {selectedUser.avatar_url || gymBroMap[Number(selectedUser.telegram_id)]?.photo_url ? (
                  <img
                    src={selectedUser.avatar_url || gymBroMap[Number(selectedUser.telegram_id)]?.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                    {selectedUser.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white truncate">{selectedUser.name}</h3>
                  {selectedUser.is_verified && <span className="text-xs text-blue-400">☑️</span>}
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedUser.telegram_username ? `@${selectedUser.telegram_username}` : 'Юзернейм скрыт'}
                </p>
                <p className="text-[10px] text-slate-500">ID: {selectedUser.telegram_id}</p>
              </div>
            </div>

            {/* КНОПКИ УПРАВЛЕНИЯ ДОСТУПОМ */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {/* PRO */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => togglePro(selectedUser)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedUser.is_pro
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {selectedUser.is_pro ? '👑 PRO: Включен' : '👑 Включить PRO'}
                </button>

                {/* Верификация */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => toggleVerified(selectedUser)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedUser.is_verified
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {selectedUser.is_verified ? '☑️ Верифицирован' : '☑️ Верифицировать'}
                </button>
              </div>

              {/* Блокировка */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => toggleBlock(selectedUser)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  selectedUser.is_blocked
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white/[0.03] border-red-500/30 text-red-400 hover:bg-red-500/10'
                }`}
              >
                {selectedUser.is_blocked ? '🔓 Разблокировать атлета' : '🚫 Заблокировать доступ'}
              </button>
            </div>

            {/* ДАННЫЕ АНКЕТЫ GYMBRO */}
            {gymBroMap[Number(selectedUser.telegram_id)] ? (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-[11px]">
                <span className="text-[9px] font-black text-[#FF8C38] uppercase tracking-wider block">
                  Анкета атлета GymBro
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-slate-500 text-[9px] block">Зал:</span>
                    <span className="text-white font-medium truncate block">
                      {gymBroMap[Number(selectedUser.telegram_id)].weekday_gym}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Сплит:</span>
                    <span className="text-white font-medium truncate block">
                      {gymBroMap[Number(selectedUser.telegram_id)].split}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Время:</span>
                    <span className="text-white font-medium truncate block">
                      {gymBroMap[Number(selectedUser.telegram_id)].time_slot}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block">Цель:</span>
                    <span className="text-white font-medium truncate block">
                      {gymBroMap[Number(selectedUser.telegram_id)].search_goal}
                    </span>
                  </div>
                </div>

                {gymBroMap[Number(selectedUser.telegram_id)].bio && (
                  <div className="pt-1 border-t border-white/[0.04]">
                    <span className="text-slate-500 text-[9px] block">О себе:</span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {gymBroMap[Number(selectedUser.telegram_id)].bio}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center text-[10px] text-slate-500">
                Атлет ещё не заполнил анкету GymBro
              </div>
            )}

            {/* Прямая связь в Telegram */}
            {selectedUser.telegram_username ? (
              <a
                href={`https://t.me/${selectedUser.telegram_username}`}
                target="_blank"
                rel="noreferrer"
                className="w-full gymshark-btn-electric py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 no-underline block"
              >
                <span>💬 Написать в Telegram (@{selectedUser.telegram_username})</span>
              </a>
            ) : (
              <div className="text-center text-[10px] text-slate-500">
                Юзернейм Telegram скрыт настройками приватности
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
