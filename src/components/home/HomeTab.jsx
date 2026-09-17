import React from 'react';
import TelegramBanner from './blocks/TelegramBanner';
import DailyQuote from './blocks/DailyQuote';
import TrainersB2BGrid from './blocks/TrainersB2BGrid';
import GymFeedTab from '../GymFeedTab';

export default function HomeTab({
  currentUser,
  onOpenPaywall
}) {
  return (
    <div className="space-y-2.5 pb-4 select-none">
      {/* 1. Верхний микро-баннер канала */}
      <TelegramBanner />

      {/* 2. Цитата / фокус дня */}
      <DailyQuote />

      {/* 3. Плашки B2B тренеров */}
      <TrainersB2BGrid />

      {/* 4. Лента зала с пруфами */}
      <GymFeedTab
        user={currentUser}
        onOpenPaywall={onOpenPaywall}
      />
    </div>
  );
}
