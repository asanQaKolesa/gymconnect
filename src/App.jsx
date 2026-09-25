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
import { 
  Home, 
  Users, 
  MessageSquareText, 
  UtensilsCrossed, 
  User 
} from 'lucide-react';
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

  // 1. ТРЕНЕРСКИЙ РОУТ
  const [isTrainerMode, setIsTrainerMode] = useState(() => {
    return new URLSearchParams(window.location.search).get('trainer') === 'true';
  });
  
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

  // МГНОВЕННЫЙ ВОЗВРАТ В ПРОФИЛЬ БЕЗ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ И БЕЗ ЗАСТАВКИ
  const handleTrainerBackToProfile = () => {
    setIsTrainerMode(false);
    setIsTrainerRegistering(false);
    setActiveTab('profile');
    setIsLoading(false); // Заставка не включится
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('trainer');
      url.searchParams.set('tab', 'profile');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } catch (e) {
      console.warn(e);
    }
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

  // Вкладки нижнего бара
  const navigationTabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'gymbro', label: t.nav.gymbro, icon: Users },
    { id: 'reviews', label: t.nav.reviews, icon: MessageSquareText },
    { id: 'nutrition', label: t.nav.nutrition, icon: UtensilsCrossed },
    { id: 'profile', label: t.nav.profile, icon: User }
  ];

  // ЭКРАН 4: Основное приложение
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
              onOpenTrainer={() => setIsTrainerMode(true)}
            />
          )}
        </div>

        {/* Apple Floating Glass Dock Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] select-none">
          <div className="w-full max-w-md mx-auto px-2.5 py-1.5 flex justify-between items-center">
            
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 active:scale-95 ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {/* Светящаяся неоновая капсула вокруг активного таба */}
                  {isActive && (
                    <span className="absolute inset-x-1 inset-y-0.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl shadow-[0_0_16px_rgba(37,99,235,0.25)] animate-in fade-in zoom-in-95 duration-200" />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <Icon 
                      className={`w-[21px] h-[21px] transition-all duration-300 ${
                        isActive 
                          ? 'stroke-[2.2] scale-110 drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)] text-blue-600' 
                          : 'stroke-[1.65] text-slate-400'
                      }`} 
                    />

                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_#2563eb] mt-0.5 animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>

                  <span 
                    className={`relative z-10 text-[9.5px] tracking-tight mt-0.5 transition-all duration-300 ${
                      isActive 
                        ? 'text-blue-600 font-extrabold' 
                        : 'text-slate-400 font-semibold'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
