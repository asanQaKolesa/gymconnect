import React, { useState } from 'react';
import { RotateCcw, X, Check, Zap, MapPin, SlidersHorizontal, Users } from 'lucide-react';

export default function GymBroTab() {
  const [profiles, setProfiles] = useState([
    {
      id: 1,
      name: 'Алексей',
      age: 26,
      type: 'Экстраверт',
      gym: 'Invictus Go (Навои)',
      time: 'Вечер (18:00 - 20:00)',
      experience: 'СТАЖ 3 ГОДА',
      bio: 'Качаю массу, ищу напарника на базу (жим, присед, тяга). Только хардкор.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      name: 'Тимур',
      age: 28,
      type: 'Интроверт',
      gym: 'Invictus Go (Жетысу-2)',
      time: 'Утро (08:00 - 10:00)',
      experience: 'СТАЖ 5 ЛЕТ',
      bio: 'Работаем на рельеф и силу. Без лишних разговоров, только четкий подход.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProfile = profiles[currentIndex];

  const handleNext = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="p-3 max-w-md mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Шапка раздела GymBro в едином стиле */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-2.5 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">GymBro Matching</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Больше не тренируйся один • Напарники по базе</p>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-xl text-[10px] font-semibold border border-blue-100/50 shrink-0">
            <Users className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Живой поиск</span>
          </div>
        </div>
      </div>

      {/* Верхние кнопки-переключатели (Мэтчи, Лайки, Анкета) */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <button className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-800 shadow-sm flex items-center justify-center gap-1">
          <span>Мэтчи</span>
          <span className="w-4 h-4 bg-blue-50 text-blue-600 rounded-full text-[9px] flex items-center justify-center">3</span>
        </button>
        <button className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-800 shadow-sm flex items-center justify-center gap-1">
          <span>Лайки</span>
          <span className="w-4 h-4 bg-rose-50 text-rose-600 rounded-full text-[9px] flex items-center justify-center">5</span>
        </button>
        <button className="py-2 px-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-semibold text-slate-800 shadow-sm flex items-center justify-center gap-1">
          <span>Моя анкета</span>
        </button>
      </div>

      {/* Фильтры зала */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <button className="py-2 px-3 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Все залы Алматы</span>
        </button>
        <button className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-xs font-medium shadow-sm flex items-center justify-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
          <span>Только мой зал</span>
        </button>
      </div>

      {/* Центральная карточка свайпа */}
      {currentProfile ? (
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 flex flex-col justify-end mb-3 h-[380px]">
          <div className="absolute inset-0 z-0">
            <img 
              src={currentProfile.image} 
              alt={currentProfile.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
          </div>

          <div className="absolute top-3 left-3 right-3 z-10 flex gap-1.5">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-medium">
              {currentProfile.type}
            </span>
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-medium">
              {currentProfile.age} лет
            </span>
          </div>

          <div className="relative z-10 p-4 text-white">
            <div className="flex items-baseline gap-2 mb-0.5">
              <h2 className="text-lg font-bold tracking-tight">{currentProfile.name}</h2>
            </div>
            <div className="text-[11px] text-slate-200 mb-2.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{currentProfile.gym} • {currentProfile.time}</span>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-[9px] font-bold text-blue-300 tracking-wider uppercase mb-0.5">{currentProfile.experience}</div>
              <p className="text-xs text-slate-100 leading-snug line-clamp-2">
                {currentProfile.bio}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[380px] bg-white rounded-3xl border border-slate-100 flex items-center justify-center p-6 text-center">
          <p className="text-xs text-slate-400">Анкеты в вашем районе закончились</p>
        </div>
      )}

      {/* Четыре управляющие кнопки на плашке */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-100 flex items-center justify-around">
        <button 
          onClick={handleNext}
          className="w-11 h-11 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4 stroke-[1.5]" />
        </button>
        <button 
          onClick={handleNext}
          className="w-12 h-12 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 shadow-sm active:scale-95 transition-all"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
        <button 
          onClick={handleNext}
          className="w-12 h-12 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-sm active:scale-95 transition-all"
        >
          <Check className="w-5 h-5 stroke-[2]" />
        </button>
        <button 
          onClick={handleNext}
          className="w-11 h-11 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-full flex items-center justify-center text-purple-600 shadow-sm active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

    </div>
  );
}
