import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Загружаем реальных пользователей из базы данных Supabase при открытии админки
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        // Пробуем сделать запрос к таблице users (или profiles) в Supabase
        let { data, error } = await supabase
          .from('users') 
          .select('*');

        if (error) {
          // Если таблицы users нет, попробуем альтернативное название profiles
          const altQuery = await supabase.from('profiles').select('*');
          if (altQuery.error) {
            throw error; // если и там ошибка, показываем её
          } else {
            data = altQuery.data;
          }
        }

        if (data) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Ошибка загрузки пользователей:', err.message);
        setErrorMsg('Не удалось загрузить данные из таблицы. Проверьте название таблицы в Supabase.');
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
          ⚠️ {errorMsg} (Убедитесь, что таблица с пользователями создана в вашем проекте Supabase).
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
              В таблице пока нет записей или пользователь зарегистрировался через встроенную Auth-систему Supabase.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-4">ID / Имя</th>
                    <th className="p-4">Email / Телефон</th>
                    <th className="p-4">Данные анкеты</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{u.name || u.full_name || `Пользователь #${index + 1}`}</td>
                      <td className="p-4 text-zinc-400">{u.email || u.phone || 'Не указан'}</td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {JSON.stringify(u).slice(0, 60)}...
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
