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
      },
      {
        id: 2,
        author: 'Тимур М.',
        target: 'World Class Almaty',
        date: '3 дня назад',
        rating: 4.5,
        verified: true,
        text: 'Премиальный сервис, чистый бассейн, полотенца всегда в наличии. Из минусов — высокая цена годового абонемента.',
        likes: 8
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
      },
      {
        id: 2,
        author: 'Камила Р.',
        target: 'Тренер Алия С.',
        date: 'Неделю назад',
        rating: 4.8,
        verified: true,
        text: 'Помогла скорректировать осанку и избавиться от боли в пояснице. Программа тренировок составлена идеально.',
        likes: 12
      }
    ]
  };

  const currentList = reviewsData[activeTab];

  return (
    <div className="space-y-2.5">
      {/* Заголовок блока */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Свежий отзыв</span>
        <span className="text-[11px] text-blue-600 font-medium">Без накрутки</span>
      </div>

      {/* Первый отзыв (полный) */}
      {currentList[0] && <ReviewCard review={currentList[0]} isTransparent={false} />}

      {/* Второй отзыв (обрезанный на 30% сверху с градиентом растворения) */}
      <div className="relative h-20 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 opacity-40 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10"></div>
        {currentList[1] && <ReviewCard review={currentList[1]} isTransparent={true} />}
      </div>

      {/* Кнопки управления (компактные, прямо на главном экране) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button 
          onClick={onOpenAll}
          className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Все отзывы</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        <button 
          onClick={onOpenAdd}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Оставить отзыв</span>
        </button>
      </div>
    </div>
  );
}
