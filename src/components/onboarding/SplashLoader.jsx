// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';

const AlmatyMapBackground = () => {
    // Реальные залы из предоставленного документа для фонового паттерна карты
    const mapGyms = [
        { id: 1, name: "Invictus Fitness", top: "35%", left: "28%" },
        { id: 2, name: "БАНЗАЙ Fitness", top: "22%", left: "60%" },
        { id: 3, name: "Adrenaline", top: "48%", left: "45%" },
        { id: 4, name: "Underground Big", top: "65%", left: "30%" },
        { id: 5, name: "Iron House", top: "30%", left: "75%" },
        { id: 6, name: "FitnessBlitz", top: "52%", left: "70%" },
        { id: 7, name: "Nomad Gym", top: "72%", left: "55%" },
        { id: 8, name: "WORKOUT", top: "18%", left: "40%" },
        { id: 9, name: "Urban Gym", top: "40%", left: "85%" },
        { id: 10, name: "Balance", top: "60%", left: "15%" },
        { id: 11, name: "S89 Fitness", top: "28%", left: "20%" },
        { id: 12, name: "Technofit", top: "58%", left: "42%" },
        { id: 13, name: "K1 Fitness", top: "78%", left: "75%" },
        { id: 14, name: "Uniflex", top: "15%", left: "80%" }
    ];

    return (
        <div className="almaty-map-bg">
            {/* Схема дорог и сетки Алматы */}
            <div className="map-grid-lines">
                <div className="line-h line-1"></div>
                <div className="line-h line-2"></div>
                <div className="line-v line-1"></div>
                <div className="line-v line-2"></div>
            </div>

            {/* Аккуратные мини-пины реальных залов на фоне */}
            {mapGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="gym-map-pin"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.3}s` }}
                >
                    <span className="pin-pulse"></span>
                    <span className="pin-dot"></span>
                    <div className="pin-tooltip">{gym.name}</div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
