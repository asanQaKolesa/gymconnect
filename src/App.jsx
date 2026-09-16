import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { LEGAL_DOCS } from './legalDocs';
import NutritionTab from './components/NutritionTab';
import GymBroTab from './components/GymBroTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Базовый профиль пользователя (таблица users)
  const [currentUser, setCurrentUser] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  // 2. Отдельная анкета GymBro (таблица gymbro_cards)
  const [myGymBroCard, setMyGymBroCard] = useState(null);
  const [gymBroCards, setGymBroCards] = useState([]);

  const [activeDoc, setActiveDoc] = useState(null);
  const [saving, setSaving] = useState(false);

  // Форма базовой регистрации аккаунта
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

    // Загрузка залов
    const { data: gymData } = await supabase.from('gyms').select('*');
    if (gymData) setBranches(gymData);

    if (tgId) {
      // 1. Проверяем базовый аккаунт в users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tgId)
        .maybeSingle();

      if (userData) {
        setCurrentUser(userData);
      }

      // 2. Проверяем отдельную анкету в gymbro_cards
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

  // Создание базового аккаунта пользователя
  async function handleRegisterUser(e) {
    e.preventDefault();
    if (!regForm.name.trim()) return alert('Укажи свое имя');

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
      alert('Ошибка создания профиля: ' + error.message);
    }
    setSaving(false);
  }

  // Создание / обновление анкеты поиска GymBro
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
      } else {
        alert('Ошибка обновления анкеты: ' + error.message);
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
      } else {
        alert('Ошибка сохранения анкеты: ' + error.message);
      }
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <span className="text-3xl animate-spin inline-block">⚡</span>
          <p className="text-xs text-slate-400">Синхронизация GymConnect...</p>
        </div>
      </div>
    );
  }

  const ModalDoc = activeDoc && (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-white pr-2">{LEGAL_DOCS[activeDoc]?.title}</h3>
          <button onClick={() => setActiveDoc(null)} className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer">✕</button>
        </div>
        <div className="p-4 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {LEGAL_DOCS[activeDoc]?.content}
        </div>
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 rounded-b-3xl">
          <button onClick={() => setActiveDoc(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl font-bold cursor-pointer">Понятно</button>
        </div>
      </div>
    </div>
  );

  // ЭКРАН 1: БАЗОВАЯ РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ (Имя, Пол, Город)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-5 max-w-md mx-auto">
        {ModalDoc}
        <header className="text-center py-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="text-amber-500 text-sm">⚡</span>
            <span className="text-xs font-bold text-amber-400">GymConnect ID</span>
          </div>
          <h1 className="text-xl font-black tracking-tight mt-2 text-white">Добро пожаловать</h1>
          <p className="text-xs text-slate-400">Создай базовый профиль атлета (быстро и бесплатно).</p>
        </header>

        <form onSubmit={handleRegisterUser} className="space-y-4 mt-2 flex-1 flex flex-col justify-between">
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Как тебя зовут?</label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="Твое имя"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Твой пол</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegForm({ ...regForm, gender: 'Парень' })}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    regForm.gender === 'Парень' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🧔 Парень
                </button>
                <button
                  type="button"
                  onClick={() => setRegForm({ ...regForm, gender: 'Девушка' })}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    regForm.gender === 'Девушка' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  👩 Девушка
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Твой город</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegForm({ ...regForm, city: 'Алматы' })}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    regForm.city === 'Алматы' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🍎 Алматы
                </button>
                <button
                  type="button"
                  onClick={() => setRegForm({ ...regForm, city: 'Астана' })}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    regForm.city === 'Астана' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🏛 Астана
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 text-center leading-tight">
              Нажимая кнопку, вы принимаете{' '}
              <button type="button" onClick={() => setActiveDoc('offer')} className="text-amber-400 underline cursor-pointer">Оферту</button> и{' '}
              <button type="button" onClick={() => setActiveDoc('privacy')} className="text-amber-400 underline cursor-pointer">Политику конфиденциальности</button>.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Создаем профиль...' : 'Войти в GymConnect 🚀'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 select-none">
      {ModalDoc}

      {/* Верхний бар */}
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 font-black text-lg">⚡</span>
          <div>
            <h1 className="text-base font-bold tracking-tight">GymConnect</h1>
            <p className="text-[10px] text-slate-400">{currentUser.city} • Фитнес-сеть</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => initApp()}
            className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-semibold active:scale-90 transition cursor-pointer"
          >
            🔄 Сброс кэша
          </button>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
            PRO Тест
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* ================= 1. ГЛАВНАЯ ================= */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 p-4 rounded-3xl border border-amber-500/20 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Профиль пользователя</span>
                  <h2 className="text-lg font-black text-white mt-0.5">{currentUser.name}</h2>
                  <p className="text-xs text-slate-300">{currentUser.city} • {currentUser.gender}</p>
                </div>
                <span className="text-2xl">💪</span>
              </div>

              {myGymBroCard ? (
                <div className="text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                  <p className="text-emerald-400 font-bold">✓ Карточка GymBro активна</p>
                  <p><span className="text-slate-400">🏢 Будни:</span> {myGymBroCard.weekday_gym}</p>
                  <p><span className="text-slate-400">🎯 Сплит:</span> {myGymBroCard.split}</p>
                </div>
              ) : (
                <div className="text-xs bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-300 space-y-1">
                  <p className="font-bold">Анкета поиска GymBro еще не создана</p>
                  <p className="text-[11px] text-slate-400">Перейди во вкладку GymBro, чтобы заполнить параметры поиска.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Поиск GymBro
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-black">PRO</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">В базе доступно {gymBroCards.length} анкет</p>
                </div>
                <span className="text-2xl">🤝</span>
              </div>

              <button
                onClick={() => setActiveTab('gymbro')}
                className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-2xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {myGymBroCard ? 'Открыть поиск напарников ➔' : 'Заполнить анкету GymBro ➔'}
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Рацион & Питание
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-black">PRO</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">КБЖУ, меню на 7 дней и корзина закупки</p>
                </div>
                <span className="text-2xl">🥗</span>
              </div>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl transition border border-slate-700 cursor-pointer"
              >
                Открыть конструктор питания ➔
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
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <h2 className="text-base font-bold text-white">Мой аккаунт</h2>

              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-xl font-black text-slate-950 shadow-md">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentUser.name}</h3>
                    <p className="text-xs text-amber-400">{currentUser.city} • {currentUser.gender}</p>
                  </div>
                </div>

                {myGymBroCard ? (
                  <div className="text-xs space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center">
                      <p className="text-amber-400 font-bold">Карточка GymBro активна:</p>
                      <button
                        onClick={() => setActiveTab('gymbro')}
                        className="text-[11px] text-amber-400 underline cursor-pointer"
                      >
                        Изменить
                      </button>
                    </div>
                    <p><span className="text-slate-500">🏢 Будни:</span> {myGymBroCard.weekday_gym}</p>
                    <p><span className="text-slate-500">🏙 Выходные:</span> {myGymBroCard.weekend_gym}</p>
                    <p><span className="text-slate-500">🎯 Сплит:</span> {myGymBroCard.split}</p>
                    <p><span className="text-slate-500">⏰ Время:</span> {myGymBroCard.time_slot}</p>
                    {myGymBroCard.instagram && (
                      <p><span className="text-slate-500">📸 Inst:</span> @{myGymBroCard.instagram}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab('gymbro')}
                    className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    + Заполнить анкету поиска GymBro
                  </button>
                )}
              </div>
            </div>

            {/* Поддержка */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Поддержка</h3>
              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center no-underline"
              >
                Написать в техподдержку (@asanali_kk) 🤝
              </a>
            </div>

            {/* Документы */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Документы</h3>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button type="button" onClick={() => setActiveDoc('rules')} className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex justify-between items-center cursor-pointer">
                  <span>🛡 Правила сообщества</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button type="button" onClick={() => setActiveDoc('offer')} className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex justify-between items-center cursor-pointer">
                  <span>📄 Публичный договор-оферта</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button type="button" onClick={() => setActiveDoc('payment')} className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex justify-between items-center cursor-pointer">
                  <span>💳 Регламент оплаты (Kaspi)</span>
                  <span className="text-slate-500">➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around py-2 z-20">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${activeTab === 'home' ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="text-base mb-0.5">🏠</span> Главная
        </button>
        <button onClick={() => setActiveTab('gymbro')} className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${activeTab === 'gymbro' ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="text-base mb-0.5">👥</span> GymBro
        </button>
        <button onClick={() => setActiveTab('nutrition')} className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${activeTab === 'nutrition' ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="text-base mb-0.5">🥗</span> Питание
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${activeTab === 'profile' ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="text-base mb-0.5">👤</span> Профиль
        </button>
      </nav>
    </div>
  );
}
