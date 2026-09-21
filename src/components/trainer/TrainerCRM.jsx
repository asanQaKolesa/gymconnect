// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, Dumbbell, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, LogOut, RefreshCw, ChevronRight } from 'lucide-react';

export default function TrainerCRM({ trainerUsername, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загружаем учеников, которые указали этого тренера в своей анкете
  const fetchMyStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('trainer_username', trainerUsername);

    if (error) {
      console.error('Ошибка загрузки учеников:', error.message);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (trainerUsername) {
      fetchMyStudents();
    }
  }, [trainerUsername]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Шапка CRM тренера */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between mb-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              TC
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Кабинет тренера</h1>
              <p className="text-xs text-slate-400">@{trainerUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchMyStudents}
              className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
              title="Обновить"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onLogout}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Метрики (KPI тренера) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных учеников</p>
            <h3 className="text-xl font-black text-white mt-1">{students.length}</h3>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Заработано за месяц</p>
            <h3 className="text-xl font-black text-emerald-400 mt-1">0 ₸</h3>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Статус профиля</p>
            <h3 className="text-xs font-bold text-blue-400 mt-2 bg-blue-500/10 py-1 px-2 rounded-lg inline-block border border-blue-500/20">
              Верифицирован
            </h3>
          </div>
        </div>

        {/* Список учеников */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Мои подопечные</h3>
            <span className="text-xs text-slate-400 font-mono">Всего: {students.length}</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="p-4 hover:bg-slate-900/50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-white">
                      {student.first_name} {student.last_name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Цель: <span className="text-blue-400">{student.goal}</span> | Зал: {student.gym}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                        {student.username}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Абонемент: {student.membership_term}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
                      Управление
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                {loading ? 'Загрузка учеников...' : 'У вас пока нет привязанных учеников. Ученики укажут ваш ник (@username) при заполнении анкеты в приложении.'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
