import React, { useState } from 'react';

const MOTIVATION_QUOTES = [
  {
    quote: 'Последние три или четыре повторения — это то, что заставляет мышцы расти. Эта зона боли отличает чемпиона от того, кто им не станет.',
    author: 'Арнольд Шварценеггер',
    tag: 'Mental Strength'
  },
  {
    quote: 'Единственный человек, с которым ты соревнуешься каждое утро перед зеркалом — это ты сам вчерашний.',
    author: 'Крис Бамстед (CBum)',
    tag: 'Discipline'
  },
  {
    quote: 'Легкий вес, детка! Если бы это было легко, все вокруг были бы чемпионами.',
    author: 'Ронни Коулмэн',
    tag: 'Hard Work'
  },
  {
    quote: 'Когда твой разум говорит тебе, что ты выложился на 100%, на самом деле ты потратил только 40% своего потенциала.',
    author: 'Дэвид Гоггинс',
    tag: 'No Limits'
  },
  {
    quote: 'Не считай повторения, пока не станет тяжело. Начинай считать только тогда, когда начинает жечь.',
    author: 'Мухаммед Али',
    tag: 'Focus'
  },
  {
    quote: 'Победа куется в пустом зале в 7 утра, когда никто не видит и никто не аплодирует.',
    author: 'Дориан Йейтс',
    tag: 'Obsession'
  },
  {
    quote: 'Никаких оправданий. Либо ты делаешь этот подход, либо идешь домой.',
    author: 'Том Платц',
    tag: 'Intensity'
  }
];

export default function DailyFuel() {
  const [copied, setCopied] = useState(false);

  // Выбираем цитату дня по текущей дате
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const quoteIndex = dayOfYear % MOTIVATION_QUOTES.length;
  const daily = MOTIVATION_QUOTES[quoteIndex];

  function handleCopy() {
    const textToShare = `«${daily.quote}» — ${daily.author}\n\n⚡️ GymConnect Community`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-[#1b1512] via-[#10141f] to-[#0a0d14] border border-amber-500/20 shadow-xl space-y-2.5">
      {/* Мягкое неоновое свечение на фоне */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#FF5A1F]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Верхняя строка: бейджик и кнопка поделиться */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">⚡️</span>
          <span className="text-[9px] font-black tracking-widest uppercase text-[#FF8C38]">
            DAILY FUEL • ЗАРЯД ДНЯ
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[10px] font-semibold text-slate-300 active:scale-95 transition cursor-pointer"
        >
          {copied ? (
            <>
              <span className="text-emerald-400">✓</span>
              <span className="text-emerald-300">Скопировано</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Поделиться</span>
            </>
          )}
        </button>
      </div>

      {/* Цитата */}
      <blockquote className="text-xs text-slate-200 font-medium leading-relaxed italic pr-2">
        "{daily.quote}"
      </blockquote>

      {/* Автор и тег */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
        <span className="text-[11px] font-bold text-white tracking-tight">
          — {daily.author}
        </span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-[#FF5A1F]/15 text-[#FF8C38] border border-[#FF5A1F]/20">
          #{daily.tag}
        </span>
      </div>
    </div>
  );
}
