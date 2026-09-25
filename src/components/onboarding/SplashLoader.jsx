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
    Ticket, 
    Shield, 
    ChevronRight 
} from 'lucide-react';

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [featureIndex, setFeatureIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const hasFinishedRef = useRef(false);

    // Печатный текст для бренда и слоганов
    const [typedBrand, setTypedBrand] = useState('');
    const [typedSloganKk, setTypedSloganKk] = useState('');
    const [typedSloganRu, setTypedSloganRu] = useState('');

    const targetBrand = "GymConnect";
    const targetSloganKk = "Бұдан былай жалғыз жаттықпайсың";
    const targetSloganRu = "Больше не тренируйся один";

    // 8 преимуществ с лаконичными текстами, идеально помещающимися в одну строку
    const features = [
        { icon: <Users className="w-4 h-4 text-blue-600" />, kk: "Өз залыңнан GymBro тап", ru: "Найди напарника в своем зале" },
        { icon: <MapPin className="w-4 h-4 text-sky-600" />, kk: "Алматының 230+ залы бірыңғай базада", ru: "230+ фитнес-клубов на одной карте" },
        { icon: <Utensils className="w-4 h-4 text-emerald-600" />, kk: "КБЖУ есептеу және тамақтану жоспары", ru: "Умный расчет КБЖУ и рацион питания" },
        { icon: <Dumbbell className="w-4 h-4 text-orange-600" />, kk: "Кәсіби жаттықтырушылар базасы", ru: "Подбор квалифицированных тренеров" },
        { icon: <MessageSquare className="w-4 h-4 text-indigo-600" />, kk: "Залдар жайлы шынайы пікірлер", ru: "Честные отзывы атлетов о клубах" },
        { icon: <Ticket className="w-4 h-4 text-teal-600" />, kk: "Кез келген залға абонемент алу", ru: "Покупка абонемента в любой зал" },
        { icon: <Shield className="w-4 h-4 text-violet-600" />, kk: "Тек тексерілген фитнес орталықтар", ru: "Только проверенные фитнес-центры" },
        { icon: <Flame className="w-4 h-4 text-rose-600" />, kk: "Күн сайын тәртіп пен нәтиже", ru: "Дисциплина и мотивация каждый день" }
    ];

    const handleSkip = () => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;
        setIsVisible(false);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 300);
    };

    // 1. Анимация печатного текста (Typewriter)
    useEffect(() => {
        let bIdx = 0;
        let sKkIdx = 0;
        let sRuIdx = 0;

        // Печать "GymConnect"
        const brandTimer = setInterval(() => {
            bIdx++;
            setTypedBrand(targetBrand.slice(0, bIdx));
            if (bIdx >= targetBrand.length) {
                clearInterval(brandTimer);

                // После названия печатаем казахский слоган
                const kkTimer = setInterval(() => {
                    sKkIdx++;
                    setTypedSloganKk(targetSloganKk.slice(0, sKkIdx));
                    if (sKkIdx >= targetSloganKk.length) {
                        clearInterval(kkTimer);

                        // После казахского печатаем русский слоган
                        const ruTimer = setInterval(() => {
                            sRuIdx++;
                            setTypedSloganRu(targetSloganRu.slice(0, sRuIdx));
                            if (sRuIdx >= targetSloganRu.length) {
                                clearInterval(ruTimer);
                            }
                        }, 30);
                    }
                }, 30);
            }
        }, 65);

        return () => {
            clearInterval(brandTimer);
        };
    }, []);

    // 2. Таймеры прогресса и смены фич на 10 секунд
    useEffect(() => {
        const featureInterval = setInterval(() => {
            setFeatureIndex((prev) => (prev < features.length - 1 ? prev + 1 : 0));
        }, 1250);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        const exitTimer = setTimeout(() => {
            if (!hasFinishedRef.current) {
                hasFinishedRef.current = true;
                setIsVisible(false);
                setTimeout(() => {
                    if (onFinish) onFinish();
                }, 400);
            }
        }, 10000);

        return () => {
            clearInterval(featureInterval);
            clearInterval(progressInterval);
            clearTimeout(exitTimer);
        };
    }, [features.length, onFinish]);

    return (
        <div className={`splash-overlay ${!isVisible ? 'splash-fade-out' : ''}`}>
            
            {/* Живая интерактивная карта фитнес-клубов */}
            <AlmatyMapBackground />

            {/* Нижний стек карточки */}
            <div className="splash-bottom-stack">
                
                {/* Кнопка пропуска над карточкой (не перекрывает карту) */}
                <div className="splash-skip-row">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="splash-skip-btn active:scale-95"
                    >
                        <span>Өткізу / Пропустить</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                </div>

                {/* Белая плашка с жестко зафиксированной высотой (не прыгает) */}
                <div className="splash-card-contrast">
                    
                    {/* Верхний бейдж только на казахском языке */}
                    <div className="splash-badge-pill">
                        <span className="badge-pill-dot"></span>
                        <span className="badge-pill-text">230+ зал • Алматы фитнес қауымдастығы</span>
                    </div>

                    {/* Печатное название GymConnect с курсором */}
                    <h1 className="splash-brand">
                        <span>{typedBrand}</span>
                        {typedBrand.length < targetBrand.length && <span className="typewriter-cursor">|</span>}
                    </h1>

                    {/* Печатные слоганы */}
                    <div className="slogans-container">
                        <p className="slogan-kk">
                            {typedSloganKk}
                            {typedBrand.length >= targetBrand.length && typedSloganKk.length < targetSloganKk.length && (
                                <span className="typewriter-cursor">|</span>
                            )}
                        </p>
                        <p className="slogan-ru">
                            {typedSloganRu}
                            {typedSloganKk.length >= targetSloganKk.length && typedSloganRu.length < targetSloganRu.length && (
                                <span className="typewriter-cursor">|</span>
                            )}
                        </p>
                    </div>

                    {/* Фиксированный контейнер фич с защитой от переноса строк */}
                    <div className="feature-box">
                        <div className="feature-icon-wrap">
                            {features[featureIndex].icon}
                        </div>
                        <div className="feature-text-wrap">
                            <p className="dyn-kk">{features[featureIndex].kk}</p>
                            <p className="dyn-ru">{features[featureIndex].ru}</p>
                        </div>
                    </div>

                    {/* Прогресс-бар на 10 секунд */}
                    <div className="splash-progress-wrapper">
                        <div className="splash-progress-info">
                            <div className="progress-text-col">
                                <span className="prog-dot"></span>
                                <span className="prog-kk">Қосылуда / Подключение к залам Алматы...</span>
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

        </div>
    );
};

export default SplashLoader;
