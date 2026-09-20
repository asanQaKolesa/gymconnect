import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';

export default function ProfileTab() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      <h1 className="text-xl font-bold text-slate-900 mb-4 px-1">Личный кабинет</h1>
      <ProfileHeader />
      <ProfileMenu />
      <ProfileDocs />
      <ProfileDangerZone />
    </div>
  );
}
