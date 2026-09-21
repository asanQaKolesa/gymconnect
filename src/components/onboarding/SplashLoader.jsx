// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css';
import AlmatyMapBackground from './AlmatyMapBackground';
import { MapPin, Users, Utensils, MessageSquare, Dumbbell, ShieldCheck, Zap } from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [featureIndex, setFeatureIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // 6 ключевых преимуществ экосистемы GymConnect (Казахский + Русский)
    const features = [
        { icon: <Users className="w-5 h-5 text-blue-400" />, kk: "Өз залыңнан серіктес тап", ru: "Найди сплит-партнера в своем зале" },
        { icon: <Utensils className="w-5 h-5 text-emerald-400" />, kk: "Тамақтану және КБЖУ жоспары", ru: "Умный расчет КБЖУ и рацион питания" },
        { icon: <MessageSquare className="w-5 h-5 text-indigo-400" />, kk: "Залдар туралы шынайы пікірлер", ru: "Честные отзывы о фитнес-клубах Алматы" },
        { icon: <Dumbbell className="w-5 h-5 text-orange-400" />, kk: "Кәсіби тренерді таңдаңыз", ru: "Подбор квалифицированных тренеров" },
        { icon: <MapPin className="w-5 h-5 text-sky-400" />, kk: "Алматының барлық залдары картада", ru: "Все фитнес-клубы города на одной карте" },
        { icon: <ShieldCheck className="w-5 h-5 text-teal-400" />, kk: "Біртұтас спорттық қауымдастық", ru: "Единое комьюнити мотивированных атлетов" }
    ];

    useEffect(() => {
        // Смена функций каждые 1.6 секунды (6 шагов за ~9.6 сек)
        const featureInterval = setInterval(() => {
            setFeatureIndex((prev) => (prev < features.length - 1 ? prev + 1 : prev));
        }, 1600);

        // Плавный рост прогресса до 100% за 10 секунд
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        // Общее время заставки — ровно 10 секунд
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
            {/* Фоновая карта Алматы в стиле 2ГИС */}
            <AlmatyMapBackground />

            {/* Контрастная стеклянная плашка поверх карты */}
            <div className="splash-card-lower">
                <div className="splash-badge">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <div className="badge-text-col">
                        <span>Алматы • 230+ объектов в базе или с нами</span>
                        <span className="badge-sub">Алматы • 230+ объект базада немесе бізбен бірге</span>
                    </div>
                </div>

                {/* Побуквенная анимация GymConnect */}
                <h1 className="splash-brand">
                    <span>G</span><span>y</span><span>m</span><span>C</span><span>o</span><span>n</span><span>n</span><span>e</span><span>c</span><span>t</span>
                </h1>

                {/* Слоганы на двух языках */}
                <div className="slogans-container">
                    <p className="slogan-kk">Жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                {/* Блок преимуществ */}
                <div className="feature-box" key={featureIndex}>
                    <div className="feature-icon-wrap">
                        {features[featureIndex].icon}
                    </div>
                    <div className="feature-text-wrap">
                        <p className="dyn-kk">{features[featureIndex].kk}</p>
                        <p className="dyn-ru">{features[featureIndex].ru}</p>
                    </div>
                </div>

                {/* Прогресс-бар загрузки экосистемы на двух языках */}
                <div className="splash-progress-wrapper">
                    <div className="splash-progress-info">
                        <div className="progress-text-col">
                            <span>Запуск экосистемы GymConnect...</span>
                            <span className="prog-sub">GymConnect экожүйесін іске қосу...</span>
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
