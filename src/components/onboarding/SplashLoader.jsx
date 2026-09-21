// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css';
import { Users, Dumbbell, Zap, Flame, Shield } from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [step, setStep] = useState(0);

    // Расширенный набор фич для 7-секундного показа (Казахский + Русский)
    const features = [
        { 
            icon: <Dumbbell className="w-8 h-8 text-blue-400" />, 
            titleKk: "Өз залыңнан серіктес тап", 
            titleRu: "Найди своего партнера по залу",
            sub: "Сплит-тренировки стали ближе" 
        },
        { 
            icon: <Users className="w-8 h-8 text-indigo-400" />, 
            titleKk: "Мықты ортада жаттық", 
            titleRu: "Тренируйся в сильном окружении",
            sub: "Комьюнити мотивированных атлетов" 
        },
        { 
            icon: <Flame className="w-8 h-8 text-orange-400" />, 
            titleKk: "Бірге жаттығу — нәтижелірек", 
            titleRu: "Тренируйся эффективно вместе",
            sub: "Мотивация и поддержка 24/7" 
        },
        { 
            icon: <Zap className="w-8 h-8 text-emerald-400" />, 
            titleKk: "Жылдам дамы және өс", 
            titleRu: "Прогрессируй быстрее",
            sub: "Обмен опытом и результатами" 
        }
    ];

    useEffect(() => {
        // Смена слайдов каждые 1.6 секунды (4 шага за ~6.5 секунд)
        const interval = setInterval(() => {
            setStep((prev) => (prev < features.length - 1 ? prev + 1 : prev));
        }, 1600);

        // Общее время работы заставки — ровно 7 секунд (7000 мс)
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 600); // Время на плавное исчезновение
        }, 7000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            {/* Премиальные фоновые градиенты Apple style */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="splash-card">
                {/* Анимированная иконка с мягким парящим эффектом */}
                <div className="icon-pulse-container">
                    <div className="icon-ring"></div>
                    <div className="icon-inner">
                        {features[step].icon}
                    </div>
                </div>

                {/* Название бренда с эффектом сборки букв */}
                <h1 className="splash-brand">
                    <span>G</span><span>y</span><span>m</span><span>C</span><span>o</span><span>n</span><span>n</span><span>e</span><span>c</span><span>t</span>
                </h1>

                {/* Главный слоган на двух языках */}
                <div className="slogans-container">
                    <p className="slogan-kk">Жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                {/* Динамический блок мотивации на двух языках */}
                <div className="feature-dynamic-box" key={step}>
                    <p className="dyn-kk">{features[step].titleKk}</p>
                    <p className="dyn-ru">{features[step].titleRu}</p>
                </div>

                {/* Прогресс-бар загрузки на 7 секунд */}
                <div className="splash-progress-track">
                    <div className="splash-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashLoader;
