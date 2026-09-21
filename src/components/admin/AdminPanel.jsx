// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ShieldCheck, Users, Dumbbell, Building2, LogOut, RefreshCw, Search } from 'lucide-react';

export default function AdminPanel({ onBack }) {
  // Простой стейт авторизации администратора
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('gymconnect_admin_auth') === 'true';
  });
  
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  
  // Данные из базы
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'trainers', 'gyms'
  const [searchQuery, setSearchQuery] = useState('');

  // Авторизация админа (можешь поменять логин/пароль на свои)
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

  // Загрузка данных из Supabase
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

  // Если не авторизован — показываем экран входа
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GymConnect Admin</h1>
            <p className="text-xs text-slate-500">Вход в закрытую панель управления</p>
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

  // Фильтрация данных по вкладкам и поиску
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (p.gym?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (activeTab === 'users') return matchesSearch && (p.role === 'user' || !p.role);
    if (activeTab === 'trainers') return matchesSearch && (p.role === 'trainer' || p.trainer_username);
    if (activeTab === 'gyms') return matchesSearch; // Здесь можно сгруппировать по залам
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
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

        {/* Навигация по ролям (Табы) */}
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
            <span>Тренеры & Лиды</span>
          </button>

          <button
            onClick={() => setActiveTab('gyms')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'gyms' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Клубы и абонементы</span>
          </button>
        </div>

        {/* Поиск */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, Telegram или фитнес-залу..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>

        {/* Таблица данных */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3">Имя / Фамилия</th>
                  <th className="p-3">Telegram</th>
                  <th className="p-3">Зал</th>
                  <th className="p-3">Цель / Стаж</th>
                  <th className="p-3">Абонемент</th>
                  <th className="p-3">Тренер</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      {loading ? 'Загрузка данных из базы...' : 'Данные не найдены'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
