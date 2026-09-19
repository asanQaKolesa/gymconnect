import React, { useState } from 'react';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, Check, BookOpen, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] pb-28 ${appleTheme.styles.fontFamily}`}>
      {/* Изолированные вкладки (комнаты) */}
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

      {/* Твой родной старый таб-бар снизу */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 shadow-lg">
        {/* Главная */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Главная</span>
        </button>

        {/* GymBro */}
        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center justify-center w-14 py-1 ${activeTab === 'gymbro' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">GymBro</span>
        </button>

        {/* Отзывы (родная выступающая кнопка по центру) */}
        <div className="relative -top-5">
          <button
            onClick={() => setActiveTab('reviews')}
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg hover:bg-blue-500 transition-transform active:scale-95 border-4 border-white"
          >
            <Check className="w-6 h-6" />
          </button>
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-600">Отзывы</span>
        </div>

        {/* Питание */}
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center justify-center w-14 py-1 ${activeTab === 'nutrition' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Питание</span>
        </button>

        {/* Профиль */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-14 py-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">Профиль</span>
        </button>
      </div>
    </div>
  );
}
