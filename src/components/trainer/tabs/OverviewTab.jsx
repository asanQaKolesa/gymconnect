// src/components/trainer/tabs/OverviewTab.jsx
import React from 'react';
import KpiCards from '../overview-components/KpiCards';
import QuickActionsBanner from '../overview-components/QuickActionsBanner';
import TodayScheduleWidget from '../overview-components/TodayScheduleWidget';

export default function OverviewTab({ activeCount, pausedCount, leftCount, lowBalanceCount, totalEarnings, students, onSelectStudent, onOpenAddModal }) {
  return (
    <div className="space-y-4 text-xs">
      <KpiCards 
        activeCount={activeCount} 
        pausedCount={pausedCount} 
        leftCount={leftCount} 
        lowBalanceCount={lowBalanceCount} 
        totalEarnings={totalEarnings} 
      />

      <QuickActionsBanner 
        students={students} 
        onOpenAddModal={onOpenAddModal} 
      />

      <TodayScheduleWidget 
        students={students} 
        onSelectStudent={onSelectStudent} 
      />
    </div>
  );
}
