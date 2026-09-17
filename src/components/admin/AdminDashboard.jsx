import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Состояние для добавления нового пользователя
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGym, setNewGym] = useState('Invictus Go');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase.from('users').select('*');
      
      if (error) {
        // Пробуем альтернативную таблицу profiles
        const alt = await supabase.from('profiles').select('*');
        if (!alt.error && alt.data) {
          setUsers(alt.data);
        } else {
          setUsers([]);
        }
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Ошибка:', err.message);
      setErrorMsg('Не удалось загрузить пользователей.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Функция добавления пользователя в базу
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('users').insert([
        { name: newName, email: newEmail, gym: newGym, status: 'Active' }
      ]);

      if (error) {
        // Пробуем в profiles если таблица users выдала ошибку
        await supabase.from('profiles').insert([
          { name: newName, email: newEmail, gym: newGym, status: 'Active' }
        ]);
      }

      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      fetchUsers(); // Обновляем список
    } catch (err) {
      alert('Ошибка при добавлении: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400">GymConnect // Admin CRM</h1>
          <p className="text-xs text-zinc-400">Закрытая панель управления базой данных и пользователями</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            + Добавить атлета
          </button>
          <button 
            onClick={fetchUsers}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            🔄 Обновить
          </button>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
            LIVE_SUPABASE: CONNECTED
          </div>
        </div>
      </div>

      {/* Модальное окно добавления */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Добавить нового пользователя</h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Имя / Фамилия</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required
                  placeholder="Например: Асанәли"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Email / Телефон</label>
                <input 
                  type="text" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="asan@mail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Фитнес-зал</label>
                <input 
                  type="text" 
                  value={newGym} 
                  onChange={(e) => setNewGym(e.target.value)} 
                  placeholder="Invictus Go"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-emerald-400"
                >
                  Сохранить в базу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <div className="p-8 text-center text-zinc-500 text-sm space-y-3">
              <p>В таблице пока нет записей.</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-medium hover:bg-emerald-500/20"
              >
                + Добавить первого пользователя вручную
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-4">Имя / Атлет</th>
                    <th className="p-4">Контакт</th>
                    <th className="p-4">Зал / Цель</th>
                    <th className="p-4 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map((u, index) => (
                    <tr key={u.id || index} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium">{u.name || u.full_name || 'Без имени'}</td>
                      <td className="p-4 text-zinc-400">{u.email || u.phone || 'Не указан'}</td>
                      <td className="p-4 text-zinc-400 text-xs">{u.gym || 'Не указан'}</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {u.status || 'Active'}
                        </span>
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
