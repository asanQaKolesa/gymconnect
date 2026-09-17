import React from 'react';
import { appleTheme } from '../../ui/AppleTheme';

export default function ReviewsTab() {
  const reviewsList = [
    {
      id: 1,
      gym: "Invictus Go (Навои)",
      author: "Асанәли Е.",
      rating: 5,
      date: "Вчера, 19:40",
      text: "Отличный зал, вентиляция работает на ура, много свободного веса. Народу вечером много, но тренажеры свободные найти можно.",
      verified: true
    },
    {
      id: 2,
      gym: "Fidelity (Достык)",
      author: "Тимур К.",
      rating: 4,
      date: "3 дня назад",
      text: "Премиум уровень чувствуется во всем, бассейн чистый. Из минусов — парковка по вечерам забита.",
      verified: true
    }
  ];

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-4 space-y-5 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* Шапка раздела */}
      <div className="pt-3 pb-1">
        <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">GymConnect Community</span>
        <h1 className="text-[32px] font-bold tracking-tight text-[#000000] leading-none mt-1">Честные отзывы</h1>
        <p className="text-[13px] text-[#8E8E93] mt-1.5">Никакой накрутки. Только проверенные атлеты с клубными картами алматинских залов.</p>
      </div>

      {/* Кнопка действия */}
      <button 
        onClick={() => alert('Открытие формы верификации клубной карты для написания отзыва.')}
        className={appleTheme.styles.buttonPrimary}
      >
        + Оставить отзыв о своем зале
      </button>

      {/* Список отзывов */}
      <div className="space-y-3 pt-2">
        <h2 className={appleTheme.styles.sectionTitle}>Последние верифицированные</h2>

        {reviewsList.map((item) => (
          <div key={item.id} className={appleTheme.styles.card}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md">
                  {item.gym}
                </span>
                <h3 className="font-bold text-black text-[15px] tracking-tight mt-1">
                  {item.author} {item.verified && <span className="text-xs text-[#34C759]">✓ проверен</span>}
                </h3>
              </div>
              <div className="text-amber-500 font-bold text-sm">
                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
              </div>
            </div>

            <p className="text-[13px] text-zinc-700 leading-relaxed mt-2">
              "{item.text}"
            </p>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-100 text-[11px] text-[#8E8E93]">
              <span>{item.date}</span>
              <span className="text-[#007AFF] cursor-pointer font-medium">Полезно 👍 (12)</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
