import React from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';

export default function ReviewCard({ review, isTransparent }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all ${isTransparent ? 'opacity-50 select-none' : ''}`}>
      {/* Шапка карточки: Автор и верификация */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center">
            {review.author[0]}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900">{review.author}</span>
              {review.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />}
            </div>
            <span className="text-[10px] text-slate-400">{review.target} • {review.date}</span>
          </div>
        </div>

        {/* Звезды оценки */}
        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-xl">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700">{review.rating}</span>
        </div>
      </div>

      {/* Текст отзыва */}
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        {review.text}
      </p>

      {/* Футер карточки: Лайки и статус */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
        <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]">Рекомендует</span>
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>{review.likes}</span>
        </button>
      </div>
    </div>
  );
}
