// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Users, Dumbbell, TrendingUp, LogOut, RefreshCw, X, User, DollarSign, Clock, Calendar, Settings, Utensils, ShieldCheck, Zap, ArrowUpRight, UserPlus, Info } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import ProgressTab from './tabs/ProgressTab';
import ScheduleTab from './tabs/ScheduleTab';
import FinanceTab from './tabs/FinanceTab';
import NotesTab from './tabs/NotesTab';

export default function TrainerCRM({ trainerUsername, onLogout }) {
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Форма добавления нового ученика тренером
  const [newStudentForm, setNewStudentForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    monthly_price: 50000,
    package_type: 'Персональный (1 на 1)',
    total_trainings: 12,
    left_trainings: 12,
    gym: 'Invictus Go'
  });

  const [subscription, setSubscription] = useState({
    isActive: true,
    expiresAt: '25.10.2026'
  });

  const [trainerEditForm, setTrainerEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    instagram: '',
    experience_years: '',
    products: '',
    avatar_url: ''
  });

  const [studentFinances, setStudentFinances] = useState({
    monthly_price: 50000,
    package_type: 'Персональный (1 на 1)',
    total_trainings: 12,
    left_trainings: 12,
    is_burnable: false,
    status: 'active',
    payment_method: 'Перевод Kaspi',
    workout_days: ['Понедельник', 'Среда', 'Пятница'],
    workout_time_slot: 'Вечер (16:00 - 21:00)',
    birth_date: ''
  });

  const fetchTrainerAndStudents = async () => {
    setLoading(true);
    const cleanU = trainerUsername.replace('@', '');

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
        products: tData.products || '',
        avatar_url: tData.avatar_url || ''
      });
    }

    const { data: sData, error: sError } = await supabase
      .from('profiles')
      .select('*')
      .or(`trainer_username.eq.@${cleanU},trainer_username.eq.${cleanU}`);

    if (!sError && sData) {
      const filteredStudents = sData.filter(s => {
        const studentU = (s.username || '').replace('@', '').toLowerCase();
        return studentU !== cleanU.toLowerCase();
      });
      setStudents(filteredStudents);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (trainerUsername) {
      fetchTrainerAndStudents();
    }
  }, [trainerUsername]);

  // Гибридный обработчик: добавляем или обновляем ученика через upsert по username без дублей
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const cleanU = trainerUsername.replace('@', '');
    const cleanStudentU = newStudentForm.username ? newStudentForm.username.trim().replace(/^@+/, '') : '';
    const formattedUsername = cleanStudentU ? `@${cleanStudentU}` : `@student_${Date.now()}`;

    const studentPayload = {
      first_name: newStudentForm.first_name,
      last_name: newStudentForm.last_name,
      username: formattedUsername,
      phone: newStudentForm.phone || null,
      monthly_price: Number(newStudentForm.monthly_price),
      package_type: newStudentForm.package_type,
      total_trainings: Number(newStudentForm.total_trainings),
      left_trainings: Number(newStudentForm.left_trainings),
      gym: newStudentForm.gym || 'Invictus Go',
      trainer_username: `@${cleanU}`,
      status: 'active'
    };

    const { error } = await supabase
      .from('profiles')
      .upsert([studentPayload], { onConflict: 'username' });

    if (error) {
      alert('Ошибка добавления ученика: ' + error.message);
    } else {
      alert('Ученик успешно добавлен в CRM! Если он зарегистрирован в боте, данные синхронизированы.');
      setIsAddModalOpen(false);
      setNewStudentForm({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        monthly_price: 50000,
        package_type: 'Персональный (1 на 1)',
        total_trainings: 12,
        left_trainings: 12,
        gym: 'Invictus Go'
      });
      fetchTrainerAndStudents();
    }
  };

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
        products: trainerEditForm.products,
        avatar_url: trainerEditForm.avatar_url
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
      package_type: student.package_type || 'Персональный (1 на 1)',
      total_trainings: student.total_trainings || 12,
      left_trainings: student.left_trainings !== undefined ? student.left_trainings : 12,
      is_burnable: student.is_burnable || false,
      status: student.status || 'active',
      payment_method: student.payment_method || 'Перевод Kaspi',
      workout_days: student.workout_days || ['Понедельник', 'Среда', 'Пятница'],
      workout_time_slot: student.workout_time_slot || 'Вечер (16:00 - 21:00)',
      birth_date: student.birth_date || ''
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
        payment_method: studentFinances.payment_method,
        workout_days: studentFinances.workout_days,
        workout_time_slot: studentFinances.workout_time_slot,
        birth_date: studentFinances.birth_date || null
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

  const handleTelegramRedirect = (actionType) => {
    const cleanUsername = trainerUsername.replace('@', '');
    const message = encodeURIComponent(
      actionType === 'buy' 
        ? `Привет! Хочу оформить подписку на GymConnect CRM для тренера @${cleanUsername}`
        : `Привет! Хочу продлить подписку на GymConnect CRM для тренера @${cleanUsername}`
    );
    window.open(`https://t.me/asanali_kk?text=${message}`, '_blank');
  };

  const formatGoal = (goal) => {
    if (!goal) return 'Не указана';
    const g = goal.toLowerCase();
    if (g === 'mass' || g.includes('набор')) return 'Набор массы и гипертрофия';
    if (g === 'cut' || g.includes('сушка') || g.includes('похудение')) return 'Похудение и сушка';
    if (g === 'tone' || g.includes('рекомпозиция') || g.includes('тонус')) return 'Тонус и рекомпозиция';
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

  const lowBalanceStudents = students.filter(s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const timeSlots = ['Утро (08:00 - 12:00)', 'Обед (12:00 - 16:00)', 'Вечер (16:00 - 21:00)'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Шапка кабинета тренера */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {trainerProfile?.avatar_url ? (
                <img src={trainerProfile.avatar_url} alt="Trainer" className="w-12 h-12 rounded-2xl object-cover shadow-md border border-slate-200" />
              ) : (
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-md shadow-blue-600/20">
                  {trainerProfile?.first_name?.[0] || 'T'}
                </div>
              )}
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

          {/* Виджет подписки тренера и кнопка продвижения */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {subscription.isActive ? (
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Подписка CRM активна</p>
                    <p className="text-[11px] text-slate-500">Доступ действителен до <span className="font-semibold text-emerald-700">{subscription.expiresAt}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleTelegramRedirect('renew')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px]"
                >
                  Продлить
                </button>
              </div>
            ) : (
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Подписка не оформлена</p>
                    <p className="text-[11px] text-slate-500">Оформите доступ для работы с базой учеников</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTelegramRedirect('buy')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px]"
                >
                  Оформить
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Продвижение профиля (Таргет)</p>
                  <p className="text-[11px] text-slate-500">Получайте новых клиентов в свой зал</p>
                </div>
              </div>
              <button
                onClick={() => alert('Скоро здесь появится модуль настройки лидогенерации и таргета!')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px] flex items-center gap-1"
              >
                <span>Скоро</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Навигация (Табы) */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5">
          <button onClick={() => setActiveTab('overview')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Обзор</button>
          <button onClick={() => setActiveTab('students')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Ученики</button>
          <button onClick={() => setActiveTab('workouts')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'workouts' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Программы</button>
          <button onClick={() => setActiveTab('schedule')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Смены</button>
          <button onClick={() => setActiveTab('nutrition')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'nutrition' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Питание</button>
          <button onClick={() => setActiveTab('finance')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Касса</button>
          <button onClick={() => setActiveTab('notes')} className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>Заметки</button>
        </div>

        {/* Рендер активной вкладки */}
        {activeTab === 'overview' && (
          <OverviewTab 
            activeCount={activeCount} 
            pausedCount={pausedCount} 
            leftCount={leftCount} 
            lowBalanceCount={lowBalanceStudents.length} 
            totalEarnings={totalEarnings} 
            students={students}
            onSelectStudent={handleOpenStudentProfile}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
        {activeTab === 'students' && (
          <StudentsListTab students={students} formatGoal={formatGoal} onSelectStudent={(student) => handleOpenStudentProfile(student)} onOpenAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'workouts' && <WorkoutsTab students={students} />}
        {activeTab === 'schedule' && <ScheduleTab trainerProfile={trainerProfile} onUpdate={fetchTrainerAndStudents} />}
        {activeTab === 'nutrition' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center py-16 space-y-2">
            <Utensils className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <h3 className="font-bold text-base text-slate-900">Раздел «Питание и рационы» в разработке</h3>
            <p className="text-xs text-slate-500">Скоро здесь появится конструктор КБЖУ и назначение планов питания для подопечных.</p>
          </div>
        )}
        {activeTab === 'finance' && <FinanceTab students={students} onUpdate={fetchTrainerAndStudents} />}
        {activeTab === 'notes' && <NotesTab students={students} onUpdate={fetchTrainerAndStudents} />}

        {/* Модальное окно добавления ученика с подсказкой */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Добавить ученика в CRM</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>

              {/* Информативная подсказка гибридного подхода */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Если ученик уже зарегистрирован в боте GymConnect, укажите его Telegram username — карточка автоматически привяжется к вашему аккаунту без создания дублей!</span>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Имя *</label>
                    <input 
                      type="text"
                      required
                      value={newStudentForm.first_name}
                      onChange={(e) => setNewStudentForm({...newStudentForm, first_name: e.target.value})}
                      placeholder="Асанәли"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Фамилия</label>
                    <input 
                      type="text"
                      value={newStudentForm.last_name}
                      onChange={(e) => setNewStudentForm({...newStudentForm, last_name: e.target.value})}
                      placeholder="Құсайынов"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Telegram Username</label>
                  <input 
                    type="text"
                    value={newStudentForm.username}
                    onChange={(e) => setNewStudentForm({...newStudentForm, username: e.target.value})}
                    placeholder="@username"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Телефон WhatsApp</label>
                  <input 
                    type="tel"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({...newStudentForm, phone: e.target.value})}
                    placeholder="7011234567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Стоимость (₸ / мес)</label>
                    <input 
                      type="number"
                      value={newStudentForm.monthly_price}
                      onChange={(e) => setNewStudentForm({...newStudentForm, monthly_price: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Всего занятий</label>
                    <input 
                      type="number"
                      value={newStudentForm.total_trainings}
                      onChange={(e) => setNewStudentForm({...newStudentForm, total_trainings: e.target.value, left_trainings: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Фитнес-зал</label>
                  <input 
                    type="text"
                    value={newStudentForm.gym}
                    onChange={(e) => setNewStudentForm({...newStudentForm, gym: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium">Отмена</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md">Добавить в CRM</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования профиля тренера */}
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
                  <label className="block font-medium text-slate-700 mb-1">Ссылка на фото (Avatar URL)</label>
                  <input 
                    type="text"
                    value={trainerEditForm.avatar_url}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, avatar_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
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

        {/* Модальное окно управления учеником */}
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
                  <div className="pt-1">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Дата рождения (для поздравлений)</label>
                    <input 
                      type="date"
                      value={studentFinances.birth_date}
                      onChange={(e) => setStudentFinances({...studentFinances, birth_date: e.target.value})}
                      className="w-full p-2 bg-white border border-blue-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1"><b>Цель:</b> {formatGoal(selectedStudent.goal)} | <b>Зал:</b> {selectedStudent.gym || 'Не указан'}</p>
                </div>

                <form onSubmit={handleSaveStudentFinances} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Статус, Финансы и График
                  </p>

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
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                      >
                        <option value="Персональный (1 на 1)">Персональный (1 на 1)</option>
                        <option value="Мини-группа">Мини-группа</option>
                        <option value="Сплит (вдвоем)">Сплит (вдвоем)</option>
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

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Способ оплаты</label>
                    <select 
                      value={studentFinances.payment_method}
                      onChange={(e) => setStudentFinances({...studentFinances, payment_method: e.target.value})}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="Перевод Kaspi">Перевод Kaspi</option>
                      <option value="Наличные">Наличные</option>
                      <option value="Безналичный расчет">Безналичный расчет</option>
                    </select>
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
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot, idx) => {
                        const isSelected = studentFinances.workout_time_slot === slot;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStudentFinances({...studentFinances, workout_time_slot: slot})}
                            className={`py-2 px-1 rounded-xl font-semibold text-[11px] border transition-all text-center ${
                              isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {slot.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
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
