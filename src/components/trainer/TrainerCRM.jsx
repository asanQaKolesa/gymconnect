// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Utensils } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import ScheduleTab from './tabs/ScheduleTab';
import FinanceTab from './tabs/FinanceTab';
import NotesTab from './tabs/NotesTab';

import TrainerHeader from './components/TrainerHeader';
import TrainerNav from './components/TrainerNav';
import AddStudentModal from './components/AddStudentModal';

export default function TrainerCRM({ trainerUsername, onLogout }) {
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      alert('Ученик успешно добавлен в CRM!');
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
    return goal;
  };

  const activeCount = students.filter(s => s.status === 'active' || !s.status).length;
  const pausedCount = students.filter(s => s.status === 'paused').length;
  const leftCount = students.filter(s => s.status === 'left').length;
  const totalEarnings = students
    .filter(s => s.status === 'active' || !s.status)
    .reduce((sum, s) => sum + (Number(s.monthly_price) || 0), 0);

  const lowBalanceStudents = students.filter(s => (s.status === 'active' || !s.status) && (s.left_trainings !== undefined ? s.left_trainings : 12) <= 2);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-4">
        
        <TrainerHeader 
          trainerProfile={trainerProfile}
          trainerUsername={trainerUsername}
          loading={loading}
          subscription={subscription}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onRefresh={fetchTrainerAndStudents}
          onLogout={onLogout}
          onTelegramRedirect={handleTelegramRedirect}
        />

        <TrainerNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'overview' && (
          <OverviewTab 
            activeCount={activeCount} 
            pausedCount={pausedCount} 
            leftCount={leftCount} 
            lowBalanceCount={lowBalanceStudents.length} 
            totalEarnings={totalEarnings} 
            students={students}
            onSelectStudent={(student) => setSelectedStudent(student)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
        {activeTab === 'students' && (
          <StudentsListTab students={students} formatGoal={formatGoal} onSelectStudent={(student) => setSelectedStudent(student)} onOpenAddModal={() => setIsAddModalOpen(true)} />
        )}
        {activeTab === 'workouts' && <WorkoutsTab students={students} />}
        {activeTab === 'schedule' && <ScheduleTab trainerProfile={trainerProfile} onUpdate={fetchTrainerAndStudents} />}
        {activeTab === 'nutrition' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center py-16 space-y-2">
            <Utensils className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <h3 className="font-bold text-base text-slate-900">Раздел «Питание и рационы» в разработке</h3>
            <p className="text-xs text-slate-500">Скоро здесь появится конструктор КБЖУ и назначение планов питания.</p>
          </div>
        )}
        {activeTab === 'finance' && <FinanceTab students={students} onUpdate={fetchTrainerAndStudents} />}
        {activeTab === 'notes' && <NotesTab students={students} onUpdate={fetchTrainerAndStudents} />}

        <AddStudentModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          form={newStudentForm}
          setForm={setNewStudentForm}
          onSubmit={handleCreateStudent}
        />

      </div>
    </div>
  );
}
