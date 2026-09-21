// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css';
import { Users, Dumbbell, Zap, ShieldCheck } from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [step, setStep] = useState(0);

    // Массив сменяющихся фич/иконок для демонстрации комьюнити
    const features = [
        { icon: <Dumbbell className="w-8 h-8 text-blue-400" />, title: "Найди своего партнера по залу", sub: "Сплит-тренировки стали ближе" },
        { icon: <Users className="w-8 h-8 text-indigo-400" />, title: "Тренируйся в сильном окружении", sub: "Комьюнити мотивированных атлетов" },
        { icon: <Zap className="w-8 h-8 text-emerald-400" />, title: "Прогрессируй быстрее", sub: "Обмен опытом и результатами" }
    ];

    useEffect(() => {
        // Переключение мини-слайдов внутри заставки каждые 1.3 секунды
        const interval = setInterval(() => {
            setStep((prev) => (prev < features.length - 1 ? prev + 1 : prev));
        }, 1300);

        // Общее время работы заставки — 4.5 секунды
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 600); // Время на плавное исчезновение
        }, 4500);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            {/* Фоновые градиентные эппловские свечения */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="splash-card">
                {/* Анимированный блок иконки */}
                <div className="icon-pulse-container">
                    <div className="icon-ring"></div>
                    <div className="icon-inner">
                        {features[step].icon}
                    </div>
                </div>

                {/* Название бренда */}
                <h1 className="splash-brand">GymConnect</h1>

                {/* Двуязычный слоган (Казахский -> Русский) */}
                <div className="slogans-container">
                    <p className="slogan-kk">Жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                {/* Смена подтекстов под шагом */}
                <div className="feature-dynamic-text">
                    <span className="fade-text" key={step}>
                        {features[step].title}
                    </span>
                </div>

                {/* Эппловский прогресс-бар загрузки */}
                <div className="splash-progress-track">
                    <div className="splash-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashLoader;
