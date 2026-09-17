import React from 'react';
import { appleTheme } from './AppleTheme';

export default function AppleTabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: '🏠' },
    { id: 'gymbro', label: 'GymBro', icon: '🤝' },
    { id: 'nutrition', label: 'Питание', icon: '🥗' },
    { id: 'profile', label: 'Профиль', icon: '👤' },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#F9F9FB]/85 backdrop-blur-xl border-t border-[#3C3C43]/15 px-6 py-2 flex items-center justify-between z-50 max-w-md mx-auto ${appleTheme.styles.fontFamily}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center cursor-pointer transition-all ${
              isActive ? 'text-[#007AFF]' : 'text-[#8E8E93] hover:text-[#000000]'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
