// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState, useRef } from 'react';
import './SplashLoader.css';
import AlmatyMapBackground from './AlmatyMapBackground';
import { 
    Users, 
    Utensils, 
    MessageSquare, 
    Dumbbell, 
    MapPin, 
    Flame, 
    ChevronRight,
    Map
} from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [featureIndex, setFeatureIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const hasFinishedRef = useRef(false);

    const features = [
        { icon: <Users className="w-4 h-4 text-blue-600" />, kk: "Өз залыңнан GymBro тап", ru: "Найди напарника в своем зале" },
        { icon: <MapPin className="w-4 h-4 text-sky-600" />, kk: "Алматының 230+ залы бірыңғай базада", ru: "230+ клубов города на одной карте" },
        { icon: <Utensils className="w-4 h-4 text-emerald-600" />, kk: "КБЖУ есептеу және тамақтану рационы", ru: "Умный расчет КБЖУ и планы питания" },
        { icon: <Dumbbell className="w-4 h-4 text-orange-600" />, kk: "Кәсіби жаттықтырушылар базасы", ru: "Подбор квалифицированных тренеров" },
        { icon: <MessageSquare className="w-4 h-4 text-indigo-600" />, kk: "Клубтар жайлы шынайы спортшылар пікірі", ru: "Честные отзывы атлетов о фитнес-залах" },
        { icon: <Flame className="w-4 h-4 text-rose-600" />, kk: "Күн сайын мотивация мен тәртіп", ru: "Дисциплина и мотивация каждый день" }
    ];

    const handleSkip = () => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setIsVisible(false);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 300);
    };

    useEffect(() => {
        // Быстрая смена ключевых фич
        const featureInterval = setInterval(() => {
            setFeatureIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0));
        }, 900);

        // Комфортный прогресс (~3.2 секунды вместо утомительных 10 секунд)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                const increment = Math.floor(Math.random() * 4) + 3;
                return Math.min(prev + increment, 100);
            });
        }, 100);

        return () => {
            clearInterval(featureInterval);
            clearInterval(progressInterval);
        };
    }, [features.length]);

    // Завершение по достижении 100%
    useEffect(() => {
        if (progress >= 100 && !hasFinishedRef.current) {
            hasFinishedRef.current = true;
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => {
                    if (onFinish) onFinish();
                }, 350);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [progress, onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            
            {/* Интерактивная живая карта фитнес-клубов Алматы */}
            <AlmatyMapBackground />

            {/* Верхняя кнопка быстрого пропуска */}
            <div className="splash-top-bar">
                <button
                    type="button"
                    onClick={handleSkip}
                    className="splash-skip-btn active:scale-95"
                >
                    <span>Өткізу / Пропустить</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
            </div>

            {/* Контрастная Apple Glass карточка */}
            <div className="splash-card-contrast">
                
                {/* Исправленный бейдж: иконка и текст сцентрированы в одну монолитную капсулу */}
                <div className="splash-badge-pill">
                    <span className="badge-pill-dot"></span>
                    <span className="badge-pill-text">230+ зал • Алматы фитнес қауымдастығы</span>
                </div>

                {/* Название бренда */}
                <h1 className="splash-brand">GymConnect</h1>

                {/* Слоган */}
                <div className="slogans-container">
                    <p className="slogan-kk">Бұдан былай жалғыз жаттықпайсың</p>
                    <p className="slogan-ru">Больше не тренируйся один</p>
                </div>

                {/* Динамическая карточка преимуществ */}
                <div className="feature-box">
                    <div className="feature-icon-wrap">
                        {features[featureIndex].icon}
                    </div>
                    <div className="feature-text-wrap">
                        <p className="dyn-kk">{features[featureIndex].kk}</p>
                        <p className="dyn-ru">{features[featureIndex].ru}</p>
                    </div>
                </div>

                {/* Прогресс-бар с индикатором загрузки */}
                <div className="splash-progress-wrapper">
                    <div className="splash-progress-info">
                        <div className="progress-text-col">
                            <span className="prog-dot"></span>
                            <span className="prog-kk">Қосылуда / Подключение...</span>
                        </div>
                        <span className="splash-percent">{progress}%</span>
                    </div>

                    <div className="splash-progress-track">
                        <div 
                            className="splash-progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default SplashLoader;
