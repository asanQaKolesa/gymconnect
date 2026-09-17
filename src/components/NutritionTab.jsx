import React from 'react';
import NutritionTabRoot from './nutrition/NutritionTab';

export default function NutritionTab({ myProfile, onUpdateProfile }) {
  return <NutritionTabRoot myProfile={myProfile} onUpdateProfile={onUpdateProfile} />;
}
