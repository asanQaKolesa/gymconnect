import React, { useState } from 'react';
import GymBroSwipeView from './gymbro/GymBroSwipeView';
import GymBroFriendsView from './gymbro/GymBroFriendsView';
import GymBroProfileForm from './gymbro/GymBroProfileForm';

export default function GymBroTab() {
  const [subTab, setSubTab] = useState('swipe');

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Подменю внутри GymBro */}
      <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 text-xs font-medium">
        <button
          onClick={() => setSubTab('swipe')}
          className={`flex-1 py-2 rounded-xl transition-all ${subTab === 'swipe' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          🔥 Поиск напарника
        </button>
        <button
          onClick={() => setSubTab('friends')}
          className={`flex-1 py-2 rounded-xl transition-all ${subTab === 'friends' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          👥 Мои друзья
        </button>
        <button
          onClick={() => setSubTab('profile')}
          className={`flex-1 py-2 rounded-xl transition-all ${subTab === 'profile' ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          ⚙️ Анкета
        </button>
      </div>

      {/* Отображение подраздела */}
      <div className="mt-4">
        {subTab === 'swipe' && <GymBroSwipeView />}
        {subTab === 'friends' && <GymBroFriendsView />}
        {subTab === 'profile' && <GymBroProfileForm />}
      </div>
    </div>
  );
}
