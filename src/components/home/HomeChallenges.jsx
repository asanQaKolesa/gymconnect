import React from 'react';
import { Flame, Trophy } from 'lucide-react';

export default function HomeChallenges() {
  const challenges = [
    { id: 1, title: '100 бёрпи за 10 минут', reward: '100 бёрпи', participants: '1,420 атлетов' },
    { id: 2, title: 'Планка 3 минуты', reward: 'Статика', participants: '980 атлетов' },
    { id: 3, title: 'Марафон подтягиваний', reward: 'База', participants: '650 атлетов' },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500 stroke-[1.5]" />
          <span>Активные вызовы дня</span>
        </span>
        <span className="text-[11px] text-blue-600 font-medium">Все (3)</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {challenges.map((item) => (
          <div key={item.id} className="min-w-[220px] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">Вызов</span>
                <span className="text-[10px] text-slate-400">{item.participants}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-[11px] text-slate-400 mb-3">Проверь взрывную выносливость и силу.</p>
            </div>
            <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors">
              Участвовать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
