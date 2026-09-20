import React from 'react';
import NutritionHeader from './NutritionHeader';
// остальные импорты...

export default function NutritionTab() {
  return (
    <div className="p-3 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      <NutritionHeader />
      {/* остальной контент питания */}
    </div>
  );
}
