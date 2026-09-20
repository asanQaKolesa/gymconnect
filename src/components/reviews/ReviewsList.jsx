import React from 'react';
import ReviewCard from './ReviewCard';
import { ArrowRight, PlusCircle } from 'lucide-react';

export default function ReviewsList({ activeTab, onOpenAll, onOpenAdd }) {
  // Моковые данные под залы и тренеры
  const reviewsData = {
    gyms: [
      {
        id: 1,
        author: 'Асанәли Қ.',
        target: 'Invictus Go (Жетысу-2)',
        date: 'Вчера',
        rating: 5.0,
        verified: true,
        text: 'Отличный зал! Новые тренажеры Matrix, вентиляция работает на ура, по вечерам в зоне свободных весов бывает плотно, но атмосфера мотивирует.',
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
        text: 'За 2 месяца набора массы под руководством Армана прибавил 3.5 кг чистых мышц. Очень грамотно ставит технику приседа и становой.',
        likes: 21
      },
      {
        id: 2,
        author: 'Камила Р.',
        target: 'Тренер Алия С.',
        date: 'Неделю назад',
        rating: 4.8,
        verified: true,
        text: 'Помогла скорректировать осанку и избавиться от боли в пояснице. Программа тренировок составлена идеально под мои особенности.',
        likes: 12
      }
    ]
  };

  const currentList = reviewsData[activeTab];

  return (
    <div className="space-y-3 mb-4">
      {/* Первый отзыв (полный) */}
      {currentList[0] && <ReviewCard review={currentList[0]} isTransparent={false} />}

      {/* Второй отзыв (полупрозрачный по задумке) с кнопкой под ним */}
      <div className="relative">
        {currentList[1] && <ReviewCard review={currentList[1]} isTransparent={true} />}
      </div>

      {/* Кнопка «Посмотреть все отзывы» рядом со свежими */}
      <button 
        onClick={onOpenAll}
        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <span>Посмотреть все отзывы ({activeTab === 'gyms' ? '42' : '28'})</span>
        <ArrowRight className="w-4 h-4 stroke-[1.5]" />
      </button>

      {/* Кнопка «Оставить отзыв» в отдельной плашке */}
      <button 
        onClick={onOpenAdd}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
      >
        <PlusCircle className="w-4 h-4 stroke-[1.5]" />
        <span>Оставить отзыв (помоги другим атлетам)</span>
      </button>

      <p className="text-[11px] text-slate-400 text-center px-2">
        Ваш реальный отзыв поможет другим атлетам сделать правильный выбор без разочарования.
      </p>
    </div>
  );
}
