import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isRegistered, setIsRegistered] = useState(() => localStorage.getItem('gymconnect_profile_filled') === 'true');
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(() => localStorage.getItem('gymconnect_legal_accepted') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('gymconnect_language') || null);

  const updateUserProfile = (newProfile) => {
    setUserProfile(newProfile);
    if (newProfile) {
      localStorage.setItem('gymconnect_user_profile', JSON.stringify(newProfile));
      localStorage.setItem('gymconnect_profile_filled', 'true');
      setIsRegistered(true);
    } else {
      localStorage.removeItem('gymconnect_user_profile');
      localStorage.removeItem('gymconnect_profile_filled');
      setIsRegistered(false);
    }
  };

  const setAppLanguage = (lang) => {
    setLanguage(lang);
    if (lang) {
      localStorage.setItem('gymconnect_language', lang);
    } else {
      localStorage.removeItem('gymconnect_language');
    }
  };

  const acceptLegal = () => {
    setHasAcceptedLegal(true);
    localStorage.setItem('gymconnect_legal_accepted', 'true');
  };

  const value = {
    userProfile,
    isRegistered,
    hasAcceptedLegal,
    language,
    updateUserProfile,
    setAppLanguage,
    acceptLegal
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
