import React, { useState } from 'react';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import NutritionTab from './components/nutrition/NutritionTab';
import ProfileTab from './components/profile/ProfileTab';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center ${appleTheme.styles.fontFamily}`}>
      
      {/* Жесткий мобильный контейнер */}
      <div className={`w-full max-w-md min-h-screen bg-[${appleTheme.colors.bg}] relative pb-28 shadow-2xl`}>
        
        {/* Рендер активной вкладки */}
        <div className="w-full">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'gymbro' && <GymBroTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>

        {/* Нижний таб-бар */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-2 flex justify-around items-center">
            
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5 mb-1 stroke-[1.5]" />
              <span className="text-[10px]">Главная</span>
            </button>

            <button
              onClick={() => setActiveTab('gymbro')}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                activeTab === 'gymbro' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users className="w-5 h-5 mb-1 stroke-[1.5]" />
              <span className="text-[10px]">GymBro</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                activeTab === 'reviews' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-1 stroke-[1.5]" />
              <span className="text-[10px]">Отзывы</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                activeTab === 'nutrition' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Utensils className="w-5 h-5 mb-1 stroke-[1.5]" />
              <span className="text-[10px]">Питание</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
                activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-5 h-5 mb-1 stroke-[1.5]" />
              <span className="text-[10px]">Профиль</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
