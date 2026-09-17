import React from 'react';

export default function GymBroSwipeView({
  profiles,
  currentIndex,
  loading,
  filterGym,
  userHomeGym,
  onFilterChange,
  onSkip,
  onPrev,
  onConnect
}) {
  return (
    <div className="space-y-4">
      {/* Фильтр по залу */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 shrink-0">Зал:</span>
        <button
          onClick={() => onFilterChange('Все')}
          className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition ${
            filterGym === 'Все'
              ? 'bg-white text-black border-white'
              : 'bg-[#121622] text-slate-300 border-white/10'
          }`}
        >
          Все залы
        </button>
        <button
          onClick={() => onFilterChange(userHomeGym)}
          className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium transition ${
            filterGym === userHomeGym
              ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
              : 'bg-[#121622] text-slate-300 border-white/10'
          }`}
        >
          Только мой филиал
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Загрузка атлетов...</div>
      ) : profiles.length > 0 && currentIndex < profiles.length ? (
        <div className="bg-[#111827] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="w-full h-80 bg-gray-900 relative">
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

            {/* Психотип */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
              <span>
                {profiles[currentIndex].personality_type === 'Интроверт' ? '🤫' : 
                 profiles[currentIndex].personality_type === 'Экстраверт' ? '⚡' : '⚖️'}
              </span>
              <span>{profiles[currentIndex].personality_type || 'Амбиверт'}</span>
            </div>

            {/* Имя и локация */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#111827] via-[#111827]/85 to-transparent p-5">
              <h3 className="text-2xl font-black text-white">
                {profiles[currentIndex].full_name}{profiles[currentIndex].age ? `, ${profiles[currentIndex].age}` : ''}
              </h3>
              <p className="text-[#FF8C38] font-semibold text-xs mt-0.5 truncate">
                📍 {profiles[currentIndex].home_gym}
              </p>
            </div>
          </div>

          <div className="p-5 pt-2 space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                ⏱ {profiles[currentIndex].preferred_time || 'Вечер'}
              </span>
              <span className="bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                💪 {profiles[currentIndex].experience_level}
              </span>
            </div>

            {profiles[currentIndex].bio && (
              <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] leading-relaxed">
                «{profiles[currentIndex].bio}»
              </p>
            )}

            {profiles[currentIndex].goals?.length > 0 && (
              <div>
                <div className="text-[11px] text-slate-400 font-medium mb-1">Цели:</div>
                <div className="flex flex-wrap gap-1.5">
                  {profiles[currentIndex].goals.map((g, i) => (
                    <span key={i} className="text-[11px] bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[#FF8C38] px-2 py-0.5 rounded-md font-semibold">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Панель кнопок: Назад, Пропустить, Тренить вместе */}
          <div className="flex items-center border-t border-white/10 bg-[#0c101a]">
            {/* Кнопка отмотать назад */}
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="px-4 py-4 text-slate-400 hover:text-white disabled:opacity-25 border-r border-white/10 transition text-sm flex items-center justify-center"
              title="Отмотать назад"
            >
              ↩
            </button>

            {/* Пропустить */}
            <button
              onClick={onSkip}
              className="flex-1 py-4 text-center font-bold text-slate-400 hover:text-rose-400 border-r border-white/10 transition text-xs"
            >
              ✕ Пропустить
            </button>

            {/* Тренить вместе */}
            <button
              onClick={() => onConnect(profiles[currentIndex])}
              className="flex-1 py-4 text-center font-bold text-[#FF5A1F] hover:text-[#FF8C38] transition text-xs flex items-center justify-center gap-1"
            >
              <span>⚡</span> Тренить вместе
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center space-y-3">
          <div className="text-3xl">🏁</div>
          <h4 className="font-bold text-white text-sm">Анкеты просмотрены</h4>
          <p className="text-xs text-slate-400">Смени фильтр залов или отмотай назад!</p>
          <div className="flex justify-center gap-2">
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="px-4 py-2 bg-white/10 rounded-xl text-xs font-semibold text-white border border-white/20"
              >
                ↩ На шаг назад
              </button>
            )}
            <button
              onClick={() => { onFilterChange('Все'); }}
              className="px-4 py-2 bg-[#FF5A1F] rounded-xl text-xs font-bold text-white"
            >
              Все залы
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
