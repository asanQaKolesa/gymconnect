import React from 'react';

export default function TrainerNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'students', label: 'Ученики' },
    { id: 'workouts', label: 'Программы' },
    { id: 'schedule', label: 'Смены' },
    { id: 'nutrition', label: 'Питание' },
    { id: 'finance', label: 'Касса' },
    { id: 'notes', label: 'Заметки' },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
