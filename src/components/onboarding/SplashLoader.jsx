// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css';
import AlmatyMapBackground from './AlmatyMapBackground';
import { Users, Dumbbell, Zap, Flame, MapPin } from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [step, setStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const features = [
        { 
            icon: <Dumbbell className="w-7 h-7 text-blue-500" />, 
            titleKk: "Өз залыңнан серіктес тап", 
            titleRu: "Найди своего партнера по залу"
        },
        { 
            icon: <Users className="w-7 h-7 text-indigo-500" />, 
            titleKk: "Мықты ортада жаттық", 
            titleRu: "Тренируйся в сильном окружении"
        },
        { 
            icon: <Flame className="w-7 h-7 text-orange-500" />, 
            titleKk: "Бірге жаттығу — нәтижелірек", 
            titleRu: "Тренируйся эффективно вместе"
        },
        { 
            icon: <Zap className="w-7 h-7 text-emerald-500" />, 
            titleKk: "Жылдам дамы және өс", 
            titleRu: "Прогрессируй быстрее"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < features.length - 1 ? prev + 1 : prev));
        }, 1700);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 140);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 600);
        }, 7000);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            {/* Фоновая интерактивная карта Алматы с точками залов */}
            <AlmatyMapBackground />

            {/* Премиальная стеклянная карточка поверх карты */}
            <div className="splash-card">
                <div className="splash-badge">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>Алматы • Сеть залов города</span>
                </div>

                <div className="icon-pulse-container">
                    <div className="icon-ring"></div>
                    <div className="icon-inner">
                        {features[step].icon}
                    </div>
                </div>

                <h1 className="splash-brand">
                    <span>G</span><span>y</span><span>m</span><span>C</span><span>o</span><span>n</span><span>n</span><span>e</span><span>c</span><span>t</span>
                </h1>

                <div className="slogans-container">
                    <p className="slogan-kk">Жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                <div className="feature-dynamic-box" key={step}>
                    <p className="dyn-kk">{features[step].titleKk}</p>
                    <p className="dyn-ru">{features[step].titleRu}</p>
                </div>

                <div className="splash-progress-wrapper">
                    <div className="splash-progress-info">
                        <span>Загрузка комьюнити...</span>
                        <span className="splash-percent">{progress}%</span>
                    </div>
                    <div className="splash-progress-track">
                        <div className="splash-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplashLoader;
