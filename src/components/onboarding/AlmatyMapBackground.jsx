// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';
import { Dumbbell } from 'lucide-react';

const AlmatyMapBackground = () => {
    // Широко разбросанные координаты без наложений
    const patternGyms = [
        { id: 1, name: "БАНЗАЙ Fitness", top: "10%", left: "78%" },
        { id: 2, name: "Adrenaline", top: "20%", left: "15%" },
        { id: 3, name: "Invictus Go", top: "26%", left: "50%" },
        { id: 4, name: "Iron House", top: "8%", left: "30%" },
        { id: 5, name: "FitnessBlitz", top: "35%", left: "85%" },
        { id: 6, name: "WORKOUT", top: "14%", left: "70%" },
        { id: 7, name: "Underground Big", top: "32%", left: "15%" },
        { id: 8, name: "Urban Gym", top: "22%", left: "90%" },
        { id: 9, name: "Balance", top: "38%", left: "35%" },
        { id: 10, name: "S89 Fitness", top: "6%", left: "55%" },
        { id: 11, name: "Technofit", top: "40%", left: "72%" },
        { id: 12, name: "K1 Fitness", top: "28%", left: "32%" }
    ];

    return (
        <div className="fitness-pattern-bg">
            <div className="pattern-grid-overlay"></div>

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
