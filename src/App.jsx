import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { LEGAL_DOCS } from './legalDocs';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [branches, setBranches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myProfile, setMyProfile] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  // Всплывающее окно для документов
  const [activeDoc, setActiveDoc] = useState(null);

  const [filterMatchOnly, setFilterMatchOnly] = useState(true);
  const [filterGender, setFilterGender] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    gender: 'GymBro',
    level: 'Средний (1-3 года)',
    weekdayGym: '',
    weekendGym: '',
    split: 'Ноги / Спина (акцент на базу)',
    timeSlot: '19:00 - 21:00',
    instagram: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [weight, setWeight] = useState(75);
  const [goal, setGoal] = useState('muscle');

  useEffect(() => {
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
      if (tgName) {
        setFormData(prev => ({ ...prev, name: tgName }));
      }

      const { data: gymData } = await supabase.from('gyms').select('*');
      if (gymData && gymData.length > 0) {
        setBranches(gymData);
        setFormData(prev => ({
          ...prev,
          weekdayGym: prev.weekdayGym || gymData[0].name,
          weekendGym: prev.weekendGym || gymData[0].name
        }));
      }

      let currentProfile = null;
      if (tgId) {
        const { data: existingProfile } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('telegram_id', tgId)
          .maybeSingle();

        if (existingProfile) {
          currentProfile = existingProfile;
          setMyProfile(existingProfile);
          setFormData({
            name: existingProfile.name,
            gender: existingProfile.gender || 'GymBro',
            level: existingProfile.level,
            weekdayGym: existingProfile.weekday_gym,
            weekendGym: existingProfile.weekend_gym,
            split: existingProfile.split,
            timeSlot: existingProfile.time_slot,
            instagram: existingProfile.instagram || '',
            bio: existingProfile.bio || ''
          });
        }
      }

      await loadAthletes(currentProfile?.telegram_id || tgId);
      setLoading(false);
    }

    initApp();
  }, []);

  async function loadAthletes(currentTgId) {
    const { data } = await supabase
      .from('athlete_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const filtered = currentTgId ? data.filter(a => a.telegram_id !== currentTgId) : data;
      setAthletes(filtered);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Укажи свое имя');
      return;
    }

    setSaving(true);
    const profilePayload = {
      telegram_id: telegramUser.id || (myProfile ? myProfile.telegram_id : Date.now()),
      telegram_username: telegramUser.username || (myProfile ? myProfile.telegram_username : ''),
      name: formData.name,
      gender: formData.gender,
      level: formData.level,
      weekday_gym: formData.weekdayGym || (branches[0]?.name ?? 'Invictus'),
      weekend_gym: formData.weekendGym || (branches[0]?.name ?? 'Invictus'),
      split: formData.split,
      time_slot: formData.timeSlot,
      instagram: formData.instagram.replace('@', '').trim(),
      bio: formData.bio
    };

    if (myProfile) {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .update(profilePayload)
        .eq('id', myProfile.id)
        .select()
        .single();

      if (error) {
        alert('Ошибка обновления: ' + error.message);
      } else {
        setMyProfile(data);
        setIsEditing(false);
        await loadAthletes(data.telegram_id);
      }
    } else {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .insert([profilePayload])
        .select()
        .single();

      if (error) {
        alert('Ошибка регистрации: ' + error.message);
      } else {
        setMyProfile(data);
        setActiveTab('home');
        await loadAthletes(data.telegram_id);
      }
    }
    setSaving(false);
  }

  const displayedAthletes = athletes.filter(bro => {
    if (filterGender !== 'all' && bro.gender !== filterGender) return false;
    if (filterMatchOnly && myProfile) {
      const matchWeekday = bro.weekday_gym === myProfile.weekday_gym || bro.weekend_gym === myProfile.weekday_gym;
      const matchWeekend = bro.weekday_gym === myProfile.weekend_gym || bro.weekend_gym === myProfile.weekend_gym;
      return matchWeekday || matchWeekend;
    }
    return true;
  });

  const calories = goal === 'muscle' ? Math.round(weight * 36) : Math.round(weight * 28);
  const protein = Math.round(weight * 2.2);
  const fat = Math.round(weight * 0.9);
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);

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

  // Модальное окно просмотра документов
  const ModalDoc = activeDoc && (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-white pr-2">{LEGAL_DOCS[activeDoc]?.title}</h3>
          <button
            onClick={() => setActiveDoc(null)}
            className="text-slate-400 hover:text-white text-base px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {LEGAL_DOCS[activeDoc]?.content}
        </div>
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 rounded-b-3xl">
          <button
            onClick={() => setActiveDoc(null)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl font-bold transition cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );

  // Регистрация
  if (!myProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-5 max-w-md mx-auto">
        {ModalDoc}
        <header className="text-center py-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="text-amber-500 text-sm">⚡</span>
            <span className="text-xs font-bold text-amber-400">GymConnect ID</span>
          </div>
          <h1 className="text-xl font-black tracking-tight mt-2 text-white">Регистрация атлета</h1>
          <p className="text-xs text-slate-400">
            Создай профиль бесплатно, чтобы подключиться к сети атлетов Invictus Алматы.
          </p>
        </header>

        <form onSubmit={handleSaveProfile} className="space-y-3 mt-2 flex-1 flex flex-col justify-between">
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Твое имя"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Кто ты</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'GymBro' })}
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    formData.gender === 'GymBro'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>🧔</span> GymBro
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'GymGirl' })}
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    formData.gender === 'GymGirl'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>👩</span> GymGirl
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Уровень в зале</label>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Новичок (до 1 года)">Новичок (до 1 года)</option>
                <option value="Средний (1-3 года)">Средний (1-3 года)</option>
                <option value="Опытный (3+ года)">Опытный (3+ года)</option>
                <option value="Продвинутый лифтер">Продвинутый лифтер</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏢 Зал в будни</label>
              <select
                value={formData.weekdayGym}
                onChange={e => setFormData({ ...formData, weekdayGym: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏙 Зал на выходных</label>
              <select
                value={formData.weekendGym}
                onChange={e => setFormData({ ...formData, weekendGym: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Любимый сплит</label>
              <select
                value={formData.split}
                onChange={e => setFormData({ ...formData, split: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Ноги / Спина (акцент на базу)">Ноги / Спина (акцент на базу)</option>
                <option value="Грудь / Плечи / Руки">Грудь / Плечи / Руки</option>
                <option value="Full Body (все тело)">Full Body (все тело)</option>
                <option value="Пауэрлифтинг (присед / тяга)">Пауэрлифтинг (присед / тяга)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">⏰ Удобное время</label>
              <input
                type="text"
                value={formData.timeSlot}
                onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                placeholder="Будни 19:30, Выходные 12:00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <p className="text-[10px] text-slate-400 text-center leading-tight">
              Нажимая кнопку, вы принимаете{' '}
              <button type="button" onClick={() => setActiveDoc('offer')} className="text-amber-400 underline cursor-pointer">Договор-оферту</button>,{' '}
              <button type="button" onClick={() => setActiveDoc('privacy')} className="text-amber-400 underline cursor-pointer">Политику конфиденциальности</button> и{' '}
              <button type="button" onClick={() => setActiveDoc('rules')} className="text-amber-400 underline cursor-pointer">Правила сообщества</button>.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Создаем профиль...' : 'Завершить бесплатную регистрацию 🚀'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 select-none">
      {ModalDoc}

      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 font-black text-lg">⚡</span>
          <div>
            <h1 className="text-base font-bold tracking-tight">GymConnect</h1>
            <p className="text-[10px] text-slate-400">Алматы • Invictus Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
            PRO Тест
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
            Online
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* ГЛАВНАЯ */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 p-4 rounded-3xl border border-amber-500/20 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Карточка атлета</span>
                  <h2 className="text-lg font-black text-white mt-0.5">{myProfile.name}</h2>
                  <p className="text-xs text-slate-300">{myProfile.gender} • {myProfile.level}</p>
                </div>
                <span className="text-2xl">💪</span>
              </div>

              <div className="text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <p><span className="text-slate-400">🏢 Будни:</span> {myProfile.weekday_gym}</p>
                <p><span className="text-slate-400">🏙 Выходные:</span> {myProfile.weekend_gym}</p>
                <p><span className="text-slate-400">🎯 Фокус:</span> {myProfile.split}</p>
                {myProfile.instagram && (
                  <p><span className="text-slate-400">📸 Inst:</span> @{myProfile.instagram}</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Поиск GymBro
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-black">PRO</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Рядом доступно {athletes.length} напарников
                  </p>
                </div>
                <span className="text-2xl">🤝</span>
              </div>

              <button
                onClick={() => setActiveTab('gymbro')}
                className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-2xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Открыть поиск напарников ➔
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Рацион & КБЖУ
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md font-black">PRO</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Персональный расчет калорий и меню
                  </p>
                </div>
                <span className="text-2xl">🥗</span>
              </div>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Рассчитать свой рацион ➔
              </button>
            </div>
          </div>
        )}

        {/* GYMBRO */}
        {activeTab === 'gymbro' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 p-3 rounded-2xl border border-amber-500/30 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-amber-400">🔥 Доступ GymBro PRO открыт</p>
                <p className="text-[10px] text-slate-400">Бесплатный тестовый доступ для первых атлетов</p>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">Free Trial</span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterMatchOnly(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    filterMatchOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  🎯 Мои залы ({myProfile.weekday_gym.replace('Invictus Go — ', '')})
                </button>
                <button
                  onClick={() => setFilterMatchOnly(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    !filterMatchOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  🌍 Все залы
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterGender('all')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                    filterGender === 'all'
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilterGender('GymBro')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                    filterGender === 'GymBro'
                      ? 'bg-slate-800 text-amber-400 border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  🧔 GymBro
                </button>
                <button
                  onClick={() => setFilterGender('GymGirl')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition cursor-pointer ${
                    filterGender === 'GymGirl'
                      ? 'bg-slate-800 text-amber-400 border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  👩 GymGirl
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Напарники ({displayedAthletes.length}):
              </h2>
              <button
                onClick={() => loadAthletes(myProfile.telegram_id)}
                className="text-[11px] text-amber-400 active:scale-95 transition cursor-pointer"
              >
                🔄 Обновить
              </button>
            </div>

            <div className="space-y-3">
              {displayedAthletes.length > 0 ? (
                displayedAthletes.map(bro => (
                  <div key={bro.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {bro.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                            {bro.gender || 'GymBro'}
                          </span>
                        </h3>
                        <p className="text-xs text-amber-400 font-medium">{bro.level}</p>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {bro.split}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <p><span className="text-slate-500">🏢 Будни:</span> {bro.weekday_gym}</p>
                      <p><span className="text-slate-500">🏙 Выходные:</span> {bro.weekend_gym}</p>
                      <p><span className="text-slate-500">⏰ Время:</span> {bro.time_slot}</p>
                      {bro.bio && <p className="text-slate-400 italic">«{bro.bio}»</p>}
                    </div>

                    <div className="flex gap-2">
                      {bro.telegram_username && (
                        <a
                          href={`https://t.me/${bro.telegram_username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 no-underline shadow-md shadow-amber-500/10"
                        >
                          Telegram (@{bro.telegram_username}) 🤝
                        </a>
                      )}
                      {bro.instagram && (
                        <a
                          href={`https://instagram.com/${bro.instagram}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-pink-400 font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center justify-center no-underline border border-slate-700"
                        >
                          📸 Inst
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-4 space-y-1">
                  <p className="text-sm text-slate-300">В этом филиале пока нет других напарников</p>
                  <p className="text-xs text-slate-500">Переключи на «Все залы» или пригласи друзей!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ПИТАНИЕ */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500/20 to-slate-900 p-3 rounded-2xl border border-amber-500/30 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-amber-400">🥗 Модуль питания PRO</p>
                <p className="text-[10px] text-slate-400">Бесплатный расчет рациона на время теста</p>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">Free Trial</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Калькулятор рациона атлета</h2>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Вес тела: <span className="font-bold text-white">{weight} кг</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setGoal('muscle')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    goal === 'muscle'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Набор массы
                </button>
                <button
                  onClick={() => setGoal('cut')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    goal === 'cut'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Сушка / Рельеф
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Ккал</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">{calories}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Белки</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">{protein}г</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Жиры</p>
                  <p className="text-sm font-black text-sky-400 mt-0.5">{fat}г</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Углеводы</p>
                  <p className="text-sm font-black text-purple-400 mt-0.5">{carbs}г</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 text-[11px] text-slate-400">
              ⚠️ <b>Внимание:</b> Расчет носит информационный характер.{' '}
              <button
                type="button"
                onClick={() => setActiveDoc('disclaimer')}
                className="text-amber-400 underline font-medium cursor-pointer"
              >
                Медицинский отказ от ответственности
              </button>.
            </div>
          </div>
        )}

        {/* ПРОФИЛЬ + ТЕХПОДДЕРЖКА + ВСТРОЕННЫЕ ДОКУМЕНТЫ */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white">Моя анкета</h2>
                  <p className="text-[11px] text-slate-400">Так твою карточку видят напарники</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold active:scale-95 transition cursor-pointer"
                >
                  {isEditing ? 'Отмена' : 'Изменить ✏️'}
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-xl font-black text-slate-950 shadow-md">
                      {myProfile.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{myProfile.name}</h3>
                      <p className="text-xs text-amber-400">{myProfile.gender} • {myProfile.level}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                    <p><span className="text-slate-500">🏢 Будни:</span> <span className="text-slate-200 font-medium">{myProfile.weekday_gym}</span></p>
                    <p><span className="text-slate-500">🏙 Выходные:</span> <span className="text-slate-200 font-medium">{myProfile.weekend_gym}</span></p>
                    <p><span className="text-slate-500">🎯 Сплит:</span> <span className="text-slate-200 font-medium">{myProfile.split}</span></p>
                    <p><span className="text-slate-500">⏰ Время:</span> <span className="text-slate-200 font-medium">{myProfile.time_slot}</span></p>
                    {myProfile.instagram && (
                      <p><span className="text-slate-500">📸 Instagram:</span> <a href={`https://instagram.com/${myProfile.instagram}`} target="_blank" rel="noreferrer" className="text-pink-400 font-medium no-underline">@{myProfile.instagram}</a></p>
                    )}
                    {myProfile.bio && (
                      <p><span className="text-slate-500">💬 О себе:</span> <span className="text-slate-300 italic">{myProfile.bio}</span></p>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">📸 Instagram (без @)</label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="твой_аккаунт"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">💬 О себе / Цель</label>
                    <input
                      type="text"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Ищу страховку на присед / жим"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏢 Зал в будни</label>
                    <select
                      value={formData.weekdayGym}
                      onChange={e => setFormData({ ...formData, weekdayGym: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">🏙 Зал на выходных</label>
                    <select
                      value={formData.weekendGym}
                      onChange={e => setFormData({ ...formData, weekendGym: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">⏰ Время тренировок</label>
                    <input
                      type="text"
                      value={formData.timeSlot}
                      onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition cursor-pointer"
                  >
                    {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                  </button>
                </form>
              )}
            </div>

            {/* ТЕХПОДДЕРЖКА */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Поддержка пользователей</h3>
                <span className="text-lg">💬</span>
              </div>
              <p className="text-xs text-slate-400">
                Возник вопрос по работе сервиса или есть предложение по залам? Напиши напрямую в службу заботы.
              </p>
              <a
                href="https://t.me/asanali_kk"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 border border-amber-500/30 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 no-underline"
              >
                Написать в техподдержку (@asanali_kk) 🤝
              </a>
            </div>

            {/* ДОКУМЕНТЫ БЕЗ ТИЛЬДЫ (ВСТРОЕННЫЕ) */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Документы и безопасность
              </h3>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDoc('rules')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>🛡 Правила сообщества и безопасности</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc('offer')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>📄 Публичный договор-оферта</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc('privacy')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>🔒 Политика конфиденциальности</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc('payment')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>💳 Регламент оплаты и возврата (Kaspi)</span>
                  <span className="text-slate-500">➔</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDoc('disclaimer')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 hover:text-white flex justify-between items-center cursor-pointer"
                >
                  <span>⚕️ Медицинский отказ от ответственности</span>
                  <span className="text-slate-500">➔</span>
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-600 pb-2">
              GymConnect © 2026 • Алматы, Казахстан
            </p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around py-2 z-20">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${
            activeTab === 'home' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">🏠</span>
          Главная
        </button>

        <button
          onClick={() => setActiveTab('gymbro')}
          className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${
            activeTab === 'gymbro' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">👥</span>
          GymBro
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${
            activeTab === 'nutrition' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">🥗</span>
          Питание
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center text-[11px] font-semibold cursor-pointer ${
            activeTab === 'profile' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">👤</span>
          Профиль
        </button>
      </nav>
    </div>
  );
}
