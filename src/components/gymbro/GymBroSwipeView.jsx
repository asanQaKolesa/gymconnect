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
  const currentProfile = profiles && profiles[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      {/* Селектор залов в стиле чипсов */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        <button
          onClick={() => onFilterChange('Все')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterGym === 'Все'
              ? 'bg-white text-black shadow-md shadow-white/10'
              : 'bg-white/[0.05] text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          Все залы
        </button>
        <button
          onClick={() => onFilterChange(userHomeGym)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterGym === userHomeGym
              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/30'
              : 'bg-white/[0.05] text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          📍 Мой филиал
        </button>
      </div>

      {loading ? (
        <div className="h-[480px] w-full flex items-center justify-center text-slate-400 text-xs">
          Поиск атлетов рядом...
        </div>
      ) : currentProfile ? (
        <div className="w-full flex flex-col items-center">
          {/* Главная карточка Tinder */}
          <div className="relative w-full h-[470px] rounded-[32px] overflow-hidden bg-[#121622] border border-white/10 shadow-2xl transition-all duration-300">
            {/* Фото атлета */}
            {currentProfile.photo_url ? (
              <img
                src={currentProfile.photo_url}
                alt={currentProfile.full_name}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#181d2d] to-[#0d1017] text-slate-500">
                <span className="text-6xl mb-2">🏋️‍♂️</span>
                <span className="text-xs font-medium text-slate-400">Фото пока не добавлено</span>
              </div>
            )}

            {/* Мягкий глубокий градиент Tinder поверх фото */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090c13] via-[#090c13]/40 to-transparent pointer-events-none" />

            {/* Верхние плашки: Психотип и Время */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-lg">
                <span>{currentProfile.personality_type === 'Интроверт' ? '🤫' : currentProfile.personality_type === 'Экстраверт' ? '⚡' : '⚖️'}</span>
                <span>{currentProfile.personality_type || 'Амбиверт'}</span>
              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-slate-300 border border-white/10">
                ⏱ {currentProfile.preferred_time ? currentProfile.preferred_time.split(' ')[0] : 'Вечер'}
              </span>
            </div>

            {/* Нижняя информация о человеке */}
            <div className="absolute bottom-4 left-0 right-0 px-5 space-y-2 pointer-events-none">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                  {currentProfile.full_name}
                </h2>
                {currentProfile.age && (
                  <span className="text-xl font-medium text-slate-300">
                    {currentProfile.age}
                  </span>
                )}
              </div>

              {/* Зал */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF8C38] truncate drop-shadow">
                <span>📍</span>
                <span className="truncate">{currentProfile.home_gym}</span>
              </div>

              {/* Био */}
              {currentProfile.bio && (
                <p className="text-[12px] text-slate-200 line-clamp-2 leading-snug drop-shadow-sm">
                  {currentProfile.bio}
                </p>
              )}

              {/* Теги / Цели */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/15 backdrop-blur-md text-white border border-white/10">
                  💪 {currentProfile.experience_level}
                </span>
                {currentProfile.goals && currentProfile.goals.map((goal, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FF5A1F]/25 backdrop-blur-md text-[#FF9E66] border border-[#FF5A1F]/30">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tinder Action Buttons Bar */}
          <div className="flex items-center justify-center gap-5 mt-4 w-full">
            {/* Кнопка Назад (Rewind) */}
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              title="Отмотать назад"
              className="w-12 h-12 rounded-full bg-[#161b29] border border-white/10 flex items-center justify-center text-amber-400 shadow-xl active:scale-90 disabled:opacity-30 disabled:scale-100 transition-all cursor-pointer hover:bg-white/[0.08]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>

            {/* Кнопка Пропустить (Pass) */}
            <button
              onClick={onSkip}
              title="Пропустить"
              className="w-16 h-16 rounded-full bg-[#161b29] border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/10 active:scale-90 transition-all cursor-pointer hover:bg-rose-500/10 hover:border-rose-500/40"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Кнопка Тренить вместе (Match / Super Like) */}
            <button
              onClick={() => onConnect(currentProfile)}
              title="Тренить вместе"
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-white shadow-2xl shadow-[#FF5A1F]/35 active:scale-90 transition-all cursor-pointer hover:brightness-110"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Экран завершения анкет */
        <div className="w-full h-[460px] rounded-[32px] bg-[#121622] border border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl">
            🏁
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Все анкеты просмотрены</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Новые атлеты скоро появятся. Попробуй сменить фильтр залов!
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="px-4 py-2 rounded-2xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 transition cursor-pointer"
              >
                ↩ Отмотать назад
              </button>
            )}
            <button
              onClick={() => onFilterChange('Все')}
              className="px-4 py-2 rounded-2xl bg-[#FF5A1F] text-white text-xs font-bold shadow-lg shadow-[#FF5A1F]/25 hover:brightness-110 transition cursor-pointer"
            >
              Все залы Алматы
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
