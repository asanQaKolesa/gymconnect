// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';

const AlmatyMapBackground = () => {
    // Список точек фитнес-клубов на карте Алматы с координатами для анимации
    const gymPins = [
        { id: 1, name: "Mega Fitness (Розыбакиева)", top: "35%", left: "28%" },
        { id: 2, name: "Dostyk Plaza Gym", top: "25%", left: "65%" },
        { id: 3, name: "World Class Almaty", top: "48%", left: "52%" },
        { id: 4, name: "Fitnation (Жетысу)", top: "60%", left: "20%" },
        { id: 5, name: "Invictus Go (Абая)", top: "42%", left: "40%" },
        { id: 6, name: "Communitas (Самал)", top: "30%", left: "58%" }
    ];

    return (
        <div className="almaty-map-bg">
            {/* Схематичная сетка улиц / дорог Алматы */}
            <div className="map-grid-lines">
                <div className="line-h line-1"></div>
                <div className="line-h line-2"></div>
                <div className="line-v line-1"></div>
                <div className="line-v line-2"></div>
            </div>

            {/* Пульсирующие пины залов на карте */}
            {gymPins.map((pin, index) => (
                <div 
                    key={pin.id} 
                    className="gym-map-pin"
                    style={{ top: pin.top, left: pin.left, animationDelay: `${index * 0.6}s` }}
                >
                    <span className="pin-pulse"></span>
                    <span className="pin-dot"></span>
                    <div className="pin-tooltip">{pin.name}</div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
