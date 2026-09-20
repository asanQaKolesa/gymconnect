import React from 'react';
import NutritionHeader from './NutritionHeader';
import NutritionDisclaimer from './NutritionDisclaimer';
import CalorieCalculator from './CalorieCalculator';
import WaterTracker from './WaterTracker';
import AllergySelector from './AllergySelector';
import DietPlan from './DietPlan';
import GroceryCart from './GroceryCart';
import SupplementsShop from './SupplementsShop';

export default function NutritionTab() {
  return (
    <div className="p-3 max-w-md mx-auto pb-24 animate-in fade-in duration-200">
      <NutritionHeader />
      <NutritionDisclaimer />
      <CalorieCalculator />
      <WaterTracker />
      <AllergySelector />
      <DietPlan />
      <GroceryCart />
      <SupplementsShop />
    </div>
  );
}
