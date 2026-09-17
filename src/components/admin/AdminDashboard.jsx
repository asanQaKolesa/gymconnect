import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      let allRecords = [];

      // 1. Пробуем собрать данные из обычных таблиц (users, profiles, athletes, clients)
      const tableNames = ['users', 'profiles', 'athletes', 'clients', 'registrations'];
      for (const tableName of tableNames) {
        const { data, error } = await supabase.from(tableName).select('*');
        if (!error && data && data.length > 0) {
          allRecords = [...allRecords, ...data];
        }
      }

      // 2. Пробуем получить пользователей из таблицы авторизации Supabase Auth (если есть права)
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && authData && authData.users) {
          const formattedAuthUsers = authData.users.map(u => ({
            id: u.id,
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'Auth User',
            email: u.email,
            phone: u.phone || 'Не указан',
            created_at: u.created_at,
            source: 'Supabase Auth'
          }));
          allRecords = [...allRecords, ...formattedAuthUsers];
        }
      } catch (e) {
        // Административный метод Auth API может требовать service_role ключ, это нормально
      }

      // Убираем дубликаты, если они есть
      const uniqueUsers = Array.from(new Map(allRecords.map(item => [item.id || item.email, item])).values());
      setUsers(uniqueUsers);

    } catch (err) {
      console.error('Ошибка:', err.message);
      setErrorMsg('Не удалось выгрузить пользователей. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400">GymConnect // Admin CRM</h1>
          <p className="text-xs text-zinc-400">Закрытая панель управления базой данных и пользователями</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAllUsers}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            🔄 Обновить данные
          </button>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
            LIVE_SUPABASE: CONNECTED
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
        >
          👥 База пользователей ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('b2b')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'b2b' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
        >
          🏢 Тренеры и Залы (B2B)
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-sm">Зарегистрированные атлеты из базы Supabase</h3>
            <span className="text-xs text-zinc-400">Всего записей: {users.length}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Загрузка данных из базы...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              В базе пока нет записей. Если пользователь зарегистрировался, убедитесь, что он записался в таблицу базы данных.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-4">Имя / Профиль</th>
                    <th className="p-4">Email / Контакт</th>
                    <th className="p-4">Данные / Источник</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{u.name || u.full_name || u.username || 'Без имени'}</td>
                      <td className="p-4 text-zinc-400">{u.email || u.phone || 'Не указан'}</td>
                      <td className="p-4 text-zinc-400 text-xs font-mono">
                        {u.source ? `Источник: ${u.source}` : JSON.stringify(u).slice(0, 50)}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1 rounded-lg transition-colors">
                          Детали
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'b2b' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-zinc-400 text-sm">
          Раздел управления B2B-тренерами и фитнес-клубами Алматы...
        </div>
      )}
    </div>
  );
}
