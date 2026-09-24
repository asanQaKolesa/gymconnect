// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, Dumbbell, TrendingUp, LogOut, RefreshCw, X, User, DollarSign, Clock, Calendar, Settings, Shield } from 'lucide-react';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import ProgressTab from './tabs/ProgressTab';
import ScheduleTab from './tabs/ScheduleTab'; // Новая вкладка графика в зале

export default function TrainerCRM({ trainerUsername, onLogout }) {
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Состояние для редактирования профиля тренера
  const [trainerEditForm, setTrainerEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    instagram: '',
    experience_years: '',
    products: ''
  });

  // Локальное состояние для редактирования ученика
  const [studentFinances, setStudentFinances] = useState({
    monthly_price: 50000,
    package_type: 'individual',
    total_trainings: 12,
    left_trainings: 12,
    is_burnable: false,
    status: 'active',
    workout_days: ['Понедельник', 'Среда', 'Пятница'],
    workout_time_slot: 'Вечер (18:00)'
  });

  const fetchTrainerAndStudents = async () => {
    setLoading(true);
    const cleanU = trainerUsername.replace('@', '');

    // 1. Загружаем данные самого тренера
    const { data: tData } = await supabase
      .from('trainer_profiles')
      .select('*')
      .or(`username.eq.@${cleanU},username.eq.${cleanU}`)
      .maybeSingle();

    if (tData) {
      setTrainerProfile(tData);
      setTrainerEditForm({
        first_name: tData.first_name || '',
        last_name: tData.last_name || '',
        phone: tData.phone || '',
        instagram: tData.instagram || '',
        experience_years: tData.experience_years || '',
        products: tData.products || ''
      });
    }

    // 2. Загружаем учеников тренера
    const { data: sData, error: sError } = await supabase
      .from('profiles')
      .select('*')
      .or(`trainer_username.eq.@${cleanU},trainer_username.eq.${cleanU}`);

    if (!sError) {
      setStudents(sData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (trainerUsername) {
      fetchTrainerAndStudents();
    }
  }, [trainerUsername]);

  const handleUpdateTrainerProfile = async (e) => {
    e.preventDefault();
    if (!trainerProfile) return;

    const { error } = await supabase
      .from('trainer_profiles')
      .update({
        first_name: trainerEditForm.first_name,
        last_name: trainerEditForm.last_name,
        phone: trainerEditForm.phone,
        instagram: trainerEditForm.instagram,
        experience_years: Number(trainerEditForm.experience_years) || 0,
        products: trainerEditForm.products
      })
      .eq('id', trainerProfile.id);

    if (error) {
      alert('Ошибка обновления профиля: ' + error.message);
    } else {
      alert('Данные вашего профиля успешно сохранены!');
      setIsProfileModalOpen(false);
      fetchTrainerAndStudents();
    }
  };

  const handleOpenStudentProfile = (student) => {
    setSelectedStudent(student);
    setStudentFinances({
      monthly_price: student.monthly_price || 50000,
      package_type: student.package_type || 'individual',
      total_trainings: student.total_trainings || 12,
      left_trainings: student.left_trainings !== undefined ? student.left_trainings : 12,
      is_burnable: student.is_burnable || false,
      status: student.status || 'active',
      workout_days: student.workout_days || ['Понедельник', 'Среда', 'Пятница'],
      workout_time_slot: student.workout_time_slot || 'Вечер'
    });
  };

  const handleToggleDay = (day) => {
    const currentDays = studentFinances.workout_days || [];
    if (currentDays.includes(day)) {
      setStudentFinances({ ...studentFinances, workout_days: currentDays.filter(d => d !== day) });
    } else {
      setStudentFinances({ ...studentFinances, workout_days: [...currentDays, day] });
    }
  };

  const handleSaveStudentFinances = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        monthly_price: studentFinances.monthly_price,
        package_type: studentFinances.package_type,
        total_trainings: studentFinances.total_trainings,
        left_trainings: studentFinances.left_trainings,
        is_burnable: studentFinances.is_burnable,
        status: studentFinances.status,
        workout_days: studentFinances.workout_days,
        workout_time_slot: studentFinances.workout_time_slot
      })
      .eq('id', selectedStudent.id);

    if (error) {
      alert('Ошибка сохранения: ' + error.message);
    } else {
      alert('Данные ученика успешно обновлены!');
      fetchTrainerAndStudents();
      setSelectedStudent(null);
    }
  };

  // Исправленный и расширенный перевод целей
  const formatGoal = (goal) => {
    if (!goal) return 'Не указана';
    const g = goal.toLowerCase();
    if (g === 'mass' || g.includes('набор')) return 'Набор массы и гипертрофия';
    if (g === 'cut' || g.includes('сушка') || g.includes('похудение')) return 'Похудение и сушка';
    if (g === 'recomp' || g.includes('рекомпозиция')) return 'Рекомпозиция тела';
    if (g === 'functional' || g.includes('функционал')) return 'Функциональный тренинг';
    return goal;
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

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const timeSlots = ['Утро (08:00 - 12:00)', 'Обед (12:00 - 16:00)', 'Вечер (16:00 - 21:00)', 'Свободный график'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* ШАПКА КАБИНЕТА ТРЕНЕРА + КНОПКА РЕДАКТИРОВАНИЯ ПРОФИЛЯ */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-md shadow-blue-600/20">
              {trainerProfile?.first_name?.[0] || 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  {trainerProfile ? `${trainerProfile.first_name} ${trainerProfile.last_name}` : 'Кабинет тренера'}
                </h1>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-mono px-2 py-0.5 rounded-md border border-blue-100">
                  {trainerProfile?.role_type === 'group' ? 'Групповой тренинг' : trainerProfile?.role_type === 'both' ? 'Универсал' : 'Персональный тренер'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">@{trainerUsername.replace('@', '')} • {trainerProfile?.experience_years || 0} лет стажа</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Мой профиль</span>
            </button>
            <button onClick={fetchTrainerAndStudents} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Обновить">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100" title="Выйти">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* МЕТРИКИ (KPI) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Активных учеников</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">На паузе</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pausedCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Ушли</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{leftCount}</h3>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Доход за месяц</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalEarnings.toLocaleString()} ₸</h3>
          </div>
        </div>

        {/* НАВИГАЦИЯ (ТАБЫ) */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => setActiveTab('students')} className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Users className="w-4 h-4" /><span>Ученики ({students.length})</span>
          </button>
          <button onClick={() => setActiveTab('workouts')} className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'workouts' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Dumbbell className="w-4 h-4" /><span>Программы</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <Calendar className="w-4 h-4" /><span>График в зале</span>
          </button>
          <button onClick={() => setActiveTab('progress')} className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${activeTab === 'progress' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200'}`}>
            <TrendingUp className="w-4 h-4" /><span>Прогресс</span>
          </button>
        </div>

        {/* КОНТЕНТ ВКЛАДОК */}
        {activeTab === 'students' && (
          <StudentsListTab students={students} formatGoal={formatGoal} onSelectStudent={(student) => handleOpenStudentProfile(student)} onOpenAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'workouts' && <WorkoutsTab students={students} />}
        {activeTab === 'schedule' && <ScheduleTab trainerProfile={trainerProfile} onUpdate={fetchTrainerAndStudents} />}
        {activeTab === 'progress' && <ProgressTab students={students} />}

        {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРОФИЛЯ ТРЕНЕРА */}
        {isProfileModalOpen && trainerProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Настройки профиля тренера</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleUpdateTrainerProfile} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Имя</label>
                    <input 
                      type="text"
                      value={trainerEditForm.first_name}
                      onChange={(e) => setTrainerEditForm({...trainerEditForm, first_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Фамилия</label>
                    <input 
                      type="text"
                      value={trainerEditForm.last_name}
                      onChange={(e) => setTrainerEditForm({...trainerEditForm, last_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Телефон WhatsApp</label>
                  <input 
                    type="text"
                    value={trainerEditForm.phone}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, phone: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Instagram</label>
                  <input 
                    type="text"
                    value={trainerEditForm.instagram}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, instagram: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Опыт работы (лет)</label>
                  <input 
                    type="number"
                    value={trainerEditForm.experience_years}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, experience_years: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Мои продукты / программы</label>
                  <textarea 
                    rows="2"
                    value={trainerEditForm.products}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, products: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md">Сохранить</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* МОДАЛЬНОЕ ОКНО УПРАВЛЕНИЯ УЧЕНИКОМ */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-4 text-xs text-slate-700">
                {/* Антропометрия */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> Антропометрия атлета
                  </p>
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Рост</span>
                      <span className="font-bold text-slate-800">{selectedStudent.height ? `${selectedStudent.height} см` : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Вес</span>
                      <span className="font-bold text-slate-800">{selectedStudent.weight ? `${selectedStudent.weight} кг` : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Возраст</span>
                      <span className="font-bold text-slate-800">{selectedStudent.age ? `${selectedStudent.age} л.` : '—'}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 block">Пол</span>
                      <span className="font-bold text-slate-800">{formatGender(selectedStudent.gender)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1"><b>Цель:</b> {formatGoal(selectedStudent.goal)} | <b>Зал:</b> {selectedStudent.gym || 'Не указан'}</p>
                </div>

                {/* ФИНАНСЫ, СТАТУС И РАСПИСАНИЕ */}
                <form onSubmit={handleSaveStudentFinances} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Статус, Финансы и График
                  </p>

                  {/* Статус клиента */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Статус ученика в CRM</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setStudentFinances({...studentFinances, status: 'active'})}
                        className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                          studentFinances.status === 'active' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Активен
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFinances({...studentFinances, status: 'paused'})}
                        className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                          studentFinances.status === 'paused' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        На паузе
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFinances({...studentFinances, status: 'left'})}
                        className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                          studentFinances.status === 'left' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Ушел
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Тип тарифа</label>
                      <select 
                        value={studentFinances.package_type}
                        onChange={(e) => setStudentFinances({...studentFinances, package_type: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="individual">Персональный (1 на 1)</option>
                        <option value="mini_group">Мини-группа</option>
                        <option value="couple">Сплит (вдвоем)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Стоимость (₸ / мес)</label>
                      <input 
                        type="number"
                        value={studentFinances.monthly_price}
                        onChange={(e) => setStudentFinances({...studentFinances, monthly_price: Number(e.target.value)})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Всего тренировок</label>
                      <input 
                        type="number"
                        value={studentFinances.total_trainings}
                        onChange={(e) => setStudentFinances({...studentFinances, total_trainings: Number(e.target.value)})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Остаток тренировок</label>
                      <input 
                        type="number"
                        value={studentFinances.left_trainings}
                        onChange={(e) => setStudentFinances({...studentFinances, left_trainings: Number(e.target.value)})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-emerald-600 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Политика сгорания</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStudentFinances({...studentFinances, is_burnable: false})}
                        className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center ${
                          !studentFinances.is_burnable ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Несгораемые (перенос)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentFinances({...studentFinances, is_burnable: true})}
                        className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center ${
                          studentFinances.is_burnable ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Сгораемые (при пропуске)
                      </button>
                    </div>
                  </div>

                  {/* ВЫБОР ДНЕЙ НЕДЕЛИ И ВРЕМЕНИ */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" /> Выбор дней недели
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {daysOfWeek.map((day, idx) => {
                        const isSelected = (studentFinances.workout_days || []).includes(day);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleToggleDay(day)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] border transition-all ${
                              isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block font-medium text-slate-700">Время / Тайм-слот</label>
                    <select
                      value={studentFinances.workout_time_slot}
                      onChange={(e) => setStudentFinances({...studentFinances, workout_time_slot: e.target.value})}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      {timeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all text-xs"
                    >
                      Сохранить изменения ученика
                    </button>
                  </div>
                </form>
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
