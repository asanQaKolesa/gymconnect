import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function HomeArticles() {
  const articles = [
    { id: 1, tag: 'Питание & КБЖУ', title: 'Как грамотно составить рацион и не сорваться при дефиците', time: '4 мин чтения' },
    { id: 2, tag: 'Тренировки', title: 'Full Body или Split: что выбрать новичку для старта', time: '5 мин чтения' },
    { id: 3, tag: 'Восстановление', title: 'Роль сна и гидратации в наборе мышечной массы', time: '3 мин чтения' },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-600 stroke-[1.5]" />
          <span>Полезные статьи & база</span>
        </span>
        <span className="text-[11px] text-blue-600 font-medium">Все (PRO)</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {articles.map((item) => (
          <div key={item.id} className="min-w-[220px] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{item.tag}</span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-3 leading-snug">{item.title}</h3>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              <span>Читать</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
