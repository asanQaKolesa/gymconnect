import React, { useState, useEffect } from 'react';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import NutritionTab from './components/nutrition/NutritionTab';
import ProfileTab from './components/profile/ProfileTab';
import SplashLoader from './components/onboarding/SplashLoader';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';

export default function App() {
  // Состояние заставки (показываем при самом первом открытии)
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем, заполнил ли пользователь профиль (анкету)
  // Сохраняем статус в localStorage, чтобы при повторных входах не заставлять заполнять заново
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  // Активная вкладка: если не зарегистрирован, принудительно ставим 'profile', иначе 'home'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true' ? 'home' : 'profile';
  });

  // Обработка окончания показа заставки
  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  // Функция успешного завершения онбординга (вызывается из ProfileTab, когда юзер сохранил анкету)
  const handleProfileComplete = () => {
    setIsRegistered(true);
    localStorage.setItem('gymconnect_profile_filled', 'true');
    setActiveTab('home'); // Переводим на главную после заполнения
  };

  // Если заставка еще активна, показываем только её
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center ${appleTheme.styles.fontFamily}`}>
      
      {/* ЖЕСТКИЙ МОБИЛЬНЫЙ КОНТЕЙНЕР */}
      <div className={`w-full max-w-md min-h-screen bg-[${appleTheme.colors.bg}] relative pb-28 shadow-2xl flex flex-col justify-between`}>
        
        {/* Рендер активной вкладки */}
        <div className="w-full flex-1 pb-24">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'gymbro' && <GymBroTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'profile' && <ProfileTab onComplete={handleProfileComplete} isRegistration={!isRegistered} />}
        </div>

        {/* НИЖНИЙ ТАБ-БАР (Блокируем или скрываем переключения, если пользователь еще не прошел онбординг) */}
        {isRegistered ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-lg">
            <div className="w-full max-w-md mx-auto px-4 py-2 flex justify-around items-center">
              
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'home' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">Главная</span>
              </button>

              <button
                onClick={() => setActiveTab('gymbro')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'gymbro' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">GymBro</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'reviews' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">Отзывы</span>
              </button>

              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'nutrition' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Utensils className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">Питание</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'profile' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">Профиль</span>
              </button>

            </div>
          </div>
        ) : (
          /* Подсказка для нового пользователя внизу экрана */
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-3 text-xs font-medium shadow-lg">
            Заполните анкету профиля для доступа к GymConnect
          </div>
        )}

      </div>
    </div>
  );
}
