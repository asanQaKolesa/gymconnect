import React from 'react';
import { Building2, UserCheck } from 'lucide-react';

export default function ReviewTabsSwitch({ activeTab, setActiveTab }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* Кнопка: Залы */}
      <button
        onClick={() => setActiveTab('gyms')}
        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
          activeTab === 'gyms'
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200 shadow-sm'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'gyms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
          <Building2 className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-tight">Фитнес-залы</div>
          <div className={`text-[10px] ${activeTab === 'gyms' ? 'text-blue-100' : 'text-slate-400'}`}>Оборудование и сервис</div>
        </div>
      </button>

      {/* Кнопка: Тренеры */}
      <button
        onClick={() => setActiveTab('trainers')}
        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
          activeTab === 'trainers'
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200 shadow-sm'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'trainers' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
          <UserCheck className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-tight">Тренеры</div>
          <div className={`text-[10px] ${activeTab === 'trainers' ? 'text-purple-100' : 'text-slate-400'}`}>Результаты клиентов</div>
        </div>
      </button>
    </div>
  );
}
