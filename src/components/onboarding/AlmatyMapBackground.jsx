// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';
import { Dumbbell } from 'lucide-react';

const AlmatyMapBackground = () => {
    // Список залов с координатами выше зоны карточки
    const mapGyms = [
        { id: 1, name: "БАНЗАЙ Fitness", top: "15%", left: "70%" },
        { id: 2, name: "Adrenaline", top: "22%", left: "30%" },
        { id: 3, name: "Invictus Go", top: "28%", left: "52%" },
        { id: 4, name: "Iron House", top: "12%", left: "25%" },
        { id: 5, name: "FitnessBlitz", top: "35%", left: "78%" },
        { id: 6, name: "WORKOUT", top: "18%", left: "48%" },
        { id: 7, name: "Underground Big", top: "40%", left: "22%" },
        { id: 8, name: "Urban Gym", top: "25%", left: "85%" },
        { id: 9, name: "Balance", top: "45%", left: "40%" },
        { id: 10, name: "S89 Fitness", top: "10%", left: "55%" }
    ];

    return (
        <div className="almaty-map-bg-gis">
            {/* Дороги и кварталы */}
            <div className="gis-roads-layer">
                <div className="road-main r-1"></div>
                <div className="road-main r-2"></div>
                <div className="road-sub s-1"></div>
                <div className="road-sub s-2"></div>
            </div>

            {/* Пины с иконками фитнеса и полупрозрачным текстом */}
            {mapGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="gis-gym-pin"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.3}s` }}
                >
                    <div className="gis-pin-pulse"></div>
                    <div className="gis-pin-icon-wrap">
                        <Dumbbell className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="gis-pin-card-trans">
                        <span className="gis-pin-text">{gym.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
