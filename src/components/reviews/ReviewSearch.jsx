import React from 'react';
import { Search } from 'lucide-react';

export default function ReviewSearch({ activeTab, searchQuery, setSearchQuery }) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.5]" />
      <input
        type="text"
        placeholder={activeTab === 'gyms' ? 'Поиск зала по названию (например, Invictus)...' : 'Поиск тренера по имени...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-600 transition-colors"
      />
    </div>
  );
}
