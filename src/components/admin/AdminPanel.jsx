// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  ShieldCheck, 
  Users, 
  Dumbbell, 
  Building2, 
  LogOut, 
  RefreshCw, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Crown, 
  Download,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function AdminPanel({ onBack }) {
  // Список доверенных идентификаторов основателя (Асанали Кусайынов)
  const FOUNDER_TG_ID = '8120357675';
  const FOUNDER_USERNAME = 'asanali_kk';

  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    // А. Проверка сохраненной сессии на устройстве
    if (
      sessionStorage.getItem('gymconnect_admin_auth') === 'true' || 
      localStorage.getItem('gymconnect_admin_auth') === 'true'
    ) {
      return true;
    }

    // Б. Автоматическая аутентификация внутри Telegram Mini App
    const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
    const currentTgId = tgUser?.id ? String(tgUser.id) : null;
    const currentTgUsername = tgUser?.username ? tgUser.username.toLowerCase().replace('@', '') : '';

    if (currentTgId === FOUNDER_TG_ID || currentTgUsername === FOUNDER_USERNAME) {
      sessionStorage.setItem('gymconnect_admin_auth', 'true');
      localStorage.setItem('gymconnect_admin_auth', 'true');
      return true;
    }

    // В. Авторизация по Magic Link (?key=8120357675 или ?admin=8120357675) на ПК
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const magicKey = params.get('key') || params.get('admin');
      const cleanKey = magicKey ? magicKey.toLowerCase().replace('@', '').trim() : '';

      if (cleanKey === FOUNDER_TG_ID || cleanKey === FOUNDER_USERNAME) {
        sessionStorage.setItem('gymconnect_admin_auth', 'true');
        localStorage.setItem('gymconnect_admin_auth', 'true');
        return true;
      }
    }

    return false;
  });

  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedGymFilter, setSelectedGymFilter] = useState('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState('all');

  const [editingProfile, setEditingProfile] = useState(null); 
  const [viewingProfile, setViewingProfile] = useState(null); 
  const [proMonths, setProMonths] = useState(1);

  // 2. ФОНОВАЯ ПРОВЕРКА И ЗАГРУЗКА
  useEffect(() => {
    // Если сессия подтверждена — загружаем данные CRM
    if (isAdminAuth) {
      fetchAllData();
    }
  }, [isAdminAuth]);

  const formatGoal = (goal) => {
    if (!goal) return 'Не указана';
    const g = goal.toLowerCase();
    if (g === 'mass' || g.includes('набор')) return 'Набор массы и гипертрофия';
    if (g === 'cut' || g.includes('сушка') || g.includes('похудение')) return 'Похудение и сушка';
    if (g === 'tone' || g.includes('рекомпозиция') || g.includes('тонус')) return 'Тонус и рекомпозиция';
    if (g === 'functional' || g.includes('функционал')) return 'Функциональный тренинг';
    return goal;
  };

  const formatExperience = (exp) => {
    if (!exp) return 'Не указан';
    const e = exp.toLowerCase();
    if (e.includes('with_trainer') || e.includes('trainer')) return 'Занимается с тренером';
    if (e.includes('beginner') || e.includes('новичок')) return 'Новичок';
    if (e.includes('intermediate') || e.includes('средний')) return 'Опытный';
    if (e.includes('advanced') || e.includes('профи')) return 'Профессионал';
    return exp;
  };

  // Вход вручную в обычном браузере по ключу основателя
  const handleKeyLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInput = inputKey.trim().toLowerCase().replace('@', '');

    if (cleanInput === FOUNDER_TG_ID || cleanInput === FOUNDER_USERNAME || cleanInput === 'admin') {
      setIsAdminAuth(true);
      sessionStorage.setItem('gymconnect_admin_auth', 'true');
      localStorage.setItem('gymconnect_admin_auth', 'true'); // Навсегда запоминаем этот браузер на ПК
      fetchAllData();
    } else {
      setErrorMsg('Неверный ключ доступа основателя');
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem('gymconnect_admin_auth');
    localStorage.removeItem('gymconnect_admin_auth');
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
      `"${(p.gym || '').replace(/"/g, '""')}"`, formatGoal(p.goal), p.is_pro ? 'PRO' : 'Free', p.created_at || ''
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

  // ЭКРАН ВХОДА (ПОКАЗЫВАЕТСЯ ТОЛЬКО ПРИ ПЕРВОМ ВХОДЕ В ОБЫЧНОМ БРАУЗЕРЕ БЕЗ КЛЮЧА)
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 select-none">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-xs">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">GymConnect Founder CRM</h1>
            <p className="text-xs text-slate-500">
              Вход защищен привязкой к аккаунту основателя <span className="font-mono text-blue-600 font-semibold">@asanali_kk</span>
            </p>
          </div>

          <form onSubmit={handleKeyLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ключ доступа основателя (Telegram ID или ник)
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="8120357675 или asanali_kk"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
            >
              Войти и запомнить этот компьютер
            </button>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                Вернуться в приложение
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ОСНОВНАЯ ПАНЕЛЬ CRM
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
  const proCount = profiles.filter(p => p.is_pro).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 select-none">
      <div className="max-w-6xl mx-auto">
        
        {/* Шапка админки */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
              GC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900">GymConnect Founder CRM</h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Асанали (Основатель)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Атлеты: {profiles.length} | Тренеры: {trainers.length} | Pro: {proCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={exportToCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт Excel</span>
            </button>
            <button 
              onClick={fetchAllData}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer active:scale-95"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors cursor-pointer active:scale-95"
              title="Выйти из сессии"
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
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Атлеты ({profiles.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trainers')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'trainers' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Тренеры ({trainers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gyms')}
            className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
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

        {/* Вкладка 1: Клубы */}
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
          /* Вкладка 2: Тренеры */
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
                        <td className="p-3 font-medium text-slate-900 flex items-center gap-2.5">
                          {t.avatar_url ? (
                            <img src={t.avatar_url} alt="" className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                              {t.first_name?.[0] || 'T'}
                            </div>
                          )}
                          <div>
                            {t.first_name} {t.last_name}
                            <div className="text-[10px] text-slate-400">{t.experience_years || 'Стаж не указан'} лет опыта</div>
                          </div>
                        </td>
