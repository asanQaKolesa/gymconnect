import React from 'react';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'gymbro', label: 'GymBro', icon: Users },
    { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
    { id: 'nutrition', label: 'Питание', icon: Utensils },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-slate-800 px-4 py-2 flex justify-around items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
              isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
