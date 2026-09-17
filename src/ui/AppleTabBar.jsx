import React from 'react';
import { appleTheme } from './AppleTheme';

export default function AppleTabBar({ activeTab, setActiveTab }) {
  const tabs = [
    { 
      id: 'home', 
      label: 'Главная', 
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      id: 'gymbro', 
      label: 'GymBro', 
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) 
    },
    { 
      id: 'nutrition', 
      label: 'Питание', 
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ) 
    },
    { 
      id: 'profile', 
      label: 'Профиль', 
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#F9F9FB]/85 backdrop-blur-xl border-t border-[#3C3C43]/15 px-6 py-2.5 flex items-center justify-between z-50 max-w-md mx-auto ${appleTheme.styles.fontFamily}`}>
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
            <div className="mb-0.5">
              {tab.icon(isActive)}
            </div>
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-semibold text-[#007AFF]' : 'font-medium text-[#8E8E93]'}`}>
              {tab.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
