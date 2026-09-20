import React, { useState } from 'react';
import ReviewsHeader from './ReviewsHeader';
import ReviewTabsSwitch from './ReviewTabsSwitch';
import ReviewSearch from './ReviewSearch';
import ReviewsList from './ReviewsList';

export default function ReviewsTab() {
  const [activeTab, setActiveTab] = useState('gyms'); // 'gyms' или 'trainers'
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4 max-w-md mx-auto pb-16 animate-in fade-in duration-200">
      <ReviewsHeader />
      <ReviewTabsSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
      <ReviewSearch activeTab={activeTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ReviewsList 
        activeTab={activeTab} 
        onOpenAll={() => alert('Открытие полных списков отзывов')} 
        onOpenAdd={() => alert('Открытие формы добавления отзыва')} 
      />
    </div>
  );
}
