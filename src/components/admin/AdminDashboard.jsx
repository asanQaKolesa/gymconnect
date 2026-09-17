import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setErrorMsg('');

        // Проверяем разные возможные варианты названий таблиц в Supabase
        const tableNames = ['users', 'profiles', 'athletes', 'clients', 'registrations'];
        let foundData = null;
        let lastError = null;

        for (const tableName of tableNames) {
          const { data, error } = await supabase.from(tableName).select('*');
          if (!error && data) {
            foundData = data;
            break;
          } else {
            lastError = error;
          }
        }

        if (foundData) {
          setUsers(foundData);
        } else {
          throw lastError || new Error('Таблицы не найдены');
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err.message);
        setErrorMsg('Не удалось найти таблицы в Supabase. Создайте таблицу пользователей в вашей базе данных.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400">GymConnect // Admin CRM</h1>
          <p className="text-xs text-zinc-400">Закрытая панель управления базой данных и пользователями</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
          LIVE_SUPABASE: CONNECTED
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
              Таблица найдена, но в ней пока нет записей.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-4">ID / Имя</th>
                    <th className="p-4">Email / Контакт</th>
                    <th className="p-4">Данные анкеты</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{u.name || u.full_name || u.username || `Пользователь #${index + 1}`}</td>
                      <td className="p-4 text-zinc-400">{u.email || u.phone || 'Не указан'}</td>
                      <td className="p-4 text-zinc-400 text-xs font-mono">
                        {JSON.stringify(u)}
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
