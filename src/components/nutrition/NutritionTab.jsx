import React from 'react';
import NutritionDisclaimer from './NutritionDisclaimer';
import NutritionCalculator from './NutritionCalculator';
import WaterTracker from './WaterTracker';
import NutritionAllergies from './NutritionAllergies';
import NutritionDiet from './NutritionDiet';
import NutritionCart from './NutritionCart';
import NutritionSupplements from './NutritionSupplements';

export default function NutritionTab() {
  return (
    <div className="p-4 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      <h1 className="text-xl font-bold text-slate-900 mb-4 px-1">Питание и КБЖУ</h1>
      
      <NutritionDisclaimer />
      <NutritionCalculator />
      <WaterTracker />
      <NutritionAllergies />
      <NutritionDiet />
      <NutritionCart />
      <NutritionSupplements />
    </div>
  );
}
