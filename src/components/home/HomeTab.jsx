import React from 'react';
import HomeHeader from './HomeHeader';
import DailyQuote from './DailyQuote';
import WorkoutStreak from './WorkoutStreak';
import TodayPlan from './TodayPlan';
import ActionGrid from './ActionGrid';
import HomeChallenges from './HomeChallenges';
import HomeArticles from './HomeArticles';

export default function HomeTab() {
  return (
    <div className="p-4 max-w-md mx-auto flex flex-col pb-6 animate-in fade-in duration-200">
      <HomeHeader 
        onOpenSub={() => alert('Открытие подписки PRO')} 
        onOpenNotif={() => alert('Уведомления пустые')} 
      />
      <DailyQuote />
      <WorkoutStreak />
      <TodayPlan />
      <ActionGrid />
      <HomeChallenges />
      <HomeArticles />
    </div>
  );
}
