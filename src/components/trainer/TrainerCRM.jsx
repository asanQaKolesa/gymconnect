// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, Dumbbell, TrendingUp, LogOut, RefreshCw, X, User } from 'lucide-react';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import ProgressTab from './tabs/ProgressTab';

export default function TrainerCRM({ trainerUsername, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    username: '',
    gym: 'Invictus Go | Улица Навои, 97',
    goal: 'mass',
    monthly_price: 50000
  });

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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const cleanUsername = newStudent.username.replace('@', '').trim();

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          trainer_username: trainerUsername,
          monthly_price: newStudent.monthly_price,
          gym: newStudent.gym,
          goal: newStudent.goal,
          status: 'active'
        })
        .eq('id', existingUser.id);

      if (updateError) {
        alert('Ошибка привязки ученика: ' + updateError.message);
      } else {
        fetchMyStudents();
        setIsAddModalOpen(false);
        setNewStudent({ first_name: '', last_name: '', username: '', gym: 'Invictus Go | Улица Навои, 97', goal: 'mass', monthly_price: 50000 });
        alert(`Ученик @${cleanUsername} успешно привязан! Данные подтянуты.`);
      }
    } else {
      const payload = {
        first_name: newStudent.first_name,
        last_name: newStudent.last_name,
        username: cleanUsername,
        trainer_username: trainerUsername,
        gym: newStudent.gym,
        goal: newStudent.goal,
        monthly_price: newStudent.monthly_price,
        status: 'active',
        role: 'user'
      };

      const { data, error } = await supabase.from('profiles').insert([payload]).select();
      if (error) {
        alert('Ошибка добавления: ' + error.message);
      } else {
        if (data) setStudents(prev => [data[0], ...prev]);
        setIsAddModalOpen(false);
        setNewStudent({ first_name: '', last_name: '', username: '', gym: 'Invictus Go | Улица Навои, 97', goal: 'mass', monthly_price: 50000 });
        alert('Ученик добавлен в CRM!');
      }
    }
  };

  // Функции для красивого отображения на русском языке
  const formatGoal = (goal) => {
    switch (goal) {
      case 'mass': return 'Набор массы';
      case 'cut': return 'Похудение / Сушка';
      case 'recomp': return 'Рекомпозиция';
      case 'functional': return 'Функциональный';
      default: return goal || 'Не указана';
    }
  };

  const formatGender = (gender) => {
    if (gender === 'male' || gender === 'М' || gender === 'm') return 'Мужской';
    if (gender === 'female' || gender === 'Ж' || gender === 'f') return 'Женский';
    return gender || 'Не указан';
  };

  const activeCount = students.filter(s => s.status === 'active' || !s.status).length;
  const pausedCount = students.filter(s => s.status === 'paused').length;
  const leftCount = students.filter(s => s.status === 'left').length;
  const totalEarnings = students
    .filter(s => s.status === 'active' || !s.status)
    .reduce((sum, s) => sum + (Number(s.monthly_price) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Шапка CRM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              TC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Кабинет тренера</h1>
              <p className="text-xs text-slate-500 font-mono">{trainerUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMyStudents} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Метрики */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных учеников</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">{activeCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">На паузе</p>
            <h3 className="text-xl font-black text-amber-600 mt-1">{pausedCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Ушли</p>
            <h3 className="text-xl font-black text-rose-600 mt-1">{leftCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Доход за месяц</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{totalEarnings.toLocaleString()} ₸</h3>
          </div>
        </div>

        {/* Навигация */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => setActiveTab('students')} className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Users className="w-4 h-4" /><span>Ученики ({students.length})</span>
          </button>
          <button onClick={() => setActiveTab('workouts')} className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'workouts' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Dumbbell className="w-4 h-4" /><span>Программы</span>
          </button>
          <button onClick={() => setActiveTab('progress')} className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'progress' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <TrendingUp className="w-4 h-4" /><span>Прогресс</span>
          </button>
        </div>

        {activeTab === 'students' && (
          <StudentsListTab students={students} onSelectStudent={(student) => setSelectedStudent(student)} onOpenAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'workouts' && <WorkoutsTab students={students} />}
        {activeTab === 'progress' && <ProgressTab students={students} />}

        {/* Модалка добавления ученика */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Добавить ученика в CRM</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Имя *</label>
                    <input type="text" required value={newStudent.first_name} onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})} placeholder="Иван" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Фамилия *</label>
                    <input type="text" required value={newStudent.last_name} onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})} placeholder="Иванов" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram Username ученика *</label>
                  <input type="text" required value={newStudent.username} onChange={(e) => setNewStudent({...newStudent, username: e.target.value})} placeholder="@username" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Цель</label>
                    <select value={newStudent.goal} onChange={(e) => setNewStudent({...newStudent, goal: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option value="mass">Набор массы</option>
                      <option value="cut">Похудение / Сушка</option>
                      <option value="recomp">Рекомпозиция</option>
                      <option value="functional">Функциональный</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Стоимость (₸ / мес)</label>
                    <input type="number" value={newStudent.monthly_price} onChange={(e) => setNewStudent({...newStudent, monthly_price: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Фитнес-зал</label>
                  <input type="text" value={newStudent.gym} onChange={(e) => setNewStudent({...newStudent, gym: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md">Привязать ученика</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно ПОЛНОГО ПРОФИЛЯ УЧЕНИКА для тренера */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">@{selectedStudent.username || 'не указан'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                {/* Антропометрия */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> Антропометрия и здоровье
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Рост</span>
                      <span className="font-bold text-slate-800">{selectedStudent.height ? `${selectedStudent.height} см` : 'Не указан'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Вес</span>
                      <span className="font-bold text-slate-800">{selectedStudent.weight ? `${selectedStudent.weight} кг` : 'Не указан'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Возраст</span>
                      <span className="font-bold text-slate-800">{selectedStudent.age ? `${selectedStudent.age} лет` : 'Не указан'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Пол</span>
                      <span className="font-bold text-slate-800">{formatGender(selectedStudent.gender)}</span>
                    </div>
                  </div>
                </div>

                {/* Данные абонемента и целей */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <p className="font-semibold text-slate-900 mb-1">Данные абонемента и целей</p>
                  <p><b>Фитнес-зал:</b> {selectedStudent.gym || 'Не указан'}</p>
                  <p><b>Цель:</b> {formatGoal(selectedStudent.goal)}</p>
                  <p><b>Стоимость:</b> {selectedStudent.monthly_price ? `${selectedStudent.monthly_price} ₸ / месяц` : 'Бесплатно'}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-xs">Закрыть</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
