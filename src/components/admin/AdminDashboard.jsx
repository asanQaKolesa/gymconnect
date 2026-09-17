import React, { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState([
    { id: 1, name: 'Асанәли Құсайынов', role: 'Trainer / Admin', goal: 'Набор массы', gym: 'Invictus Go', status: 'Active' },
    { id: 2, name: 'Тимур Бекмамбетов', role: 'GymBro', goal: 'Сушка', gym: 'World Class Almaty', status: 'Active' },
    { id: 3, name: 'Дильназ Ахметова', role: 'GymBro', goal: 'Поддержание формы', gym: 'Fitnation', status: 'Pending' },
  ]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400">GymConnect // Admin CRM</h1>
          <p className="text-xs text-zinc-400">Закрытая панель управления базой данных и пользователями</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400 font-mono">
          SECURE_MODE: ON
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
        >
          👥 Пользователи и Анкеты
        </button>
        <button 
          onClick={() => setActiveTab('b2b')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'b2b' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
        >
          🏢 Тренеры и Залы (B2B)
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-sm">База зарегистрированных атлетов</h3>
            <span className="text-xs text-zinc-400">Всего: {users.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="p-4">Имя / Профиль</th>
                  <th className="p-4">Роль</th>
                  <th className="p-4">Цель</th>
                  <th className="p-4">Зал</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-zinc-400">{u.role}</td>
                    <td className="p-4 text-zinc-400">{u.goal}</td>
                    <td className="p-4 text-zinc-400">{u.gym}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs text-zinc-400 hover:text-white bg-zinc-800 px-3 py-1 rounded-lg transition-colors">
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'b2b' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-zinc-400 text-sm">
          Раздел управления B2B-тренерами и фитнес-клубами Алматы в разработке...
        </div>
      )}
    </div>
  );
}
