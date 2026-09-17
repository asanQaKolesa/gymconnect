import React, { useState, useEffect } from 'react';
import HomeTab from './components/home/HomeTab';
import GymBroTab from './components/GymBroTab';
import NutritionTab from './components/nutrition/NutritionTab';
import ProfileTab from './components/profile/ProfileTab';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Проверяем, открыта ли секретная админ-панель (по ссылке с #admin)
  useEffect(() => {
    const checkRoute = () => {
      if (window.location.hash === '#admin') {
        setIsAdminRoute(true);
      } else {
        setIsAdminRoute(false);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  // Если в ссылке есть #admin — показываем полноценную CRM-панель
  if (isAdminRoute) {
    return (
      <div>
        {/* Кнопка выхода обратно в обычное приложение */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex justify-between items-center text-xs">
          <span className="text-emerald-400 font-mono font-bold">🔒 Режим администратора CRM</span>
          <button 
            onClick={() => { window.location.hash = ''; setIsAdminRoute(false); }}
            className="bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 rounded-lg transition-colors"
          >
            ← Вернуться в приложение
          </button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Основной контент в зависимости от вкладки */}
      <main className="max-w-md mx-auto">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'gymbro' && <GymBroTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Нижняя навигационная панель */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around p-3 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}
        >
          <span>🏠</span>
          <span>Главная</span>
        </button>
        <button 
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center text-xs ${activeTab === 'gymbro' ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}
        >
          <span>🤝</span>
          <span>GymBro</span>
        </button>
        <button 
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center text-xs ${activeTab === 'nutrition' ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}
        >
          <span>🥗</span>
          <span>Питание</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center text-xs ${activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}
        >
          <span>👤</span>
          <span>Профиль</span>
        </button>
      </nav>
    </div>
  );
}
