import React from 'react';
import ReviewCard from './ReviewCard';
import { ArrowRight, PlusCircle } from 'lucide-react';

export default function ReviewsList({ activeTab, onOpenAll, onOpenAdd }) {
  const reviewsData = {
    gyms: [
      {
        id: 1,
        author: 'Асанәли Қ.',
        target: 'Invictus Go (Жетысу-2)',
        date: 'Вчера',
        rating: 5.0,
        verified: true,
        text: 'Отличный зал! Новые тренажеры Matrix, вентиляция работает на ура, по вечерам в зоне свободных весов бывает плотно.',
        likes: 14
      }
    ],
    trainers: [
      {
        id: 1,
        author: 'Диас К.',
        target: 'Тренер Арман Садыков',
        date: '2 дня назад',
        rating: 5.0,
        verified: true,
        text: 'За 2 месяца набора массы под руководством Армана прибавил 3.5 кг чистых мышц. Очень грамотно ставит технику.',
        likes: 21
      }
    ]
  };

  const currentList = reviewsData[activeTab];

  return (
    <div className="space-y-3">
      {/* Заголовок блока */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Свежий отзыв</span>
        <span className="text-[11px] text-emerald-600 font-medium">Верифицировано</span>
      </div>

      {/* Единственный актуальный свежий отзыв */}
      {currentList[0] && <ReviewCard review={currentList[0]} isTransparent={false} />}

      {/* Полноразмерная карточка-кнопка: Посмотреть все отзывы */}
      <button 
        onClick={onOpenAll}
        className="w-full p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left transition-all shadow-sm group flex items-center justify-between"
      >
        <div>
          <div className="text-xs font-semibold text-slate-900 mb-0.5 flex items-center gap-1.5">
            <span>Все отзывы ({activeTab === 'gyms' ? '42' : '28'})</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-[11px] text-slate-400">Нажмите, чтобы ознакомиться со всеми мнениями и рейтингами</div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <ArrowRight className="w-4 h-4 stroke-[1.5]" />
        </div>
      </button>

      {/* Полноразмерная карточка-кнопка: Оставить отзыв */}
      <button 
        onClick={onOpenAdd}
        className="w-full p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left transition-all shadow-sm group flex items-center justify-between"
      >
        <div>
          <div className="text-xs font-semibold text-blue-600 mb-0.5 flex items-center gap-1.5">
            <span>Оставить свой отзыв</span>
          </div>
          <div className="text-[11px] text-slate-400">Ваш реальный опыт поможет другим атлетам сделать правильный выбор без разочарования</div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors">
          <PlusCircle className="w-4 h-4 stroke-[1.5]" />
        </div>
      </button>
    </div>
  );
}
