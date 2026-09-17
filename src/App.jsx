import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import HomeTab from './components/HomeTab';
import GymBroTab from './components/GymBroTab';
import FriendsTab from './components/FriendsTab';
import NutritionTab from './components/NutritionTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    }

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

  const NAV_ITEMS = [
    { id: 'home', label: 'Главная', icon: '⚡' },
    { id: 'gymbro', label: 'GymBro', icon: '🤝' },
    { id: 'friends', label: 'Друзья', icon: '👥' },
    { id: 'nutrition', label: 'Питание', icon: '🥗' },
    { id: 'profile', label: 'Профиль', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans select-none">
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

      <main className="flex-1 w-full max-w-lg mx-auto overflow-y-auto">
        {activeTab === 'home' && (
          <HomeTab session={session} telegramUser={telegramUser} user={telegramUser} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'gymbro' && (
          <GymBroTab session={session} telegramUser={telegramUser} user={telegramUser} />
        )}
        {activeTab === 'friends' && (
          <FriendsTab session={session} telegramUser={telegramUser} user={telegramUser} />
        )}
        {activeTab === 'nutrition' && (
          <NutritionTab session={session} telegramUser={telegramUser} user={telegramUser} />
        )}
        {activeTab === 'profile' && (
          <ProfileTab session={session} telegramUser={telegramUser} user={telegramUser} />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-gray-800/80 py-2 px-3 z-40">
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
