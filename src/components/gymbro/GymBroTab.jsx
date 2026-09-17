import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';
import GymBroMatches from './GymBroMatches';
import GymBroLikes from './GymBroLikes';
import GymBroEditProfile from './GymBroEditProfile';

export default function GymBroTab() {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: "Алексей",
      age: 26,
      personality: "Экстраверт",
      gym: "Invictus Go (Навои)",
      experience: "Стаж 3 года",
      time: "Вечер (18:00 - 20:00)",
      goal: "Качаю массу, ищу напарника на базу (жим, присед, тяга). Только хардкор.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
    },
    {
      id: 2,
      name: "Дильназ",
      age: 24,
      personality: "Амбиверт",
      gym: "Workout (Достык)",
      experience: "Стаж 1.5 года",
      time: "Утро (08:00 - 10:00)",
      goal: "Кроссфит, функциональный тренинг и работа на рельеф.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=85"
    },
    {
      id: 3,
      name: "Санжар",
      age: 28,
      personality: "Интроверт",
      gym: "Fidelity (Самал)",
      experience: "Стаж 5 лет",
      time: "День (14:00)",
      goal: "Подготовка к соревнованиям по пауэрлифтингу. Нужен надежный страхующий.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('swipe');
  const [filterMode, setFilterMode] = useState('all'); // 'all' (Все залы) или 'my' (Мой зал)

  const handleSwipe = (action) => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 pt-3 pb-24 flex flex-col max-w-md mx-auto ${appleTheme.styles.fontFamily}`}>
      
      {/* Верхние плашки навигации */}
      {activeSubTab === 'swipe' && (
        <div className="space-y-2.5 shrink-0 animate-fadeIn mb-2.5">
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setActiveSubTab('matches')}
              className="py-2.5 px-2 rounded-[16px] text-[13px] font-bold tracking-tight transition-all border bg-white text-zinc-800 border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center gap-1.5 hover:bg-zinc-50"
            >
              <svg className="w-4 h-4 text-[#007AFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Мэтчи (3)
            </button>

            <button 
              onClick={() => setActiveSubTab('likes')}
              className="py-2.5 px-2 rounded-[16px] text-[13px] font-bold tracking-tight transition-all border bg-white text-zinc-800 border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center gap-1.5 hover:bg-zinc-50"
            >
              <svg className="w-4 h-4 text-[#FF3B30]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Лайки (5)
            </button>

            <button 
              onClick={() => setActiveSubTab('edit')}
              className="py-2.5 px-2 rounded-[16px] text-[13px] font-bold tracking-tight transition-all border bg-white text-zinc-800 border-black/[0.04] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center gap-1.5 hover:bg-zinc-50"
            >
              <svg className="w-4 h-4 text-[#34C759]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Моя анкета
            </button>
          </div>

          {/* Переключатель фильтра залов сверху */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setFilterMode('all')}
              className={`py-2 px-3 rounded-[14px] text-[12px] font-bold tracking-tight transition-all border flex items-center justify-center gap-1.5 ${
                filterMode === 'all' 
                  ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-[0_4px_14px_rgba(0,122,255,0.3)]' 
                  : 'bg-white text-zinc-700 border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-zinc-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Все залы Алматы
            </button>

            <button 
              onClick={() => setFilterMode('my')}
              className={`py-2 px-3 rounded-[14px] text-[12px] font-bold tracking-tight transition-all border flex items-center justify-center gap-1.5 ${
                filterMode === 'my' 
                  ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-[0_4px_14px_rgba(0,122,255,0.3)]' 
                  : 'bg-white text-zinc-700 border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-zinc-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Только мой зал
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'matches' && <GymBroMatches onBack={() => setActiveSubTab('swipe')} />}
      {activeSubTab === 'likes' && <GymBroLikes onBack={() => setActiveSubTab('swipe')} />}
      {activeSubTab === 'edit' && <GymBroEditProfile onBack={() => setActiveSubTab('swipe')} />}

      {/* Основной экран свайпов: утвержденный размер карточки и кнопок */}
      {activeSubTab === 'swipe' && currentProfile && (
        <div className="flex-1 flex flex-col justify-center space-y-3.5 my-auto animate-fadeIn pb-2">
          
          <div className="bg-white rounded-[28px] shadow-[0_10px_32px_rgba(0,0,0,0.06)] border border-black/[0.05] overflow-hidden relative flex flex-col mx-auto w-full max-w-[370px]">
            <div className="relative w-full aspect-[4/4.3] bg-zinc-900">
              <img src={currentProfile.avatar} alt={currentProfile.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
              
              {/* Возраст и статус наверху карточки */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 tracking-wide">
                  {currentProfile.personality}
                </div>
                <div className="bg-black/30 backdrop-blur-md text-zinc-200 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
                  {currentProfile.age} лет
                </div>
              </div>

              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <h2 className="text-[26px] font-bold tracking-tight">{currentProfile.name}</h2>
                <div className="text-[12px] text-blue-300 font-medium mt-0.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {currentProfile.gym} • {currentProfile.time}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1.5 bg-white">
              <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
                <svg className="w-4 h-4 text-[#007AFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {currentProfile.experience}
              </div>
              <p className="text-[13px] text-zinc-700 leading-snug">
                "{currentProfile.goal}"
              </p>
            </div>
          </div>

          {/* Плашка с кнопками */}
          <div className="bg-white/90 backdrop-blur-xl border border-black/[0.06] rounded-[24px] px-6 py-3 shadow-[0_6px_24px_rgba(0,0,0,0.05)] flex items-center justify-between mx-auto w-full max-w-[370px]">
            
            <button onClick={() => alert('Возврат последней анкеты')} className="w-14 h-14 rounded-full bg-white border border-black/[0.06] shadow-[0_3px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-zinc-700 hover:scale-105 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>

            <button onClick={() => handleSwipe('dislike')} className="w-14 h-14 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#FF3B30] hover:scale-105 active:scale-95 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button onClick={() => handleSwipe('like')} className="w-14 h-14 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#34C759] hover:scale-105 active:scale-95 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <button onClick={() => alert('Буст анкеты!')} className="w-14 h-14 rounded-full bg-white border border-black/[0.06] shadow-[0_3px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#AF52DE] hover:scale-105 active:scale-95 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
