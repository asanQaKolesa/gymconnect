import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';
import { gymsharkQuotes } from '../../data/quotesData';

export default function HomeTab() {
  const todayDate = new Date().getDate();
  const currentQuote = gymsharkQuotes[(todayDate - 1) % gymsharkQuotes.length];

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [challenge1Accepted, setChallenge1Accepted] = useState(false);
  const [challenge2Accepted, setChallenge2Accepted] = useState(false);

  const articles = [
    {
      id: 1,
      tag: "Питание & Психология",
      title: "Как грамотно составить рацион и не сорваться при дефиците",
      readTime: "4 мин чтения",
      badge: "PRO"
    },
    {
      id: 2,
      tag: "Закупка • Осень",
      title: "Идеальная продуктовая корзина на неделю для набора массы",
      readTime: "3 мин чтения",
      badge: "PRO"
    },
  ];

  return (
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-4 space-y-4 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* Шапка: Компактная подписка GymConnect + Уведомления */}
      <div className="flex items-center gap-2.5 pt-1">
        <div 
          onClick={() => alert('Маркетплейс абонементов во все фитнес-залы Алматы без менеджеров и скрытых цен!')}
          className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#0056B3] text-white rounded-[16px] px-4 py-3 shadow-[0_4px_16px_rgba(0,122,255,0.2)] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-blue-100">Маркетплейс Алматы</div>
            <div className="text-[14px] font-bold tracking-tight">⚡ Оформить подписку GymConnect</div>
          </div>
          <span className="text-sm font-bold bg-white/20 w-7 h-7 rounded-full flex items-center justify-center">→</span>
        </div>
        
        <button 
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-12 h-12 rounded-[16px] bg-white border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-black hover:bg-zinc-50 active:scale-95 transition-all relative shrink-0"
        >
          <svg className="w-5 h-5 text-zinc-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF3B30]"></span>
        </button>
      </div>

      {notificationsOpen && (
        <div className="bg-white rounded-[18px] p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-black/[0.04] space-y-1.5 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-[12px] font-bold uppercase text-zinc-400 tracking-wider">Уведомления</h3>
            <span className="text-[11px] text-[#007AFF] cursor-pointer" onClick={() => setNotificationsOpen(false)}>Закрыть</span>
          </div>
          <div className="p-2.5 bg-[#F2F2F7]/70 rounded-xl text-[13px] text-zinc-800">
            🚀 Скоро открытие прямого бронирования абонементов во все залы без WhatsApp-менеджеров!
          </div>
        </div>
      )}

      {/* ТОНКАЯ ЦИТАТА ДНЯ (Gymshark Vibe) */}
      <div className="bg-[#1C1C1E] text-white rounded-[18px] px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center gap-3">
        <span className="text-xl shrink-0">🦈</span>
        <p className="text-[13px] font-medium leading-snug tracking-tight text-zinc-200">
          "{currentQuote}"
        </p>
      </div>

      {/* ОСНОВНАЯ СЕТКА ДЕЙСТВИЙ (4 ПЛИТКИ) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Плитка 1: Найти тренера */}
        <button 
          onClick={() => alert('Поиск персонального тренера под ваши задачи.')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[18px] p-3.5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-base mb-2">
            🎯
          </div>
          <div>
            <h3 className="font-semibold text-black text-[14px] tracking-tight">Найти тренера</h3>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Персональный наставник</p>
          </div>
        </button>

        {/* Плитка 2: Найти клиентов */}
        <button 
          onClick={() => alert('Кабинет тренера: поиск учеников и публикация анкеты.')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[18px] p-3.5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center text-base mb-2">
            💼
          </div>
          <div>
            <h3 className="font-semibold text-black text-[14px] tracking-tight">Найти клиентов</h3>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Для фитнес-тренеров</p>
          </div>
        </button>

        {/* Плитка 3: Оставить отзыв */}
        <button 
          onClick={() => alert('Бесплатные верифицированные отзывы о залах Алматы.')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[18px] p-3.5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center text-base mb-2">
            ✓
          </div>
          <div>
            <h3 className="font-semibold text-black text-[14px] tracking-tight">Оставить отзыв</h3>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">Честно и без накрутки</p>
          </div>
        </button>

        {/* Плитка 4: Купить абонемент */}
        <button 
          onClick={() => alert('Каталог всех залов Алматы с реальными ценами и без WhatsApp менеджеров.')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[18px] p-3.5 text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center text-base mb-2">
            🎟️
          </div>
          <div>
            <h3 className="font-semibold text-black text-[14px] tracking-tight">Купить абонемент</h3>
            <p className="text-[10px] text-[#8E8E93] mt-0.5">В любой фитнес-зал</p>
          </div>
        </button>
      </div>

      {/* ВЫЗОВЫ ДНЯ (ЧЕЛЛЕНДЖИ) */}
      <div className="space-y-2.5">
        <h2 className={appleTheme.styles.sectionTitle}>Активные вызовы дня</h2>
        
        {/* Челлендж 1 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              🔥 Вызов #1
            </span>
            <span className="text-[11px] text-[#8E8E93]">100 бёрпи</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-black text-[15px] tracking-tight">100 бёрпи за 10 минут</h4>
              <p className="text-[12px] text-[#8E8E93]">Проверь взрывную выносливость</p>
            </div>
            <button 
              onClick={() => setChallenge1Accepted(!challenge1Accepted)}
              className={`px-4 py-2 rounded-[12px] font-semibold text-[13px] transition-all ${
                challenge1Accepted ? 'bg-[#34C759] text-white' : 'bg-[#007AFF] text-white'
              }`}
            >
              {challenge1Accepted ? 'Принято ✓' : 'Участвовать'}
            </button>
          </div>
        </div>

        {/* Челлендж 2 */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              💪 Вызов #2
            </span>
            <span className="text-[11px] text-[#8E8E93]">Кор & Пресс</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-black text-[15px] tracking-tight">Планка 3 минуты х 3 подхода</h4>
              <p className="text-[12px] text-[#8E8E93]">Ежедневный вызов для стального кор</p>
            </div>
            <button 
              onClick={() => setChallenge2Accepted(!challenge2Accepted)}
              className={`px-4 py-2 rounded-[12px] font-semibold text-[13px] transition-all ${
                challenge2Accepted ? 'bg-[#34C759] text-white' : 'bg-[#007AFF] text-white'
              }`}
            >
              {challenge2Accepted ? 'Принято ✓' : 'Участвовать'}
            </button>
          </div>
        </div>
      </div>

      {/* КАРУСЕЛЬ ПОЛЕЗНЫХ СТАТЕЙ */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <h2 className={appleTheme.styles.sectionTitle + " !mb-0 !px-0"}>Полезные статьи & База</h2>
          <span className="text-[12px] text-[#007AFF] font-medium cursor-pointer">Все (PRO)</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {articles.map((art) => (
            <div 
              key={art.id}
              onClick={() => alert(`Открытие статьи: ${art.title}`)}
              className="min-w-[260px] max-w-[260px] bg-white rounded-[20px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-black/[0.04] flex flex-col justify-between cursor-pointer hover:border-[#007AFF] transition-all shrink-0"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-semibold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md">
                    {art.tag}
                  </span>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    {art.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-black text-[14px] leading-snug tracking-tight">
                  {art.title}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-zinc-100 text-[11px] text-[#8E8E93]">
                <span>📖 {art.readTime}</span>
                <span className="text-[#007AFF] font-medium">Читать →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
