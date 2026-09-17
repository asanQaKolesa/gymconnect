import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function GymBroTab() {
  // Мок-база анкет атлетов Алматы
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: "Алексей",
      age: 26,
      personality: "Экстраверт 🔥",
      gym: "Invictus Go (Навои)",
      experience: "Стаж 3 года",
      time: "Вечер (18:00 - 20:00)",
      goal: "Качаю массу, ищу напарника на базу (жим/присед/тяга). Без соплей, только хардкор.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      name: "Дильназ",
      age: 24,
      personality: "Амбиверт ⚡",
      gym: "Workout (Достык)",
      experience: "Стаж 1.5 года",
      time: "Утро (08:00 - 10:00)",
      goal: "Кроссфит, функциональный тренинг и работа на рельеф.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      name: "Санжар",
      age: 28,
      personality: "Интроверт 🎧",
      gym: "Fidelity (Самал)",
      experience: "Стаж 5 лет",
      time: "День (14:00)",
      goal: "Подготовка к соревнованиям по пауэрлифтингу. Нужен надежный страхующий.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState('swipe'); // 'swipe' | 'matches' | 'likes' | 'edit'

  // Обработка свайпов / кнопок
  const handleSwipe = (action) => {
    // action: 'dislike' | 'like' | 'superlike'
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Круг почета по анкетам
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-3 space-y-3 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* Шапка / 3 управляющие плашки */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button 
          onClick={() => setActiveSubTab('matches')}
          className={`py-2 px-3 rounded-[14px] text-[12px] font-bold tracking-tight transition-all border ${
            activeSubTab === 'matches' 
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm' 
              : 'bg-white text-zinc-800 border-black/[0.04]'
          }`}
        >
          👥 Мэтчи (3)
        </button>

        <button 
          onClick={() => setActiveSubTab('likes')}
          className={`py-2 px-3 rounded-[14px] text-[12px] font-bold tracking-tight transition-all border ${
            activeSubTab === 'likes' 
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm' 
              : 'bg-white text-zinc-800 border-black/[0.04]'
          }`}
        >
          ❤️ Лайки (5)
        </button>

        <button 
          onClick={() => setActiveSubTab('edit')}
          className={`py-2 px-3 rounded-[14px] text-[12px] font-bold tracking-tight transition-all border ${
            activeSubTab === 'edit' 
              ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm' 
              : 'bg-white text-zinc-800 border-black/[0.04]'
          }`}
        >
          ✏️ Моя анкета
        </button>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ В ВКЛАДКЕ СВАЙПОВ */}
      {activeSubTab === 'swipe' && currentProfile && (
        <div className="space-y-3">
          
          {/* КОМПАКТНАЯ КАРТОЧКА В СТИЛЕ ТИНДЕРА */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-black/[0.05] overflow-hidden relative flex flex-col">
            
            {/* Фото атлета */}
            <div className="relative w-full h-[320px] bg-zinc-900">
              <img 
                src={currentProfile.avatar} 
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              {/* Тип личности сверху */}
              <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                {currentProfile.personality}
              </div>

              {/* Имя и возраст внизу фото */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-[24px] font-bold tracking-tight">{currentProfile.name}</h2>
                  <span className="text-[18px] font-medium text-zinc-300">{currentProfile.age}</span>
                </div>
                <div className="text-[12px] text-blue-300 font-medium mt-0.5">
                  📍 {currentProfile.gym} • {currentProfile.time}
                </div>
              </div>
            </div>

            {/* Описание и стаж под фото */}
            <div className="p-4 space-y-2.5 bg-white">
              <div className="flex items-center gap-2 text-[12px] text-[#8E8E93] font-semibold uppercase tracking-wider">
                <span>💪 {currentProfile.experience}</span>
              </div>
              <p className="text-[13px] text-zinc-800 leading-snug">
                "{currentProfile.goal}"
              </p>
            </div>
          </div>

          {/* ПАНЕЛЬ КНОПОК УПРАВЛЕНИЯ (ТИДЕР-СТИЛЬ) */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {/* Возврат */}
            <button 
              onClick={() => alert('Возврат последней анкеты')}
              className="w-12 h-12 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center text-amber-500 hover:scale-105 active:scale-95 transition-all text-xl"
            >
              🔄
            </button>

            {/* Дизлайк */}
            <button 
              onClick={() => handleSwipe('dislike')}
              className="w-14 h-14 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center justify-center text-red-500 hover:scale-105 active:scale-95 transition-all text-2xl font-bold"
            >
              ✕
            </button>

            {/* Суперлайк */}
            <button 
              onClick={() => handleSwipe('superlike')}
              className="w-12 h-12 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center text-blue-500 hover:scale-105 active:scale-95 transition-all text-xl"
            >
              ⭐
            </button>

            {/* Лайк */}
            <button 
              onClick={() => handleSwipe('like')}
              className="w-16 h-16 rounded-full bg-[#34C759] shadow-[0_6px_20px_rgba(52,199,89,0.3)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all text-2xl font-bold"
            >
              ✓
            </button>

            {/* Буст */}
            <button 
              onClick={() => alert('Буст анкеты: поднимите свой профиль в топ Алматы на 30 минут!')}
              className="w-12 h-12 rounded-full bg-white border border-black/[0.06] shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-center text-purple-600 hover:scale-105 active:scale-95 transition-all text-xl"
            >
              ⚡
            </button>
          </div>

        </div>
      )}

      {/* РАЗДЕЛ: МЭТЧИ */}
      {activeSubTab === 'matches' && (
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-3">
          <h3 className="font-bold text-black text-[16px]">Ваши взаимные мэтчи (3)</h3>
          <p className="text-[13px] text-[#8E8E93]">Эти атлеты тоже хотят тренироваться с вами в одних залах Алматы. Напишите им в Telegram!</p>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-[14px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">А</div>
                <div>
                  <div className="font-bold text-sm">Алексей</div>
                  <div className="text-[11px] text-[#8E8E93]">Invictus Go • Взаимный лайк</div>
                </div>
              </div>
              <button onClick={() => alert('Открытие чата с Алексеем')} className="px-3 py-1.5 bg-[#007AFF] text-white rounded-lg text-xs font-semibold">Написать</button>
            </div>
          </div>
        </div>
      )}

      {/* РАЗДЕЛ: ЛАЙКИ */}
      {activeSubTab === 'likes' && (
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-3">
          <h3 className="font-bold text-black text-[16px]">Кто вас лайкнул (5)</h3>
          <p className="text-[13px] text-[#8E8E93]">Ответьте взаимностью, чтобы образовался мэтч и открылся чат для совместной тренировки.</p>
          <div className="p-4 bg-blue-50/50 rounded-[14px] text-center text-xs text-[#007AFF] font-medium">
            🔒 Оформите PRO-подписку GymConnect, чтобы видеть всех, кто вас лайкнул без ожидания!
          </div>
        </div>
      )}

      {/* РАЗДЕЛ: МОЯ АНКЕТА */}
      {activeSubTab === 'edit' && (
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-4">
          <h3 className="font-bold text-black text-[16px]">Редактировать анкету GymBro</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Ваш основной зал</label>
              <input type="text" defaultValue="Invictus Go (Навои)" className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] text-sm font-medium" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#8E8E93] uppercase">Цель и описание</label>
              <textarea defaultValue="Качаю массу, ищу напарника..." className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-[12px] text-sm font-medium h-20" />
            </div>
            <button onClick={() => alert('Анкета успешно сохранена!')} className={appleTheme.styles.buttonPrimary}>
              Сохранить изменения
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
