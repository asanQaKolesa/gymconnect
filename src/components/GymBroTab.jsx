import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ALMATY_GYMS } from '../data/almatyGyms';
import GymBroProfileForm from './gymbro/GymBroProfileForm';
import GymBroSwipeView from './gymbro/GymBroSwipeView';
import FriendsTab from './FriendsTab';

export const INVICTUS_CLUBS = ALMATY_GYMS;

export default function GymBroTab({ session, telegramUser, user }) {
  const [activeSubTab, setActiveSubTab] = useState('swipe');
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentUserId, setCurrentUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterGym, setFilterGym] = useState('Все');

  const resolveUserId = () => {
    const tg = telegramUser || user || window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tg?.id) return String(tg.id);
    if (session?.user?.id) return session.user.id;
    let localId = localStorage.getItem('gymconnect_device_user_id');
    if (!localId) {
      localId = 'usr_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('gymconnect_device_user_id', localId);
    }
    return localId;
  };

  useEffect(() => {
    const uid = resolveUserId();
    setCurrentUserId(uid);
    loadData(uid);
  }, [session, telegramUser, user]);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      // Загрузка анкеты GymBro
      const { data: myData } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (myData) {
        setUserProfile(myData);
      } else {
        // Подтягиваем данные из базовой таблицы profiles если есть
        const { data: baseProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();

        if (baseProf) {
          setUserProfile({
            full_name: baseProf.full_name || baseProf.username || 'Атлет',
            photo_url: baseProf.avatar_url || '',
            home_gym: ALMATY_GYMS[0],
            telegram_contact: baseProf.username || ''
          });
        }
      }

      // Загрузка анкет других пользователей для ленты
      const { data: allProfiles } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .neq('user_id', uid);

      if (allProfiles) setProfiles(allProfiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBro = (bro) => {
    if (bro.telegram_contact) {
      window.open(`https://t.me/${bro.telegram_contact.replace('@', '')}`, '_blank');
    }
    setCurrentIndex(prev => prev + 1);
  };

  const filteredProfiles = profiles.filter(p => {
    if (filterGym !== 'Все' && p.home_gym !== filterGym) return false;
    if (userProfile?.looking_for_gender === 'Парней' && p.gender !== 'Мужской') return false;
    if (userProfile?.looking_for_gender === 'Девушек' && p.gender !== 'Женский') return false;
    return true;
  });

  return (
    <div className="max-w-xl mx-auto p-4 pb-28 text-white">
      {/* Навигационный тумблер */}
      <div className="flex bg-[#111827] p-1 rounded-2xl border border-gray-800 mb-4">
        <button
          onClick={() => { setActiveSubTab('swipe'); setIsEditing(false); }}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'swipe' && !isEditing
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔥 Поиск
        </button>
        <button
          onClick={() => { setActiveSubTab('friends'); setIsEditing(false); }}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
            activeSubTab === 'friends' && !isEditing
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          👥 Мои бро
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition border ${
            isEditing
              ? 'bg-gray-800 text-white border-gray-600'
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          ⚙️ Анкета
        </button>
      </div>

      {/* Контент */}
      {isEditing ? (
        <GymBroProfileForm
          currentUserId={currentUserId}
          initialData={userProfile}
          onSaved={(savedData) => {
            setUserProfile(savedData);
            setIsEditing(false);
            loadData(currentUserId);
          }}
          onCancel={userProfile ? () => setIsEditing(false) : null}
        />
      ) : activeSubTab === 'friends' ? (
        /* ТВОЙ НАСТОЯЩИЙ ОРИГИНАЛЬНЫЙ КОМПОНЕНТ ДРУЗЕЙ */
        <FriendsTab session={session} telegramUser={telegramUser || user} user={telegramUser || user} />
      ) : (
        <GymBroSwipeView
          profiles={filteredProfiles}
          currentIndex={currentIndex}
          loading={loading}
          filterGym={filterGym}
          userHomeGym={userProfile?.home_gym || ALMATY_GYMS[0]}
          onFilterChange={(g) => { setFilterGym(g); setCurrentIndex(0); }}
          onSkip={() => setCurrentIndex(prev => prev + 1)}
          onConnect={handleConnectBro}
        />
      )}
    </div>
  );
}
