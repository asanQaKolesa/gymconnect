import React from 'react';
import HomeHeader from './blocks/HomeHeader';
import DailyQuote from './blocks/DailyQuote';
import WorkoutStreak from './blocks/WorkoutStreak';
import TodayPlan from './blocks/TodayPlan';
import ActionGrid from './blocks/ActionGrid';

export default function HomeTab() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      <HomeHeader 
        onOpenSub={() => alert('Открытие подписки PRO')} 
        onOpenNotif={() => alert('Уведомления пустые')} 
      />
      <DailyQuote />
      <WorkoutStreak />
      <TodayPlan />
      <ActionGrid />
    </div>
  );
}
