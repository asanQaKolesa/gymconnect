// src/components/home/HomeChallenges.jsx
import React from 'react';
import { Trophy, ChevronRight } from 'lucide-react';

export default function HomeChallenges() {
  const challenges = [
    { id: 1, title: '100 бёрпи за 10 минут', reward: 'Выносливость', participants: '1,420 атлетов' },
    { id: 2, title: 'Планка 3 минуты', reward: 'Статика коры', participants: '980 атлетов' },
    { id: 3, title: 'Марафон подтягиваний', reward: 'Силовая база', participants: '650 атлетов' },
  ];

  return (
    <div className="mb-3.5 select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Trophy className="w-3 h-3 stroke-[2]" />
          </div>
          <span>Активные вызовы дня</span>
        </span>
        <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Все (3)</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {challenges.map((item) => (
          <div key={item.id} className="min-w-[220px] bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-36">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg font-mono">
                  {item.reward}
                </span>
                <span className="text-[10px] text-slate-400">{item.participants}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h3>
              <p className="text-[10.5px] text-slate-400 leading-tight mt-1">Проверь силу духа и технику.</p>
            </div>
            
            <button 
              type="button"
              onClick={() => alert(`Вы приняли вызов: ${item.title}!`)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              Участвовать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
