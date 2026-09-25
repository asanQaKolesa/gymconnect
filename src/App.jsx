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
import LegalDocsPage from './components/profile/LegalDocsPage';
import AdminPanel from './components/admin/AdminPanel';
import TrainerLogin from './components/trainer/TrainerLogin';
import TrainerOnboarding from './components/trainer/TrainerOnboarding';
import TrainerCRM from './components/trainer/TrainerCRM';
import { appleTheme } from './ui/AppleTheme';
import { Home, Users, MessageSquare, Utensils, User } from 'lucide-react';
import { translations } from './locales/translations';

export default function App() {
  // Экстренный сброс сессии через URL (?reset=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

  // 1. ТРЕНЕРСКИЙ РОУТ (?trainer=true)
  const isTrainerRoute = new URLSearchParams(window.location.search).get('trainer') === 'true';
  const [isTrainerMode, setIsTrainerMode] = useState(isTrainerRoute);
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

  // Флаг завершенности регистрации
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  // Флаг принятия всех 7 документов
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(() => {
    return localStorage.getItem('gymconnect_legal_accepted') === 'true';
  });

  // Выбранный язык
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymconnect_language') || null;
  });

  const t = translations[language] || translations.kk;

  // Активная вкладка
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) return params.get('tab');
    return 'profile';
  });

  // Гарантированный возврат в профиль атлета
  const handleTrainerBackToProfile = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('trainer');
    url.searchParams.set('tab', 'profile');
    window.location.href = url.pathname + url.search;
  };

  // Проверка тренера в БД Supabase
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

  // Синхронизация профиля атлета с Supabase
  useEffect(() => {
    async function syncAthleteProfile() {
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
          if (data.legal_accepted) {
            setHasAcceptedLegal(true);
            localStorage.setItem('gymconnect_legal_accepted', 'true');
          }
          localStorage.setItem('gymconnect_profile_filled', 'true');
          localStorage.setItem('gymconnect_user_profile', JSON.stringify(data));
        } else if (error) {
          console.warn('Сетевая ошибка синхронизации Supabase:', error.message);
        } else if (!data && !localStorage.getItem('gymconnect_profile_filled')) {
          setUserProfile(null);
          setIsRegistered(false);
          setHasAcceptedLegal(false);
        }
      }
    }
    syncAthleteProfile();
  }, []);

  // Тренерский режим
  if (isTrainerMode) {
    if (!trainerUsername) {
      if (isTrainerRegistering) {
        return (
          <TrainerOnboarding 
            onBack={() => setIsTrainerRegistering(false)}
            onExitToProfile={handleTrainerBackToProfile}
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
            onBack={handleTrainerBackToProfile}
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
          onBack={handleTrainerBackToProfile}
          onLogout={() => {
            localStorage.removeItem('gymconnect_trainer_registered');
            localStorage.removeItem('gymconnect_trainer_username');
            setTrainerUsername('');
            setIsTrainerRegistering(false);
            handleTrainerBackToProfile();
          }}
        />
      );
    }
  }

  // Админ-панель (?admin=true)
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

  // Заставка (Splash)
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('gymconnect_language', lang);
  };

  const handleRegistrationComplete = (newProfile) => {
    setIsRegistered(true);
    setUserProfile(newProfile);
    localStorage.setItem('gymconnect_profile_filled', 'true');
    if (newProfile?.legal_accepted) {
      setHasAcceptedLegal(true);
      setActiveTab('profile');
    }
  };

  const handleLegalAccepted = () => {
    setHasAcceptedLegal(true);
    localStorage.setItem('gymconnect_legal_accepted', 'true');
    setActiveTab('profile');
  };

  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из своего профиля?')) {
      localStorage.clear();
      setIsRegistered(false);
      setUserProfile(null);
      setLanguage(null);
      setHasAcceptedLegal(false);
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите безвозвратно удалить свой профиль?')) {
      if (userProfile?.id) {
        await supabase.from('profiles').delete().eq('id', userProfile.id);
      }
      localStorage.clear();
      setIsRegistered(false);
      setUserProfile(null);
      setLanguage(null);
      setHasAcceptedLegal(false);
      window.location.reload();
    }
  };

  // ЭКРАН 1: Загрузочная анимация залов (10 секунд)
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // ЭКРАН 2: Выбор языка
  if (!language && !isRegistered) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // ЭКРАН 3: Регистрация
  if (!isRegistered) {
    return (
      <RegisterProfilePage 
        currentLang={language || 'ru'} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  // ЭКРАН 3.5: ОБЯЗАТЕЛЬНЫЙ ЮРИДИЧЕСКИЙ БАРЬЕР (7 актов)
  if (!hasAcceptedLegal) {
    return (
      <LegalDocsPage 
        isMandatory={true}
        onConsentConfirmed={handleLegalAccepted} 
      />
    );
  }

  // ЭКРАН 4: Основное приложение (Фон #F2F2F7 растянут на 100% без черных полос)
  return (
    <div className={`min-h-screen w-full bg-[#F2F2F7] overflow-x-hidden ${appleTheme.styles.fontFamily}`}>
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#F2F2F7] relative pb-28 flex flex-col justify-between">
        
        {/* Контент активного раздела */}
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

        {/* Нижний стеклянный Dock Bar на всю ширину */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-lg">
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
