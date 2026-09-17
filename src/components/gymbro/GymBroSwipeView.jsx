import React from 'react';

export default function GymBroSwipeView({
  profiles,
  currentIndex,
  loading,
  filterGym,
  userHomeGym,
  onFilterChange,
  onSkip,
  onConnect
}) {
  return (
    <div className="space-y-4">
      {/* Фильтр по залу */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-gray-400 shrink-0">Зал:</span>
        <button
          onClick={() => onFilterChange('Все')}
          className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium ${
            filterGym === 'Все'
              ? 'bg-white text-black border-white'
              : 'bg-gray-800 text-gray-300 border-gray-700'
          }`}
        >
          Все залы
        </button>
        <button
          onClick={() => onFilterChange(userHomeGym)}
          className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium ${
            filterGym === userHomeGym
              ? 'bg-emerald-500 text-black border-emerald-400'
              : 'bg-gray-800 text-gray-300 border-gray-700'
          }`}
        >
          Только мой филиал
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-xs">Загрузка атлетов...</div>
      ) : profiles.length > 0 && currentIndex < profiles.length ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="w-full h-72 bg-gray-900 relative">
            {profiles[currentIndex].photo_url ? (
              <img
                src={profiles[currentIndex].photo_url}
                alt={profiles[currentIndex].full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-t from-black/80 to-transparent">
                🏋️‍♂️
              </div>
            )}
            
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
              <span>
                {profiles[currentIndex].personality_type === 'Интроверт' ? '🤫' : 
                 profiles[currentIndex].personality_type === 'Экстраверт' ? '⚡' : '⚖️'}
              </span>
              <span>{profiles[currentIndex].personality_type || 'Амбиверт'}</span>
            </div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent p-5">
              <h3 className="text-2xl font-black text-white">
                {profiles[currentIndex].full_name}, {profiles[currentIndex].age}
              </h3>
              <p className="text-emerald-400 font-semibold text-xs mt-0.5 truncate">
                📍 {profiles[currentIndex].home_gym}
              </p>
            </div>
          </div>

          <div className="p-5 pt-2 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                ⏱ {profiles[currentIndex].preferred_time || 'Вечер'}
              </span>
              <span className="bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                💪 {profiles[currentIndex].experience_level}
              </span>
            </div>

            {profiles[currentIndex].bio && (
              <p className="text-xs text-gray-300 bg-gray-900/80 p-3 rounded-xl border border-gray-800 leading-relaxed">
                «{profiles[currentIndex].bio}»
              </p>
            )}

            <div>
              <div className="text-[11px] text-gray-400 font-medium mb-1">Цели:</div>
              <div className="flex flex-wrap gap-1.5">
                {profiles[currentIndex].goals?.map((g, i) => (
                  <span key={i} className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex border-t border-gray-800 bg-[#0b0f19]">
            <button
              onClick={onSkip}
              className="flex-1 py-4 text-center font-bold text-gray-400 hover:text-rose-400 border-r border-gray-800 transition"
            >
              ✕ Пропустить
            </button>
            <button
              onClick={() => onConnect(profiles[currentIndex])}
              className="flex-1 py-4 text-center font-bold text-emerald-400 hover:text-emerald-300 transition"
            >
              ⚡ Тренить вместе
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center space-y-2">
          <div className="text-3xl">🏁</div>
          <h4 className="font-bold text-white text-sm">Анкеты подошли к концу</h4>
          <p className="text-xs text-gray-400">Смени фильтр залов или вернись позже!</p>
          <button
            onClick={() => onFilterChange('Все')}
            className="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white border border-gray-700"
          >
            Сбросить на «Все залы»
          </button>
        </div>
      )}
    </div>
  );
}
