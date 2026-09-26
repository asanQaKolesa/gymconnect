// src/components/home/HomeTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import HomeHeader from './HomeHeader';
import ActionGrid from './ActionGrid';
import DailyQuote from './DailyQuote';
import HomeChallenges from './HomeChallenges';
import HomeArticles from './HomeArticles';
import { 
  CreditCard, 
  X, 
  ChevronRight, 
  Percent, 
  Trophy, 
  MapPin, 
  Activity, 
  Check 
} from 'lucide-react';

// Встроенная баннер-карусель анонсов и турниров
function HomePromoCarousel({ onOpenSub }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const banners = [
    {
      id: 1,
      tag: 'Спецпредложение',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
      title: 'Скидки до -30% на абонементы в залы Алматы',
      desc: 'Выгодные клубные карты в Invictus, FitnessBlitz и 1Fit через GymConnect Pass.',
      icon: <Percent className="w-4 h-4 text-slate-800" />,
      badge: 'Выгода',
      bgGradient: 'from-slate-100 via-white to-blue-50/30'
    },
    {
      id: 2,
      tag: 'Турнир GymConnect',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
      title: 'Открытый кубок Алматы по жиму лежа',
      desc: 'Регистрируйтесь в боте, соревнуйтесь с атлетами своего веса и забирайте призы.',
      icon: <Trophy className="w-4 h-4 text-slate-800" />,
      badge: 'Призы 500k ₸',
      bgGradient: 'from-slate-100 via-white to-slate-50'
    },
    {
      id: 3,
      tag: 'Новая локация',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
      title: 'Новый Invictus Go в Бостандыкском районе',
      desc: 'Уже добавлен на карту залов! Ищите напарников GymBro в новом клубе.',
      icon: <MapPin className="w-4 h-4 text-slate-800" />,
      badge: '230+ залов',
      bgGradient: 'from-slate-100 via-white to-blue-50/20'
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
    <div className="mb-3.5 select-none">
      <div
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 45) setCurrentIndex((prev) => (prev + 1) % banners.length);
          if (diff < -45) setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
        }}
        onClick={onOpenSub}
        className={`w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 relative overflow-hidden cursor-pointer transition-all active:scale-99 bg-gradient-to-br ${currentBanner.bgGradient}`}
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

          <span className="text-[10px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
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
                  currentIndex === idx ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Виджет «Пульс залов Алматы в реальном времени»
function LiveGymTrafficWidget() {
  const gymsStatus = [
    { name: 'Invictus Go (Mega Park)', status: 'Умеренно', color: 'bg-emerald-500', note: 'Свободны стойки жима' },
    { name: 'FitnessBlitz (Достык)', status: 'Час пик', color: 'bg-amber-500', note: 'Плотная зона свободных весов' },
    { name: 'Adrenaline (Абая)', status: 'Свободно', color: 'bg-emerald-500', note: 'Идеальное время для сессии' }
  ];

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 mb-3.5 select-none space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
            <Activity className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">Пульс залов Алматы</h4>
            <p className="text-[10px] text-slate-400">Загруженность клубов в реальном времени</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
          Live
        </span>
      </div>

      <div className="space-y-1.5">
        {gymsStatus.map((g, idx) => (
          <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
            <div className="overflow-hidden pr-2">
              <p className="font-semibold text-slate-900 truncate">{g.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{g.note}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${g.color}`} />
              <span className="text-[10.5px] font-medium text-slate-700">{g.status}</span>
            </div>
          </div>
        ))}
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
    <div className="p-3.5 max-w-md mx-auto flex flex-col pb-8 select-none animate-in fade-in duration-200">
      
      {/* 1. Баннер-карусель анонсов и промо-акций (поднята на самый верх) */}
      <HomePromoCarousel 
        onOpenSub={handleOpenSubscription} 
      />

      {/* 2. Сервисы GymConnect (подняты выше, полностью монохромные) */}
      <ActionGrid 
        onNavigateTab={onNavigateTab}
      />

      {/* 3. Премиальный блок подписки PRO и социальное доказательство с аватарами */}
      <HomeHeader 
        onOpenSub={handleOpenSubscription} 
      />

      {/* 4. Пульс залов Алматы (интерактивная загрузка в реальном времени) */}
      <LiveGymTrafficWidget />

      {/* 5. Обновленная минималистичная цитата дня от Gymshark */}
      <DailyQuote />

      {/* 6. Активные вызовы дня (монохромные карточки) */}
      <HomeChallenges />

      {/* 7. База знаний и полезные статьи */}
      <HomeArticles />

      {/* МОДАЛЬНОЕ ОКНО ОФОРМЛЕНИЯ ПОДПИСКИ PRO */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                  <CreditCard className="w-4 h-4 stroke-[2]" />
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
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md"
            >
              <span>Оформить через Kaspi Pay</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
