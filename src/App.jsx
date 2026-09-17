import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { LEGAL_DOCS_LIST } from './legalDocs';
import NutritionTab from './components/NutritionTab';
import GymBroTab from './components/GymBroTab';

// Векторные Apple SF Symbols
const Icons = {
  Lightning: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Biceps: () => (
    <svg className="w-6 h-6 text-[#FF5A1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16.5a3.5 3.5 0 0 0 5 0l1-1a3.5 3.5 0 0 1 5 0l2 2a3 3 0 0 0 4.2-4.2l-2-2a3.5 3.5 0 0 1 0-5l1-1a3.5 3.5 0 0 0 0-5l-2-2a3.5 3.5 0 0 0-4.2 0l-1 1a3.5 3.5 0 0 1-5 0l-2-2a3.5 3.5 0 0 0-4.2 4.2l1 1a3.5 3.5 0 0 1 0 5l-1 1a3.5 3.5 0 0 0 0 5l2 2a3 3 0 0 0 .2.3z" />
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

  const [regForm, setRegForm] = useState({
    name: '',
    gender: 'Парень',
    city: 'Алматы'
  });

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
    if (tgName) setRegForm(prev => ({ ...prev, name: tgName }));

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

  async function handleRegisterUser(e) {
    e.preventDefault();
    if (!regForm.name.trim()) return alert('Укажите имя');

    setSaving(true);
    const tgId = telegramUser.id || Date.now();
    const payload = {
      telegram_id: tgId,
      telegram_username: telegramUser.username || '',
      name: regForm.name.trim(),
      gender: regForm.gender,
      city: regForm.city
    };

    const { data, error } = await supabase
      .from('users')
      .insert([payload])
      .select()
      .single();

    if (!error) {
      setCurrentUser(data);
    } else {
      alert('Ошибка: ' + error.message);
    }
    setSaving(false);
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
      bio: cardData.bio
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
      {/* Верхний Header Apple Frosted Glass */}
      <header className="px-5 py-3.5 border-b border-white/[0.08] flex justify-between items-center bg-[#0a0d14]/75 backdrop-blur-2xl sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/20">
            <Icons.Lightning />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">GymConnect</h1>
            <p className="text-[11px] text-slate-400 font-normal">{currentUser?.city || 'Алматы'} • Invictus</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => initApp()}
            className="text-[11px] text-slate-400 hover:text-white px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] active:scale-95 transition"
          >
            Обновить
          </button>
          <div className="flex items-center gap-1 bg-[#FF5A1F]/10 border border-[#FF5A1F]/25 px-2.5 py-1 rounded-full">
            <Icons.Crown />
            <span className="text-[10px] font-bold text-[#FF5A1F] tracking-wide">PRO</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3.5">
        {/* ================= 1. ГЛАВНАЯ СТРАНИЦА ================= */}
        {activeTab === 'home' && (
          <div className="space-y-3.5">
            {/* Карточка профиля */}
            <div className="apple-glass-card p-5 space-y-3.5">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#FF5A1F] tracking-wider">
                    Аккаунт атлета
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentUser?.name || 'Атлет'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentUser?.city} • {currentUser?.gender}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shadow-inner">
                  <Icons.Biceps />
                </div>
              </div>

              {myGymBroCard ? (
                <div className="text-xs bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/[0.07] space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Анкета GymBro опубликована
                  </div>
                  <p className="text-slate-300 font-normal text-[11px] pt-0.5">
                    <span className="text-slate-500">Зал:</span> {myGymBroCard.weekday_gym}
                  </p>
                  <p className="text-slate-300 font-normal text-[11px]">
                    <span className="text-slate-500">Фокус:</span> {myGymBroCard.split}
                  </p>
                </div>
              ) : (
                <div className="text-xs bg-[#FF5A1F]/10 p-3 rounded-xl border border-[#FF5A1F]/20 space-y-1">
                  <p className="text-[#FF8C38] font-semibold text-[11px]">Анкета поиска еще не заполнена</p>
                  <p className="text-[11px] text-slate-400 font-normal">Заполни параметры залов, чтобы напарники видели тебя в ленте.</p>
                </div>
              )}
            </div>

            {/* Блок Напарники (GymBro) */}
            <div className="apple-glass p-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-white tracking-tight">Поиск GymBro</h3>
                    <span className="text-[9px] bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 px-1.5 py-0.5 rounded-md font-extrabold tracking-wide">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    В базе доступно {gymBroCards.length} анкет напарников
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF5A1F]">
                  <Icons.Users />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('gymbro')}
                className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>{myGymBroCard ? 'Открыть анкеты напарников' : 'Заполнить анкету поиска'}</span>
                <Icons.ArrowRight />
              </button>
            </div>

            {/* Блок Питание */}
            <div className="apple-glass p-5 space-y-3.5">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-white tracking-tight">Рацион & Питание</h3>
                    <span className="text-[9px] bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 px-1.5 py-0.5 rounded-md font-extrabold tracking-wide">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    КБЖУ, меню на 7 дней и недельная корзина
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF5A1F]">
                  <Icons.Salad />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="w-full gymshark-btn-glass py-3 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Конструктор рациона</span>
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

        {/* ================= 3. ПИТАНИЕ ================= */}
        {activeTab === 'nutrition' && (
          <NutritionTab
            myProfile={currentUser}
            onUpdateProfile={async (params) => {
              await supabase.from('users').update(params).eq('id', currentUser.id);
            }}
          />
        )}

        {/* ================= 4. ПРОФИЛЬ ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-3.5">
            <div className="apple-glass p-5 space-y-3.5">
              <h2 className="text-sm font-bold text-white tracking-tight">Мой аккаунт</h2>

              <div className="flex items-center gap-3.5 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-lg font-black text-white shadow-lg shadow-[#FF5A1F]/20">
                  {currentUser?.name?.[0] || 'A'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{currentUser?.name}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{currentUser?.city} • {currentUser?.gender}</p>
                </div>
              </div>

              {myGymBroCard && (
                <div className="text-xs space-y-1.5 bg-black/40 backdrop-blur-md p-3.5 rounded-xl border border-white/[0.07] mt-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/[0.06]">
                    <span className="text-[#FF8C38] font-semibold">Анкета GymBro активна</span>
                    <button
                      onClick={() => setActiveTab('gymbro')}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Редактировать
                    </button>
                  </div>
                  <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Будни:</span> {myGymBroCard.weekday_gym}</p>
                  <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Выходные:</span> {myGymBroCard.weekend_gym}</p>
                  <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Сплит:</span> {myGymBroCard.split}</p>
                </div>
              )}
            </div>

            {/* Поддержка */}
            <div className="apple-glass p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Поддержка</h3>
              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full gymshark-btn-glass py-2.5 text-xs flex items-center justify-center gap-2 no-underline text-[#FF8C38]"
              >
                Чат с основателем (@asanali_kk)
              </a>
            </div>

            {/* Все 7 документов с gymconnect.kz */}
            <div className="apple-glass p-4 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Правовая информация</h3>
                <span className="text-[10px] text-slate-500 font-medium">gymconnect.kz</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {LEGAL_DOCS_LIST && LEGAL_DOCS_LIST.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] text-slate-300 flex justify-between items-center no-underline active:scale-[0.99] transition"
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <span className="text-sm">{doc.icon}</span>
                      <span className="leading-snug text-[11px] font-medium">{doc.title}</span>
                    </div>
                    <Icons.ArrowRight />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Нативный нижний бар Apple TabBar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto ios-nav-dock flex justify-around py-2.5 z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Home />
          <span className="text-[10px] font-semibold tracking-tight">Главная</span>
        </button>

        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'gymbro' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Users />
          <span className="text-[10px] font-semibold tracking-tight">GymBro</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'nutrition' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.Salad />
          <span className="text-[10px] font-semibold tracking-tight">Питание</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'profile' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.User />
          <span className="text-[10px] font-semibold tracking-tight">Профиль</span>
        </button>
      </nav>
    </div>
  );
}
