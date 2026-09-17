import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ALMATY_GYMS } from '../data/almatyGyms';

export const INVICTUS_CLUBS = ALMATY_GYMS;

export default function GymBroTab({ session }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Поиск и выбор зала
  const [gymSearch, setGymSearch] = useState('');
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [filterGym, setFilterGym] = useState('Все');

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Мужской',
    experience_level: 'Средний (1-3 года)',
    goals: [],
    preferred_days: [],
    preferred_time: 'Вечер (18:00 - 21:00)',
    home_gym: ALMATY_GYMS[0],
    bio: '',
    photo_url: '',
    telegram_contact: '',
    whatsapp_contact: ''
  });

  const GOALS_LIST = ['Набор массы', 'Похудение / Сушка', 'Пауэрлифтинг', 'Поддержание формы', 'Кроссфит', 'Выносливость'];
  const DAYS_LIST = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile();
      loadBroProfiles();
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          age: data.age || '',
          gender: data.gender || 'Мужской',
          experience_level: data.experience_level || 'Средний (1-3 года)',
          goals: data.goals || [],
          preferred_days: data.preferred_days || [],
          preferred_time: data.preferred_time || 'Вечер (18:00 - 21:00)',
          home_gym: data.home_gym || ALMATY_GYMS[0],
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          telegram_contact: data.telegram_contact || '',
          whatsapp_contact: data.whatsapp_contact || ''
        });
      } else {
        setIsEditing(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBroProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gymbro_profiles')
        .select('*')
        .neq('user_id', session.user.id);

      if (data) {
        setProfiles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: session.user.id,
        ...formData,
        age: parseInt(formData.age, 10) || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('gymbro_profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setIsEditing(false);
      loadBroProfiles();
    } catch (err) {
      alert('Ошибка при сохранении анкеты: ' + err.message);
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
    if (filterGym === 'Все') return true;
    return p.home_gym === filterGym;
  });

  return (
    <div className="max-w-xl mx-auto p-4 pb-28 text-white">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
          🔥 GymBro Tinder
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold border border-gray-700"
        >
          {isEditing ? 'Смотреть анкеты' : 'Моя анкета'}
        </button>
      </div>

      {isEditing ? (
        /* РЕГИСТРАЦИЯ И РЕДАКТИРОВАНИЕ АНКЕТЫ */
        <form onSubmit={handleSaveProfile} className="space-y-4 bg-[#111827] p-5 rounded-2xl border border-gray-800">
          <h3 className="text-base font-bold text-emerald-400">Настройка твоей карточки</h3>

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
              <label className="text-xs text-gray-400 font-medium">Пол</label>
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

          {/* КНОПКА ВЫБОРА ЗАЛА С ОКНОМ ПОИСКА */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium">Твой фитнес-клуб / филиал</label>
            <button
              type="button"
              onClick={() => setIsGymModalOpen(true)}
              className="w-full bg-[#1f2937] border border-gray-700 hover:border-emerald-500 rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between text-white transition-colors"
            >
              <span className="truncate text-sm font-medium text-emerald-300">
                {formData.home_gym || 'Выбрать зал из 230 клубов...'}
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
            <label className="text-xs text-gray-400 font-medium mb-1 block">Цели тренировок</label>
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
            <label className="text-xs text-gray-400 font-medium">О себе / кого ищешь</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl p-3 text-sm mt-1 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ищу напарника на жим и присед по вечерам, взаимная страховка..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium">Telegram (@username)</label>
              <input
                type="text"
                value={formData.telegram_contact}
                onChange={e => setFormData({ ...formData, telegram_contact: e.target.value })}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3 py-2 text-xs mt-1 text-white focus:outline-none focus:border-emerald-500"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp_contact}
                onChange={e => setFormData({ ...formData, whatsapp_contact: e.target.value })}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-3 py-2 text-xs mt-1 text-white focus:outline-none focus:border-emerald-500"
                placeholder="+7 707..."
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
        /* ЛЕНТА СВАЙПОВ ТИНДЕРА */
        <div className="space-y-4">
          {/* Фильтр по залу */}
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
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {displayedProfiles[currentIndex].full_name}, {displayedProfiles[currentIndex].age}
                    </h3>
                    <p className="text-emerald-400 font-semibold text-xs mt-0.5">
                      📍 {displayedProfiles[currentIndex].home_gym}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                    {displayedProfiles[currentIndex].experience_level}
                  </span>
                </div>

                {displayedProfiles[currentIndex].bio && (
                  <p className="text-sm text-gray-300 bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 leading-relaxed">
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

                <div className="pt-2 flex gap-3">
                  {displayedProfiles[currentIndex].telegram_contact && (
                    <a
                      href={`https://t.me/${displayedProfiles[currentIndex].telegram_contact.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-center text-xs font-bold"
                    >
                      ✈️ Telegram
                    </a>
                  )}
                  {displayedProfiles[currentIndex].whatsapp_contact && (
                    <a
                      href={`https://wa.me/${displayedProfiles[currentIndex].whatsapp_contact.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-center text-xs font-bold"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Кнопки листания */}
              <div className="flex border-t border-gray-800 bg-[#0b0f19]">
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(prev + 1, displayedProfiles.length))}
                  className="flex-1 py-4 text-center font-bold text-gray-400 hover:text-rose-400 border-r border-gray-800 transition-colors"
                >
                  ✕ Пропустить
                </button>
                <button
                  onClick={() => {
                    alert('Контакт открыт в карточке!');
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

      {/* МОДАЛЬНОЕ ОКНО ПОИСКА ПО 230 ЗАЛАМ */}
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
