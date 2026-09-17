import React from 'react';
import AthleteStats from './AthleteStats';

export default function ProfileTab() {
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Профиль пользователя
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Управление личными данными, целями тренировок и настройками аккаунта.
        </p>
      </div>

      {/* Подключаем блок статистики атлета */}
      <AthleteStats />
    </div>
  );
}
