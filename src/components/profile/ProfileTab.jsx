import React from 'react';
import AthleteStats from '../AthleteStats';
import AdminCRM from '../AdminCRM';

export default function ProfileTab({ user, onUpdateUser, onNavigateTab }) {
  return (
    <div className="space-y-4 select-none">
      {/* Если пользователь администратор — показываем панель управления */}
      {user?.is_admin && (
        <div className="mb-4">
          <AdminCRM />
        </div>
      )}

      {/* Статистика и данные профиля атлета */}
      <AthleteStats user={user} onUpdateUser={onUpdateUser} onNavigateTab={onNavigateTab} />
    </div>
  );
}
