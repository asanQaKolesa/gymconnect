import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { LEGAL_DOCS } from './legalDocs';
import NutritionTab from './components/NutritionTab';
import GymBroTab from './components/GymBroTab';

// Apple 3D Emojis в высоком разрешении
const ICONS = {
  lightning: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/High%20Voltage.png",
  muscle: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20activities/Flexed%20Biceps.png",
  handshake: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png",
  salad: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Green%20Salad.png",
  crown: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Crown.png",
  home: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/House.png",
  user: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Bust%20in%20Silhouette.png",
  shield: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png",
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  const [myGymBroCard, setMyGymBroCard] = useState(null);
  const [gymBroCards, setGymBroCards] = useState([]);

  const [activeDoc, setActiveDoc] = useState(null);
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
      <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <img src={ICONS.lightning} alt="Loading" className="w-10 h-10 mx-auto animate-pulse" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Синхронизация...</p>
        </div>
      </div>
    );
  }

  const ModalDoc = activeDoc && (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="ios-card max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-white">{LEGAL_DOCS[activeDoc]?.title}</h3>
          <button onClick={() => setActiveDoc(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
        <div className="p-4 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal">
          {LEGAL_DOCS[activeDoc]?.content}
        </div>
        <div className="p-3 border-t border-white/10 bg-black/20">
          <button onClick={() => setActiveDoc(null)} className="w-full ios-button-secondary py-2.5 text-xs font-semibold">Понятно</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans pb-24 select-none">
      {ModalDoc}

      {/* Верхний Header в стиле Apple iOS */}
      <header className="px-5 py-3.5 border-b border-white/[0.07] flex justify-between items-center bg-[#0d1017]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img src={ICONS.lightning} alt="GymConnect" className="w-6 h-6 object-contain" />
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">GymConnect</h1>
            <p className="text-[11px] text-slate-400 font-normal">{currentUser?.city || 'Алматы'} • Invictus</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => initApp()}
            className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] active:scale-95 transition"
          >
            Обновить
          </button>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <img src={ICONS.crown} alt="PRO" className="w-3 h-3 object-contain" />
            <span className="text-[10px] font-semibold text-amber-400">PRO</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-3.5">
        {/* ================= 1. ГЛАВНАЯ СТРАНИЦА ================= */}
        {activeTab === 'home' && (
          <div className="space-y-3.5">
            {/* Карточка профиля */}
            <div className="ios-card-accent p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-amber-400/90 tracking-wider">
                    Аккаунт атлета
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5 tracking-tight">
                    {currentUser?.name || 'Атлет'}
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    {currentUser?.city} • {currentUser?.gender}
                  </p>
                </div>
                <img src={ICONS.muscle} alt="Muscle" className="w-8 h-8 object-contain" />
              </div>

              {myGymBroCard ? (
                <div className="text-xs bg-black/30 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="text-xs">●</span> Анкета GymBro опубликована
                  </div>
                  <p className="text-slate-300 font-normal text-[11px]">
                    <span className="text-slate-500">Зал:</span> {myGymBroCard.weekday_gym}
                  </p>
                  <p className="text-slate-300 font-normal text-[11px]">
                    <span className="text-slate-500">Фокус:</span> {myGymBroCard.split}
                  </p>
                </div>
              ) : (
                <div className="text-xs bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 space-y-1">
                  <p className="text-amber-300 font-medium">Анкета GymBro не создана</p>
                  <p className="text-[11px] text-slate-400 font-normal">Заполни анкету, чтобы напарники видели тебя в залах.</p>
                </div>
              )}
            </div>

            {/* Блок Напарники (GymBro) */}
            <div className="ios-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Поиск GymBro</h3>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    В базе доступно {gymBroCards.length} анкет напарников
                  </p>
                </div>
                <img src={ICONS.handshake} alt="GymBro" className="w-7 h-7 object-contain" />
              </div>

              <button
                onClick={() => setActiveTab('gymbro')}
                className="w-full ios-button-primary py-3 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                {myGymBroCard ? 'Открыть анкеты напарников' : 'Заполнить анкету поиска'} →
              </button>
            </div>

            {/* Блок Питание */}
            <div className="ios-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">Рацион & Питание</h3>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    КБЖУ, меню на 7 дней и умная корзина
                  </p>
                </div>
                <img src={ICONS.salad} alt="Salad" className="w-7 h-7 object-contain" />
              </div>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="w-full ios-button-secondary py-3 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                Конструктор рациона →
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
            onOpenDoc={setActiveDoc}
          />
        )}

        {/* ================= 4. ПРОФИЛЬ ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-3.5">
            <div className="ios-card p-4 space-y-3">
              <h2 className="text-sm font-bold text-white">Мой аккаунт</h2>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg font-bold text-black shadow-lg shadow-amber-500/10">
                  {currentUser?.name?.[0] || 'A'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{currentUser?.name}</h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">{currentUser?.city} • {currentUser?.gender}</p>
                </div>
              </div>

              {myGymBroCard && (
                <div className="text-xs space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/[0.06] mt-2">
                  <div className="flex justify-between items-center pb-1 border-b border-white/[0.05]">
                    <span className="text-amber-400 font-medium">Анкета напарника активна</span>
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
            <div className="ios-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Поддержка</h3>
              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full ios-button-secondary py-2.5 text-xs font-medium flex items-center justify-center gap-2 no-underline text-amber-400"
              >
                Чат с основателем (@asanali_kk)
              </a>
            </div>

            {/* Документы */}
            <div className="ios-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Документы</h3>
              <div className="space-y-1 text-xs">
                <button type="button" onClick={() => setActiveDoc('rules')} className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-300 flex justify-between items-center">
                  <span>Правила сообщества</span>
                  <span className="text-slate-500 text-xs">→</span>
                </button>
                <button type="button" onClick={() => setActiveDoc('offer')} className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-slate-300 flex justify-between items-center">
                  <span>Публичная оферта</span>
                  <span className="text-slate-500 text-xs">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Нативный нижний бар Apple TabBar с 3D-иконками */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto ios-tabbar flex justify-around py-2.5 z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'opacity-100 scale-105' : 'opacity-40'}`}
        >
          <img src={ICONS.home} alt="Home" className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-medium tracking-tight">Главная</span>
        </button>

        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'gymbro' ? 'opacity-100 scale-105' : 'opacity-40'}`}
        >
          <img src={ICONS.handshake} alt="GymBro" className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-medium tracking-tight">GymBro</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'nutrition' ? 'opacity-100 scale-105' : 'opacity-40'}`}
        >
          <img src={ICONS.salad} alt="Nutrition" className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-medium tracking-tight">Питание</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'profile' ? 'opacity-100 scale-105' : 'opacity-40'}`}
        >
          <img src={ICONS.user} alt="Profile" className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-medium tracking-tight">Профиль</span>
        </button>
      </nav>
    </div>
  );
}
