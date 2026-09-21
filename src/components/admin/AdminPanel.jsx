// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ShieldCheck, Users, Dumbbell, Building2, LogOut, RefreshCw, Search, Trash2, Edit3, X, Check, Filter } from 'lucide-react';

export default function AdminPanel({ onBack }) {
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('gymconnect_admin_auth') === 'true';
  });
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'trainers', 'gyms'
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтры
  const [selectedGymFilter, setSelectedGymFilter] = useState('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState('all');

  // Модальные окна
  const [editingProfile, setEditingProfile] = useState(null); // Для редактирования
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Для добавления
  const [newProfileData, setNewProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    city: 'Алматы',
    district: 'Медеуский',
    gym: 'Invictus Go | Улица Навои, 97, Алматы',
    membership_term: '6_months',
    experience_level: 'independent',
    trainer_need: 'self',
    specialization: 'athlete',
    goal: 'mass',
    looking_for: 'gymbro',
    workout_time: 'evening',
    workout_days: ['mon', 'wed', 'fri'],
    role: 'user'
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'admin' && password === 'gymconnect2026') {
      setIsAdminAuth(true);
      sessionStorage.setItem('gymconnect_admin_auth', 'true');
      fetchProfiles();
    } else {
      alert('Неверный логин или пароль администратора!');
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem('gymconnect_admin_auth');
  };

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки базы:', error.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdminAuth) {
      fetchProfiles();
    }
  }, [isAdminAuth]);

  // Удаление пользователя
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить атлета ${name} из базы данных?`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  // Сохранение отредактированного профиля
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update(editingProfile)
      .eq('id', editingProfile.id);

    if (error) {
      alert('Ошибка обновления: ' + error.message);
    } else {
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? editingProfile : p));
      setEditingProfile(null);
      alert('Профиль успешно обновлен!');
    }
  };

  // Ручное добавление атлета через CRM
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    const payload = {
      ...newProfileData,
      age: Number(newProfileData.age),
      height: Number(newProfileData.height),
      weight: Number(newProfileData.weight),
      agree_terms: true,
      agree_privacy: true,
      agree_trainers: true,
      agree_safety: true
    };

    const { data, error } = await supabase.from('profiles').insert([payload]).select();
    if (error) {
      alert('Ошибка создания: ' + error.message);
    } else {
      if (data) setProfiles(prev => [data[0], ...prev]);
      setIsAddModalOpen(false);
      alert('Атлет успешно добавлен в базу!');
    }
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GymConnect Admin</h1>
            <p className="text-xs text-slate-500">Закрытая панель управления CRM</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Логин</label>
              <input 
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Пароль</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all"
            >
              Войти в админ-панель
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-all"
              >
                Вернуться в приложение
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Фильтрация
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.gym?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesGym = selectedGymFilter === 'all' || p.gym === selectedGymFilter;
    const matchesGoal = selectedGoalFilter === 'all' || p.goal === selectedGoalFilter;

    if (activeTab === 'users') return matchesSearch && matchesGym && matchesGoal && (p.role === 'user' || !p.role);
    if (activeTab === 'trainers') return matchesSearch && (p.role === 'trainer' || p.trainer_username);
    if (activeTab === 'gyms') return matchesSearch; 
    return matchesSearch && matchesGym && matchesGoal;
  });

  // Уникальные списки для фильтров
  const uniqueGyms = [...new Set(profiles.map(p => p.gym))].filter(Boolean);
  const uniqueGoals = [...new Set(profiles.map(p => p.goal))].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Шапка админки */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              GC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">GymConnect CRM Dashboard</h1>
              <p className="text-xs text-slate-500">Всего записей в базе: {profiles.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+ Добавить атлета</span>
            </button>
            <button 
              onClick={fetchProfiles}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Навигация (Табы) */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Атлеты ({profiles.filter(p => p.role === 'user' || !p.role).length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trainers')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'trainers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Тренеры ({profiles.filter(p => p.trainer_username).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gyms')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'gyms' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Фитнес-залы & Клубы</span>
          </button>
        </div>

        {/* Панель поиска и фильтров */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, Telegram или залу..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
            />
          </div>

          <div>
            <select
              value={selectedGymFilter}
              onChange={(e) => setSelectedGymFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
            >
              <option value="all">🏋️‍♂️ Все фитнес-залы</option>
              {uniqueGyms.map((gym, idx) => (
                <option key={idx} value={gym}>{gym}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGoalFilter}
              onChange={(e) => setSelectedGoalFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm cursor-pointer"
            >
              <option value="all">🎯 Все цели тренировок</option>
              {uniqueGoals.map((goal, idx) => (
                <option key={idx} value={goal}>{goal}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Таблица данных */}
        {activeTab === 'gyms' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Статистика по фитнес-клубам Алматы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uniqueGyms.map((gymName, index) => {
                const count = profiles.filter(p => p.gym === gymName).length;
                return (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{gymName}</h4>
                      <p className="text-[10px] text-slate-500">Зарегистрированных атлетов</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {count} чел.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3 w-12 text-center">№</th>
                    <th className="p-3">Имя / Фамилия</th>
                    <th className="p-3">Telegram</th>
                    <th className="p-3">Зал</th>
                    <th className="p-3">Цель / Стаж</th>
                    <th className="p-3">Абонемент</th>
                    <th className="p-3">Тренер</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((p, index) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono">{index + 1}</td>
                        <td className="p-3 font-medium text-slate-900">
                          {p.first_name} {p.last_name}
                          <div className="text-[10px] text-slate-400">{p.age} лет, {p.gender === 'male' ? 'М' : 'Ж'}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-mono text-[11px]">
                            {p.username}
                          </span>
                        </td>
                        <td className="p-3 max-w-[180px] truncate" title={p.gym}>
                          {p.gym}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">{p.goal}</span>
                          <div className="text-[10px] text-slate-400">{p.experience_level}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                            {p.membership_term}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-indigo-600">
                          {p.trainer_username || '—'}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button 
                            onClick={() => setEditingProfile(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors inline-flex items-center"
                            title="Редактировать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, `${p.first_name} ${p.last_name}`)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        {loading ? 'Загрузка данных из базы...' : 'Данные не найдены'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ */}
        {editingProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Редактирование анкеты</h3>
                <button onClick={() => setEditingProfile(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Имя</label>
                    <input 
                      type="text"
                      value={editingProfile.first_name || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, first_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Фамилия</label>
                    <input 
                      type="text"
                      value={editingProfile.last_name || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, last_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram Username</label>
                  <input 
                    type="text"
                    value={editingProfile.username || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, username: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Возраст</label>
                    <input 
                      type="number"
                      value={editingProfile.age || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, age: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Рост (см)</label>
                    <input 
                      type="number"
                      value={editingProfile.height || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, height: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Вес (кг)</label>
                    <input 
                      type="number"
                      value={editingProfile.weight || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, weight: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Фитнес-зал</label>
                  <input 
                    type="text"
                    value={editingProfile.gym || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, gym: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Цель</label>
                    <input 
                      type="text"
                      value={editingProfile.goal || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, goal: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Абонемент</label>
                    <input 
                      type="text"
                      value={editingProfile.membership_term || ''}
                      onChange={(e) => setEditingProfile({...editingProfile, membership_term: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram тренера</label>
                  <input 
                    type="text"
                    value={editingProfile.trainer_username || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, trainer_username: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ АТЛЕТА */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Добавить атлета вручную</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Имя *</label>
                    <input 
                      type="text"
                      required
                      value={newProfileData.first_name}
                      onChange={(e) => setNewProfileData({...newProfileData, first_name: e.target.value})}
                      placeholder="Иван"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Фамилия *</label>
                    <input 
                      type="text"
                      required
                      value={newProfileData.last_name}
                      onChange={(e) => setNewProfileData({...newProfileData, last_name: e.target.value})}
                      placeholder="Иванов"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram Username *</label>
                  <input 
                    type="text"
                    required
                    value={newProfileData.username}
                    onChange={(e) => setNewProfileData({...newProfileData, username: e.target.value})}
                    placeholder="@username"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Возраст</label>
                    <input 
                      type="number"
                      value={newProfileData.age}
                      onChange={(e) => setNewProfileData({...newProfileData, age: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Рост</label>
                    <input 
                      type="number"
                      value={newProfileData.height}
                      onChange={(e) => setNewProfileData({...newProfileData, height: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Вес</label>
                    <input 
                      type="number"
                      value={newProfileData.weight}
                      onChange={(e) => setNewProfileData({...newProfileData, weight: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Фитнес-зал</label>
                  <input 
                    type="text"
                    value={newProfileData.gym}
                    onChange={(e) => setNewProfileData({...newProfileData, gym: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md"
                  >
                    Добавить в базу
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
