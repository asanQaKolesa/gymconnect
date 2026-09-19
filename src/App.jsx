import React, { useState } from 'react';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] pb-24 ${appleTheme.styles.fontFamily}`}>
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

      {/* Ровный таб-бар в одну строку со столовыми приборами для питания */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2 flex justify-around items-center">
          {/* Главная */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
              activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Главная</span>
          </button>

          {/* GymBro */}
          <button
            onClick={() => setActiveTab('gymbro')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
              activeTab === 'gymbro' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-[10px]">GymBro</span>
          </button>

          {/* Отзывы (теперь в один ряд, иконка сообщения) */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
              activeTab === 'reviews' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Отзывы</span>
          </button>

          {/* Питание (иконка столовых приборов Utensils) */}
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
              activeTab === 'nutrition' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Utensils className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Питание</span>
          </button>

          {/* Профиль */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
}
