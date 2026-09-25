import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Calendar, 
  Phone, 
  Send, 
  Instagram, 
  MapPin, 
  Dumbbell, 
  Users, 
  Check 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function EditProfilePage({ user, onBack, onSaveSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || 'male',
    telegram_username: user?.telegram_username || user?.username || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    instagram: user?.instagram || '',
    city: user?.city || 'Алматы',
    district: user?.district || 'Бостандыкский',
    gym: user?.gym || 'Invictus Go (Almaty)',
    height: user?.height || '182',
    weight: user?.weight || '78',
    goal: user?.goal || 'Набор массы',
    workout_days: Array.isArray(user?.workout_days) ? user.workout_days : ['Пн', 'Ср', 'Пт'],
    gymbro_search: user?.gymbro_search !== undefined ? user.gymbro_search : true,
    bio: user?.bio || 'Gymrat'
  });

  const almatyGyms = [
    'Invictus Go (Almaty)',
    'Invictus Fitness (Dostyk Plaza)',
    'Fitness Blitz (Абая-Гагарина)',
    'Fitness Blitz (Mega Park)',
    'World Class Almaty',
    'Fidelity Club',
    'Grand Pool Gym',
    'Royal Club Fitness'
  ];

  const almatyDistricts = [
    'Бостандыкский',
    'Медеуский',
    'Алмалинский',
    'Ауэзовский',
    'Турксибский',
    'Жетысуский',
    'Наурызбайский',
    'Алатауский'
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const toggleDay = (day) => {
    if (formData.workout_days.includes(day)) {
      setFormData({
        ...formData,
        workout_days: formData.workout_days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        workout_days: [...formData.workout_days, day]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        birth_date: formData.birth_date,
        gender: formData.gender,
        telegram_username: formData.telegram_username.replace('@', ''),
        whatsapp: formData.whatsapp,
        instagram: formData.instagram.replace('@', ''),
        city: formData.city,
        district: formData.district,
        gym: formData.gym,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        goal: formData.goal,
        workout_days: formData.workout_days,
        gymbro_search: formData.gymbro_search,
        bio: formData.bio
      };

      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updatedPayload)
          .eq('id', user.id);

        if (error) throw error;
      }

      onSaveSuccess(updatedPayload);
    } catch (err) {
      console.error('Ошибка сохранения профиля:', err);
      onSaveSuccess(formData); // локальное сохранение
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] overflow-y-auto pb-16 pt-3 px-4 select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        
        {/* Верхняя навигационная панель */}
        <div className="bg-white rounded-2xl py-2.5 px-3.5 shadow-xs border border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Назад</span>
          </button>
          
          <h2 className="text-xs font-semibold text-slate-800">Редактирование анкеты</h2>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Сохранение...' : 'Готово'}
          </button>
        </div>

        {/* Форма редактирования */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Блок: Личные данные */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Личные данные</p>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Фамилия</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Дата рождения</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Пол</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-normal text-slate-500 block mb-1">О себе (Био)</label>
              <input
                type="text"
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Gymrat, стаж 4 года"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Блок: Контакты и соцсети */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Контакты и связь</p>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Telegram @username</label>
                <input
                  type="text"
                  value={formData.telegram_username}
                  onChange={e => setFormData({ ...formData, telegram_username: e.target.value })}
                  placeholder="username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">WhatsApp телефон</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+7 (707) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-normal text-slate-500 block mb-1">Instagram профиль</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="gymconnect.kz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Блок: Локация и фитнес-клуб */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Локация и фитнес-зал</p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Город</label>
                <input
                  type="text"
                  disabled
                  value={formData.city}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Район Алматы</label>
                <select
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  {almatyDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-normal text-slate-500 block mb-1">Основной клуб тренировок</label>
              <select
                value={formData.gym}
                onChange={e => setFormData({ ...formData, gym: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
              >
                {almatyGyms.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Блок: Параметры тела и цели */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 space-y-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Параметры и цель</p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Рост (см)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-normal text-slate-500 block mb-1">Вес (кг)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-normal text-slate-500 block mb-1">Главная цель тренировок</label>
              <select
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="Набор массы">Набор мышечной массы</option>
                <option value="Сушка и рельеф">Снижение веса и сушка</option>
                <option value="Поддержание тонуса">Поддержание тонуса и здоровья</option>
                <option value="Силовые показатели">Развитие силы и выносливости</option>
              </select>
            </div>

            {/* Дни недели */}
            <div>
              <label className="text-[11px] font-normal text-slate-500 block mb-1.5">Дни тренировок</label>
              <div className="flex gap-1">
                {daysOfWeek.map(d => {
                  const isSelected = formData.workout_days.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GymBro переключатель */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-800">Поиск напарника (GymBro)</p>
                <p className="text-[10px] text-slate-400">Показывать мой профиль атлетам из моего зала</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gymbro_search: !formData.gymbro_search })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  formData.gymbro_search ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.gymbro_search ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Кнопка отправки */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Сохранение данных...' : 'Сохранить изменения'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
