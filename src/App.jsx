import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('find');
  const [branches, setBranches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Пользователь
  const [myProfile, setMyProfile] = useState(null);
  const [telegramUser, setTelegramUser] = useState({ id: null, username: '', first_name: '' });

  // Фильтры ленты
  const [filterMatchOnly, setFilterMatchOnly] = useState(true);
  const [filterGender, setFilterGender] = useState('all'); // 'all' | 'GymBro' | 'GymGirl'

  // Форма регистрации
  const [formData, setFormData] = useState({
    name: '',
    gender: 'GymBro',
    level: 'Средний (1-3 года)',
    weekdayGym: '',
    weekendGym: '',
    split: 'Ноги / Спина',
    timeSlot: '19:00 - 21:00'
  });
  const [saving, setSaving] = useState(false);

  // Калькулятор КБЖУ
  const [weight, setWeight] = useState(75);
  const [goal, setGoal] = useState('muscle');

  useEffect(() => {
    async function initApp() {
      setLoading(true);

      // 1. Считываем данные Telegram WebApp
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

      // 2. Загружаем список залов
      const { data: gymData } = await supabase.from('gyms').select('*');
      if (gymData && gymData.length > 0) {
        setBranches(gymData);
        setFormData(prev => ({
          ...prev,
          weekdayGym: gymData[0].name,
          weekendGym: gymData[0].name
        }));
      }

      // 3. Проверяем наличие профиля
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
        }
      }

      // 4. Загружаем всех атлетов
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
      // Исключаем себя из списка напарников
      const filtered = currentTgId ? data.filter(a => a.telegram_id !== currentTgId) : data;
      setAthletes(filtered);
    }
  }

  // Регистрация
  async function handleRegister(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Укажи свое имя');
      return;
    }

    setSaving(true);
    const newProfile = {
      telegram_id: telegramUser.id || Date.now(),
      telegram_username: telegramUser.username || '',
      name: formData.name,
      gender: formData.gender,
      level: formData.level,
      weekday_gym: formData.weekdayGym || (branches[0]?.name ?? 'Invictus'),
      weekend_gym: formData.weekendGym || (branches[0]?.name ?? 'Invictus'),
      split: formData.split,
      time_slot: formData.timeSlot
    };

    const { data, error } = await supabase
      .from('athlete_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) {
      alert('Ошибка при регистрации: ' + error.message);
    } else {
      setMyProfile(data);
      await loadAthletes(data.telegram_id);
    }
    setSaving(false);
  }

  // Фильтрация атлетов
  const displayedAthletes = athletes.filter(bro => {
    // Фильтр по полу
    if (filterGender !== 'all' && bro.gender !== filterGender) return false;

    // Фильтр совпадения залов с пользователем
    if (filterMatchOnly && myProfile) {
      const matchWeekday = bro.weekday_gym === myProfile.weekday_gym || bro.weekend_gym === myProfile.weekday_gym;
      const matchWeekend = bro.weekday_gym === myProfile.weekend_gym || bro.weekend_gym === myProfile.weekend_gym;
      return matchWeekday || matchWeekend;
    }
    return true;
  });

  // Расчет рациона
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

  // ЭКРАН ОНБОРДИНГА (Регистрация нового пользователя)
  if (!myProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-5 max-w-md mx-auto">
        <header className="text-center py-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <span className="text-amber-500 text-sm">⚡</span>
            <span className="text-xs font-bold text-amber-400">GymConnect Pass</span>
          </div>
          <h1 className="text-xl font-black tracking-tight mt-2 text-white">Создай анкету атлета</h1>
          <p className="text-xs text-slate-400">
            Заполни данные один раз, чтобы находить напарников в залах Invictus Алматы.
          </p>
        </header>

        <form onSubmit={handleRegister} className="space-y-3 mt-2 flex-1 flex flex-col justify-between">
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Имя</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Как тебя зовут?"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Кто ты</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'GymBro' })}
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
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
                  className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
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
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Любимый сплит / фокус</label>
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
                placeholder="Например: 19:30 - 21:00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {saving ? 'Сохранение анкеты...' : 'Создать анкету и войти 🚀'}
          </button>
        </form>
      </div>
    );
  }

  // ГЛАВНЫЙ ЭКРАН С УМНЫМИ ФИЛЬТРАМИ
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 select-none">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 font-black text-lg">⚡</span>
            <h1 className="text-base font-bold tracking-tight">GymConnect</h1>
          </div>
          <p className="text-[11px] text-slate-400">
            {myProfile.name} • <span className="text-amber-400 font-medium">{myProfile.gender}</span>
          </p>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
          Online
        </span>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {activeTab === 'find' && (
          <div className="space-y-4">
            {/* Твои залы */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Твоя локация:
              </h2>
              <div className="text-xs space-y-1 text-slate-300">
                <p><span className="text-slate-500">🏢 Будни:</span> {myProfile.weekday_gym}</p>
                <p><span className="text-slate-500">🏙 Выходные:</span> {myProfile.weekend_gym}</p>
              </div>
            </div>

            {/* Блок фильтров */}
            <div className="space-y-2">
              {/* Фильтр: Совпадение залов или Все залы */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterMatchOnly(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    filterMatchOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  🎯 Мои залы
                </button>
                <button
                  onClick={() => setFilterMatchOnly(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    !filterMatchOnly
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  🌍 Все залы
                </button>
              </div>

              {/* Фильтр по полу */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterGender('all')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
                    filterGender === 'all'
                      ? 'bg-slate-800 text-white border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setFilterGender('GymBro')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
                    filterGender === 'GymBro'
                      ? 'bg-slate-800 text-amber-400 border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  🧔 GymBro
                </button>
                <button
                  onClick={() => setFilterGender('GymGirl')}
                  className={`flex-1 py-1 text-[11px] rounded-lg border transition ${
                    filterGender === 'GymGirl'
                      ? 'bg-slate-800 text-amber-400 border-slate-600'
                      : 'bg-slate-950 text-slate-500 border-slate-900'
                  }`}
                >
                  👩 GymGirl
                </button>
              </div>
            </div>

            {/* Заголовок ленты */}
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Напарники рядом ({displayedAthletes.length}):
              </h2>
              <button
                onClick={() => loadAthletes(myProfile.telegram_id)}
                className="text-[11px] text-amber-400 active:scale-95 transition"
              >
                🔄 Обновить
              </button>
            </div>

            {/* Карточки напарников */}
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
                    </div>

                    {bro.telegram_username ? (
                      <a
                        href={`https://t.me/${bro.telegram_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 no-underline"
                      >
                        Написать в Telegram (@{bro.telegram_username}) 🤝
                      </a>
                    ) : (
                      <button
                        onClick={() => alert(`У ${bro.name} не указан публичный username в Telegram`)}
                        className="w-full mt-1 bg-slate-800 text-slate-400 text-xs py-2 rounded-xl"
                      >
                        Username скрыт
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-4 space-y-1">
                  <p className="text-sm text-slate-300">В выбранных залах пока нет напарников</p>
                  <p className="text-xs text-slate-500">
                    Переключи фильтр на «🌍 Все залы» или пригласи друга!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-4">
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

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p className="font-semibold text-white">💡 Базовые ориентиры рациона:</p>
              <p>• Зеленая чечевица + филе индейки или куриная грудка в аэрогриле.</p>
              <p>• Тайминг спортпита: Креатин 5-10г ежедневно, цитруллин и бета-аланин за 30 мин до ног/спины.</p>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur border-t border-slate-800 flex justify-around py-2.5 z-20">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeTab === 'find' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">👥</span>
          GymBro
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeTab === 'nutrition' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">🥗</span>
          Питание
        </button>
      </nav>
    </div>
  );
}
