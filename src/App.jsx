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
  HomeFeed: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  UsersGymBro: () => (
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
  User: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
};

const BACKUP_ADMIN_PIN = "7770";

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  const [myGymBroCard, setMyGymBroCard] = useState(null);
  const [gymBroCards, setGymBroCards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);

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
      tgName = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
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
        if (!userData.terms_accepted) {
          setShowTermsModal(true);
        }
      } else {
        const initialName = tgName || (tgUser ? `@${tgUser}` : 'Новый атлет');
        const newPayload = {
          telegram_id: tgId,
          telegram_username: tgUser,
          name: initialName,
          gender: 'Парень',
          city: 'Алматы',
          sport_type: 'Атлет',
          is_pro: false,
          terms_accepted: false
        };

        const { data: createdUser } = await supabase
          .from('users')
          .insert([newPayload])
          .select()
          .single();

        if (createdUser) {
          setCurrentUser(createdUser);
          setShowTermsModal(true);
        } else {
          setCurrentUser(newPayload);
        }
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

  async function handleAcceptTerms() {
    if (!termsAgreed) return alert('Пожалуйста, подтвердите согласие с правилами сервиса');
    const tgId = telegramUser.id || currentUser?.telegram_id;
    if (!tgId) return;

    await supabase
      .from('users')
      .update({ terms_accepted: true, terms_accepted_at: new Date().toISOString() })
      .eq('telegram_id', tgId);

    setCurrentUser(prev => ({ ...prev, terms_accepted: true }));
    setShowTermsModal(false);
  }

  function handleLogoTap() {
    const nextTaps = logoTaps + 1;
    setLogoTaps(nextTaps);
    if (nextTaps >= 4) {
      setLogoTaps(0);
      const pin = prompt('Введите резервный PIN администратора:');
      if (pin === BACKUP_ADMIN_PIN) {
        setCurrentUser(prev => ({ ...prev, is_admin: true }));
        alert('Резервный режим администратора активирован! 👑');
      } else if (pin !== null) {
        alert('Неверный PIN-код');
      }
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
      {/* Юридическая оферта */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-4 shadow-2xl border border-white/10 rounded-3xl">
            <div className="text-center space-y-1.5">
              <span className="text-3xl">⚖️</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Добро пожаловать в GymConnect</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Для доступа к поиску напарников и клубной ленте, подтвердите согласие с правилами сервиса.
              </p>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2 text-[11px] text-slate-300">
              <p>• Сервис предназначен для совершеннолетних атлетов.</p>
              <p>• Соблюдайте этикет и безопасность в фитнес-клубах.</p>
              <p>• Вы сами несёте ответственность за своё здоровье во время тренировок.</p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-300 pt-1">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={e => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 text-[#FF5A1F] focus:ring-0"
              />
              <span>Я принимаю условия Публичной оферты и Политику конфиденциальности GymConnect</span>
            </label>

            <button
              type="button"
              onClick={handleAcceptTerms}
              disabled={!termsAgreed}
              className="w-full gymshark-btn-electric py-3 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Начать тренировки ➔
            </button>
          </div>
        </div>
      )}

      {/* Пейволл PRO */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-glass max-w-sm w-full p-5 space-y-4 shadow-2xl border border-white/10 rounded-3xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icons.Crown />
                <h3 className="text-sm font-bold text-white tracking-tight">GymConnect VIP PRO</h3>
              </div>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-center">
              <div className="py-2">
                <span className="text-3xl font-black text-white tracking-tight">3 000 ₸</span>
                <span className="text-xs text-slate-400 font-medium"> / месяц</span>
              </div>

              <div className="space-y-2 text-left text-xs text-slate-200">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">👑</span>
                  <span><strong>GymBro</strong> — Безлимитный поиск напарников и прямые контакты</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">👑</span>
                  <span><strong>Лента зала</strong> — Публикация пруфов формы и реакции</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[#FF5A1F] font-black">👑</span>
                  <span><strong>Рационы и КБЖУ</strong> — Меню на 7 дней и продуктовая корзина</span>
                </div>
              </div>

              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full gymshark-btn-electric py-3 text-xs font-bold flex items-center justify-center gap-2 no-underline cursor-pointer shadow-lg shadow-[#FF5A1F]/20 mt-3"
              >
                <span>Оформить VIP-доступ (Kaspi Pay)</span>
                <span>➔</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Шапка */}
      <header className="px-5 py-3 border-b border-white/[0.08] flex justify-between items-center bg-[#0a0d14]/80 backdrop-blur-2xl sticky top-0 z-30">
        <div onClick={handleLogoTap} className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF8C38] flex items-center justify-center text-white shadow-lg shadow-[#FF5A1F]/25 flex-shrink-0">
            <Icons.Lightning />
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-white tracking-tight leading-tight">GymConnect</h1>
            <p className="text-[10px] text-slate-400 font-normal">{currentUser?.city || 'Алматы'} • Club</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.is_pro ? (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-[#FF5A1F]/20 border border-amber-500/30 px-3 py-1 rounded-full">
              <span className="text-xs">👑</span>
              <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase">VIP</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPaywallModal(true)}
              className="flex items-center gap-1 bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition"
            >
              <Icons.Crown />
              <span className="text-[10px] font-bold text-[#FF5A1F] tracking-wide">3 000 ₸</span>
            </button>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 px-4 py-3.5 max-w-md mx-auto w-full space-y-4">
        {activeTab === 'home' && (
          <div className="space-y-3.5">
            <div className="apple-glass-card p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#121622] border border-white/15 flex-shrink-0 flex items-center justify-center shadow-md">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Athlete" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white">{currentUser?.name?.[0] || 'A'}</span>
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-white tracking-tight truncate">
                      {currentUser?.name || 'Атлет'}
                    </h2>
                    {currentUser?.is_pro && (
                      <span className="text-[8px] bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-black">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {currentUser?.city || 'Алматы'} • {currentUser?.sport_type || 'Атлет'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('profile')}
                className="text-[10px] text-[#FF8C38] font-bold px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
              >
                Профиль ➔
              </button>
            </div>

            <GymFeedTab
              user={currentUser}
              onOpenPaywall={() => setShowPaywallModal(true)}
            />
          </div>
        )}

        {/* Раздел GymBro (включает поиск + твоих друзей внутри) */}
        {activeTab === 'gymbro' && (
          <GymBroTab
            myCard={myGymBroCard}
            user={currentUser}
            gyms={branches}
            cards={gymBroCards}
            onSaveCard={handleSaveGymBroCard}
            onRefreshCards={() => loadAllCards(telegramUser.id)}
            onOpenPaywall={() => setShowPaywallModal(true)}
            isSaving={saving}
          />
        )}

        {/* Раздел Питание */}
        {activeTab === 'nutrition' && (
          <NutritionTab
            myProfile={currentUser}
            onUpdateProfile={async (params) => {
              await supabase.from('users').update(params).eq('telegram_id', currentUser.telegram_id);
            }}
          />
        )}

        {/* Раздел Профиль */}
        {activeTab === 'profile' && (
          <ProfileTab
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser({ ...currentUser, ...updated })}
            onNavigateTab={(tabName) => setActiveTab(tabName)}
          />
        )}
      </main>

      {/* 4 чистые вкладки в нижнем баре */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto ios-nav-dock flex justify-around py-2.5 z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'home' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.HomeFeed />
          <span className="text-[10px] font-semibold tracking-tight">Главная</span>
        </button>

        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${activeTab === 'gymbro' ? 'text-[#FF5A1F] scale-105' : 'text-slate-400 opacity-60'}`}
        >
          <Icons.UsersGymBro />
          <span className="text-[10px] font-semibold tracking-tight">GymBro</span>
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
