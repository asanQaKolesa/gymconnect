import React from 'react';

export default function GymBroFriendsView() {
  const friends = [
    { id: 1, name: 'Асанәли Құсайынов', gym: 'Invictus Go', status: 'В сети', goal: 'Набор массы' },
    { id: 2, name: 'Атлет #2', gym: 'World Class Almaty', status: 'Тренируется', goal: 'Сушка' },
    { id: 3, name: 'Атлет #3', gym: 'Fitnation', status: 'Был недавно', goal: 'Сила' },
    { id: 4, name: 'Атлет #4', gym: 'Invictus', status: 'В сети', goal: 'Поддержание' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-white">Ваши GymBro на связи</h3>
          <p className="text-xs text-zinc-400">Активные напарники по залам Алматы</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-xl font-mono border border-emerald-500/20">
          {friends.length} атлета
        </span>
      </div>

      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all">
            <div className="space-y-1">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                {friend.name}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-xs text-zinc-400">📍 {friend.gym} • Цель: {friend.goal}</div>
            </div>
            <button 
              onClick={() => alert(`Чат с ${friend.name} откроется в Telegram!`)}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-xl font-medium transition-colors border border-emerald-500/20"
            >
              Связаться
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
