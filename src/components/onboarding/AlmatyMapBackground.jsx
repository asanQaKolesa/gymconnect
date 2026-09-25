// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';
import { Dumbbell } from 'lucide-react';

const AlmatyMapBackground = () => {
    // Единый регистр и стиль для всех залов на карте (без капслока)
    const patternGyms = [
        { id: 1, name: "Invictus Go", top: "7%", left: "24%", delay: "0s" },
        { id: 2, name: "1Fit Pass", top: "6%", left: "74%", delay: "0.8s" },
        { id: 3, name: "Adrenaline", top: "16%", left: "50%", delay: "0.3s" },
        { id: 4, name: "Банзай Fitness", top: "18%", left: "15%", delay: "1.2s" },
        { id: 5, name: "Esentai Fit+Spa", top: "19%", left: "84%", delay: "0.5s" },
        { id: 6, name: "Ya. Pilates & Gym", top: "29%", left: "33%", delay: "1.5s" },
        { id: 7, name: "Workout Forum", top: "28%", left: "67%", delay: "0.2s" },
        { id: 8, name: "Royal Club", top: "39%", left: "20%", delay: "1.0s" },
        { id: 9, name: "Underground Big", top: "38%", left: "80%", delay: "1.7s" },
        { id: 10, name: "Pyramid Strong", top: "44%", left: "50%", delay: "0.6s" }
    ];

    return (
        <div className="fitness-pattern-bg">
            <div className="pattern-grid-overlay"></div>

            {/* Радарные орбиты вокруг центра */}
            <div className="radar-ring radar-ring-1"></div>
            <div className="radar-ring radar-ring-2"></div>
            <div className="radar-ring radar-ring-3"></div>

            {/* Светящиеся маяки клубов */}
            {patternGyms.map((gym) => (
                <div 
                    key={gym.id} 
                    className="pattern-gym-pin"
                    style={{ 
                        top: gym.top, 
                        left: gym.left, 
                        animationDelay: gym.delay 
                    }}
                >
                    <div className="pin-pulse-ring" style={{ animationDelay: gym.delay }}></div>
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
