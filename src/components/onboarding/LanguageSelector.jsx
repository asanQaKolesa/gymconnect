// src/components/onboarding/LanguageSelector.jsx
import React, { useState } from 'react';
import { Check, Globe, ArrowRight, Sparkles } from 'lucide-react';
import './LanguageSelector.css';

export default function LanguageSelector({ currentLang = 'kk', onSelectLanguage }) {
  const [selected, setSelected] = useState(currentLang || 'kk');

  const handleContinue = (e) => {
    e.preventDefault();
    if (onSelectLanguage) {
      onSelectLanguage(selected);
    }
  };

  return (
    <div className="language-overlay">
      <div className="language-card">
        
        {/* Иконка глобуса в стиле Apple */}
        <div className="lang-icon-wrap">
          <Globe className="w-6 h-6 text-blue-600 stroke-[2.2]" />
        </div>

        {/* Двуязычные заголовки */}
        <h1 className="lang-title">Тілді таңдаңыз</h1>
        <h2 className="lang-title-ru">Выберите язык</h2>
        <p className="lang-subtitle">
          GymConnect экожүйесінің негізгі тілін белгілеңіз • Выберите язык приложения
        </p>

        {/* Список опций (с флагом Казахстана 🇰🇿) */}
        <div className="lang-options-list">
          
          {/* Қазақша */}
          <div 
            onClick={() => setSelected('kk')}
            className={`lang-option-btn ${selected === 'kk' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl select-none">🇰🇿</span>
              <div className="lang-info">
                <span className="lang-name">Қазақша</span>
                <span className="lang-desc">Қазақ тілінде жалғастыру</span>
              </div>
            </div>

            <div className="lang-radio">
              {selected === 'kk' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
          </div>

          {/* Русский */}
          <div 
            onClick={() => setSelected('ru')}
            className={`lang-option-btn ${selected === 'ru' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl select-none">🇰🇿</span>
              <div className="lang-info">
                <span className="lang-name">Русский</span>
                <span className="lang-desc">Продолжить на русском языке</span>
              </div>
            </div>

            <div className="lang-radio">
              {selected === 'ru' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
          </div>

        </div>

        {/* Информационная плашка локализации */}
        <div className="lang-hint-banner">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            {selected === 'kk' 
              ? 'Алматы залдары мен GymBro серіктестері қазақ тілінде көрсетіледі.' 
              : 'Залы Алматы и база GymBro будут отображаться на русском языке.'}
          </span>
        </div>

        {/* Кнопка продолжения */}
        <button
          type="button"
          onClick={handleContinue}
          className="lang-continue-btn active:scale-98"
        >
          <span>{selected === 'kk' ? 'Жалғастыру және бастау' : 'Продолжить и начать'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
