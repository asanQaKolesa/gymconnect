import React, { useState } from 'react';
import { Home, Users, MessageSquare, Utensils, User, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-24">
      {/* Контент страниц */}
      {activeTab === 'home' && (
        <div className="p-4 max-w-md mx-auto space-y-4">
          {/* Шапка рейтинга */}
          <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">GymConnect Reviews</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/30">100% честно</span>
            </div>
            <h1 className="text-2xl font-black mb-1">Народный рейтинг Алматы</h1>
            <p className="text-sm text-slate-400">Реальные отзывы без накрутки. Подтвержденные клубные карты атлетов и проверенные тренеры.</p>
          </div>

          {/* Быстрые фильтры / категории */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-600 hover:bg-blue-500 transition-all p-4 rounded-2xl cursor-pointer shadow-lg flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <span className="text-xl">🏋️‍♂️</span>
              </div>
              <div>
                <h2 className="font-bold text-base">Фитнес-залы</h2>
                <p className="text-xs text-blue-200">Оборудование и сервис</p>
              </div>
            </div>

            <div className="bg-[#1e293b] hover:bg-slate-800 transition-all p-4 rounded-2xl cursor-pointer border border-slate-800 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h2 className="font-bold text-base">Тренеры</h2>
                <p className="text-xs text-slate-400">Результаты клиентов</p>
              </div>
            </div>
          </div>

          {/* Поиск */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Поиск зала по названию..." 
              className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-500">🔍</span>
          </div>

          {/* Список отзывов / залов */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-base">Свежие отзывы</h2>
              <span className="text-xs text-blue-400 cursor-pointer hover:underline">Посмотреть все (4) →</span>
            </div>

            {/* Карточка 1 */}
            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">Invictus Go (Навои)</h3>
                  <p className="text-xs text-blue-400">Тимур К.</p>
                </div>
                <div className="flex text-amber-400 text-sm">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Отличный зал! Тренажеры новые, атмосфера рабочая. Много силовых рам, очередей на базу почти нет.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md font-medium border border-emerald-500/20">Рекомендует</span>
                <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md font-medium border border-blue-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Верифицировано
                </span>
                <span className="text-slate-500 ml-auto">• Сегодня, 14:20</span>
              </div>
            </div>

            {/* Карточка 2 */}
            <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">Workout (Достык)</h3>
                  <p className="text-xs text-blue-400">Алия М.</p>
                </div>
                <div className="flex text-amber-400 text-sm">
                  {'★'.repeat(3)}{'☆'.repeat(2)}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Зал неплохой, но в часы пик (после 18:00) вентиляция не справляется, душно, и в зоне свободного веса тесновато.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gymbro' && (
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <h1 className="text-xl font-bold mb-2">GymBro Сообщество</h1>
          <p className="text-sm text-slate-400">Здесь атлеты находят напарников для тренировок.</p>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <h1 className="text-xl font-bold mb-2">Все отзывы</h1>
          <p className="text-sm text-slate-400">Раздел отзывов и оценок.</p>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <h1 className="text-xl font-bold mb-2">Питание и рацион</h1>
          <p className="text-sm text-slate-400">Калькулятор КБЖУ и программы питания.</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="p-4 max-w-md mx-auto text-center py-20">
          <h1 className="text-xl font-bold mb-2">Профиль атлета</h1>
          <p className="text-sm text-slate-400">Ваши клубные карты и сохраненные залы.</p>
        </div>
      )}

      {/* Единый нижний таб-бар */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-slate-800 px-4 py-2 flex justify-around items-center z-50">
        {[
          { id: 'home', label: 'Главная', icon: Home },
          { id: 'gymbro', label: 'GymBro', icon: Users },
          { id: 'reviews', label: 'Отзывы', icon: MessageSquare },
          { id: 'nutrition', label: 'Питание', icon: Utensils },
          { id: 'profile', label: 'Профиль', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
                isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
