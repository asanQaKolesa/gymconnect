import React, { useState } from 'react';

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
  const [showFullBio, setShowFullBio] = useState(false);
  const currentProfile = profiles && profiles[currentIndex];

  const handleInfoToggle = (e) => {
    e.stopPropagation();
    setShowFullBio(!showFullBio);
  };

  const handleSuperLike = () => {
    alert('⭐️ Суперлайк отправлен! Ваша анкета покажется этому бро первой.');
    onConnect(currentProfile);
  };

  const handleBoost = () => {
    alert('⚡ Boost активирован! Твой профиль поднят в топ на 30 минут.');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[360px] mx-auto select-none pb-2">
      {/* Селектор залов (минималистичные чипсы над карточкой) */}
      <div className="w-full flex items-center justify-center gap-2 mb-3 px-2">
        <button
          onClick={() => onFilterChange('Все')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            filterGym === 'Все'
              ? 'bg-white text-black shadow-md'
              : 'bg-white/[0.06] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          Все залы
        </button>
        <button
          onClick={() => onFilterChange(userHomeGym)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
            filterGym === userHomeGym
              ? 'bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] text-white shadow-md shadow-[#FF5A1F]/30'
              : 'bg-white/[0.06] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <span>📍</span>
          <span>Мой зал</span>
        </button>
      </div>

      {loading ? (
        <div className="h-[490px] w-full flex items-center justify-center text-slate-400 text-xs">
          Поиск атлетов рядом...
        </div>
      ) : currentProfile ? (
        <div className="w-full flex flex-col items-center">
          {/* Главная карточка в стиле Tinder */}
          <div className="relative w-full h-[485px] rounded-[28px] overflow-hidden bg-[#161a26] shadow-2xl border border-white/[0.08]">
            {/* Фотография атлета */}
            {currentProfile.photo_url ? (
              <img
                src={currentProfile.photo_url}
                alt={currentProfile.full_name}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1e2436] to-[#0f131d] text-slate-500">
                <span className="text-6xl mb-3">🏋️‍♂️</span>
                <span className="text-xs text-slate-400 font-medium">Фото не добавлено</span>
              </div>
            )}

            {/* Психотип (аккуратный тег сверху справа) */}
            <div className="absolute top-3.5 right-3.5 bg-black/45 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[11px] font-bold text-white flex items-center gap-1.5 pointer-events-none">
              <span>{currentProfile.personality_type === 'Интроверт' ? '🤫' : currentProfile.personality_type === 'Экстраверт' ? '⚡' : '⚖️'}</span>
              <span>{currentProfile.personality_type || 'Амбиверт'}</span>
            </div>

            {/* Мягкий темный градиент для читаемости текста снизу (как в оригинале) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

            {/* Блок с именем, возрастом, био и кнопкой (i) */}
            <div className="absolute bottom-4 left-0 right-0 px-4 text-white">
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* Имя и возраст */}
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md truncate">
                      {currentProfile.full_name}
                    </h2>
                    {currentProfile.age && (
                      <span className="text-2xl font-normal text-slate-200 drop-shadow-md">
                        {currentProfile.age}
                      </span>
                    )}
                  </div>

                  {/* Локация зала */}
                  <p className="text-[11px] font-medium text-slate-300 flex items-center gap-1 mt-0.5 drop-shadow">
                    <span>📍</span>
                    <span className="truncate">{currentProfile.home_gym}</span>
                  </p>

                  {/* Описание (био) */}
                  <p className={`text-xs text-slate-200 mt-1 leading-snug drop-shadow ${showFullBio ? '' : 'line-clamp-2'}`}>
                    {currentProfile.bio || 'Ищу напарника для регулярных тренировок и базы!'}
                  </p>

                  {/* Теги времени и опыта */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10">
                      ⏱ {currentProfile.preferred_time ? currentProfile.preferred_time.split(' ')[0] : 'Вечер'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10">
                      💪 {currentProfile.experience_level}
                    </span>
                  </div>
                </div>

                {/* Кнопка Инфо (i) */}
                <button
                  type="button"
                  onClick={handleInfoToggle}
                  className="w-7 h-7 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 5 оригинальных кнопок Tinder под карточкой */}
          <div className="flex items-center justify-center gap-3.5 mt-3.5 w-full">
            {/* 1. Желтая кнопка: Rewind (Назад) */}
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              title="Отмотать назад"
              className="w-11 h-11 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-[#EAA135] active:scale-90 disabled:opacity-30 disabled:scale-100 transition-all cursor-pointer hover:bg-slate-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
              </svg>
            </button>

            {/* 2. Красная кнопка: Pass (✕) */}
            <button
              onClick={onSkip}
              title="Пропустить"
              className="w-14 h-14 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#FD5068] active:scale-90 transition-all cursor-pointer hover:bg-slate-50"
            >
              <svg className="w-7 h-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.8" strokeLinecap="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 3. Голубая кнопка: Super Like (★) */}
            <button
              onClick={handleSuperLike}
              title="Суперлайк"
              className="w-11 h-11 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-[#2DB1FF] active:scale-90 transition-all cursor-pointer hover:bg-slate-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </button>

            {/* 4. Зеленая кнопка: Like / Match (♥) */}
            <button
              onClick={() => onConnect(currentProfile)}
              title="Тренить вместе"
              className="w-14 h-14 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#1BE4A1] active:scale-90 transition-all cursor-pointer hover:bg-slate-50"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>

            {/* 5. Фиолетовая кнопка: Boost (⚡) */}
            <button
              onClick={handleBoost}
              title="Boost анкеты"
              className="w-11 h-11 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-[#A65BFF] active:scale-90 transition-all cursor-pointer hover:bg-slate-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Экран, когда анкеты закончились */
        <div className="w-full h-[485px] rounded-[28px] bg-[#161a26] border border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-3xl">
            🏁
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Все анкеты просмотрены</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
              Новые атлеты скоро появятся. Смени фильтр залов или отмотай назад!
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
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF5A1F] to-[#FF7A00] text-white text-xs font-bold shadow-lg shadow-[#FF5A1F]/30 hover:brightness-110 transition cursor-pointer"
            >
              Все залы Алматы
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
