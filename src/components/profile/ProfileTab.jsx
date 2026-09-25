// src/components/profile/ProfileTab.jsx
import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';
import EditProfilePage from './EditProfilePage';

export default function ProfileTab({ user: initialUser, onLogout, onDeleteAccount }) {
  const [user, setUser] = useState(initialUser || {});
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  // Основной экран личного кабинета
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 pt-2.5 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3">
        <ProfileHeader />

        <ProfileCard 
          user={user} 
          onOpenEdit={() => setIsEditOpen(true)} 
        />

        <ProfileMenu />

        <ProfileDocs />

        <ProfileDangerZone 
          onLogout={onLogout} 
          onDeleteAccount={onDeleteAccount} 
        />
      </div>
    </div>
  );
}
