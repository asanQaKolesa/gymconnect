// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';

const AlmatyMapBackground = () => {
    // Большая база реальных залов для заполнения карты в стиле 2ГИС
    const mapGyms = [
        { id: 1, name: "БАНЗАЙ Fitness", top: "18%", left: "75%" },
        { id: 2, name: "Adrenaline", top: "25%", left: "35%" },
        { id: 3, name: "Invictus Go", top: "42%", left: "15%" },
        { id: 4, name: "WORKOUT", top: "72%", left: "32%" },
        { id: 5, name: "Iron House", top: "30%", left: "80%" },
        { id: 6, name: "FitnessBlitz", top: "52%", left: "68%" },
        { id: 7, name: "Nomad Gym", top: "78%", left: "50%" },
        { id: 8, name: "Underground Big", top: "65%", left: "28%" },
        { id: 9, name: "Urban Gym", top: "38%", left: "88%" },
        { id: 10, name: "Balance", top: "58%", left: "12%" },
        { id: 11, name: "S89 Fitness", top: "28%", left: "20%" },
        { id: 12, name: "Technofit", top: "55%", left: "42%" },
        { id: 13, name: "K1 Fitness", top: "82%", left: "78%" },
        { id: 14, name: "Uniflex", top: "15%", left: "82%" },
        { id: 15, name: "Royal club", top: "75%", left: "60%" }
    ];

    return (
        <div className="almaty-map-bg-gis">
            {/* Стилизованные дороги и кварталы Алматы в стиле 2ГИС */}
            <div className="gis-roads-layer">
                <div className="road-main r-1"></div>
                <div className="road-main r-2"></div>
                <div className="road-main r-3"></div>
                <div className="road-sub s-1"></div>
                <div className="road-sub s-2"></div>
                <div className="road-sub s-3"></div>
            </div>

            {/* Брендовые пины залов с подложками */}
            {mapGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="gis-gym-pin"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.25}s` }}
                >
                    <div className="gis-pin-pulse"></div>
                    <div className="gis-pin-dot"></div>
                    <div className="gis-pin-card">
                        <span className="gis-pin-text">{gym.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
