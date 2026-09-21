// src/components/profile/ProfileTab.jsx
import React, { useState } from 'react';
import { translations } from '../../locales/translations';
import { User, Dumbbell, Target, AtSign, CheckCircle2 } from 'lucide-react';

// Импортируем твои компоненты для обычного режима профиля
import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';

export default function ProfileTab({ onComplete, isRegistration, currentLang = 'kk' }) {
  const t = translations[currentLang] || translations.kk;
  const p = t.profileOnboarding;

  // Данные профиля со считыванием из Telegram WebApp SDK или localStorage
  const [formData, setFormData] = useState(() => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const savedProfile = JSON.parse(localStorage.getItem('gymconnect_user_data') || '{}');

    return {
      name: savedProfile.name || (tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : ''),
      username: savedProfile.username || (tgUser?.username ? `@${tgUser.username}` : ''),
      gym: savedProfile.gym || '',
      goal: savedProfile.goal || 'mass'
    };
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Сохраняем в localStorage
    localStorage.setItem('gymconnect_user_data', JSON.stringify(formData));
    
    // Передаем сигнал в App.jsx об успешном завершении онбординга
    if (onComplete) onComplete();
  };

  // ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЕЩЕ НЕ ЗАРЕГИСТРИРОВАН — ПОКАЗЫВАЕМ ОБЯЗАТЕЛЬНУЮ АНКЕТУ
  if (isRegistration) {
    return (
      <div className="w-full min-h-screen p-4 pb-32 flex flex-col items-center justify-start animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mt-4">
          
          {/* Шапка онбординга */}
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              {p.badge}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{p.title}</h1>
            <p className="text-xs text-slate-500">{p.subtitle}</p>
          </div>

          {/* Форма анкеты */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Имя */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{p.nameLabel}</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={p.namePlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{p.usernameLabel}</label>
              <div className="relative flex items-center">
                <AtSign className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder={p.usernamePlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Основной зал */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{p.gymLabel}</label>
              <div className="relative flex items-center">
                <Dumbbell className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={formData.gym}
                  onChange={(e) => handleChange('gym', e.target.value)}
                  placeholder={p.gymPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Цель тренировок */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">{p.goalLabel}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mass', label: p.goalMass },
                  { id: 'cut', label: p.goalCut },
                  { id: 'strength', label: p.goalStrength },
                  { id: 'tone', label: p.goalTone }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleChange('goal', item.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      formData.goal === item.id 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка сохранения */}
            <button
              type="submit"
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{p.saveBtn}</span>
            </button>

          </form>
        </div>
      </div>
    );
  }

  // ЕСЛИ АНКЕТА УЖЕ ЗАПОЛНЕНА — ОТОБРАЖАЕМ СТАНДАРТНЫЙ ИНТЕРФЕЙС ПРОФИЛЯ
  return (
    <div className="p-4 max-w-md mx-auto flex flex-col pb-6 animate-in fade-in duration-200">
      <ProfileHeader />
      <ProfileCard />
      <ProfileMenu />
      <ProfileDocs />
      <ProfileDangerZone />
    </div>
  );
}
