// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';

const AlmatyMapBackground = () => {
    // Реальные залы с подложками для фоновой карты в стиле 2ГИС
    const mapGyms = [
        { id: 1, name: "Invictus Fitness", top: "32%", left: "25%" },
        { id: 2, name: "БАНЗАЙ Fitness", top: "20%", left: "58%" },
        { id: 3, name: "Adrenaline", top: "45%", left: "42%" },
        { id: 4, name: "Underground Big", top: "68%", left: "28%" },
        { id: 5, name: "Iron House", top: "28%", left: "78%" },
        { id: 6, name: "FitnessBlitz", top: "50%", left: "72%" },
        { id: 7, name: "Nomad Gym", top: "75%", left: "52%" },
        { id: 8, name: "WORKOUT", top: "16%", left: "38%" },
        { id: 9, name: "Urban Gym", top: "38%", left: "82%" },
        { id: 10, name: "Balance", top: "58%", left: "15%" },
        { id: 11, name: "S89 Fitness", top: "25%", left: "18%" },
        { id: 12, name: "Technofit", top: "55%", left: "40%" }
    ];

    return (
        <div className="almaty-map-bg">
            {/* Полупрозрачная сетка дорог и кварталов Алматы в стиле 2ГИС */}
            <div className="map-grid-container">
                <div className="map-road h-1"></div>
                <div className="map-road h-2"></div>
                <div className="map-road h-3"></div>
                <div className="map-road v-1"></div>
                <div className="map-road v-2"></div>
                <div className="map-road v-3"></div>
            </div>

            {/* Пины залов с нежными подложками и пульсацией */}
            {mapGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="map-gym-pin-wrapper"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.35}s` }}
                >
                    <div className="pin-pulse-ring"></div>
                    <div className="pin-marker"></div>
                    <div className="pin-label-card">
                        <span className="pin-name">{gym.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
