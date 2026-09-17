import React, { useState } from 'react';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import AppleTabBar from './ui/AppleTabBar';
import { appleTheme } from './ui/AppleTheme';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] pb-24 ${appleTheme.styles.fontFamily}`}>
      {/* Отображение активных вкладок */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'gymbro' && <GymBroTab />}
      
      {activeTab === 'nutrition' && (
        <div className="p-6 text-center text-zinc-500 pt-20">
          <h2 className="text-xl font-bold text-black mb-2">Питание & КБЖУ</h2>
          <p>Вкладка в разработке под Apple UI Kit...</p>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div className="p-6 text-center text-zinc-500 pt-20">
          <h2 className="text-xl font-bold text-black mb-2">Профиль</h2>
          <p>Вкладка в разработке под Apple UI Kit...</p>
        </div>
      )}

      {/* Наш новый фирменный стеклянный TabBar в стиле Apple */}
      <AppleTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
