// src/components/trainer/components/TrainerNav.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  FileText 
} from 'lucide-react';

export default function TrainerNav({ activeTab, setActiveTab }) {
  // Список рабочих вкладок CoachOS с лаконичными иконками
  const tabs = [
    { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { id: 'students', label: 'Ученики', icon: Users },
    { id: 'workouts', label: 'Программы', icon: Dumbbell },
    { id: 'schedule', label: 'Смены', icon: Calendar },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'finance', label: 'Касса', icon: DollarSign },
    { id: 'notes', label: 'Заметки', icon: FileText }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg select-none py-2 px-3">
      <div className="max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1.5 active:scale-95 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
