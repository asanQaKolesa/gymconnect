import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import GymBroTab from './components/GymBroTab';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ровно 4 чистые вкладки в нижнем баре
  const NAV_ITEMS = [
    { id: 'home', label: 'Главная', icon: '⚡' },
    { id: 'gymbro', label: 'GymBro', icon: '🤝' },
    { id: 'nutrition', label: 'Питание', icon: '🥗' },
    { id: 'profile', label: 'Профиль', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans select-none">
      {/* Верхний статус-бар приложения */}
      <header className="px-5 py-3.5 border-b border-gray-800/80 flex items-center justify-between bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-base shadow-lg shadow-emerald-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-white">GymConnect</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">Алматы • Community</span>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
          PRO
        </div>
      </header>

      {/* Основной контент экранов */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-y-auto">
        {activeTab === 'home' && (
          <div className="p-5 space-y-5">
            {/* Мотивационный блок */}
            <div className="bg-gradient-to-br from-[#131d31] to-[#0f172a] border border-gray-800 p-5 rounded-3xl relative overflow-hidden shadow-xl">
              <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">Фокус дня</div>
              <h2 className="text-lg font-black leading-snug">«Дисциплина бьёт мотивацию в 100% случаев»</h2>
              <p className="text-xs text-gray-400 mt-2">Каждый подход приближает тебя к лучшей форме.</p>
            </div>

            {/* Быстрые действия */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('gymbro')}
                className="p-4 rounded-2xl bg-[#131d31] border border-gray-800 hover:border-emerald-500/50 text-left transition space-y-1 group"
              >
                <span className="text-2xl block group-hover:scale-110 transition-transform">🤝</span>
                <div className="font-bold text-sm text-white">Найти напарника</div>
                <div className="text-[11px] text-gray-400">Tinder в твоем зале</div>
              </button>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="p-4 rounded-2xl bg-[#131d31] border border-gray-800 hover:border-emerald-500/50 text-left transition space-y-1 group"
              >
                <span className="text-2xl block group-hover:scale-110 transition-transform">🥗</span>
                <div className="font-bold text-sm text-white">Мой рацион</div>
                <div className="text-[11px] text-gray-400">КБЖУ и трекер воды</div>
              </button>
            </div>
          </div>
        )}

        {/* Раздел GymBro (Поиск + Друзья внутри) */}
        {activeTab === 'gymbro' && <GymBroTab session={session} />}

        {/* Раздел Питание */}
        {activeTab === 'nutrition' && (
          <div className="p-8 text-center space-y-2 text-gray-400">
            <div className="text-4xl">🥗</div>
            <h3 className="font-bold text-white text-base">Дневник питания</h3>
            <p className="text-xs">Трекер калорий и воды будет готов в следующем обновлении.</p>
          </div>
        )}

        {/* Раздел Профиль */}
        {activeTab === 'profile' && (
          <div className="p-8 text-center space-y-2 text-gray-400">
            <div className="text-4xl">👤</div>
            <h3 className="font-bold text-white text-base">Личный кабинет</h3>
            <p className="text-xs">Настройки аккаунта и статистика тренировок.</p>
          </div>
        )}
      </main>

      {/* Нижний бар навигации (4 вкладки) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-gray-800/80 py-2 px-4 z-40">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {NAV_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive ? 'text-emerald-400 scale-105' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
