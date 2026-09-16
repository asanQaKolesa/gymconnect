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

  // В ленту пускаем только тех, у кого создана анкета в gymbro_cards
  const hasGymBroCard = Boolean(myCard);

  return (
    <div className="space-y-4">
      <GymBroPaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      {!hasGymBroCard ? (
        <GymBroOnboarding
          gyms={gyms}
          userCity={user?.city || 'Алматы'}
          userName={user?.name || ''}
          userGender={user?.gender || 'Парень'}
          onComplete={onSaveCard}
          isSaving={isSaving}
        />
      ) : (
        <GymBroFeed
          cards={cards}
          myCard={myCard}
          onRefresh={onRefreshCards}
          onOpenPaywall={() => setShowPaywall(true)}
          isProTrial={true}
        />
      )}
    </div>
  );
}
