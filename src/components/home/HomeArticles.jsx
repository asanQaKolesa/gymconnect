// src/components/home/HomeArticles.jsx
import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function HomeArticles() {
  const articles = [
    { id: 1, tag: 'Питание & КБЖУ', title: 'Как грамотно составить рацион и не сорваться при дефиците', time: '4 мин' },
    { id: 2, tag: 'Тренировки', title: 'Full Body или Split: что выбрать новичку для старта', time: '5 мин' },
    { id: 3, tag: 'Восстановление', title: 'Роль сна и гидратации в наборе мышечной массы', time: '3 мин' },
  ];

  return (
    <div className="mb-2 select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <BookOpen className="w-3 h-3 stroke-[2]" />
          </div>
          <span>Полезные статьи & база знаний</span>
        </span>
        <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Все (PRO)</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {articles.map((item) => (
          <div key={item.id} className="min-w-[220px] bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-36">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                  {item.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">{item.title}</h3>
            </div>
            
            <button 
              type="button"
              onClick={() => alert(`Открытие статьи: «${item.title}»`)}
              className="flex items-center justify-between text-xs font-semibold text-slate-800 pt-1 border-t border-slate-100 hover:text-blue-600 transition-colors"
            >
              <span>Читать статью</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
