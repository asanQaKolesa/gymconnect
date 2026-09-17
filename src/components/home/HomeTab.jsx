import React, { useState } from 'react';
import { appleTheme } from '../../ui/AppleTheme';
import { gymsharkQuotes } from '../../data/quotesData';

export default function HomeTab() {
  // Вычисляем цитату на основе текущего дня месяца (смена каждые 24 часа)
  const todayDate = new Date().getDate();
  const currentQuote = gymsharkQuotes[(todayDate - 1) % gymsharkQuotes.length];

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);

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
    <div className={`min-h-screen bg-[${appleTheme.colors.bg}] text-[${appleTheme.colors.primaryText}] px-4 py-4 space-y-5 max-w-md mx-auto pb-32 ${appleTheme.styles.fontFamily}`}>
      
      {/* Шапка: Подписка во всю ширину + уведомления */}
      <div className="flex items-center gap-3 pt-2">
        <div 
          onClick={() => alert('Переход к выбору абонемента Invictus Go!')}
          className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#0056B3] text-white rounded-[20px] p-4 shadow-[0_6px_20px_rgba(0,122,255,0.25)] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">Invictus Go • Алматы</div>
            <div className="text-[16px] font-bold tracking-tight mt-0.5">⚡ Оформить подписку</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            →
          </div>
        </div>
        
        <button 
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-14 h-14 rounded-[20px] bg-white border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex items-center justify-center text-[#000000] hover:bg-zinc-50 active:scale-95 transition-all relative shrink-0"
        >
          <svg className="w-6 h-6 text-zinc-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span>
        </button>
      </div>

      {notificationsOpen && (
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-black/[0.04] space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-[13px] font-bold uppercase text-zinc-500 tracking-wider">Уведомления</h3>
            <span className="text-[11px] text-[#007AFF] cursor-pointer" onClick={() => setNotificationsOpen(false)}>Закрыть</span>
          </div>
          <div className="p-3 bg-[#F2F2F7]/60 rounded-xl text-[13px] text-zinc-800">
            🔥 Опубликована новая платная статья: «Продуктовая корзина на осень».
          </div>
        </div>
      )}

      {/* МОТИВАЦИЯ ДНЯ (Импорт из отдельного файла с таймером 24 часа) */}
      <div className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.15)] relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-10">🦈</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0A84FF] bg-[#0A84FF]/20 px-2.5 py-1 rounded-full">
            Gymshark Vibe • День {todayDate}
          </span>
          <span className="text-[11px] text-zinc-400">Обновление через 24ч</span>
        </div>
        <p className="text-[15px] font-semibold leading-relaxed tracking-tight text-zinc-100 mt-2">
          "{currentQuote}"
        </p>
      </div>

      {/* КНОПКИ: Найти тренера / Стать тренером */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => alert('Поиск тренера: подбираем наставников под ваши цели!')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[20px] p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-xl mb-3">
            🎯
          </div>
          <div>
            <h3 className="font-semibold text-[#000000] text-[15px] tracking-tight">Найти тренера</h3>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">Персональный наставник</p>
          </div>
        </button>

        <button 
          onClick={() => alert('Кабинет тренера: публикация анкеты и поиск учеников.')}
          className="bg-white hover:bg-zinc-50 border border-black/[0.04] rounded-[20px] p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-[14px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center text-xl mb-3">
            💼
          </div>
          <div>
            <h3 className="font-semibold text-[#000000] text-[15px] tracking-tight">Стать тренером</h3>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">Найти клиентов</p>
          </div>
        </button>
      </div>

      {/* АКТИВНЫЙ ВЫЗОВ (ЧЕЛЛЕНДЖ) */}
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            🔥 Вызов дня
          </span>
          <span className="text-[11px] text-[#8E8E93]">Осталось 14 часов</span>
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-black tracking-tight">100 бёрпи за 10 минут</h3>
          <p className="text-[13px] text-[#8E8E93] mt-0.5">Проверь свою выносливость и попади в топ комьюнити GymConnect.</p>
        </div>
        <button 
          onClick={() => setChallengeAccepted(!challengeAccepted)}
          className={`w-full py-3 rounded-[14px] font-semibold text-[14px] transition-all ${
            challengeAccepted 
              ? 'bg-[#34C759] text-white shadow-md' 
              : 'bg-[#F2F2F7] text-black hover:bg-zinc-200'
          }`}
        >
          {challengeAccepted ? '✓ Вызов принят! Удачи в зале' : 'Принять вызов'}
        </button>
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
