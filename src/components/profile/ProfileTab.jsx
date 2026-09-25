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

export default function ProfileTab({ user: initialUser, onLogout, onDeleteAccount, onOpenTrainer }) {
  const [user, setUser] = useState(initialUser || {});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const handleSaveSuccess = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    setIsEditOpen(false);
  };

  // Полноэкранный режим редактирования анкеты
  if (isEditOpen) {
    return (
      <EditProfilePage 
        user={user} 
        onBack={() => setIsEditOpen(false)} 
        onSaveSuccess={handleSaveSuccess} 
      />
    );
  }

  // Полноэкранный просмотр 7 юридических актов
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

        {/* 2. Карточка атлета (Аватар, Статус, Соцсети, GymBro, скрытые параметры) */}
        <ProfileCard 
          user={user} 
          onOpenEdit={() => setIsEditOpen(true)} 
        />

        {/* 3. Основное меню (Абонемент, PRO без Kaspi, Статистика посещений, Мои тренировки, Поделиться) */}
        <ProfileMenu 
          user={user} 
        />

        {/* 4. Сотрудничество и партнерство (Тренеры CRM, Залы, Магазины, Специалисты) */}
        <ProfilePartnership 
          onOpenTrainer={onOpenTrainer} 
        />

        {/* 5. Служба поддержки и контакты в соцсетях */}
        <ProfileSupport />

        {/* 6. Юридическая документация (Монохромная плашка на 7 актов) */}
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
