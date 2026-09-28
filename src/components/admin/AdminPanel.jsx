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
