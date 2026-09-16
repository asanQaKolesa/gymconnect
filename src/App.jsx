import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('find');
  const [branches, setBranches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Калькулятор КБЖУ
  const [weight, setWeight] = useState(75);
  const [goal, setGoal] = useState('muscle');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Читаем из таблицы gyms, созданной в Supabase
      const { data: gymData } = await supabase.from('gyms').select('*');
      if (gymData && gymData.length > 0) {
        setBranches(gymData);
      }

      setAthletes([
        {
          id: 1,
          name: 'Алихан',
          experience: 'Опытный (3 года)',
          weekdayGym: 'Invictus Go - ЖК LAMIYA',
          weekendGym: 'Invictus Go - ЖК Q\'net Towers',
          split: 'Ноги / Спина',
          time: 'Будни: 07:30, Выходные: 11:00',
          telegram: 'alikhan_fit'
        },
        {
          id: 2,
          name: 'Диас',
          experience: 'Средний (1.5 года)',
          weekdayGym: 'Invictus Go - Аскарова',
          weekendGym: 'Invictus Go - Аскарова',
          split: 'Грудь / Руки',
          time: 'Будни: 19:30, Выходные: 14:00',
          telegram: 'dias_almaty'
        },
        {
          id: 3,
          name: 'Нурсултан',
          experience: 'Продвинутый (5 лет)',
          weekdayGym: 'Invictus Go - ЖК Q\'net Towers',
          weekendGym: 'Invictus Go - ЖК LAMIYA',
          split: 'Тяжелая база / Присед',
          time: 'Будни: 18:30',
          telegram: 'nurs_power'
        }
      ]);
      setLoading(false);
    }
    loadData();
  }, []);

  const calories = goal === 'muscle' ? Math.round(weight * 36) : Math.round(weight * 28);
  const protein = Math.round(weight * 2.2);
  const fat = Math.round(weight * 0.9);
  const carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 select-none">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 font-black text-lg">⚡</span>
            <h1 className="text-base font-bold tracking-tight">GymConnect</h1>
          </div>
          <p className="text-[11px] text-slate-400">Алматы • Invictus GymBro Network</p>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
          Online
        </span>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {activeTab === 'find' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Подключенные филиалы Invictus ({branches.length}):
              </h2>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {branches.length > 0 ? (
                  branches.map(b => (
                    <span key={b.id} className="text-[11px] bg-slate-950 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg">
                      📍 {b.name.replace('Invictus Go - ', '')}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Загрузка филиалов...</span>
                )}
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Доступные GymBro рядом:
            </h2>

            <div className="space-y-3">
              {athletes.map(bro => (
                <div key={bro.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{bro.name}</h3>
                      <p className="text-xs text-amber-400 font-medium">{bro.experience}</p>
                    </div>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {bro.split}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <p><span className="text-slate-500">🏢 Будни:</span> {bro.weekdayGym}</p>
                    <p><span className="text-slate-500">🏙 Выходные:</span> {bro.weekendGym}</p>
                    <p><span className="text-slate-500">⏰ Время:</span> {bro.time}</p>
                  </div>

                  <button
                    onClick={() => alert(`Запрос отправлен атлету @${bro.telegram}`)}
                    className="w-full mt-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    Забиться на тренировку 🤝
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Калькулятор рациона атлета</h2>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Вес тела: <span className="font-bold text-white">{weight} кг</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setGoal('muscle')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    goal === 'muscle'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Набор массы
                </button>
                <button
                  onClick={() => setGoal('cut')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    goal === 'cut'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Сушка / Рельеф
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Ккал</p>
                  <p className="text-sm font-black text-amber-400 mt-0.5">{calories}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Белки</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">{protein}г</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Жиры</p>
                  <p className="text-sm font-black text-sky-400 mt-0.5">{fat}г</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Углеводы</p>
                  <p className="text-sm font-black text-purple-400 mt-0.5">{carbs}г</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p className="font-semibold text-white">💡 Базовые ориентиры рациона:</p>
              <p>• Зеленая чечевица + филе индейки или куриная грудка в аэрогриле.</p>
              <p>• Тайминг спортпита: Креатин 5-10г ежедневно, цитруллин и бета-аланин за 30 мин до ног/спины.</p>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur border-t border-slate-800 flex justify-around py-2.5 z-20">
        <button
          onClick={() => setActiveTab('find')}
          className={`flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeTab === 'find' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">👥</span>
          GymBro
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex flex-col items-center text-xs font-semibold cursor-pointer ${
            activeTab === 'nutrition' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-base mb-0.5">🥗</span>
          Питание
        </button>
      </nav>
    </div>
  );
}
