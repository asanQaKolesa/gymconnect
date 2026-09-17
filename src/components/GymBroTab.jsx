import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const GOALS = [
  'Совместные тренировки',
  'Новая дружба & фитнес',
  'Поиск комьюнити'
];

const SCOPES = [
  'Только мой зал',
  'Любой зал в городе'
];

const SPLITS = [
  'Грудные + Трицепс',
  'Спина + Бицепс',
  'День ног + Плечи',
  'Тяни-Толкай (Push-Pull)',
  'Фулбоди (Fullbody)'
];

const TIME_SLOTS = [
  'Утро (07:00 – 11:00)',
  'День (12:00 – 16:00)',
  'Вечер (18:00 – 22:00)'
];

const LEVELS = [
  'Новичок (до 1 года)',
  'Любитель (1–3 года)',
  'Опытный (3+ года / База)'
];

export default function GymBroTab({
  myCard,
  user,
  cards = [],
  onSaveCard,
  onRefreshCards,
  onOpenPaywall,
  isSaving
}) {
  const [isEditingCard, setIsEditingCard] = useState(!myCard);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const myTgId = Number(user?.telegram_id || 0);

  // Исключаем только тех, с кем РЕАЛЬНО есть активная связь в Supabase
  const [activeRelations, setActiveRelations] = useState([]);
  const [incomingLikers, setIncomingLikers] = useState([]);

  // Локальные пропуски только в рамках текущей сессии
  const [sessionPassedIds, setSessionPassedIds] = useState([]);
  const [lastSwipedCard, setLastSwipedCard] = useState(null);

  // Фильтры
  const [gymFilter, setGymFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: myCard?.name || user?.name || '',
    gender: myCard?.gender || user?.gender || 'Парень',
    city: myCard?.city || user?.city || 'Алматы',
    weekday_gym: myCard?.weekday_gym || 'Invictus Fitness',
    weekend_gym: myCard?.weekend_gym || '',
    search_goal: myCard?.search_goal || 'Совместные тренировки',
    search_scope: myCard?.search_scope || 'Только мой зал',
    split: myCard?.split || 'Грудные + Трицепс',
    time_slot: myCard?.time_slot || 'Вечер (18:00 – 22:00)',
    level: myCard?.level || 'Любитель (1–3 года)',
    bio: myCard?.bio || user?.bio || '',
    instagram: myCard?.instagram || user?.instagram || '',
    photo_url: myCard?.photo_url || user?.avatar_url || ''
  });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Очищаем старый застрявший localStorage с прошлых тестов
  useEffect(() => {
    if (myTgId) {
      localStorage.removeItem(`gym_passed_${myTgId}`);
    }
  }, [myTgId]);

  // Загружаем связи напрямую из Supabase
  async function loadRelations() {
    if (!myTgId) return;
    try {
      // 1. Мои исходящие (pending или accepted)
      const { data: myOut } = await supabase
        .from('friendships')
        .select('friend_id, status')
        .eq('user_id', myTgId);

      // 2. Входящие подтвержденные (accepted)
      const { data: acceptedIn } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('friend_id', myTgId)
        .eq('status', 'accepted');

      // 3. Входящие ожидающие (pending) - они ДОЛЖНЫ показываться первыми
      const { data: pendingIn } = await supabase
        .from('friendships')
        .select('user_id')
        .eq('friend_id', myTgId)
        .eq('status', 'pending');

      const excluded = [
        ...(myOut || []).map(r => Number(r.friend_id)),
        ...(acceptedIn || []).map(r => Number(r.user_id))
      ];

      setActiveRelations(excluded);

      if (pendingIn) {
        setIncomingLikers(pendingIn.map(d => Number(d.user_id)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadRelations();
  }, [myTgId]);

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setFormData(prev => ({ ...prev, photo_url: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Сброс истории текущей сессии
  function handleResetDeck() {
    setSessionPassedIds([]);
    setLastSwipedCard(null);
    setCurrentIndex(0);
    loadRelations();
    if (onRefreshCards) onRefreshCards();
  }

  // Фильтрация колоды
  const activeDeck = cards
    .filter(c => {
      const cardTgId = Number(c.telegram_id);
      if (cardTgId === myTgId) return false;

      // Если в базе есть активная связь (уже друзья или отправлен запрос)
      if (activeRelations.includes(cardTgId)) return false;

      // Если пропущен в текущей сессии
      if (sessionPassedIds.includes(cardTgId)) return false;

      if (gymFilter === 'my_gym' && formData.weekday_gym) {
        if (c.weekday_gym?.toLowerCase() !== formData.weekday_gym?.toLowerCase()) return false;
      }

      if (goalFilter !== 'all') {
        if (c.search_goal !== goalFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Тот, кто лайкнул меня, всегда идет первым!
      const aLikesMe = incomingLikers.includes(Number(a.telegram_id));
      const bLikesMe = incomingLikers.includes(Number(b.telegram_id));
      if (aLikesMe && !bLikesMe) return -1;
      if (!aLikesMe && bLikesMe) return 1;
      return 0;
    });

  const currentCard = activeDeck[currentIndex];
  const isCurrentCardLikingMe = currentCard ? incomingLikers.includes(Number(currentCard.telegram_id)) : false;

  function handleTouchStart(e) {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 60) {
      handlePass();
    } else if (diff < -60) {
      handleConnect();
    }
  }

  // Пропуск в рамках текущей сессии
  function handlePass() {
    if (!currentCard) return;
    const targetTgId = Number(currentCard.telegram_id);

    setLastSwipedCard({ card: currentCard, action: 'pass' });
    setSessionPassedIds(prev => [...prev, targetTgId]);

    if (currentIndex >= activeDeck.length - 1) {
      setCurrentIndex(0);
    }
  }

  // Откат назад ↩️
  function handleRewind() {
    if (!lastSwipedCard) return;
    const targetTgId = Number(lastSwipedCard.card.telegram_id);

    setSessionPassedIds(prev => prev.filter(id => id !== targetTgId));
    setActiveRelations(prev => prev.filter(id => id !== targetTgId));
    setLastSwipedCard(null);
    setCurrentIndex(0);
  }

  // Коннект
  async function handleConnect() {
    if (!currentCard) return;
    const targetTgId = Number(currentCard.telegram_id);

    setLastSwipedCard({ card: currentCard, action: 'connect' });
    setActiveRelations(prev => [...prev, targetTgId]);

    try {
      if (isCurrentCardLikingMe) {
        // ВЗАИМНЫЙ МЭТЧ!
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('user_id', targetTgId)
          .eq('friend_id', myTgId);

        setMatchResult({
          isMutual: true,
          targetUser: currentCard
        });
        setIncomingLikers(prev => prev.filter(id => id !== targetTgId));
      } else {
        // Односторонняя заявка
        await supabase.from('friendships').insert([
          { user_id: myTgId, friend_id: targetTgId, status: 'pending' }
        ]);

        setMatchResult({
          isMutual: false,
          targetUser: currentCard
        });
      }
    } catch (e) {
      console.error(e);
      setMatchResult({
        isMutual: false,
        targetUser: currentCard
      });
    }

    if (currentIndex >= activeDeck.length - 1) {
      setCurrentIndex(0);
    }
  }

  function handleSubmitForm(e) {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Укажите ваше имя');
    onSaveCard(formData);
    setIsEditingCard(false);
  }

  return (
    <div className="space-y-3 pb-8 select-none">
      {/* 1. ЭКРАН РЕЗУЛЬТАТА СВАЙПА */}
      {matchResult && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-6 text-center space-y-4 border border-white/10 rounded-3xl animate-in zoom-in-95 duration-200">
            {matchResult.isMutual ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-[#FF5A1F] flex items-center justify-center text-3xl mx-auto shadow-xl shadow-[#FF5A1F]/30 animate-bounce">
                  ⚡️
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#FF8C38] uppercase tracking-widest block">
                    IT'S A GYMBRO MATCH!
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Вы оба готовы тренироваться!
                  </h3>
                  <p className="text-xs text-slate-300 pt-1">
                    Вы с атлетом <strong className="text-white">{matchResult.targetUser.name}</strong> теперь напарники в GymConnect.
                  </p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-[11px] text-slate-300">
                  📍 {matchResult.targetUser.weekday_gym} • 💪 {matchResult.targetUser.split}
                </div>

                {matchResult.targetUser.telegram_username ? (
                  <a
                    href={`https://t.me/${matchResult.targetUser.telegram_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-1.5 no-underline block shadow-lg shadow-[#FF5A1F]/30"
                  >
                    <span>💬 Написать в Telegram (@{matchResult.targetUser.telegram_username}) ➔</span>
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    У напарника скрыт юзернейм, он добавлен в твои друзья.
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="text-4xl block">🤝</span>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white tracking-tight">
                    Запрос отправлен
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Заявка на тренировку ушла атлету <strong className="text-white">{matchResult.targetUser.name}</strong>.
                  </p>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-[11px] text-slate-400">
                  🔒 Контакты Telegram откроются обоим, как только напарник ответит взаимным свайпом.
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setMatchResult(null)}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 cursor-pointer transition"
            >
              Продолжить поиск напарников
            </button>
          </div>
        </div>
      )}

      {/* 2. ДЕТАЛЬНОЕ ДОСЬЕ АТЛЕТА */}
      {showDetailModal && currentCard && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-3.5 border border-white/10 rounded-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Досье кандидата GymBro
              </span>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white text-base px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#121622] border-2 border-white/10 shadow-lg">
                {currentCard.photo_url ? (
                  <img src={currentCard.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                    {currentCard.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              <h3 className="text-base font-black text-white">{currentCard.name}</h3>
              <p className="text-xs text-slate-400">{currentCard.city} • {currentCard.level}</p>
            </div>

            {isCurrentCardLikingMe && (
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-[#FF5A1F]/20 border border-amber-500/40 text-center">
                <span className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                  <span>🔥</span> Этот атлет уже хочет тренироваться с тобой!
                </span>
              </div>
            )}

            <div className="p-2.5 rounded-2xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-center">
              <span className="text-[9px] text-[#FF8C38] font-bold uppercase block">Цель знакомства:</span>
              <span className="text-xs font-black text-white">{currentCard.search_goal || 'Совместные тренировки'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 block">Зал:</span>
                <span className="text-white font-semibold truncate block">{currentCard.weekday_gym}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 block">Сплит:</span>
                <span className="text-white font-semibold truncate block">{currentCard.split}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 block">Время:</span>
                <span className="text-white font-semibold truncate block">{currentCard.time_slot}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 block">Радиус:</span>
                <span className="text-white font-semibold truncate block">{currentCard.search_scope || 'Мой зал'}</span>
              </div>
            </div>

            {currentCard.bio && (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">О себе</span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{currentCard.bio}</p>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-center space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                <span>🔒</span> Связь в Telegram: <strong className="text-slate-500">t.me/••••••••</strong>
              </span>
              <p className="text-[9px] text-slate-500">
                Контакт станет доступен после взаимного свайпа
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDetailModal(false);
                handleConnect();
              }}
              className="w-full gymshark-btn-electric py-3 text-xs font-bold cursor-pointer"
            >
              {isCurrentCardLikingMe ? 'Взаимный мэтч! 🤝🔥' : 'Предложить тренировку 🤝'}
            </button>
          </div>
        </div>
      )}

      {/* 3. РЕДАКТИРОВАНИЕ АНКЕТЫ */}
      {isEditingCard ? (
        <div className="apple-glass p-4 space-y-3.5 border border-white/[0.08] rounded-3xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {myCard ? 'Настройки анкеты GymBro' : 'Создание анкеты GymBro'}
              </h3>
              <p className="text-[10px] text-slate-400">Заполни карточку, чтобы другие атлеты могли тебя найти</p>
            </div>
            {myCard && (
              <button
                type="button"
                onClick={() => setIsEditingCard(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                ✕ Отмена
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-3">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#121622] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-md">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="GymBro" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📸</span>
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[11px] font-bold text-white block">Фото для карточки</span>
                <label className="inline-block px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer active:scale-95 transition">
                  <span>Выбрать из галереи 📷</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Цель поиска напарника
              </label>
              <select
                value={formData.search_goal}
                onChange={e => setFormData({ ...formData, search_goal: e.target.value })}
                className="w-full apple-input text-xs py-2"
              >
                {GOALS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Основной зал
                </label>
                <input
                  type="text"
                  required
                  placeholder="Invictus, Blitz..."
                  value={formData.weekday_gym}
                  onChange={e => setFormData({ ...formData, weekday_gym: e.target.value })}
                  className="w-full apple-input text-xs py-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Радиус поиска
                </label>
                <select
                  value={formData.search_scope}
                  onChange={e => setFormData({ ...formData, search_scope: e.target.value })}
                  className="w-full apple-input text-xs py-2"
                >
                  {SCOPES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Сплит
                </label>
                <select
                  value={formData.split}
                  onChange={e => setFormData({ ...formData, split: e.target.value })}
                  className="w-full apple-input text-xs py-2"
                >
                  {SPLITS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Время
                </label>
                <select
                  value={formData.time_slot}
                  onChange={e => setFormData({ ...formData, time_slot: e.target.value })}
                  className="w-full apple-input text-xs py-2"
                >
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Уровень подготовки
              </label>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className="w-full apple-input text-xs py-2"
              >
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                О себе в зале
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Жму 100 на 5, ищу напарника..."
                className="w-full apple-input text-xs py-2 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full gymshark-btn-electric py-3 text-xs font-bold shadow-lg shadow-[#FF5A1F]/20 cursor-pointer"
            >
              {isSaving ? 'Сохраняем анкету...' : 'Сохранить и начать поиск ➔'}
            </button>

            {/* Кнопка сброса истории для тестирования */}
            <button
              type="button"
              onClick={handleResetDeck}
              className="w-full py-2 text-[10px] font-semibold text-slate-500 hover:text-slate-300 text-center cursor-pointer block pt-2"
            >
              🔄 Сбросить историю просмотров (для тестов)
            </button>
          </form>
        </div>
      ) : (
        /* ================= 4. ЭКРАН СВАЙПОВ TINDER ================= */
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setGymFilter(gymFilter === 'all' ? 'my_gym' : 'all')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex-shrink-0 ${
                  gymFilter === 'my_gym'
                    ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                }`}
              >
                📍 {gymFilter === 'my_gym' ? 'Только мой зал' : 'Все залы'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (goalFilter === 'all') setGoalFilter('Совместные тренировки');
                  else if (goalFilter === 'Совместные тренировки') setGoalFilter('Новая дружба & фитнес');
                  else setGoalFilter('all');
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex-shrink-0 ${
                  goalFilter !== 'all'
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                }`}
              >
                🎯 {goalFilter === 'all' ? 'Все цели' : goalFilter}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingCard(true)}
              className="px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold text-[#FF8C38] flex-shrink-0 hover:bg-white/[0.06] cursor-pointer"
            >
              Моя анкета ✏️
            </button>
          </div>

          {currentCard ? (
            <div className="space-y-3">
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => setShowDetailModal(true)}
                className={`relative w-full h-[420px] rounded-3xl overflow-hidden bg-[#10141f] border shadow-2xl cursor-pointer active:scale-[0.99] transition duration-200 ${
                  isCurrentCardLikingMe
                    ? 'border-amber-500/80 ring-2 ring-amber-500/30 shadow-amber-500/20'
                    : 'border-white/10'
                }`}
              >
                {currentCard.photo_url ? (
                  <img
                    src={currentCard.photo_url}
                    alt={currentCard.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#141926] to-[#0a0d14] text-slate-500">
                    <span className="text-6xl">🏋️‍♂️</span>
                    <span className="text-xs mt-2 font-medium">Фото не загружено</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 inset-x-3.5 flex justify-between items-start pointer-events-none gap-2">
                  {isCurrentCardLikingMe ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#FF5A1F] text-white shadow-lg shadow-amber-500/40 animate-pulse">
                      ⚡️ Хочет тренироваться с тобой!
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white truncate">
                      🎯 {currentCard.search_goal || 'Тренировки'}
                    </span>
                  )}

                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FF5A1F]/90 backdrop-blur-md text-white shadow-md flex-shrink-0">
                    {currentCard.weekday_gym || 'Зал'}
                  </span>
                </div>

                <div className="absolute bottom-4 inset-x-4 space-y-1.5 pointer-events-none">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                      {currentCard.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-300">
                      {currentCard.city}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-200">
                    <span className="px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-md">
                      💪 {currentCard.split}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-md">
                      ⏰ {currentCard.time_slot?.split(' ')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/15 backdrop-blur-md">
                      ⚡️ {currentCard.level?.split(' ')[0]}
                    </span>
                  </div>

                  {currentCard.bio && (
                    <p className="text-xs text-slate-300 line-clamp-2 pt-0.5 drop-shadow">
                      {currentCard.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* 4 КНОПКИ ДЕЙСТВИЙ */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  disabled={!lastSwipedCard}
                  onClick={handleRewind}
                  className="w-11 h-11 rounded-full bg-white/[0.04] border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 flex items-center justify-center text-base shadow active:scale-90 transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Вернуть предыдущую анкету"
                >
                  ↩️
                </button>

                <button
                  type="button"
                  onClick={handlePass}
                  className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 flex items-center justify-center text-xl shadow-lg active:scale-90 transition cursor-pointer"
                  title="Пропустить"
                >
                  ✕
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(true)}
                  className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 flex items-center justify-center text-sm shadow active:scale-90 transition cursor-pointer"
                  title="Подробнее"
                >
                  ℹ️
                </button>

                <button
                  type="button"
                  onClick={handleConnect}
                  className={`w-14 h-14 rounded-full text-white flex items-center justify-center text-2xl shadow-xl active:scale-90 transition cursor-pointer ${
                    isCurrentCardLikingMe
                      ? 'bg-gradient-to-tr from-amber-500 via-[#FF5A1F] to-emerald-400 ring-4 ring-amber-500/30 animate-pulse'
                      : 'bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] shadow-[#FF5A1F]/30'
                  }`}
                  title="Законнектиться"
                >
                  🤝
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center apple-glass border border-white/[0.08] rounded-3xl space-y-3 py-14">
              <span className="text-4xl block">🏋️‍♂️🏁</span>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">Все доступные анкеты просмотрены!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Все напарники, с которыми ты уже подружился, находятся во вкладке «Друзья».
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDeck}
                  className="gymshark-btn-electric px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Обновить ленту 🔄
                </button>
                {lastSwipedCard && (
                  <button
                    type="button"
                    onClick={handleRewind}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] border border-amber-500/30 text-xs font-semibold text-amber-400 hover:text-white cursor-pointer"
                  >
                    Вернуть последнюю ↩️
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
