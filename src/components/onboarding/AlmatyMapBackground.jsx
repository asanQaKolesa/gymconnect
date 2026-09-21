// src/components/onboarding/AlmatyMapBackground.jsx
import React from 'react';
import './AlmatyMapBackground.css';
import { Dumbbell } from 'lucide-react';

const AlmatyMapBackground = () => {
    // Строгий шахматный порядок без пересечений (ряды по 3-4 элемента)
    const patternGyms = [
        // Верхний ряд
        { id: 1, name: "Iron House", top: "8%", left: "20%" },
        { id: 2, name: "S89 Fitness", top: "8%", left: "50%" },
        { id: 3, name: "БАНЗАЙ Fitness", top: "8%", left: "80%" },
        
        // Второй ряд
        { id: 4, name: "Adrenaline", top: "18%", left: "32%" },
        { id: 5, name: "WORKOUT", top: "18%", left: "68%" },
        
        // Третий ряд
        { id: 6, name: "Underground Big", top: "28%", left: "18%" },
        { id: 7, name: "Invictus Go", top: "28%", left: "50%" },
        { id: 8, name: "Urban Gym", top: "28%", left: "82%" },
        
        // Нижний ряд (над карточкой)
        { id: 9, name: "Balance", top: "40%", left: "28%" },
        { id: 10, name: "Technofit", top: "40%", left: "72%" }
    ];

    return (
        <div className="fitness-pattern-bg">
            <div className="pattern-grid-overlay"></div>

            {patternGyms.map((gym, index) => (
                <div 
                    key={gym.id} 
                    className="pattern-gym-pin"
                    style={{ top: gym.top, left: gym.left, animationDelay: `${index * 0.2}s` }}
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
