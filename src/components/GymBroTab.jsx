import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ALMATY_GYMS } from '../data/almatyGyms';
import GymBroProfileForm from './gymbro/GymBroProfileForm';
import GymBroSwipeView from './gymbro/GymBroSwipeView';

export const INVICTUS_CLUBS = ALMATY_GYMS;

export default function GymBroTab({ session, telegramUser, user, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentUserId, setCurrentUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterGym, setFilterGym] = useState('Все');

  const resolveUserId = () => {
    const tg = telegramUser || user || currentUser || window?.Telegram?.WebApp?.initDataUnsafe?.user;
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
  }, [session, telegramUser, user, currentUser]);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      // 1. Загрузка своей анкеты
      const { data: myData } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (myData) {
        setUserProfile(myData);
      } else {
        // Подтягиваем из profiles CRM если еще нет анкеты в gymbro
        const { data: crmUser } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${uid},telegram_id.eq.${uid}`)
          .single();

        if (crmUser) {
          setUserProfile({
            full_name: crmUser.full_name || crmUser.username || 'Атлет',
            photo_url: crmUser.avatar_url || '',
            home_gym: ALMATY_GYMS[0],
            telegram_contact: crmUser.username || ''
          });
        }
      }

      // 2. Загрузка ВСЕХ пользователей из CRM базы (profiles), исключая себя
      let allUsers = [];

      // Сначала читаем анкеты GymBro
      const { data: gymbroData } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .neq('user_id', uid);

      if (gymbroData && gymbroData.length > 0) {
        allUsers = [...gymbroData];
      }

      // Догружаем людей из общей таблицы profiles CRM, если их нет в gymbro_profiles
      const { data: crmProfiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', uid)
        .neq('telegram_id', uid);

      if (crmProfiles && crmProfiles.length > 0) {
        crmProfiles.forEach(cp => {
          const cpId = String(cp.telegram_id || cp.id);
          if (cpId !== uid && !allUsers.some(u => String(u.user_id) === cpId)) {
            allUsers.push({
              user_id: cpId,
              full_name: cp.full_name || cp.username || 'Атлет CRM',
              age: cp.age || 24,
              gender: cp.gender || 'Мужской',
              experience_level: cp.experience_level || 'Средний (1-3 года)',
              goals: cp.goals || ['Набор массы', 'Поддержание формы'],
              preferred_days: ['Пн', 'Ср', 'Пт'],
              preferred_time: 'Вечер (18:00 - 21:00)',
              personality_type: 'Амбиверт',
              home_gym: cp.home_gym || ALMATY_GYMS[0],
              bio: cp.bio || 'Тренируюсь в зале, ищу напарника!',
              photo_url: cp.avatar_url || '',
              telegram_contact: cp.username || ''
            });
          }
        });
      }

      setProfiles(allUsers);
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
      {/* Верхняя панель GymBro */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            🔥 GymBro Tinder
          </h2>
          <p className="text-[11px] text-gray-400">Найдено атлетов: {filteredProfiles.length}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border ${
            isEditing
              ? 'bg-gray-800 text-white border-gray-600'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isEditing ? 'Смотреть анкеты' : '⚙️ Моя анкета'}
        </button>
      </div>

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
