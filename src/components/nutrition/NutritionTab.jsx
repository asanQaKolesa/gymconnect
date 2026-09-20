import React, { useState } from 'react';
import NutritionHeader from './NutritionHeader';
import NutritionDisclaimer from './NutritionDisclaimer';
import NutritionCalculator from './NutritionCalculator';
import WaterTracker from './WaterTracker';
import NutritionAllergies from './NutritionAllergies';
import NutritionDiet from './NutritionDiet';
import NutritionCart from './NutritionCart';
import NutritionSupplements from './NutritionSupplements';

export default function NutritionTab() {
  const [weight, setWeight] = useState(75);

  return (
    <div className="p-3 max-w-md mx-auto pb-16 animate-in fade-in duration-200">
      <NutritionHeader />
      <NutritionDisclaimer />
      <NutritionCalculator weight={weight} setWeight={setWeight} />
      <WaterTracker />
      <NutritionAllergies />
      <NutritionDiet />
      <NutritionCart />
      <NutritionSupplements />
    </div>
  );
}
