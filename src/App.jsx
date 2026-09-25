// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import HomeTab from './components/home/HomeTab';
import ReviewsTab from './components/reviews/ReviewsTab';
import GymBroTab from './components/gymbro/GymBroTab';
import NutritionTab from './components/nutrition/NutritionTab';
import ProfileTab from './components/profile/ProfileTab';
import SplashLoader from './components/onboarding/SplashLoader';
import LanguageSelector from './components/onboarding/LanguageSelector';
import AdminPanel from './components/admin/AdminPanel'; // Фаундерская CRM
import TrainerLogin from './components/trainer/TrainerLogin'; // Вход тренера
import TrainerOnboarding from './components/trainer/TrainerOnboarding'; // Регистрация тренера
import TrainerCRM from './components/trainer/TrainerCRM'; // CRM тренера
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';
import { translations } from './locales/translations';

export default function App() {
  // 1. СТРОГАЯ И ГЛАВНАЯ ПРОВЕРКА ТРЕНЕРСКОГО РОУТА (?trainer=true)
  const isTrainerRoute = new URLSearchParams(window.location.search).get('trainer') === 'true';
  const [trainerUsername, setTrainerUsername] = useState(() => {
    return localStorage.getItem('gymconnect_trainer_username') || '';
  });
  const [isTrainerRegistering, setIsTrainerRegistering] = useState(false);

  // Состояние для профиля атлета из базы Supabase
  const [userProfile, setUserProfile] = useState(null);

  // Проверка существования тренера в таблице 'trainer_profiles' при старте
  useEffect(() => {
    async function verifyTrainer() {
      if (trainerUsername) {
        const cleanU = trainerUsername.replace('@', '');
        const { data, error } = await supabase
          .from('trainer_profiles')
          .select('*')
          .or(`username.eq.@${cleanU},username.eq.${cleanU}`)
          .maybeSingle();

        if (error || !data) {
          localStorage.removeItem('gymconnect_trainer_registered');
          localStorage.removeItem('gymconnect_trainer_username');
          setTrainerUsername('');
        }
      }
    }
    verifyTrainer();
  }, [trainerUsername]);

  // Загрузка данных атлета из Supabase (например, по Telegram WebApp или сохраненному ID)
  useEffect(() => {
    async function fetchAthleteProfile() {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const savedTelegramId = tgUser?.id || localStorage.getItem('gymconnect_telegram_id');

      if (savedTelegramId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', savedTelegramId)
          .maybeSingle();

        if (data && !error) {
          setUserProfile(data);
          setIsRegistered(true);
          localStorage.setItem('gymconnect_profile_filled', 'true');
        }
      }
    }
    fetchAthleteProfile();
  }, []);

  if (isTrainerRoute) {
    if (!trainerUsername) {
      if (isTrainerRegistering) {
        return (
          <TrainerOnboarding 
            onComplete={(username) => {
              localStorage.setItem('gymconnect_trainer_registered', 'true');
              localStorage.setItem('gymconnect_trainer_username', username);
              setTrainerUsername(username);
              setIsTrainerRegistering(false);
            }} 
          />
        );
      } else {
        return (
          <TrainerLogin 
            onLoginSuccess={(username) => {
              localStorage.setItem('gymconnect_trainer_registered', 'true');
              localStorage.setItem('gymconnect_trainer_username', username);
              setTrainerUsername(username);
            }}
            onSwitchToRegister={() => setIsTrainerRegistering(true)}
          />
        );
      }
    } else {
      return (
        <TrainerCRM 
          trainerUsername={trainerUsername}
          onLogout={() => {
            localStorage.removeItem('gymconnect_trainer_registered');
            localStorage.removeItem('gymconnect_trainer_username');
            setTrainerUsername('');
            setIsTrainerRegistering(false);
          }}
        />
      );
    }
  }

  // 2. СТРОГАЯ ПРОВЕРКА АДМИН-РЕЖИМА ФАУНДЕРА (?admin=true)
  const [isAdminRoute] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      localStorage.setItem('gymconnect_admin_mode', 'true');
      return true;
    }
    return localStorage.getItem('gymconnect_admin_mode') === 'true';
  });

  if (isAdminRoute) {
    return (
      <AdminPanel 
        onBack={() => {
          localStorage.removeItem('gymconnect_admin_mode');
          window.history.pushState({}, document.title, window.location.pathname);
          window.location.reload();
        }} 
      />
    );
  }

  // Состояние заставки для обычного приложения
  const [isLoading, setIsLoading] = useState(true);

  // Выбранный язык: проверяем localStorage, чтобы не запрашивать повторно
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymconnect_language') || null;
  });

  // Получаем словарь текстов для выбранного языка
  const t = translations[language] || translations.kk;

  // Проверяем, заполнил ли пользователь профиль (анкету)
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  // Активная вкладка: если не зарегистрирован, открываем профиль/анкету, иначе главную
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true' ? 'home' : 'profile';
  });

  // Обработка окончания показа заставки
  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  // Сохранение выбранного языка в localStorage
  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('gymconnect_language', lang);
  };

  // Функция успешного завершения онбординга (вызывается из ProfileTab)
  const handleProfileComplete = (profileData) => {
    setIsRegistered(true);
    setUserProfile(profileData);
    localStorage.setItem('gymconnect_profile_filled', 'true');
    setActiveTab('home');
  };

  // 3. Если заставка еще активна
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // 4. Если заставка завершилась, но язык не выбран — показываем выбор языка (только один раз)
  if (!language) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // 5. Основной интерфейс приложения (Telegram Mini App)
  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center ${appleTheme.styles.fontFamily}`}>
      
      {/* ЖЕСТКИЙ МОБИЛЬНЫЙ КОНТЕЙНЕР */}
      <div className={`w-full max-w-md min-h-screen bg-[${appleTheme.colors.bg}] relative pb-28 shadow-2xl flex flex-col justify-between`}>
        
        {/* Рендер активной вкладки */}
        <div className="w-full flex-1 pb-24">
          {activeTab === 'home' && <HomeTab userProfile={userProfile} />}
          {activeTab === 'gymbro' && <GymBroTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'profile' && (
            <ProfileTab 
              userProfile={userProfile}
              onComplete={handleProfileComplete} 
              isRegistration={!isRegistered} 
              currentLang={language} 
            />
          )}
        </div>

        {/* НИЖНИЙ ТАБ-БАР ИЛИ ПОДСКАЗКА РЕГИСТРАЦИИ */}
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
                <span className="text-[10px]">{t.nav.home}</span>
              </button>

              <button
                onClick={() => setActiveTab('gymbro')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'gymbro' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">{t.nav.gymbro}</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'reviews' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MessageSquare className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">{t.nav.reviews}</span>
              </button>

              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'nutrition' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Utensils className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">{t.nav.nutrition}</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  activeTab === 'profile' ? 'text-blue-600 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mb-1 stroke-[1.75]" />
                <span className="text-[10px]">{t.nav.profile}</span>
              </button>

            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-3 text-xs font-medium shadow-lg">
            {language === 'kk' ? 'GymConnect қолжетімділігі үшін профиль сауалнамасын толтырыңыз' : 'Заполните анкету профиля для доступа к GymConnect'}
          </div>
        )}

      </div>
    </div>
  );
}
