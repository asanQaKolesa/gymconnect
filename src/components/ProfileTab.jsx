import React from 'react';
import ProfileTabRoot from './profile/ProfileTab';

export default function ProfileTab({ user, onUpdateUser, onNavigateTab }) {
  return <ProfileTabRoot user={user} onUpdateUser={onUpdateUser} onNavigateTab={onNavigateTab} />;
}
