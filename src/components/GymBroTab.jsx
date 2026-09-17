import React, { useState } from 'react';
import GymBroOnboarding from './gymbro/GymBroOnboarding';
import GymBroFeed from './gymbro/GymBroFeed';
import GymBroPaywallModal from './gymbro/GymBroPaywallModal';

export default function GymBroTab({ myCard, user, gyms, cards, onSaveCard, onRefreshCards, isSaving }) {
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Алматы');
  const [isEditing, setIsEditing] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Если карточки еще нет или включен режим редактирования — показываем Apple-анкету
  if (!myCard || isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">
            {isEditing ? 'Настройки анкеты' : 'Первичная анкета'}
          </span>
          {myCard && (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08]"
            >
              Отмена
            </button>
          )}
        </div>
        <GymBroOnboarding
          initialData={myCard || { city: selectedCity, name: user?.name, gender: user?.gender }}
          gyms={gyms}
          onSave={async (data) => {
            await onSaveCard(data);
            setIsEditing(false);
          }}
          isSaving={isSaving}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Селектор города Apple Segmented Control */}
      <div className="apple-glass p-1.5 flex gap-1.5">
        <button
          onClick={() => setSelectedCity('Алматы')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            selectedCity === 'Алматы'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Алматы
        </button>
        <button
          onClick={() => setSelectedCity('Астана')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            selectedCity === 'Астана'
              ? 'bg-gradient-to-b from-[#FF682B] to-[#E0480A] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Астана
        </button>
      </div>

      {/* Моя активная карточка */}
      <div className="apple-glass-card p-4 space-y-2.5">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-tight">Твоя карточка в поиске</span>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] text-[#FF5A1F] font-semibold hover:underline"
          >
            Изменить
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <p><span className="text-slate-500">🏢 Будни:</span> {myCard.weekday_gym}</p>
          <p><span className="text-slate-500">🏙 Выходные:</span> {myCard.weekend_gym}</p>
          <p><span className="text-slate-500">🎯 Сплит:</span> {myCard.split}</p>
          <p><span className="text-slate-500">⏰ Время:</span> {myCard.time_slot}</p>
        </div>
      </div>

      {/* Лента напарников */}
      <GymBroFeed
        cards={cards.filter(c => c.city === selectedCity)}
        gyms={gyms}
        userCard={myCard}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onRefresh={onRefreshCards}
      />

      <GymBroPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
      />
    </div>
  );
}
