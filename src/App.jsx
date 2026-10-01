// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAppContext } from './AppContext';
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
import DesignSystemShowcase from './components/ui/DesignSystemShowcase';
import { appleTheme } from './ui/AppleTheme';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Utensils, 
  User 
} from 'lucide-react';
import { translations } from './locales/translations';
import { 
  pruneExpiredBotMessages, 
  sendStudentNotification,
  sendTelegramMessage,
  escapeHtml
} from './utils/telegramNotifications';

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
  const { userProfile, isRegistered, hasAcceptedLegal, language, updateUserProfile, acceptLegal, setAppLanguage } = useAppContext();

  // Активная вкладка
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

  const [isLoading, setIsLoading] = useState(true);

  const t = translations[language] || translations.kk;

  // ================= 2. ОБРАБОТКА DEEP LINK ПРИГЛАШЕНИЯ ОТ ТРЕНЕРА =================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.clear();
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
      return;
    }

    // Фоновая безопасная очистка сообщений бота
    try {
      if (typeof pruneExpiredBotMessages === 'function') {
        pruneExpiredBotMessages(24);
      }
    } catch (e) {}

    // Перехват параметра ?start=coach_username или tgWebAppStartParam=coach_username
    const tgWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    const rawStart = tgWebApp?.initDataUnsafe?.start_param || 
      params.get('tgWebAppStartParam') || 
      params.get('start');

    if (rawStart && rawStart.startsWith('coach_')) {
      const invitedCoach = rawStart.replace('coach_', '').replace(/[@\s]/g, '').trim().toLowerCase();
      if (invitedCoach) {
        localStorage.setItem('gymconnect_pending_coach', invitedCoach);
      }
    }
  }, []);

  // Тихая фоновая аутентификация атлета + автопривязка к тренеру
  useEffect(() => {
    async function authenticateAthleteWithTelegram() {
      const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
      let targetTelegramId = tgUser?.id ? String(tgUser.id) : localStorage.getItem('gymconnect_telegram_id');

      if (!targetTelegramId) return;

      try {
        localStorage.setItem('gymconnect_telegram_id', targetTelegramId);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', targetTelegramId)
          .maybeSingle();

        if (data && !error) {
          let updatedData = data;

          // Проверяем, перешел ли ученик по инвайт-ссылке тренера
          const pendingCoach = localStorage.getItem('gymconnect_pending_coach');
          if (pendingCoach && (!data.trainer_username || data.trainer_username.toLowerCase() !== pendingCoach)) {
            await supabase
              .from('profiles')
              .update({
                trainer_username: pendingCoach,
                trainer_telegram: pendingCoach
              })
              .eq('id', data.id);

            updatedData = {
              ...data,
              trainer_username: pendingCoach,
              trainer_telegram: pendingCoach
            };

            try {
              const { data: coachProfile } = await supabase
                .from('trainer_profiles')
                .select('telegram_id, username')
                .or(`username.ilike.${pendingCoach},username.ilike.@${pendingCoach}`)
                .maybeSingle();

              if (coachProfile && coachProfile.telegram_id) {
                const athleteName = `${data.first_name || 'Атлет'} ${data.last_name || ''}`.trim();
                const coachMsg = `🎉 <b>Новый ученик в вашей CoachOS!</b>\n\nАтлет <b>${escapeHtml(athleteName)}</b> (@${escapeHtml(data.username || 'нет ника')}) перешел по вашей ссылке-приглашению и подключился к вашему кабинету.\n\nЗайдите в CRM для назначения графика и программы.`;
                const replyMarkup = {
                  inline_keyboard: [[
                    { text: '📊 Открыть CoachOS CRM', web_app: { url: 'https://asanqakolesa.github.io/gymconnect/?trainer=true' } }
                  ]]
                };

                sendTelegramMessage(String(coachProfile.telegram_id), coachMsg, 'HTML', replyMarkup).catch(() => {});
              }
            } catch (err) {}

            localStorage.removeItem('gymconnect_pending_coach');
          }

          updateUserProfile(updatedData);


          if (updatedData.legal_accepted) {
            acceptLegal();

          }

          if (updatedData.language) {
            setAppLanguage(updatedData.language);

          }



        } else if (!data && !error) {

          updateUserProfile(null);



        }
      } catch (e) {
        console.warn('Фоновая аутентификация Telegram: работаем из кэша', e);
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
    setAppLanguage(lang);


    if (userProfile?.telegram_id) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('telegram_id', userProfile.telegram_id);
    }
  };

  const handleRegistrationComplete = (newProfile) => {

    updateUserProfile(newProfile);

    if (newProfile?.legal_accepted) {
      acceptLegal();
      setActiveTab('profile');
    }
  };

  const handleLegalAccepted = () => {
    acceptLegal();

    setActiveTab('profile');
  };

  const handleLogout = async () => {
    const { showConfirm } = await import('./utils/uiUtils');
    const agreed = await showConfirm('Вы действительно хотите выйти из своего профиля?');
    if (agreed) {
      localStorage.clear();

      updateUserProfile(null);
      setAppLanguage(null);

      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    const { showConfirm } = await import('./utils/uiUtils');
    const agreed = await showConfirm('Вы уверены, что хотите безвозвратно удалить свой профиль?');
    if (agreed) {
      if (userProfile?.id) {
        await supabase.from('profiles').delete().eq('id', userProfile.id);
      }
      localStorage.clear();

      updateUserProfile(null);
      setAppLanguage(null);

      window.location.reload();
    }
  };

  // ================= 4. ПОСЛЕДОВАТЕЛЬНОСТЬ ЭКРАНОВ =================

  // 4.0. ПРЯМОЙ ДОСТУП К ДИЗАЙН-СИСТЕМЕ (?uikit=true или ?tab=uikit)
  const isUIKitMode = new URLSearchParams(window.location.search).get('uikit') === 'true' || 
                      new URLSearchParams(window.location.search).get('tab') === 'uikit';

  if (isUIKitMode) {
    return (
      <DesignSystemShowcase 
        onBack={() => {
          window.location.href = window.location.pathname;
        }} 
      />
    );
  }

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

  // 4.3. ЭКРАН ЗАСТАВКИ
  if (isLoading) {
    return <SplashLoader onFinish={handleSplashFinish} />;
  }

  // 4.4. ВЫБОР ЯЗЫКА (для новых пользователей)
  if (!language && !isRegistered) {
    return <LanguageSelector currentLang="kk" onSelectLanguage={handleSelectLanguage} />;
  }

  // 4.5. АНКЕТА ПЕРВИЧНОЙ РЕГИСТРАЦИИ
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

  // 4.7. ОСНОВНОЕ ПРИЛОЖЕНИЕ
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
