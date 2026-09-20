import React from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';

export default function ProfileTab() {
  return (
    <div className="p-4 max-w-md mx-auto flex flex-col pb-6 animate-in fade-in duration-200">
      <ProfileHeader />
      <ProfileCard />
      <ProfileMenu />
      <ProfileDocs />
      <ProfileDangerZone />
    </div>
  );
}
