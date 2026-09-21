// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';
import { Dumbbell } from 'lucide-react';

const AlmatyMapBackground = () => {
    // Равномерно распределенные пины реальных залов выше карточки
    const patternGyms = [
        { id: 1, name: "БАНЗАЙ Fitness", top: "12%", left: "75%" },
        { id: 2, name: "Adrenaline", top: "18%", left: "22%" },
        { id: 3, name: "Invictus Go", top: "25%", left: "55%" },
        { id: 4, name: "Iron House", top: "10%", left: "35%" },
        { id: 5, name: "FitnessBlitz", top: "32%", left: "82%" },
        { id: 6, name: "WORKOUT", top: "15%", left: "80%" },
        { id: 7, name: "Underground Big", top: "35%", left: "18%" },
        { id: 8, name: "Urban Gym", top: "22%", left: "88%" },
        { id: 9, name: "Balance", top: "40%", left: "38%" },
        { id: 10, name: "S89 Fitness", top: "8%", left: "62%" },
        { id: 11, name: "Technofit", top: "38%", left: "68%" },
        { id: 12, name: "K1 Fitness", top: "28%", left: "38%" }
    ];

    return (
        <div className="fitness-pattern-bg">
            {/* Премиальная геометрическая сетка-паттерн */}
            <div className="pattern-grid-overlay"></div>

            {/* Аккуратные пины фитнес-залов */}
            {patternGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="pattern-gym-pin"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.25}s` }}
                >
                    <div className="pin-pulse-ring"></div>
                    <div className="pin-icon-box">
                        <Dumbbell className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="pin-name-tag">
                        <span>{gym.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlmatyMapBackground;
