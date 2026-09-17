import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import NutritionTab from './components/NutritionTab';
import GymBroTab from './components/GymBroTab';
import ProfileTab from './components/ProfileTab';
import GymFeedTab from './components/GymFeedTab';

const Icons = {
  Lightning: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Salad: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21h10a5 5 0 0 0 5-5v-1H2v1a5 5 0 0 0 5 5z" />
      <path d="M12 3v8" />
      <path d="m8 6 8 8" />
      <path d="m16 6-8 8" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-3.5 h-3.5 text-[#FF5A1F]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 19h20v2H2v-2zm1.5-4L6 6l4.5 5 4.5-5 2.5 9H3.5z" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  const [myGymBroCard, setMyGymBroCard] = useState(null);
  const [gymBroCards, setGymBroCards] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    setLoading(true);
    let tgId = null;
    let tgUser = '';
    let tgName = '';

    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const u = window.Telegram.WebApp.initDataUnsafe.user;
      tgId = u.id;
      tgUser = u.username || '';
      tgName = [u.first_name, u.last_name].filter(Boolean).join(' ');
    }

    setTelegramUser({ id: tgId, username: tgUser, first_name: tgName });

    const { data: gymData } = await supabase.from('gyms').select('*');
    if (gymData) setBranches(gymData);

    if (tgId) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tgId)
        .maybeSingle();

      if (userData) {
        setCurrentUser(userData);
      }

      const { data: cardData } = await supabase
        .from('gymbro_cards')
        .select('*')
        .eq('telegram_id', tgId)
        .maybeSingle();

      if (cardData) {
        setMyGymBroCard(cardData);
      }
    }

    await loadAllCards(tgId);
    setLoading(false);
  }

  async function loadAllCards(currentTgId) {
    const { data } = await supabase
      .from('gymbro_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const filtered = currentTgId ? data.filter(c => c.telegram_id !== currentTgId) : data;
      setGymBroCards(filtered);
    }
  }

  async function handleSaveGymBroCard(cardData) {
    setSaving(true);
    const tgId = telegramUser.id || (currentUser ? currentUser.telegram_id : Date.now());
    const tgUsername = telegramUser.username || (currentUser ? currentUser.telegram_username : '');

    const payload = {
      telegram_id: tgId,
      telegram_username: tgUsername,
      name: cardData.name,
      gender: cardData.gender,
      looking_for: cardData.looking_for,
      city: cardData.city,
      weekday_gym: cardData.weekday_gym,
      weekend_gym: cardData.weekend_gym,
      level: cardData.level,
      split: cardData.split,
      time_slot: cardData.time_slot,
      instagram: cardData.instagram,
      bio: cardData.bio,
      photo_url: cardData.photo_url || null
    };

    if (myGymBroCard) {
      const { data, error } = await supabase
        .from('gymbro_cards')
        .update(payload)
        .eq('id', myGymBroCard.id)
        .select()
        .single();

      if (!error) {
        setMyGymBroCard(data);
        await loadAllCards(tgId);
      }
    } else {
      const { data, error } = await supabase
        .from('gymbro_cards')
        .insert([payload])
        .select()
        .single();

      if (!error) {
        setMyGymBroCard(data);
        await loadAllCards(tgId);
      }
    }
    setSaving(false);
  }

  function handleOpenKaspiPaywall() {
    alert('Переход к оформлению GymConnect PRO через Kaspi Pay...');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F]/15 text-[#FF5A1F] flex items-center justify-center mx-auto animate-pulse border border-[#FF5A1F]/30">
            <Icons.Lightning />
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Загрузка GymConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans pb-24 select-none">
      {/* Верхний Header */}
      <header className="px-5 py-3.5 border-b border-white/[0.08] flex justify-between items-center bg-[#0a0d14]/80 backdrop-blur-2xl sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/25 flex-shrink-0">
            <Icons.Lightning />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">GymConnect</h1>
            <p className="text-[11px] text-slate-400 font-normal">{currentUser?.city || 'Алматы'} • Club</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => initApp()}
            className="text-[11px] text-slate-400 hover:text-white px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] active:scale-95 transition cursor-pointer"
          >
            Обновить
          </button>
          <button
            onClick={handleOpenKaspiPaywall}
            className="flex items-center gap-1 bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition"
          >
            <Icons.Crown />
            <span className="text-[10px] font-bold text-[#FF5A1F] tracking-wide">
              {currentUser?.is_pro ? 'PRO' : 'GET PRO'}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3.5">
        {/* ================= 1. ГЛАВНАЯ ================= */}
        {activeTab === 'home' && (
          <div className="space-y-3.5">
            <div className="apple-glass-card p-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#121622] border border-white/15 flex-shrink-0 flex items-center justify-center shadow-lg">
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Athlete" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{currentUser?.name?.[0] || 'A'}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold text-[#FF5A1F] tracking-wider block">
                      Профиль атлета
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight truncate">
                      {currentUser?.name || 'Атлет'}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {currentUser?.city || 'Алматы'} • {currentUser?.gender || 'Парень'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white flex-shrink-0 cursor-pointer"
                >
                  <Icons.ArrowRight />
                </button>
              </div>

              {myGymBroCard ? (
                <div className="text-xs bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/[0.07] space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Анкета GymBro активна
                  </div>
                  <p className="text-slate-300 text-[11px] pt-0.5">
                    <span className="text-slate-500">Зал:</span> {myGymBroCard.weekday_gym}
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    <span className="text-slate-500">Сплит:</span> {myGymBroCard.split}
                  </p>
                </div>
              ) : (
                <div className="text-xs bg-[#FF5A1F]/10 p-3 rounded-xl border border-[#FF5A1F]/20 space-y-1">
                  <p className="text-[#FF8C38] font-semibold text-[11px]">Анкета напарника не заполнена</p>
                  <p className="text-[11px] text-slate-400 font-normal">Заполни залы, чтобы напарники видели тебя в поиске.</p>
                </div>
              )}
            </div>

            {/* Блок Напарники */}
            <div className="apple-glass p-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-white tracking-tight">Поиск GymBro</h3>
                    <span className="text-[9px] bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 px-1.5 py-0.5 rounded-md font-extrabold tracking-wide">
                      COMMUNITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    В базе доступно {gymBroCards.length} анкет атлетов
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF5A1F]">
                  <Icons.Users />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('gymbro')}
                className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{myGymBroCard ? 'Смотреть анкеты напарников' : 'Создать анкету поиска'}</span>
                <Icons.ArrowRight />
              </button>
            </div>

            {/* Блок Лента */}
            <div className="apple-glass p-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-white tracking-tight">Фитнес-лента</h3>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-extrabold tracking-wide">
                      CLUB
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    Пруфы тренировок и комьюнити
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400">
                  <Icons.Camera />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('feed')}
                className="w-full gymshark-btn-glass py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Открыть ленту зала</span>
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. GYMBRO ================= */}
        {activeTab === 'gymbro' && (
          <GymBroTab
            myCard={myGymBroCard}
            user={currentUser}
            gyms={branches}
            cards={gymBroCards}
            onSaveCard={handleSaveGymBroCard}
            onRefreshCards={() => loadAllCards(telegramUser.id)}
            isSaving={saving}
          />
        )}

        {/* ================= 3. ЛЕНТА (GYMFEED PRO) ================= */}
        {activeTab === 'feed' && (
          <GymFeedTab
            user={currentUser}
            onOpenPaywall={handleOpenKaspiPaywall}
          />
        )}

        {/* ================= 4. ПИТАНИЕ ================= */}
        {activeTab === 'nutrition' && (
          <NutritionTab
            myProfile={currentUser}
            onUpdateProfile={async (params) => {
              await supabase.from('users').update(params).eq('id', currentUser.id);
            }}
          />
        )}

        {/* ================= 5. ПРОФИЛЬ ================= */}
        {activeTab === 'profile' && (
          <ProfileTab
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
          />
        )}
      </main>

      {/* Нативный нижний бар Apple TabBar с 5 вкладками */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto ios-nav-dock flex justify-around py-2.5 z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'home' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Home />
          <span className="text-[10px] font-semibold tracking-tight">Главная</span>
        </button>

        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'gymbro' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Users />
          <span className="text-[10px] font-semibold tracking-tight">GymBro</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'feed' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Camera />
          <span className="text-[10px] font-semibold tracking-tight">Лента</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'nutrition' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Salad />
          <span className="text-[10px] font-semibold tracking-tight">Питание</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'profile' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.User />
          <span className="text-[10px] font-semibold tracking-tight">Профиль</span>
        </button>
      </nav>
    </div>
  );
}
