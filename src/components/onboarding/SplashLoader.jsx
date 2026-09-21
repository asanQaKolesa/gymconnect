// src/components/onboarding/SplashLoader.jsx
import React, { useEffect, useState } from 'react';
import './SplashLoader.css'; // Подключаем CSS с анимацией

const SplashLoader = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Запускаем таймер на 3 секунды (3000 мс) для показа заставки
        const timer = setTimeout(() => {
            setIsVisible(false); // Запускаем анимацию исчезновения
            
            // Даем время анимации исчезновения (500мс) перед вызовом колбэка
            setTimeout(() => {
                if (onFinish) {
                    onFinish();
                }
            }, 500); // Это время должно совпадать с transition в CSS
            
        }, 2500); // Время показа до начала скрытия (2.5 сек)

        // Очистка таймера при размонтировании компонента
        return () => clearTimeout(timer);
    }, [onFinish]);

    // Если isVisible ложь, компонент плавно исчезает благодаря CSS,
    // но мы продолжаем его рендерить, пока не сработает второй таймер.
    // Для полного удаления из DOM можно добавить условие.
    
    return (
        <div className={`splash-container ${!isVisible ? 'fade-out' : ''}`}>
            <div className="splash-content">
                {/* Здесь будет твоя иконка/логотип. Пока используем текст для примера */}
                <div className="splash-logo-ring">
                   <span className="material-symbols-outlined" style={{fontSize: '64px', color: 'var(--tg-theme-button-color, #3390ec)'}}>
                        fitness_center
                   </span>
                </div>
                <h1 className="splash-title">GymConnect</h1>
                <p className="splash-slogan">Больше не тренируйся один</p>
                
                {/* Можно добавить маленький спиннер загрузки Telegram-style */}
                <div className="splash-spinner"></div>
            </div>
        </div>
    );
};

export default SplashLoader;
