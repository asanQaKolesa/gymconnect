// src/components/gymbro/GymBroTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  X, 
  Heart, 
  Zap, 
  MapPin, 
  SlidersHorizontal, 
  Users, 
  Check, 
  Sparkles, 
  Clock, 
  Lock, 
  Crown, 
  BookOpen, 
  MessageCircle, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function GymBroTab({ userProfile }) {
  // Профиль атлета из пропсов или локального хранилища
  const currentProfile = userProfile || (() => {
    try {
      const saved = localStorage.getItem('gymconnect_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isPro = Boolean(currentProfile?.is_pro);
  const myGym = currentProfile?.gym || 'Invictus Go (Mega Park)';

  // Режимы экрана: 'cards' | 'matches' | 'likes'
  const [activeView, setActiveView] = useState('cards');
  const [gymFilter, setGymFilter] = useState('all'); // 'all' | 'my_gym'

  // Анимация свайпа карточки: null | 'like' | 'pass' | 'superlike'
  const [swipeAction, setSwipeAction] = useState(null);

  // Модалка манифеста (показывается 1 раз при первом входе)
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isProPaywallOpen, setIsProPaywallOpen] = useState(false);

  useEffect(() => {
    const hasSeenManifest = localStorage.getItem('gymconnect_manifest_seen');
    if (!hasSeenManifest) {
      setIsManifestOpen(true);
    }
  }, []);

  const handleCloseManifest = () => {
    localStorage.setItem('gymconnect_manifest_seen', 'true');
    setIsManifestOpen(false);
  };

  // База реальных кандидатов GymBro в залах Алматы
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Алишер',
      age: 26,
      gender: 'male',
      type: 'Экстраверт',
      gym: 'Invictus Go (Mega Park)',
      time: 'Вечер (18:00 - 20:30)',
      experience: 'Стаж 4 года',
      goal: 'Силовой набор и гипертрофия',
      bio: 'Жму 130 кг на раз, ищу надежного напарника на тяжелую базу (жим, присед). Подстрахую, крикну на крайнем повторе, попьем шейкер после зала.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
      telegram: 'alisher_fit'
    },
    {
      id: 2,
      name: 'Диана',
      age: 23,
      gender: 'female',
      type: 'Амбиверт',
      gym: 'FitnessBlitz (Достык Плаза)',
      time: 'Утро (08:00 - 10:00)',
      experience: 'Стаж 2 года',
      goal: 'Тонус и ягодичный мост',
      bio: 'Тренируюсь строго до работы. Ищу GymGirl для дисциплины, чтобы не переводить будильник в 7 утра. Делаем базу, кардио и растяжку!',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
      telegram: 'diana_kz'
    },
    {
      id: 3,
      name: 'Ерлан',
      age: 29,
      gender: 'male',
      type: 'Интроверт',
      gym: 'Invictus Go (Mega Park)',
      time: 'Обед (13:00 - 15:00)',
      experience: 'Стаж 5 лет',
      goal: 'Сушка и рельеф',
      bio: 'Работаю на результат без пустых разговоров между подходами. Отдых по таймеру 90 секунд, четкая техника и дропсеты.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
      telegram: 'erlan_strong'
    },
    {
      id: 4,
      name: 'Камила',
      age: 25,
      gender: 'female',
      type: 'Экстраверт',
      gym: '1Fit Pass (Разные клубы)',
      time: 'Вечер (19:00 - 21:00)',
      experience: 'Стаж 3 года',
      goal: 'Функционал и кроссфит',
      bio: 'Обожаю интенсивные комплексы, греблю и махи гирей. Ищу партнера для совместных челенджей и соревновательного вайба!',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
      telegram: 'kamila_active'
    },
    {
      id: 5,
      name: 'Нурсултан',
      age: 27,
      gender: 'male',
      type: 'Амбиверт',
      gym: 'Adrenaline Fitness (Абая)',
      time: 'Вечер (18:30 - 20:30)',
      experience: 'Стаж 3 года',
      goal: 'Пауэрлифтинг',
      bio: 'Готовлюсь к городскому кубку по тяге. Нужен напарник с магнезией и поясом, кто понимает кайф тяжелых рабочих подходов.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
      telegram: 'nurs_lift'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyIndexes, setHistoryIndexes] = useState([]);

  // Взаимные мэтчи (уже подтвержденные)
  const [matchesList] = useState([
    {
      id: 101,
      name: 'Алексей',
      age: 26,
      gym: 'Invictus Go (Mega Park)',
      time: 'Сегодня в 18:30',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      telegram: 'alex_iron'
    },
    {
      id: 102,
      name: 'Дильназ',
      age: 24,
      gym: 'FitnessBlitz (Достык)',
      time: 'Вчера, 19:00',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      telegram: 'dilnaz_sport'
    },
    {
      id: 103,
      name: 'Санжар',
      age: 28,
      gym: 'Invictus Go (Навои)',
      time: '3 дня назад',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      telegram: 'sanzhar_kz'
    }
  ]);

  // Список входящих лайков (видны по PRO)
  const [likesList] = useState([
    {
      id: 201,
      name: 'Мадина',
      age: 24,
      gym: 'Invictus Go (Mega Park)',
      time: '2 часа назад',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      telegram: 'madina_fit'
    },
    {
      id: 202,
      name: 'Арман',
      age: 27,
      gym: 'Invictus Go (Mega Park)',
      time: 'Сегодня, 11:20',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      telegram: 'arman_power'
    },
    {
      id: 203,
      name: 'Анель',
      age: 22,
      gym: 'FitnessBlitz (Самал)',
      time: 'Вчера, 21:10',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      telegram: 'anel_gym'
    },
    {
      id: 204,
      name: 'Бауржан',
      age: 30,
      gym: '1Fit Pass',
      time: 'Вчера, 16:45',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      telegram: 'baur_almaty'
    },
    {
      id: 205,
      name: 'Айгерим',
      age: 25,
      gym: 'Royal Club',
      time: '2 дня назад',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      telegram: 'aigera_lift'
    }
  ]);

  // Фильтрация кандидатов по клубу
  const filteredCandidates = candidates.filter(item => {
    if (gymFilter === 'my_gym') {
      const cleanMyGym = myGym.split('|')[0].trim().toLowerCase();
      return item.gym.toLowerCase().includes(cleanMyGym);
    }
    return true;
  });

  const currentCandidate = filteredCandidates[currentIndex % Math.max(1, filteredCandidates.length)];

  // Действия по кнопкам с анимацией штампа
  const triggerSwipe = (actionType) => {
    setSwipeAction(actionType);
    setHistoryIndexes(prev => [...prev, currentIndex]);

    setTimeout(() => {
      setSwipeAction(null);
      setCurrentIndex(prev => (prev + 1) % filteredCandidates.length);
    }, 280);
  };

  const handleUndo = () => {
    if (historyIndexes.length === 0) return;
    const lastIndex = historyIndexes[historyIndexes.length - 1];
    setHistoryIndexes(prev => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
  };

  const handleOpenLikes = () => {
    if (!isPro) {
      setIsProPaywallOpen(true);
    } else {
      setActiveView('likes');
    }
  };

  return (
    <div className="p-3 max-w-md mx-auto flex flex-col pb-6 select-none animate-in fade-in duration-200">
      
      {/* 1. ВЕРХНЯЯ ШАПКА В СТИЛЕ ЛИЧНОГО ПРОФИЛЯ */}
      <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs">
            {currentProfile?.photo_url || currentProfile?.avatar_url ? (
              <img src={currentProfile.photo_url || currentProfile.avatar_url} alt="Аватар" className="w-full h-full object-cover" />
            ) : (
              <span>{currentProfile?.first_name ? currentProfile.first_name[0] : 'G'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold text-slate-900 leading-tight">GymBro Matching</h1>
              {isPro && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {myGym.split('|')[0] || 'Алматы'} • Напарники по базе
            </p>
          </div>
        </div>

        {/* Кнопка открытия Манифеста */}
        <button
          type="button"
          onClick={() => setIsManifestOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-[10.5px] font-semibold text-slate-700 transition-all active:scale-95"
          title="Прочитать Манифест GymConnect"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Манифест</span>
        </button>
      </div>

      {/* 2. КНОПКИ «МЭТЧИ» И «ЛАЙКИ» (КНОПКА «МОЯ АНКЕТА» УБРАНА) */}
      <div className="grid grid-cols-2 gap-2 mb-2.5">
        <button
          type="button"
          onClick={() => setActiveView(activeView === 'matches' ? 'cards' : 'matches')}
          className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 ${
            activeView === 'matches'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Взаимные мэтчи</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeView === 'matches' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
          }`}>
            {matchesList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={handleOpenLikes}
          className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 ${
            activeView === 'likes'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Кто вас лайкнул</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">
            {likesList.length}
          </span>
        </button>
      </div>

      {/* 3. ФИЛЬТРЫ ЗАЛА: «ВСЕ ЗАЛЫ АЛМАТЫ» И «ТОЛЬКО МОЙ ЗАЛ» */}
      <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 bg-slate-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => { setGymFilter('all'); setCurrentIndex(0); }}
          className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            gymFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Все залы Алматы</span>
        </button>

        <button
          type="button"
          onClick={() => { setGymFilter('my_gym'); setCurrentIndex(0); }}
          className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
            gymFilter === 'my_gym'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="truncate">Только мой зал</span>
        </button>
      </div>

      {/* 4. ОСНОВНОЙ РЕЖИМ СВАЙПА КАРТОЧЕК */}
      {activeView === 'cards' && (
        <>
          {currentCandidate ? (
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200/80 flex flex-col justify-end mb-3.5 h-[410px] transition-all">
              
              {/* Фотография атлета на весь блок */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={currentCandidate.image} 
                  alt={currentCandidate.name} 
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    swipeAction === 'like' ? 'translate-x-6 rotate-2' : 
                    swipeAction === 'pass' ? '-translate-x-6 -rotate-2' : ''
                  }`}
                />
                {/* Мягкий темный градиент Apple для читаемости текста */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>
              </div>

              {/* Штамп-анимация при свайпе */}
              {swipeAction === 'like' && (
                <div className="absolute top-8 right-6 z-30 border-4 border-emerald-400 text-emerald-400 font-black text-xl px-4 py-1 rounded-2xl rotate-12 bg-black/40 backdrop-blur-xs animate-in zoom-in-75">
                  LIKE ❤️
                </div>
              )}
              {swipeAction === 'pass' && (
                <div className="absolute top-8 left-6 z-30 border-4 border-rose-500 text-rose-500 font-black text-xl px-4 py-1 rounded-2xl -rotate-12 bg-black/40 backdrop-blur-xs animate-in zoom-in-75">
                  PASS ❌
                </div>
              )}
              {swipeAction === 'superlike' && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 border-4 border-purple-400 text-purple-300 font-black text-xl px-4 py-1 rounded-2xl bg-black/60 backdrop-blur-xs animate-in zoom-in-75">
                  SUPER GYMBRO ⚡
                </div>
              )}

              {/* Верхние чипсы: Психотип, Возраст, Стаж */}
              <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10.5px] font-semibold border border-white/20">
                  {currentCandidate.type}
                </span>
                <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10.5px] font-semibold border border-white/20 font-mono">
                  {currentCandidate.age} лет
                </span>
                <span className="px-2.5 py-1 bg-blue-600/80 backdrop-blur-md text-white rounded-xl text-[10.5px] font-bold border border-blue-400/40">
                  {currentCandidate.experience}
                </span>
              </div>

              {/* Нижний контент карточки */}
              <div className="relative z-10 p-4 text-white space-y-2">
                <div>
                  <h2 className="text-xl font-bold tracking-tight leading-tight">
                    {currentCandidate.name}
                  </h2>
                  <div className="text-[11px] text-slate-200 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{currentCandidate.gym}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-300 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{currentCandidate.time}</span>
                  </div>
                </div>

                {/* Блок био и цели */}
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/15 space-y-1">
                  <div className="text-[9.5px] font-bold text-blue-300 uppercase tracking-wider">
                    Цель: {currentCandidate.goal}
                  </div>
                  <p className="text-xs text-slate-100 leading-snug line-clamp-2 font-normal">
                    {currentCandidate.bio}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[410px] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center space-y-2 mb-3.5">
              <Users className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">Анкеты в этом клубе закончились</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Переключите фильтр на «Все залы Алматы», чтобы увидеть больше атлетов из других районов.
              </p>
              <button
                type="button"
                onClick={() => setGymFilter('all')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
              >
                Показать все залы
              </button>
            </div>
          )}

          {/* 5. ЧЕТЫРЕ УПРАВЛЯЮЩИЕ КНОПКИ В СТИЛЕ APPLE HIG */}
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex items-center justify-around">
            
            {/* Кнопка 1: Возврат (Undo) */}
            <button 
              type="button"
              onClick={handleUndo}
              disabled={historyIndexes.length === 0}
              className="w-11 h-11 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-xs active:scale-90 transition-all disabled:opacity-40"
              title="Вернуть предыдущую анкету"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Кнопка 2: Пропустить (X) */}
            <button 
              type="button"
              onClick={() => triggerSwipe('pass')}
              className="w-13 h-13 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-full flex items-center justify-center text-rose-600 shadow-sm active:scale-90 transition-all"
              title="Пропустить"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Кнопка 3: Лайк (Heart) */}
            <button 
              type="button"
              onClick={() => triggerSwipe('like')}
              className="w-13 h-13 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full flex items-center justify-center text-emerald-600 shadow-sm active:scale-90 transition-all"
              title="Тренироваться вместе"
            >
              <Heart className="w-6 h-6 stroke-[2.5] fill-emerald-500" />
            </button>

            {/* Кнопка 4: Супер-буст (Zap) */}
            <button 
              type="button"
              onClick={() => triggerSwipe('superlike')}
              className="w-11 h-11 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full flex items-center justify-center text-purple-600 shadow-xs active:scale-90 transition-all"
              title="Супер-коннект GymBro"
            >
              <Zap className="w-4 h-4 stroke-[2] fill-purple-500" />
            </button>

          </div>
        </>
      )}

      {/* 6. РЕЖИМ «ВЗАИМНЫЕ МЭТЧИ» */}
      {activeView === 'matches' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900">Ваши подтвержденные GymBro ({matchesList.length})</span>
            <button 
              type="button"
              onClick={() => setActiveView('cards')}
              className="text-[11px] font-semibold text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>К поиску</span>
            </button>
          </div>

          <div className="space-y-2">
            {matchesList.map(item => (
              <div 
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-100" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}, {item.age} лет</h4>
                    <p className="text-[10.5px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{item.gym}</span>
                    </p>
                    <span className="text-[9.5px] text-emerald-600 font-medium">Мэтч: {item.time}</span>
                  </div>
                </div>

                <a
                  href={`https://t.me/${item.telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Написать</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. РЕЖИМ «КТО ВАС ЛАЙКНУЛ» (ДЛЯ PRO-ПОЛЬЗОВАТЕЛЕЙ) */}
      {activeView === 'likes' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900">Входящие симпатии ({likesList.length})</span>
            <button 
              type="button"
              onClick={() => setActiveView('cards')}
              className="text-[11px] font-semibold text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>К поиску</span>
            </button>
          </div>

          <div className="space-y-2">
            {likesList.map(item => (
              <div 
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-100" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}, {item.age} лет</h4>
                    <p className="text-[10.5px] text-slate-500 truncate">{item.gym}</p>
                    <span className="text-[9.5px] text-rose-500 font-medium">Поставил лайк: {item.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Вы ответили взаимностью атлету ${item.name}! Мэтч создан.`)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Мэтч</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: ПОЛНЫЙ МАНИФЕСТ GYMCONNECT ================= */}
      {isManifestOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            
            {/* Шапка манифеста с кнопкой пропустить */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Манифест GymConnect</h3>
                  <p className="text-[10px] text-slate-400">Про нас с тобой и наше комьюнити</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseManifest}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10.5px] font-semibold active:scale-95 transition-all"
              >
                Пропустить
              </button>
            </div>

            {/* Полный текст Манифеста */}
            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed overflow-y-auto pr-1">
              <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-[11.5px] text-blue-950 font-medium">
                Мы знаем, как это бывает. Видишь полотно текста, закатываешь глаза и уже тянешься пальцем, чтобы просто пролистнуть вниз, поставить галочку «согласен» и пойти дальше. Можешь так и сделать, мы абсолютно не обидимся. Но если ты всё-таки остановишься на минуту, нальешь себе черпак любимого протеина и дочитаешь это до конца — возможно, тебе откликнется каждая строчка. Потому что это не просто скучные правила сервиса. Это манифест про нас с тобой.
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
                  <span>Глава первая. Броня из магнезии и ранимые души</span>
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Снаружи мы — абсолютный монолит. Кажется, что эти уверенные плечи, тяжелые штанги, сфокусированные взгляды в зеркало и глухой грохот падающих блинов на помосте созданы из чистого титана и гранита. Мы кажемся непобедимыми, сильными и неприступными.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Но каждый, кто хоть раз оставался один на один с пустой скамьей в темном зале после тяжелого рабочего дня, прекрасно знает правду. Мы все в душе невероятно мягкие, чувствительные и ранимые. Нам просто так спокойнее — носить плотную броню из любимых оверсайз худи, наушников с шумоподавлением и серьезного выражения лица. Мы приходим в качалку не только за рекордами. Мы приходим за тем, чтобы заглушить этот бесконечный шум большого города и почувствовать себя живыми.
                </p>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
                  <span>Глава вторая. Конец эпохи одиноких подходов</span>
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Именно поэтому главная, фундаментальная и абсолютно священная цель GymConnect звучит до боли просто: <b>сделать так, чтобы ты никогда больше не занимался в зале один</b>.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Хватит этих молчаливых тренировок, когда некому подстраховать в жиме, когда некому крикнуть «еще один повтор, справишься!», а твоим единственным верным собеседником на протяжении двух часов становится уставший кулер с прохладной водой. Это тоска. Так дело не пойдет.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Как утверждают абсолютно секретные (и абсолютно вымышленные) независимые эксперты по качалочному уюту из Института Абсолютного Счастья, <b>эффективность любой тренировки возрастает на 84%</b>, если рядом с тобой есть твой напарник — твой GymBro или GymGirl.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  И знаешь что? Наука (всё те же вымышленные профессора) официально подтверждает: эта магия работает даже в том случае, если 70% тренировочного времени вы просто стоите у входа, увлеченно обсуждая новый вкус протеина, странные кроссовки соседа по раздевалке или планы на грядущие выходные, а оставшиеся 30% — делаете вид, что качаетесь. Уровень эндорфинов, радости и общего жизненного тонуса от этого всё равно взлетает до стратосферы. Общаясь с правильными людьми, ты растешь быстрее.
                </p>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
                  <span>Глава третья. Немного о любви, железе и грандиозных планах</span>
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  А теперь давай поговорим о самом интересном. Мы — не холодный, бездушный сайт знакомств со свайпами влево-вправо. Но мы — самая честная, теплая и спортивная экосистема для тех, кто разделяет твой ритм жизни. Зал испокон веков был лучшим местом для встречи единомышленников, ведь здесь собираются самые целеустремленные, ухоженные и сильные люди.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Если под мерный звон гантелей, скрип тренажеров и приятный аромат бананового шейка между вами пробежит та самая искра, если ты встретишь человека, с которым тебе захочется делить не только рабочий вес на штанге, но и всю свою дальнейшую жизнь — знай, мы будем первыми, кто искренне порадуется за вас от всей души.
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Более того, пользуясь случаем, заявляем официально: <b>Ребята, если благодаря GymConnect вы найдете друг друга, создадите крепкую спортивную ячейку общества и решите пожениться — обязательно позовите нас на свадьбу!</b>
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Мы честно пообещаем прийти, надеть свои лучшие парадные спортивные костюмы, заготовить тост про правильное соотношение белков, жиров и углеводов в семейной жизни и даже пустить скупую слезу умиления прямо в момент, когда вы будете говорить друг другу «да» на фоне любимой зоны свободных весов.
                </p>
                <p className="text-slate-800 text-[11px] font-semibold pt-1">
                  Делитесь своими историями, отмечайте нас в соцсетях, качайте железо, берегите свои мягкие сердца под броней из магнезии и помните: в этом огромном и суетливом мире вам больше никогда, слышите — никогда — не придется тренироваться в одиночестве. ❤️‍🔥
                </p>
              </div>
            </div>

            {/* Финальная кнопка согласия с манифестом */}
            <button
              type="button"
              onClick={handleCloseManifest}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all"
            >
              <span>Я с вами! В зал ❤️‍🔥</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА: PRO-ПЕЙВОЛЛ ДЛЯ ЛАЙКОВ ================= */}
      {isProPaywallOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">У вас 5 новых симпатий</h3>
                  <p className="text-[10px] text-slate-400">Атлеты из залов Алматы ждут ответа</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProPaywallOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Размытые аватары кандидатов для интриги */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-slate-300 blur-xs border-2 border-white shadow-xs" />
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-900 text-center">
                Разблокируйте GymConnect PRO All-Access
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                <li>Мгновенный просмотр всех, кто поставил вам лайк</li>
                <li>Безлимитные свайпы по всем 230+ клубам города</li>
                <li>Возможность отменять ошибочные свайпы назад</li>
              </ul>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Стоимость доступа</span>
              <span className="text-sm font-bold text-slate-900">2 990 ₸ / месяц</span>
            </div>

            <a
              href="https://t.me/gymconnect_kz"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Оформить PRO-доступ</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
