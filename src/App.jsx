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
  MessageCircle, 
  Utensils, 
  User 
} from 'lucide-react';
import { translations } from './locales/translations';

export default function App() {
  // ================= 1. ВСЕ ХУКИ USESTATE (СТРОГО ДО УСЛОВНЫХ RETURN) =================
  const [isTrainerMode, setIsTrainerMode] = useState(() => {
    return new URLSearchParams(window.location.search).get('trainer') === 'true';
  });

  const [trainerUsername, setTrainerUsername] = useState(() => {
    return localStorage.getItem('gymconnect_trainer_username') || '';
  });

  const [isTrainerRegistering, setIsTrainerRegistering] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(() => {
    return localStorage.getItem('gymconnect_legal_accepted') === 'true';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymconnect_language') || null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) return params.get('tab');
    return 'profile';
  });

  const [isAdminRoute] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      localStorage.setItem('gymconnect_admin_mode', 'true');
      return true;
    }
    return localStorage.getItem('gymconnect_admin_mode') === 'true';
  });

  const [isLoading, setIsLoading] = useState(true);

  const t = translations[language] || translations.kk;

  // ================= 2. ВСЕ ХУКИ USEEFFECT =================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

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

  // ================= 3. ОБРАБОТЧИКИ НАВИГАЦИИ =================
  const handleTrainerBackToProfile = () => {
    setIsTrainerMode(false);
    setIsTrainerRegistering(false);
    setIsLoading(false);
    setActiveTab('profile');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('trainer');
      url.searchParams.set('tab', 'profile');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    } catch (e) {
      console.warn(e);
    }
  };

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

  // ================= 4. УСЛОВНЫЕ РЕНДЕРЫ (ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ) =================

  // 4.1. ТРЕНЕРСКИЙ РЕЖИМ
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

  // 4.2. АДМИН-ПАНЕЛЬ (?admin=true)
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

  // 4.3. ЗАСТАВКА (Splash)
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // 4.4. ВЫБОР ЯЗЫКА
  if (!language && !isRegistered) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // 4.5. РЕГИСТРАЦИЯ АТЛЕТА
  if (!isRegistered) {
    return (
      <RegisterProfilePage 
        currentLang={language || 'ru'} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  // 4.6. ОБЯЗАТЕЛЬНЫЙ ЮРИДИЧЕСКИЙ БАРЬЕР
  if (!hasAcceptedLegal) {
    return (
      <LegalDocsPage 
        isMandatory={true}
        onConsentConfirmed={handleLegalAccepted} 
      />
    );
  }

  // Таб-бар
  const navigationTabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'gymbro', label: t.nav.gymbro, icon: Users },
    { id: 'reviews', label: t.nav.reviews, icon: MessageCircle },
    { id: 'nutrition', label: t.nav.nutrition, icon: Utensils },
    { id: 'profile', label: t.nav.profile, icon: User }
  ];

  // 4.7. ОСНОВНОЕ ПРИЛОЖЕНИЕ
  return (
    <div className={`min-h-screen w-full bg-[#F2F2F7] overflow-x-hidden ${appleTheme.styles.fontFamily}`}>
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#F2F2F7] relative pb-28 flex flex-col justify-between">
        
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
              onOpenTrainer={() => setIsTrainerMode(true)}
              currentLang={language}
              onLanguageChange={handleSelectLanguage}
            />
          )}
        </div>

        {/* Нативный аккуратный таб-бар */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/70 shadow-sm select-none">
          <div className="w-full max-w-md mx-auto px-3 py-2 flex justify-between items-center">
            
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 active:scale-95"
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive 
                        ? 'text-blue-600 stroke-[2.2]' 
                        : 'text-slate-400 stroke-[1.7]'
                    }`} 
                  />

                  <span 
                    className={`text-[10px] tracking-tight mt-1 transition-colors duration-200 ${
                      isActive 
                        ? 'text-blue-600 font-bold' 
                        : 'text-slate-400 font-medium'
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
