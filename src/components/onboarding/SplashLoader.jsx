// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css';
import AlmatyMapBackground from './AlmatyMapBackground';
import { MapPin, Users, Utensils, MessageSquare, Dumbbell, Ticket, Shield, Flame, UsersRound } from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [featureIndex, setFeatureIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const features = [
        { icon: <Users className="w-5 h-5 text-blue-600" />, kk: "Өз залыңнан серіктес тап", ru: "Найди сплит-партнера в своем зале" },
        { icon: <Utensils className="w-5 h-5 text-emerald-600" />, kk: "Тамақтану және КБЖУ жоспары", ru: "Умный расчет КБЖУ и рацион питания" },
        { icon: <MessageSquare className="w-5 h-5 text-indigo-600" />, kk: "Залдар туралы шынайы пікірлер", ru: "Честные отзывы о фитнес-клубах Алматы" },
        { icon: <Dumbbell className="w-5 h-5 text-orange-600" />, kk: "Кәсіби тренерді таңдаңыз", ru: "Подбор квалифицированных тренеров" },
        { icon: <MapPin className="w-5 h-5 text-sky-600" />, kk: "Алматының барлық залдары картада", ru: "Все фитнес-клубы города на одной карте" },
        { icon: <Ticket className="w-5 h-5 text-teal-600" />, kk: "Кез келген залға абонемент сатып алу", ru: "Покупка абонемента в любой фитнес-зал" },
        { icon: <Shield className="w-5 h-5 text-violet-600" />, kk: "Тек тексерілген орталықтар", ru: "Только проверенные фитнес-центры" },
        { icon: <Flame className="w-5 h-5 text-rose-600" />, kk: "Мотивация және нәтиже 24/7", ru: "Мотивация и результаты каждый день" }
    ];

    useEffect(() => {
        const featureInterval = setInterval(() => {
            setFeatureIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0));
        }, 1300);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onFinish) onFinish();
            }, 600);
        }, 10000);

        return () => {
            clearInterval(featureInterval);
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            {/* Фоновая паттерн-карта с пинами залов */}
            <AlmatyMapBackground />

            {/* Контрастная белая плашка поверх карты */}
            <div className="splash-card-contrast">
                <div className="splash-badge">
                    <UsersRound className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="badge-text-col">
                        <span className="badge-kk">Алматыдағы 230+ залдың спорттық қауымдастығы</span>
                        <span className="badge-ru">Спортивное сообщество 230+ залов Алматы</span>
                    </div>
                </div>

                <h1 className="splash-brand">
                    <span>G</span><span>y</span><span>m</span><span>C</span><span>o</span><span>n</span><span>n</span><span>e</span><span>c</span><span>t</span>
                </h1>

                <div className="slogans-container">
                    <p className="slogan-kk">Бұдан былай жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                <div className="feature-box" key={featureIndex}>
                    <div className="feature-icon-wrap">
                        {features[featureIndex].icon}
                    </div>
                    <div className="feature-text-wrap">
                        <p className="dyn-kk">{features[featureIndex].kk}</p>
                        <p className="dyn-ru">{features[featureIndex].ru}</p>
                    </div>
                </div>

                <div className="splash-progress-wrapper">
                    <div className="splash-progress-info">
                        <div className="progress-text-col">
                            <span className="prog-kk">GymConnect экожүйесін іске қосу...</span>
                            <span className="prog-ru">Запуск экосистемы GymConnect...</span>
                        </div>
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
