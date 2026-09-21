// src/components/onboarding/LanguageSelector.jsx
import React from 'react';
import './LanguageSelector.css';
import { Globe, Check, ArrowRight } from 'lucide-react';

const LanguageSelector = ({ currentLang, onSelectLanguage }) => {
    return (
        <div className="language-overlay">
            <div className="language-card">
                {/* Иконка и заголовок */}
                <div className="lang-icon-wrap">
                    <Globe className="w-6 h-6 text-blue-600" />
                </div>
                
                <h2 className="lang-title">Тілді таңдаңыз / Выберите язык</h2>
                <p className="lang-subtitle">Интерфейс пен мәзір үшін тілді таңдаңыз</p>

                {/* Список языков (Казахский строго первый) */}
                <div className="lang-options-list">
                    {/* Казахский язык (Первый) */}
                    <button 
                        className={`lang-option-btn ${currentLang === 'kk' ? 'active' : ''}`}
                        onClick={() => onSelectLanguage('kk')}
                    >
                        <div className="lang-info">
                            <span className="lang-name">Қазақ тілі</span>
                            <span className="lang-desc">Қазақстан</span>
                        </div>
                        <div className={`lang-radio ${currentLang === 'kk' ? 'checked' : ''}`}>
                            {currentLang === 'kk' && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                    </button>

                    {/* Русский язык (Второй) */}
                    <button 
                        className={`lang-option-btn ${currentLang === 'ru' ? 'active' : ''}`}
                        onClick={() => onSelectLanguage('ru')}
                    >
                        <div className="lang-info">
                            <span className="lang-name">Русский</span>
                            <span className="lang-desc">Казахстан</span>
                        </div>
                        <div className={`lang-radio ${currentLang === 'ru' ? 'checked' : ''}`}>
                            {currentLang === 'ru' && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                    </button>
                </div>

                {/* Кнопка продолжения */}
                <button 
                    className="lang-continue-btn"
                    onClick={() => onSelectLanguage(currentLang || 'kk')}
                >
                    <span>Жалғастыру / Продолжить</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default LanguageSelector;
