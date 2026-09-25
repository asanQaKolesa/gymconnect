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
        } else if (!data && !localStorage.getItem('gymconnect_p
