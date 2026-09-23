// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ShieldCheck, Users, Dumbbell, Building2, LogOut, RefreshCw, Search, Trash2, Edit3, Eye, X, Crown, Download, User } from 'lucide-react';

export default function AdminPanel({ onBack }) {
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('gymconnect_admin_auth') === 'true';
  });
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  const [profiles, setProfiles] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedGymFilter, setSelectedGymFilter] = useState('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState('all');

  const [editingProfile, setEditingProfile] = useState(null); 
  const [viewingProfile, setViewingProfile] = useState(null); // Новое состояние для просмотра карточки атлета
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [proMonths, setProMonths] = useState(1);

  const handleLogin = (e) => {
    e.preventDefault();
    if (login === 'admin' && password === 'gymconnect2026') {
      setIsAdminAuth(true);
      sessionStorage.setItem('gymconnect_admin_auth', 'true');
      fetchAllData();
    } else {
      alert('Неверный логин или пароль администратора!');
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem('gymconnect_admin_auth');
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const loadedUsers = usersData || [];
    if (!usersError) setProfiles(loadedUsers);

    const { data: trainersData, error: trainersError } = await supabase
      .from('trainer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!trainersError && trainersData) {
      const trainersWithCount = trainersData.map(trainer => {
        const cleanTrainerUsername = (trainer.username || '').replace('@', '').trim().toLowerCase();
        const studentsCount = loadedUsers.filter(u => 
          (u.trainer_username || '').replace('@', '').trim().toLowerCase() === cleanTrainerUsername
        ).length;

        return {
          ...trainer,
          students_count: studentsCount
        };
      });
      setTrainers(trainersWithCount);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdminAuth) {
      fetchAllData();
    }
  }, [isAdminAuth]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить атлета ${name} из базы данных?`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDeleteTrainer = async (id, name) => {
    if (!window.confirm(`Удалить тренера ${name} из базы партнёров?`)) return;

    const { error } = await supabase.from('trainer_profiles').delete().eq('id', id);
    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      setTrainers(prev => prev.filter(t => t.id !== id));
    }
  };

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
      alert('Изменения успешно сохранены!');
    }
  };

  const handleGrantPro = async (months) => {
    const expiresDate = new Date();
    expiresDate.setMonth(expiresDate.getMonth() + Number(months));

    const updated = {
      ...editingProfile,
      is_pro: true,
      pro_expires_at: expiresDate.toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true, pro_expires_at: expiresDate.toISOString() })
      .eq('id', editingProfile.id);

    if (error) {
      alert('Ошибка активации Pro: ' + error.message);
    } else {
      setEditingProfile(updated);
      setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
      alert(`Pro-подписка активирована на ${months} мес.`);
    }
  };

  const handleRevokePro = async () => {
    const updated = {
      ...editingProfile,
      is_pro: false,
      pro_expires_at: null
    };

    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: false, pro_expires_at: null })
      .eq('id', editingProfile.id);

    if (error) {
      alert('Ошибка отзыва Pro: ' + error.message);
    } else {
      setEditingProfile(updated);
      setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
      alert('Pro-подписка деактивирована.');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Имя', 'Фамилия', 'Telegram', 'Возраст', 'Рост', 'Вес', 'Зал', 'Цель', 'Pro статус', 'Дата'];
    const rows = profiles.map(p => [
      p.id, p.first_name || '', p.last_name || '', p.username || '', p.age || '', p.height || '', p.weight || '',
      `"${(p.gym || '').replace(/"/g, '""')}"`, p.goal || '', p.is_pro ? 'PRO' : 'Free', p.created_at || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GymConnect_Athletes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <p className="text-xs text-slate-500">Панель управления основателя</p>
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
              Войти в CRM
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

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.gym?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesGym = selectedGymFilter === 'all' || p.gym === selectedGymFilter;
    const matchesGoal = selectedGoalFilter === 'all' || p.goal === selectedGoalFilter;

    return matchesSearch && matchesGym && matchesGoal;
  });

  const filteredTrainers = trainers.filter(t => 
    (t.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (t.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (t.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const uniqueGyms = [...new Set(profiles.map(p => p.gym))].filter(Boolean);
  const uniqueGoals = [...new Set(profiles.map(p => p.goal))].filter(Boolean);
  const proCount = profiles.filter(p => p.is_pro).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Шапка админки */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              GC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">GymConnect Founder CRM</h1>
              <p className="text-xs text-slate-500">Атлеты: {profiles.length} | Тренеры: {trainers.length} | Pro: {proCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={exportToCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт Excel</span>
            </button>
            <button 
              onClick={fetchAllData}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              title="Обновить"
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

        {/* Метрики (KPI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Всего атлетов</p>
              <h3 className="text-xl font-black text-slate-900">{profiles.length}</h3>
            </div>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Партнеров-тренеров</p>
              <h3 className="text-xl font-black text-indigo-600">{trainers.length}</h3>
            </div>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных Pro (Kaspi)</p>
              <h3 className="text-xl font-black text-amber-600">{proCount}</h3>
            </div>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
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
            <span>Атлеты ({profiles.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trainers')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'trainers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Тренеры ({trainers.length})</span>
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

        {/* Поиск */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, Telegram или залу..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>

        {/* РЕНДЕР ВКЛАДОК */}
        {activeTab === 'gyms' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Аналитика по фитнес-клубам Алматы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uniqueGyms.map((gymName, index) => {
                const count = profiles.filter(p => p.gym === gymName).length;
                return (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{gymName}</h4>
                      <p className="text-[10px] text-slate-500">Пользователей в базе</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {count} чел.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'trainers' ? (
          /* ТАБЛИЦА ТРЕНЕРОВ */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3 w-12 text-center">№</th>
                    <th className="p-3">Тренер</th>
                    <th className="p-3">Telegram / Телефон</th>
                    <th className="p-3">Учеников в CRM</th>
                    <th className="p-3">Специализации</th>
                    <th className="p-3">Залы</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTrainers.length > 0 ? (
                    filteredTrainers.map((t, index) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono">{index + 1}</td>
                        <td className="p-3 font-medium text-slate-900">
                          {t.first_name} {t.last_name}
                          <div className="text-[10px] text-slate-400">{t.experience_years || 'Стаж не указан'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-blue-600 font-mono">@{t.username}</div>
                          <div className="text-[10px] text-slate-400">{t.phone || '—'}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-xs">
                            {t.students_count} учеников
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {t.specializations?.map((s, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 max-w-[160px] truncate" title={(t.gyms || []).join(', ')}>
                          {(t.gyms || []).join(', ') || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleDeleteTrainer(t.id, `${t.first_name} ${t.last_name}`)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                            title="Удалить тренера"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        {loading ? 'Загрузка...' : 'Зарегистрированных тренеров пока нет'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ТАБЛИЦА АТЛЕТОВ */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="p-3 w-12 text-center">№</th>
                    <th className="p-3">Имя / Фамилия</th>
                    <th className="p-3">Telegram</th>
                    <th className="p-3">Тренер (ник)</th>
                    <th className="p-3">Зал</th>
                    <th className="p-3">Цель</th>
                    <th className="p-3">Статус</th>
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
                            @{p.username}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-indigo-600 font-mono text-[11px]">
                            {p.trainer_username ? `@${p.trainer_username}` : '—'}
                          </span>
                        </td>
                        <td className="p-3 max-w-[150px] truncate" title={p.gym}>{p.gym}</td>
                        <td className="p-3 font-semibold">{p.goal}</td>
                        <td className="p-3">
                          {p.is_pro ? (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                              <Crown className="w-3 h-3" /> PRO
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px]">Free</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {/* Кнопка Просмотра карточки */}
                          <button 
                            onClick={() => setViewingProfile(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center"
                            title="Просмотреть данные атлета"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Кнопка Редактирования */}
                          <button 
                            onClick={() => setEditingProfile(p)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors inline-flex items-center"
                            title="Редактировать и Pro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {/* Кнопка Удаления */}
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
                        {loading ? 'Загрузка данных...' : 'Данные не найдены'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА ПОЛНОЙ КАРТОЧКИ АТЛЕТА (БЕЗ РЕДАКТИРОВАНИЯ) */}
        {viewingProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{viewingProfile.first_name} {viewingProfile.last_name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">@{viewingProfile.username || 'не указан'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingProfile(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                {/* Антропометрия */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900">Антропометрия</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Возраст</span>
                      <span className="font-bold text-slate-800">{viewingProfile.age ? `${viewingProfile.age} лет` : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Пол</span>
                      <span className="font-bold text-slate-800">{viewingProfile.gender === 'male' ? 'Мужской' : viewingProfile.gender === 'female' ? 'Женский' : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Рост</span>
                      <span className="font-bold text-slate-800">{viewingProfile.height ? `${viewingProfile.height} см` : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Вес</span>
                      <span className="font-bold text-slate-800">{viewingProfile.weight ? `${viewingProfile.weight} кг` : '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Локация и зал */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900">Локация и цель</p>
                  <p><b>Город / Район:</b> {viewingProfile.city || 'Алматы'}, {viewingProfile.district || '—'}</p>
                  <p><b>Фитнес-зал:</b> {viewingProfile.gym || '—'}</p>
                  <p><b>Цель тренировок:</b> {viewingProfile.goal || '—'}</p>
                  <p><b>Уровень подготовки:</b> {viewingProfile.experience_level || '—'}</p>
                </div>

                {/* Статус и Тренер */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900">Связь и подписка</p>
                  <p><b>Персональный тренер:</b> <span className="text-indigo-600 font-mono">{viewingProfile.trainer_username ? `@${viewingProfile.trainer_username}` : 'Самостоятельно'}</span></p>
                  <p><b>Статус подписки:</b> {viewingProfile.is_pro ? 'PRO (Активна)' : 'Free (Базовый)'}</p>
                  <p><b>Дата регистрации:</b> {viewingProfile.created_at ? new Date(viewingProfile.created_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => setViewingProfile(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-xs">Закрыть</button>
              </div>
            </div>
          </div>
        )}

        {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ И PRO */}
        {editingProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Редактирование & Pro</h3>
                <button onClick={() => setEditingProfile(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-800 font-bold text-xs flex items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-600" /> Pro-подписка (Kaspi)
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${editingProfile.is_pro ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {editingProfile.is_pro ? 'АКТИВНА' : 'НЕАКТИВНА'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <select 
                    value={proMonths}
                    onChange={(e) => setProMonths(e.target.value)}
                    className="p-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value={1}>1 месяц</option>
                    <option value={3}>3 месяца</option>
                    <option value={6}>6 месяцев</option>
                    <option value={12}>1 год</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleGrantPro(proMonths)}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Активировать Pro
                  </button>
                  {editingProfile.is_pro && (
                    <button
                      type="button"
                      onClick={handleRevokePro}
                      className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold"
                    >
                      Снять
                    </button>
                  )}
                </div>
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

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram Тренера (привязка)</label>
                  <input 
                    type="text"
                    value={editingProfile.trainer_username || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, trainer_username: e.target.value})}
                    placeholder="ник тренера"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
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

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setEditingProfile(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md">Сохранить</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
