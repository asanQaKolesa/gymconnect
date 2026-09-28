// src/components/profile/ProfileTab.jsx
import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfilePartnership from './ProfilePartnership';
import ProfileSupport from './ProfileSupport';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';
import EditProfilePage from './EditProfilePage';
import LegalDocsPage from './LegalDocsPage';
import AthleteCoachWorkoutsPage from './AthleteCoachWorkoutsPage';

export default function ProfileTab({ 
  user: initialUser, 
  onLogout, 
  onDeleteAccount, 
  onOpenTrainer,
  currentLang = 'ru',
  onLanguageChange
}) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ ДО УСЛОВНЫХ RETURN)
  const [user, setUser] = useState(initialUser || {});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isCoachWorkoutsOpen, setIsCoachWorkoutsOpen] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const handleSaveSuccess = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    setIsEditOpen(false);
  };

  const handleRefreshUserData = () => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // ПОЛНОЭКРАННЫЙ РЕЖИМ ТРЕНИРОВОК С ТРЕНЕРОМ (ПРОГРАММА, КАССА, СМЕНЫ)
  if (isCoachWorkoutsOpen) {
    return (
      <AthleteCoachWorkoutsPage 
        user={user}
        onBack={() => setIsCoachWorkoutsOpen(false)}
        onUpdate={handleRefreshUserData}
      />
    );
  }

  // ПОЛНОЭКРАННЫЙ РЕЖИМ РЕДАКТИРОВАНИЯ АНКЕТЫ АТЛЕТА
  if (isEditOpen) {
    return (
      <EditProfilePage 
        user={user} 
        onBack={() => setIsEditOpen(false)} 
        onSaveSuccess={handleSaveSuccess} 
      />
    );
  }

  // ПОЛНОЭКРАННЫЙ ПРОСМОТР ЮРИДИЧЕСКИХ ДОКУМЕНТОВ
  if (isDocsOpen) {
    return (
      <LegalDocsPage 
        onBack={() => setIsDocsOpen(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-2.5 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3">
        
        {/* 1. Шапка: Личный кабинет */}
        <ProfileHeader />

        {/* 2. Карточка атлета */}
        <ProfileCard 
          user={user} 
          onOpenEdit={() => setIsEditOpen(true)} 
        />

        {/* 3. Основное меню (со сменой языка, абонементом, PRO, статистикой и тренировками от тренера) */}
        <ProfileMenu 
          user={user} 
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onOpenCoachWorkouts={() => setIsCoachWorkoutsOpen(true)}
        />

        {/* 4. Сотрудничество (B2B программа: CoachOS CRM, залы, магазины, специалисты) */}
        <ProfilePartnership 
          onOpenTrainer={onOpenTrainer} 
        />

        {/* 5. Служба поддержки и контакты */}
        <ProfileSupport />

        {/* 6. Юридическая документация */}
        <ProfileDocs 
          onOpenDocs={() => setIsDocsOpen(true)} 
        />

        {/* 7. Опасная зона */}
        <ProfileDangerZone 
          onLogout={onLogout} 
          onDeleteAccount={onDeleteAccount} 
        />

      </div>
    </div>
  );
}
