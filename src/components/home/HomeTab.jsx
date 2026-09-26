// src/components/home/HomeTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import HomeHeader from './HomeHeader';
import DailyQuote from './DailyQuote';
import WorkoutStreak from './WorkoutStreak';
import ActionGrid from './ActionGrid';
import TodayPlan from './TodayPlan';
import HomeChallenges from './HomeChallenges';
import HomeArticles from './HomeArticles';
import { CreditCard, X, ChevronRight, Percent, Trophy, MapPin } from 'lucide-react';

// Встроенный компонент баннер-карусели (не требует отдельного файла и не ломает импорты)
function HomePromoCarousel({ onOpenSub }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const banners = [
    {
      id: 1,
      tag: 'Спецпредложение',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      title: 'Скидки до -30% на абонементы в залы Алматы',
      desc: 'Выгодные клубные карты в Invictus, FitnessBlitz и 1Fit через GymConnect Pass.',
      icon: <Percent className="w-4 h-4 text-emerald-600" />,
      badge: 'Выгода',
      bgGradient: 'from-emerald-500/10 via-transparent to-blue-500/5'
    },
    {
      id: 2,
      tag: 'Турнир GymConnect',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
      title: 'Открытый кубок Алматы по жиму лежа',
      desc: 'Регистрируйтесь в боте, соревнуйтесь с атлетами своего веса и забирайте призы.',
      icon: <Trophy className="w-4 h-4 text-blue-600" />,
      badge: 'Призы 500k ₸',
      bgGradient: 'from-blue-500/10 via-transparent to-indigo-500/5'
    },
    {
      id: 3,
      tag: 'Новая локация',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200/60',
      title: 'Новый Invictus Go в Бостандыкском районе',
      desc: 'Уже добавлен на карту залов! Ищите напарников GymBro в новом клубе.',
      icon: <MapPin className="w-4 h-4 text-amber-600" />,
      badge: '230+ залов',
      bgGradient: 'from-amber-500/10 via-transparent to-orange-500/5'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[currentIndex];

  return (
    <div className="mb-3 select-none">
      <div
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 45) setCurrentIndex((prev) => (prev + 1) % banners.length);
          if (diff < -45) setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }}
        onClick={onOpenSub}
        className={`w-full bg-white rounded-3xl p-4 shadow-xs border border-slate-200/80 relative overflow-hidden cursor-pointer transition-all active:scale-99 bg-gradient-to-br ${currentBanner.bgGradient}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${currentBanner.tagColor}`}>
              {currentBanner.tag}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {currentIndex + 1} / {banners.length}
            </span>
          </div>

          <span className="text-[10.5px] font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {currentBanner.badge}
          </span>
        </div>

        <div className="space-y-1 pr-6">
          <h3 className="text-xs font-bold text-slate-900 leading-snug">
            {currentBanner.title}
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
            {currentBanner.desc}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-semibold">
            <span>Подробнее</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1">
            {banners.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeTab({ userProfile, onOpenSub, onNavigateTab }) {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleOpenSubscription = () => {
    if (typeof onOpenSub === 'function') {
      onOpenSub();
    } else {
      setIsProModalOpen(true);
    }
  };

  return (
    <div className="p-3.5 max-w-md mx-auto flex flex-col pb-10 select-none animate-in fade-in duration-200">
      
      {/* 1. Верхний бар с кнопкой PRO-подписки и центром уведомлений */}
      <HomeHeader 
        onOpenSub={handleOpenSubscription} 
      />

      {/* 2. Баннер-карусель анонсов и промо-акций */}
      <HomePromoCarousel 
        onOpenSub={handleOpenSubscription} 
      />

      {/* 3. Цитата дня Gymshark */}
      <DailyQuote />

      {/* 4. Стрик дисциплины и тренировок */}
      <WorkoutStreak />

      {/* 5. Витрина сервисов (6 направлений: Тренеры, Абонементы, Продажа, Специалисты, Спортпит, Одежда) */}
      <ActionGrid 
        onNavigateTab={onNavigateTab}
      />

      {/* 6. Блок «Сегодня по плану» (опущен под витрину сервисов) */}
      <TodayPlan 
        hasProgram={Boolean(userProfile?.workout_days && userProfile.workout_days.length > 0)}
        onOpenSettings={() => {
          if (typeof onNavigateTab === 'function') {
            onNavigateTab('profile');
          } else {
            alert('Настройка программы доступна во вкладке Профиль');
          }
        }}
      />

      {/* 7. Активные вызовы дня */}
      <HomeChallenges />

      {/* 8. База знаний и полезные статьи */}
      <HomeArticles />

      {/* МОДАЛЬНОЕ ОКНО ОФОРМЛЕНИЯ ПОДПИСКИ PRO */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">GymConnect PRO All-Access</h3>
                  <p className="text-[10px] text-slate-400">Премиум-доступ для атлетов Алматы</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <p className="font-bold text-slate-900">Что входит в подписку PRO:</p>
                <ul className="text-[11px] text-slate-700 space-y-1 list-disc pl-4">
                  <li>Безлимитный поиск и чаты с напарниками GymBro</li>
                  <li>Персональный конструктор тренировок и умный расчет КБЖУ</li>
                  <li>Партнерские скидки на абонементы в залы Алматы</li>
                  <li>Прямая связь с персональными тренерами</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center font-mono">
                <p className="text-[10px] text-slate-400 font-sans">Стоимость</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">2 990 ₸ / месяц</p>
              </div>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span>Оформить через Kaspi Pay</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
