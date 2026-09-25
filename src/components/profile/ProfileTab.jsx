import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import AthleteCard from './AthleteCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';
import EditProfilePage from './EditProfilePage';
import LegalDocsPage from './LegalDocsPage';

export default function ProfileTab({ user: initialUser, onLogout, onDeleteAccount }) {
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

  // 1. Полноэкранный режим редактирования анкеты со всеми полями
  if (isEditOpen) {
    return (
      <EditProfilePage 
        user={user} 
        onBack={() => setIsEditOpen(false)} 
        onSaveSuccess={handleSaveSuccess} 
      />
    );
  }

  // 2. Полноэкранный режим юридической информации (7 актов)
  if (isDocsOpen) {
    return (
      <LegalDocsPage 
        onBack={() => setIsDocsOpen(false)} 
      />
    );
  }

  // 3. Основной вид экрана личного профиля
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-2.5 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3">
        {/* Шапка */}
        <ProfileHeader />

        {/* Карточка атлета */}
        <AthleteCard 
          user={user} 
          onOpenEdit={() => setIsEditOpen(true)} 
        />

        {/* Меню и партнерство */}
        <ProfileMenu />

        {/* Документация и поддержка */}
        <ProfileDocs 
          onOpenDocs={() => setIsDocsOpen(true)} 
        />

        {/* Зона опасности */}
        <ProfileDangerZone 
          onLogout={onLogout} 
          onDeleteAccount={onDeleteAccount} 
        />
      </div>
    </div>
  );
}
