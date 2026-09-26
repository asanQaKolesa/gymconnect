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

  // Стейт профиля атлета
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Флаг регистрации: первично берется из кэша, но проверяется в фоне через Telegram ID
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('gymconnect_profile_filled') === 'true';
  });

  // Флаг принятия правовых актов
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(() => {
    return localStorage.getItem('gymconnect_legal_accepted') === 'true';
  });

  // Выбранный язык
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gymconnect_language') || null;
  });

  // Активная вкладка (по умолчанию Главная или Профиль)
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab')) return params.get('tab');
    return 'home';
  });

  const [isAdminRoute] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      localStorage.setItem('gymconnect_admin_mode', 'true');
      return true;
    }
    return localStorage.getItem('gymconnect_admin_mode') === 'true';
  });

  // Заставка запускается всегда при старте
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[language] || translations.kk;

  // ================= 2. БЕЗОПАСНАЯ ФОНОВАЯ АВТОРИЗАЦИЯ В TELEGRAM =================
  
  // Экстренный сброс сессии через URL (?reset=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, []);

  // Тихая аутентификация атлета по telegram_id во время заставки
  useEffect(() => {
    async function authenticateAthleteWithTelegram() {
      // Получаем аппаратный Telegram ID текущего пользователя
      const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
      let targetTelegramId = tgUser?.id ? String(tgUser.id) : localStorage.getItem('gymconnect_telegram_id');

      if (!targetTelegramId) return;

      try {
        localStorage.setItem('gymconnect_telegram_id', targetTelegramId);

        // Запрашиваем профиль из Supabase по уникальному Telegram ID
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', targetTelegramId)
          .maybeSingle();

        if (data && !error) {
          // АТЛЕТ НАЙДЕН: Полная авторизация без паролей и логинов
          setUserProfile(data);
          setIsRegistered(true);

          if (data.legal_accepted) {
            setHasAcceptedLegal(true);
            localStorage.setItem('gymconnect_legal_accepted', 'true');
          }

          if (data.language) {
            setLanguage(data.language);
            localStorage.setItem('gymconnect_language', data.language);
          }

          localStorage.setItem('gymconnect_profile_filled', 'true');
          localStorage.setItem('gymconnect_user_profile', JSON.stringify(data));
        } else if (!data && !error) {
          // НОВЫЙ АТЛЕТ: Профиля еще нет в базе, переводим на онбординг
          setIsRegistered(false);
          setUserProfile(null);
          setHasAcceptedLegal(false);
          localStorage.removeItem('gymconnect_profile_filled');
          localStorage.removeItem('gymconnect_user_profile');
        }
      } catch (e) {
        console.warn('Фоновая аутентификация Telegram: работаем из локального кэша', e);
      }
    }

    authenticateAthleteWithTelegram();
  }, []);

  // Проверка статуса тренера
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

  const handleSelectLanguage = async (lang) => {
    setLanguage(lang);
    localStorage.setItem('gymconnect_language', lang);

    // Если профиль уже существует, сохраняем выбор языка и в базу
    if (userProfile?.telegram_id) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('telegram_id', userProfile.telegram_id);
    }
  };

  // Успешная регистрация нового атлета
  const handleRegistrationComplete = (newProfile) => {
    setIsRegistered(true);
    setUserProfile(newProfile);
    localStorage.setItem('gymconnect_profile_filled', 'true');
    if (newProfile?.legal_accepted) {
      setHasAcceptedLegal(true);
      setActiveTab('profile');
    }
  };

  // Фиксация принятия правовых документов
  const handleLegalAccepted = () => {
    setHasAcceptedLegal(true);
    localStorage.setItem('gymconnect_legal_accepted', 'true');
    setActiveTab('profile');
  };

  // Выход из профиля
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

  // Удаление аккаунта
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

  // ================= 4. ПОСЛЕДОВАТЕЛЬНОСТЬ ЭКРАНОВ =================

  // 4.1. ТРЕНЕРСКИЙ РЕЖИМ (?trainer=true)
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

  // 4.2. ПАНЕЛЬ АДМИНИСТРАТОРА (?admin=true)
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

  // 4.3. ЭКРАН ЗАСТАВКИ (Пока идет анимация — в фоне завершается тихая авторизация)
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // 4.4. ВЫБОР ЯЗЫКА (Показывается ТОЛЬКО новым пользователям при первом входе)
  if (!language && !isRegistered) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // 4.5. АНКЕТА ПЕРВИЧНОЙ РЕГИСТРАЦИИ (ТОЛЬКО для новых атлетов)
  if (!isRegistered) {
    return (
      <RegisterProfilePage 
        currentLang={language || 'ru'} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  // 4.6. ОБЯЗАТЕЛЬНЫЙ ЮРИДИЧЕСКИЙ БАРЬЕР (7 документов при первом входе)
  if (!hasAcceptedLegal) {
    return (
      <LegalDocsPage 
        isMandatory={true}
        onConsentConfirmed={handleLegalAccepted} 
      />
    );
  }

  // 4.7. ОСНОВНОЕ ПРИЛОЖЕНИЕ (Для авторизованного атлета открывается мгновенно)
  const navigationTabs = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'gymbro', label: t.nav.gymbro, icon: Users },
    { id: 'reviews', label: t.nav.reviews, icon: MessageCircle },
    { id: 'nutrition', label: t.nav.nutrition, icon: Utensils },
    { id: 'profile', label: t.nav.profile, icon: User }
  ];

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
              currentLang={language}
              onLanguageChange={handleSelectLanguage}
            />
          )}
        </div>

        {/* Нижний таб-бар Apple */}
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
