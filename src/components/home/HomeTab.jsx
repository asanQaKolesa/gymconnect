import React from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function HomeTab() {
  const quickStats = [
    { label: 'Тренировки', value: '4 в нед.', icon: '⚡' },
    { label: 'Локация', value: 'Invictus Go', icon: '📍' },
    { label: 'Цель', value: 'Масса', icon: '🎯' },
  ];

  const calendarDays = [
    { day: 'Пн', date: '12', active: false },
    { day: 'Вт', date: '13', active: true },
    { day: 'Ср', date: '14', active: false },
    { day: 'Чт', date: '15', active: false },
    { day: 'Пт', date: '16', active: false },
  ];

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-4 space-y-5 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* iOS Шапка */}
      <div className="flex items-end justify-between pt-3 pb-1">
        <div>
          <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">Алматы • Весна 2026</span>
          <h1 className="text-[32px] font-bold tracking-tight text-[#000000] leading-none mt-1">Главная</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-[#E3E3E8]/80 backdrop-blur-md flex items-center justify-center text-[#000000] hover:bg-[#D1D1D6] transition-all">
            <span className="text-[14px] font-semibold">?</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#E3E3E8]/80 backdrop-blur-md flex items-center justify-center text-[#000000] hover:bg-[#D1D1D6] transition-all">
            <span className="text-[14px] font-semibold tracking-widest pb-1">•••</span>
          </button>
        </div>
      </div>

      {/* Карточка профиля */}
      <div className="space-y-2">
        <h2 className={appleTheme.styles.sectionTitle}>Активный профиль</h2>

        <div className={appleTheme.styles.cardLarge}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] bg-[#1C1C1E] text-white flex items-center justify-center text-lg shadow-sm">
                💪
              </div>
              <div>
                <h3 className="font-semibold text-[#000000] text-[16px] tracking-tight">Асанәли Ерікұлы</h3>
                <p className="text-[13px] text-[#8E8E93] font-normal">Digital Marketer & GymBro</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F2F2F7]">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-[#F2F2F7]/60 rounded-[14px] p-2.5 text-center">
                <div className="text-[10px] font-medium text-[#8E8E93] uppercase tracking-tight">{stat.label}</div>
                <div className="text-[12px] font-semibold text-[#000000] mt-0.5 tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Календарь тренировок */}
      <div className="space-y-2">
        <h2 className={appleTheme.styles.sectionTitle}>Календарь тренировок</h2>
        <div className={appleTheme.styles.card}>
          <div className="flex justify-between items-center">
            {calendarDays.map((item, idx) => (
              <div key={idx} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${item.active ? 'bg-[#007AFF] text-white shadow-md' : 'bg-[#F2F2F7]/50 text-[#3A3A3C]'}`}>
                <span className="text-[10px] font-medium uppercase">{item.day}</span>
                <span className="text-[14px] font-bold mt-1">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Блок инструментов */}
      <div className="space-y-2">
        <h2 className={appleTheme.styles.sectionTitle}>Инструменты</h2>
        <div className={`${appleTheme.styles.card} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-[#000000] text-[15px] tracking-tight">GymBro Matchmaking</h4>
              <p className="text-[13px] text-[#8E8E93] font-normal">Поиск напарников в Алматы</p>
            </div>
          </div>
          <span className="text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-3 py-1 rounded-full">Активно</span>
        </div>
      </div>

      {/* Кнопка действия */}
      <div className="pt-2">
        <button 
          onClick={() => alert('Функция в разработке!')}
          className={appleTheme.styles.buttonPrimary}
        >
          + Начать новую тренировку
        </button>
      </div>

    </div>
  );
}
