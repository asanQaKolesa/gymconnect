import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, Utensils } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('match');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranches() {
      const { data, error } = await supabase.from('gym_branches').select('*');
      if (!error && data) {
        setBranches(data);
      }
      setLoading(false);
    }
    fetchBranches();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="p-4 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>⚡ GymConnect</span>
          </h1>
          <p className="text-xs text-slate-400">Алматы • Invictus GymBro Network</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
          MVP Test
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        {activeTab === 'match' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h2 className="text-lg font-semibold mb-2">Поиск GymBro</h2>
              <p className="text-sm text-slate-400 mb-4">
                Синхронизация по залам (будни / выходные) и схожему уровню подготовки.
              </p>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                  Подключенные филиалы Invictus:
                </p>
                {loading ? (
                  <p className="text-sm text-slate-500">Загрузка залов из базы данных...</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {branches.map((b) => (
                      <span key={b.id} className="text-[11px] bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-slate-300">
                        {b.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h2 className="text-lg font-semibold mb-2">Персональное меню</h2>
              <p className="text-sm text-slate-400">
                Расчет целевого КБЖУ и автоматический подбор продуктовой корзины.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800/95 backdrop-blur border-t border-slate-700 flex justify-around py-3">
        <button
          onClick={() => setActiveTab('match')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'match' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          <Users size={20} />
          <span className="text-xs font-medium">GymBro</span>
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'nutrition' ? 'text-emerald-400' : 'text-slate-400'}`}
        >
          <Utensils size={20} />
          <span className="text-xs font-medium">Питание</span>
        </button>
      </nav>
    </div>
  );
}