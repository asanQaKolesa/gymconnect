import React, { useState } from 'react';
import GymBroOnboarding from './gymbro/GymBroOnboarding';
import GymBroFeed from './gymbro/GymBroFeed';
import GymBroPaywallModal from './gymbro/GymBroPaywallModal';

export default function GymBroTab({
  myCard,
  user,
  gyms = [],
  cards = [],
  onSaveCard,
  onRefreshCards,
  isSaving
}) {
  const [showPaywall, setShowPaywall] = useState(false);
  // Состояние: принудительно открыть форму заполнения/редактирования анкеты
  const [forceEdit, setForceEdit] = useState(false);

  // Пользователь идет в онбординг, если карточки нет ИЛИ если он нажал "Редактировать анкету"
  const needsOnboarding = !myCard || forceEdit;

  return (
    <div className="space-y-4">
      <GymBroPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {needsOnboarding ? (
        <div className="space-y-3">
          {myCard && (
            <button
              type="button"
              onClick={() => setForceEdit(false)}
              className="text-xs text-amber-400 flex items-center gap-1 font-bold py-1 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              ← Вернуться в ленту напарников
            </button>
          )}

          <GymBroOnboarding
            gyms={gyms}
            userCity={myCard?.city || user?.city || 'Алматы'}
            userName={myCard?.name || user?.name || ''}
            userGender={myCard?.gender || user?.gender || 'Парень'}
            onComplete={async (data) => {
              await onSaveCard(data);
              setForceEdit(false);
            }}
            isSaving={isSaving}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Плашка карточки пользователя вверху ленты */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>👤</span> Твоя анкета: <span className="text-amber-400">{myCard.name}</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Ищешь: {myCard.looking_for === 'bro' ? 'Парня' : myCard.looking_for === 'girl' ? 'Девушку' : 'Всех'} • {myCard.weekday_gym}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForceEdit(true)}
              className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold active:scale-95 transition"
            >
              Анкета ✏️
            </button>
          </div>

          <GymBroFeed
            cards={cards}
            myCard={myCard}
            onRefresh={onRefreshCards}
            onOpenPaywall={() => setShowPaywall(true)}
            isProTrial={true}
          />
        </div>
      )}
    </div>
  );
}
