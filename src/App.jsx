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
import RegisterProfilePage from './components/onboarding/RegisterProfilePage';
import AdminPanel from './components/admin/AdminPanel';
import TrainerLogin from './components/trainer/TrainerLogin';
import TrainerOnboarding from './components/trainer/TrainerOnboarding';
import TrainerCRM from './components/trainer/TrainerCRM';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';
import { translations } from './locales/translations';

export default function App() {
  // 1. ТРЕНЕРСКИЙ РОУТ (?trainer=true)
  const isTrainerRoute = new URLSearchParams(window.location.search).get('trainer') === 'true';
  const [trainerUsername, setTrainerUsername] = useState(() => {
    return localStorage.getItem('gymconnect_trainer_username') || '';
  });
  const [isTrainerRegistering, setIsTrainerRegistering] = useState(false);

  // Стейт профиля атлета
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Проверка тренера в БД
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

  // Загрузка существующего профиля атлета из Supabase при старте
  useEffect(() => {
    async function fetchAthleteProfile() {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const savedTelegramId = tgUser?.id ? String(tgUser.id) : localStorage.getItem('gymconnect_telegram_id');

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
          localStorage.setItem('gymconnect_user_profile', JSON.stringify(data));
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

  // 2. АДМИН-РЕЖИМ (?admin=true)
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

  // Состояние загрузочного сплэш-скрина
  const [isLoading, setIsLoading] = useState(true);

  // Выбранный язык (если сохранен в памяти — повторно не запрашивается)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymconnect_language') || null;
  });

  const t = translations[language] || translations.kk;

  // Флаг завершенности регистрации
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  // Активная вкладка нижнего таб-бара
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) return params.get('tab');
    return 'home';
  });

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('gymconnect_language', lang);
  };

  // Успешная первичная регистрация
  const handleRegistrationComplete = (newProfile) => {
    setIsRegistered(true);
    setUserProfile(newProfile);
    localStorage.setItem('gymconnect_profile_filled', 'true');
    setActiveTab('home');
  };

  // Выход из профиля
  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из своего профиля?')) {
      localStorage.removeItem('gymconnect_profile_filled');
      localStorage.removeItem('gymconnect_user_profile');
      setIsRegistered(false);
      setUserProfile(null);
      window.location.reload();
    }
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите безвозвратно удалить свой профиль?')) {
      if (userProfile?.id) {
        await supabase.from('profiles').delete().eq('id', userProfile.id);
      }
      localStorage.clear();
      window.location.reload();
    }
  };

  // ЭКРАН 1: Загрузочная анимация залов Алматы
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // ЭКРАН 2: Выбор языка (только один раз при первом входе)
  if (!language) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // ЭКРАН 3: Первичная регистрация (только для новых пользователей)
  if (!isRegistered) {
    return (
      <RegisterProfilePage 
        currentLang={language} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  // ЭКРАН 4: Основное приложение (для зарегистрированных пользователей)
  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center ${appleTheme.styles.fontFamily}`}>
      <div className="w-full max-w-md min-h-screen bg-[#F2F2F7] relative pb-28 shadow-2xl flex flex-col justify-between">
        
        {/* Контент активного экрана */}
        <div className="w-full flex-1 pb-20">
          {activeTab === 'home' && <HomeTab userProfile={userProfile} />}
          {activeTab === 'gymbro' && <GymBroTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'profile' && (
            <ProfileTab 
              user={userProfile}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </div>

        {/* Нижний Dock Bar (Таб-бар) */}
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

      </div>
    </div>
  );
}
