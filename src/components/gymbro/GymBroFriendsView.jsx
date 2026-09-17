import React from 'react';

export default function GymBroFriendsView({ friends, onRemove, onFindMore }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <span>👥</span> Сохранённые напарники
        </h3>
        <span className="text-xs text-gray-400">{friends.length} бро</span>
      </div>

      {friends.length > 0 ? (
        friends.map((bro) => (
          <div 
            key={bro.user_id} 
            className="bg-[#111827] border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gray-800 overflow-hidden shrink-0 border border-gray-700">
                {bro.photo_url ? (
                  <img src={bro.photo_url} alt={bro.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🏋️</div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {bro.full_name}, {bro.age}
                </h4>
                <p className="text-emerald-400 text-xs truncate">📍 {bro.home_gym}</p>
                <p className="text-gray-400 text-[11px] truncate">
                  ⏱ {bro.preferred_time || 'Вечер'} • {bro.personality_type || 'Амбиверт'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://t.me/${bro.telegram_contact.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <span>✈️</span> Чат
              </a>
              <button
                onClick={() => onRemove(bro.user_id)}
                className="w-8 h-8 rounded-xl bg-gray-800/80 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 flex items-center justify-center text-xs"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center space-y-2">
          <div className="text-3xl">🤝</div>
          <p className="text-sm font-bold text-white">Список пока пуст</p>
          <p className="text-xs text-gray-400">
            Перейдите во вкладку «Поиск напарника» и нажмите «⚡ Тренить вместе»!
          </p>
          <button
            onClick={onFindMore}
            className="mt-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs"
          >
            Найти первого бро
          </button>
        </div>
      )}
    </div>
  );
}
