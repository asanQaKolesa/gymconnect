import React, { useState } from 'react';
import GymBroFriendsView from './gymbro/GymBroFriendsView';
import GymBroSwipeView from './gymbro/GymBroSwipeView';
import GymBroProfileForm from './gymbro/GymBroProfileForm';
import { ALMATY_GYMS } from '../data/almatyGyms';

export default function GymBroTab({
  myCard,
  user,
  gyms = [],
  cards = [],
  onSaveCard,
  onRefreshCards,
  onOpenPaywall,
  isSaving
}) {
  const [activeSubTab, setActiveSubTab] = useState('swipe'); // 'swipe' | 'friends'
  const [isEditing, setIsEditing] = useState(false);
  const [filterGym, setFilterGym] = useState('Все');
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTgId = String(user?.telegram_id || window?.Telegram?.WebApp?.initDataUnsafe?.user?.id || '');

  // Исключаем себя из ленты свайпов
  const otherCards = cards.filter(c => {
    const cardTgId = String(c.telegram_id || '');
    if (currentTgId && cardTgId && cardTgId === currentTgId) return false;
    if (user?.telegram_username && c.telegram_username && c.telegram_username.toLowerCase() === user.telegram_username.toLowerCase()) return false;
    return true;
  });

  const formattedProfiles = otherCards.map(c => ({
    user_id: c.telegram_id || c.id,
    full_name: c.name || 'Атлет',
    age: c.age || '',
    gender: c.gender || 'Мужской',
    home_gym: c.weekday_gym || c.weekend_gym || ALMATY_GYMS[0],
    preferred_time: c.time_slot || 'Вечер (18:00 - 21:00)',
    personality_type: c.personality_type || 'Амбиверт',
    experience_level: c.level || 'Средний (1-3 года)',
    bio: c.bio || '',
    goals: [c.split].filter(Boolean),
    photo_url: c.photo_url || '',
    telegram_contact: c.telegram_username || ''
  }));

  const filteredProfiles = formattedProfiles.filter(p => {
    if (filterGym !== 'Все' && p.home_gym !== filterGym) return false;
    return true;
  });

  const handleConnect = (bro) => {
    if (bro.telegram_contact) {
      window.open(`https://t.me/${bro.telegram_contact.replace('@', '')}`, '_blank');
    }
    setCurrentIndex(prev => Math.min(prev + 1, filteredProfiles.length));
  };

  return (
    <div className="space-y-4 select-none">
      {/* Верхний переключатель режимов GymBro */}
      <div className="flex bg-[#121622] p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => { setActiveSubTab('swipe'); setIsEditing(false); }}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeSubTab === 'swipe' && !isEditing
              ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔥 Поиск напарника
        </button>
        <button
          onClick={() => { setActiveSubTab('friends'); setIsEditing(false); }}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
            activeSubTab === 'friends' && !isEditing
              ? 'bg-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Мои друзья
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition border cursor-pointer ${
            isEditing
              ? 'bg-white/10 text-white border-white/20'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          ⚙️ Анкета
        </button>
      </div>

      {/* Контент в зависимости от выбранного режима */}
      {isEditing ? (
        <GymBroProfileForm
          currentUserId={currentTgId}
          initialData={{
            full_name: myCard?.name || user?.name || '',
            gender: myCard?.gender || user?.gender || 'Мужской',
            home_gym: myCard?.weekday_gym || ALMATY_GYMS[0],
            preferred_time: myCard?.time_slot || 'Вечер (18:00 - 21:00)',
            experience_level: myCard?.level || 'Средний (1-3 года)',
            bio: myCard?.bio || '',
            photo_url: myCard?.photo_url || user?.avatar_url || '',
            telegram_contact: myCard?.telegram_username || user?.telegram_username || ''
          }}
          onSaved={async (savedData) => {
            if (onSaveCard) {
              await onSaveCard({
                name: savedData.full_name,
                gender: savedData.gender,
                looking_for: savedData.looking_for_gender,
                city: 'Алматы',
                weekday_gym: savedData.home_gym,
                weekend_gym: savedData.home_gym,
                level: savedData.experience_level,
                split: savedData.goals?.[0] || 'Фулбоди',
                time_slot: savedData.preferred_time,
                bio: savedData.bio,
                photo_url: savedData.photo_url
              });
            }
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : activeSubTab === 'friends' ? (
        <GymBroFriendsView user={user} />
      ) : (
        <GymBroSwipeView
          profiles={filteredProfiles}
          currentIndex={currentIndex}
          loading={false}
          filterGym={filterGym}
          userHomeGym={myCard?.weekday_gym || ALMATY_GYMS[0]}
          onFilterChange={(g) => { setFilterGym(g); setCurrentIndex(0); }}
          onSkip={() => setCurrentIndex(prev => Math.min(prev + 1, filteredProfiles.length))}
          onPrev={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}
