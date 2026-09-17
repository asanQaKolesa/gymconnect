import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ALMATY_GYMS } from '../data/almatyGyms';

export const INVICTUS_CLUBS = ALMATY_GYMS;

export default function GymBroTab({ session }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  
  // Модальные окна
  const [gymSearch, setGymSearch] = useState('');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [filterGym, setFilterGym] = useState('Все');

  const TIME_SLOTS = [
    'Утро (06:00 - 10:00)',
    'Обед (12:00 - 15:00)',
    'После обеда (15:00 - 18:00)',
    'Вечер (18:00 - 21:00)',
    'Поздний вечер (21:00+)',
    'Плавающий график / В любое время'
  ];

  const PERSONALITY_TYPES = [
    { label: 'Интроверт', emoji: '🤫', desc: 'В наушниках, фокус' },
    { label: 'Экстраверт', emoji: '⚡', desc: 'Драйв и общение' },
    { label: 'Амбиверт', emoji: '⚖️', desc: 'Под настроение' }
  ];

  const GOALS_LIST = ['Набор массы', 'Похудение / Сушка', 'Пауэрлифтинг', 'Поддержание формы', 'Кроссфит', 'Выносливость'];
  const DAYS_LIST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Мужской',
    looking_for_gender: 'Всех',
    experience_level: 'Средний (1-3 года)',
    goals: [],
    preferred_days: [],
    preferred_time: 'Вечер (18:00 - 21:00)',
    personality_type: 'Амбиверт',
    home_gym: ALMATY_GYMS[0],
    bio: '',
    photo_url: '',
    telegram_contact: ''
  });

  // Получение надежного идентификатора пользователя (Telegram ID -> Supabase Auth -> LocalStorage)
  const resolveUserId = () => {
    // 1. Проверяем Telegram Mini App
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      return `tg_${tgUser.id}`;
    }
    // 2. Проверяем сессию Supabase
    if (session?.user?.id) {
      return session.user.id;
    }
    // 3. Создаем постоянный локальный ID устройства
    let localId = localStorage.getItem('gymconnect_device_user_id');
    if (!localId) {
      localId = 'usr_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('gymconnect_device_user_id', localId);
    }
    return localId;
  };

  useEffect(() => {
    const uid = resolveUserId();
    setCurrentUserId(uid);

    // Автоподстановка имени и юзернейма из Telegram
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
        telegram_contact: prev.telegram_contact || tgUser.username || ''
      }));
    }

    loadUserProfile(uid);
    loadBroProfiles(uid);
  }, [session]);

  const loadUserProfile = async (uid) => {
    try {
      const { data } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || 'Мужской',
          looking_for_gender: data.looking_for_gender || 'Всех',
          experience_level: data.experience_level || 'Средний (1-3 года)',
          goals: data.goals || [],
          preferred_days: data.preferred_days || [],
          preferred_time: data.preferred_time || 'Вечер (18:00 - 21:00)',
          personality_type: data.personality_type || 'Амбиверт',
          home_gym: data.home_gym || ALMATY_GYMS[0],
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          telegram_contact: data.telegram_contact || ''
        });
      } else {
        setIsEditing(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBroProfiles = async (uid) => {
    setLoading(true);
    try {
      let query = supabase.from('gymbro_profiles').select('*');
      if (uid) {
        query = query.neq('user_id', uid);
      }
      const { data } = await query;
      if (data) {
        setProfiles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Максимальный размер фото — 5 МБ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const uid = currentUserId || resolveUserId();
      if (!formData.telegram_contact.trim()) {
        alert('Укажите ваш Telegram username для связи');
        return;
      }

      const payload = {
        user_id: uid,
        ...formData,
        telegram_contact: formData.telegram_contact.replace('@', '').trim(),
        age: parseInt(formData.age, 10) || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('gymbro_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      alert('✅ Анкета успешно сохранена!');
      setIsEditing(false);
      loadBroProfiles(uid);
    } catch (err) {
      alert('Ошибка при сохранении: ' + err.message);
    }
  };

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter(d => d !== day)
        : [...prev.preferred_days, day]
    }));
  };

  const filteredGymsModal = ALMATY_GYMS.filter(g =>
    g.toLowerCase().includes(gymSearch.toLowerCase())
  );

  const displayedProfiles = profiles.filter(p => {
    if (filterGym !== 'Все' && p.home_gym !== filterGym) return false;
    if (formData.looking_for_gender === 'Парней' && p.gender !== 'Мужской') return false;
    if (formData.looking_for_gender === 'Девушек' && p.gender !== 'Женский') return false;
    return true;
  });

  return (
    <div className="max-w-xl mx-auto p-4 pb-28 text-white">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          🔥 GymBro Tinder
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold border border-gray-700 transition"
        >
          {isEditing ? 'Смотреть анкеты' : 'Моя анкета'}
        </button>
      </div>

      {isEditing ? (
        /* РЕДАКТИРОВАНИЕ АНКЕТЫ */
        <form onSubmit={handleSaveProfile} className="space-y-4 bg-[#111827] p-5 rounded-2xl border border-gray-800">
          
          {/* ЮРИДИЧЕСКАЯ ПЛАШКА */}
          <div 
            onClick={() => setIsRulesModalOpen(true)}
            className="cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 transition"
          >
            <span className="text-lg shrink-0">🛡️</span>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-emerald-300">
                Правила сообщества и согласие на публикацию
              </p>
              <p className="text-gray-400">
                Заполняя анкету, вы даете согласие на размещение профиля в GymBro. Нажмите, чтобы прочесть.
              </p>
            </div>
          </div>

          {/* ФОТО */}
          <div className="flex items-center gap-4 bg-[#1f2937]/70 p-3 rounded-2xl border border-gray-700/60">
            <div className="w-20 h-20 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 overflow-hidden flex items-center justify-center shrink-0">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📸</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Фото анкеты
              </label>
              <label className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold cursor-pointer transition">
                <span>📁 Загрузить фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.photo_url && (
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, photo_url: '' }))}
                  className="text-xs text-rose-400 hover:underline block"
                >
                  Удалить фото
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium">Имя и фамилия</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Арман Ахметов"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium">Возраст</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
                placeholder="24"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Твой пол</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
              </select>
            </div>
          </div>

          {/* КОГО ИЩЕТ */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">
              Кого ты ищешь для тренировок?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Парней', 'Девушек', 'Всех'].map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setFormData({ ...formData, looking_for_gender: target })}
                  className={`py-2 rounded-xl border text-xs font-bold transition ${
                    formData.looking_for_gender === target
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-[#1f2937] text-gray-300 border-gray-700 hover:text-white'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>

          {/* ПСИХОТИП */}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">
              Психотип на тренировке (вайб)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERSONALITY_TYPES.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, personality_type: p.label })}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    formData.personality_type === p.label
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-[#1f2937] border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ВРЕМЯ ТРЕНИРОВОК */}
          <div>
            <label className="text-xs text-gray-400 font-medium">Время тренировок</label>
            <select
              value={formData.preferred_time}
              onChange={e => setFormData({ ...formData, preferred_time: e.target.value })}
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* ВЫБОР ЗАЛА */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Твой фитнес-клуб / филиал</label>
            <button
              type="button"
              onClick={() => setIsGymModalOpen(true)}
              className="w-full bg-[#1f2937] border border-gray-700 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between text-white transition-colors"
            >
              <span className="truncate text-sm font-medium text-emerald-300">
                {formData.home_gym || 'Выбрать зал из списка...'}
              </span>
              <span className="text-xs text-gray-400 ml-2 shrink-0">🔍 Найти</span>
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium">Стаж тренировок</label>
            <select
              value={formData.experience_level}
              onChange={e => setFormData({ ...formData, experience_level: e.target.value })}
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Новичок (< 1 года)">Новичок (&lt; 1 года)</option>
              <option value="Средний (1-3 года)">Средний (1-3 года)</option>
              <option value="Опытный (3-5 лет)">Опытный (3-5 лет)</option>
              <option value="Профи (5+ лет)">Профи (5+ лет)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Цели</label>
            <div className="flex flex-wrap gap-1.5">
              {GOALS_LIST.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGoal(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    formData.goals.includes(g)
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Дни тренировок</label>
            <div className="flex gap-1">
              {DAYS_LIST.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    formData.preferred_days.includes(d)
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-medium">О себе</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl p-3 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ищу напарника на жим и базу, взаимная страховка..."
            />
          </div>

          {/* TELEGRAM USERNAME */}
          <div>
            <label className="text-xs text-gray-400 font-medium">
              Telegram Username (для связи)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm">@</span>
              <input
                type="text"
                required
                value={formData.telegram_contact}
                onChange={e => setFormData({ ...formData, telegram_contact: e.target.value.replace('@', '') })}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="username"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            💾 Сохранить анкету
          </button>
        </form>
      ) : (
        /* КАРТОЧКА СВАЙПА */
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-gray-400 shrink-0">Зал:</span>
            <button
              onClick={() => setFilterGym('Все')}
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium ${
                filterGym === 'Все'
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              Все залы
            </button>
            <button
              onClick={() => setFilterGym(formData.home_gym)}
              className={`px-3 py-1 rounded-full border whitespace-nowrap font-medium ${
                filterGym === formData.home_gym
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              Только мой филиал
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Загрузка бро...</div>
          ) : displayedProfiles.length > 0 && currentIndex < displayedProfiles.length ? (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="w-full h-72 bg-gray-900 relative">
                {displayedProfiles[currentIndex].photo_url ? (
                  <img
                    src={displayedProfiles[currentIndex].photo_url}
                    alt={displayedProfiles[currentIndex].full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-t from-black/80 to-transparent">
                    🏋️‍♂️
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-1.5">
                  <span>
                    {displayedProfiles[currentIndex].personality_type === 'Интроверт' ? '🤫' : 
                     displayedProfiles[currentIndex].personality_type === 'Экстраверт' ? '⚡' : '⚖️'}
                  </span>
                  <span>{displayedProfiles[currentIndex].personality_type || 'Амбиверт'}</span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent p-5">
                  <h3 className="text-2xl font-black text-white">
                    {displayedProfiles[currentIndex].full_name}, {displayedProfiles[currentIndex].age}
                  </h3>
                  <p className="text-emerald-400 font-semibold text-xs mt-0.5">
                    📍 {displayedProfiles[currentIndex].home_gym}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-2 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                    ⏱ {displayedProfiles[currentIndex].preferred_time || 'Вечер'}
                  </span>
                  <span className="bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                    💪 {displayedProfiles[currentIndex].experience_level}
                  </span>
                </div>

                {displayedProfiles[currentIndex].bio && (
                  <p className="text-sm text-gray-300 bg-gray-900/80 p-3 rounded-xl border border-gray-800 leading-relaxed">
                    «{displayedProfiles[currentIndex].bio}»
                  </p>
                )}

                <div>
                  <div className="text-xs text-gray-400 font-medium mb-1.5">Цели:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {displayedProfiles[currentIndex].goals?.map((g, i) => (
                      <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {displayedProfiles[currentIndex].telegram_contact && (
                  <div className="pt-2">
                    <a
                      href={`https://t.me/${displayedProfiles[currentIndex].telegram_contact.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full block py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-center text-xs font-bold transition"
                    >
                      ✈️ Написать в Telegram (@{displayedProfiles[currentIndex].telegram_contact})
                    </a>
                  </div>
                )}
              </div>

              <div className="flex border-t border-gray-800 bg-[#0b0f19]">
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(prev + 1, displayedProfiles.length))}
                  className="flex-1 py-4 text-center font-bold text-gray-400 hover:text-rose-400 border-r border-gray-800 transition-colors"
                >
                  ✕ Пропустить
                </button>
                <button
                  onClick={() => {
                    const tg = displayedProfiles[currentIndex].telegram_contact;
                    if (tg) {
                      window.open(`https://t.me/${tg.replace('@', '')}`, '_blank');
                    }
                    setCurrentIndex(prev => Math.min(prev + 1, displayedProfiles.length));
                  }}
                  className="flex-1 py-4 text-center font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  ⚡ Тренить вместе
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-10 text-center space-y-3">
              <div className="text-3xl">🏁</div>
              <h4 className="font-bold text-white text-base">Анкеты подошли к концу</h4>
              <p className="text-xs text-gray-400">Смени фильтр залов или вернись чуть позже!</p>
              <button
                onClick={() => { setFilterGym('Все'); setCurrentIndex(0); }}
                className="px-4 py-2 bg-gray-800 rounded-xl text-xs font-semibold text-white border border-gray-700"
              >
                Сбросить на «Все залы»
              </button>
            </div>
          )}
        </div>
      )}

      {/* МОДАЛКА ПРАВИЛ */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🛡️ Правила сообщества GymBro
              </h3>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                1. <strong>Согласие на публикацию</strong>: Заполняя и сохраняя анкету в разделе GymBro, вы добровольно делаете свои данные (имя, возраст, цели, зал, Telegram username и фото) открытыми для других участников GymConnect.
              </p>
              <p>
                2. <strong>Конфиденциальность</strong>: Номер телефона не собирается. Единственный открытый канал связи — никнейм в Telegram.
              </p>
              <p>
                3. <strong>Взаимное уважение</strong>: Спам, навязчивая реклама и токсичность влекут перманентный бан.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
            >
              Я принимаю условия
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛКА ВЫБОРА ЗАЛА */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                📍 Выберите зал ({filteredGymsModal.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsGymModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={gymSearch}
                onChange={e => setGymSearch(e.target.value)}
                placeholder="Поиск зала (Invictus, Абая, Blitz, Самал...)"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-1 pr-1 divide-y divide-gray-800/40">
              {filteredGymsModal.map((gym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, home_gym: gym }));
                    setIsGymModalOpen(false);
                    setGymSearch('');
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all text-xs flex flex-col ${
                    formData.home_gym === gym
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-semibold'
                      : 'hover:bg-gray-800/60 text-gray-200'
                  }`}
                >
                  {gym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
