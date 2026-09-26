// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import TrainerHeader from './components/TrainerHeader';
import OverviewTab from './tabs/OverviewTab';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import ScheduleTab from './tabs/ScheduleTab';
import FinanceTab from './tabs/FinanceTab';
import NotesTab from './tabs/NotesTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AddStudentModal from './components/AddStudentModal';

export default function TrainerCRM({ trainerUsername, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [trainerData, setTrainerData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Форма модалки добавления студента
  const [addStudentForm, setAddStudentForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    monthly_price: 70000,
    total_trainings: 12,
    gym: ''
  });

  // Загрузка данных тренера и его учеников
  const refreshTrainerData = async () => {
    try {
      const cleanUsername = trainerUsername ? trainerUsername.replace('@', '').trim() : '';
      if (!cleanUsername) return;

      // 1. Профиль тренера
      const { data: tData, error: tErr } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.eq.@${cleanUsername},username.eq.${cleanUsername}`)
        .maybeSingle();

      if (tErr) throw tErr;
      setTrainerData(tData);

      // 2. Список учеников тренера
      const { data: sData } = await supabase
        .from('profiles')
        .select('*')
        .or(`trainer_username.eq.${cleanUsername},trainer_username.eq.@${cleanUsername},trainer_telegram.eq.${cleanUsername},trainer_telegram.eq.@${cleanUsername}`);

      setStudents(sData || []);
    } catch (err) {
      console.error('Ошибка загрузки данных в TrainerCRM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trainerUsername) {
      refreshTrainerData();
    } else {
      setLoading(false);
    }
  }, [trainerUsername]);

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addStudentForm.first_name.trim()) {
      alert('Укажите имя ученика');
      return;
    }

    try {
      const cleanU = addStudentForm.username.replace('@', '').trim();
      const payload = {
        first_name: addStudentForm.first_name.trim(),
        last_name: addStudentForm.last_name.trim(),
        username: cleanU || null,
        phone: addStudentForm.phone.replace(/\D/g, ''),
        monthly_price: Number(addStudentForm.monthly_price) || 0,
        total_trainings: Number(addStudentForm.total_trainings) || 12,
        left_trainings: Number(addStudentForm.total_trainings) || 12,
        remaining_workouts: Number(addStudentForm.total_trainings) || 12,
        gym: addStudentForm.gym || trainerData?.gym || 'Invictus Go',
        trainer_username: trainerData?.username?.replace('@', '') || trainerUsername.replace('@', ''),
        trainer_telegram: trainerData?.username?.replace('@', '') || trainerUsername.replace('@', ''),
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .insert([payload]);

      if (error) throw error;

      alert('Ученик успешно зарегистрирован в базе!');
      setIsAddStudentOpen(false);
      setAddStudentForm({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        monthly_price: 70000,
        total_trainings: 12,
        gym: ''
      });
      refreshTrainerData();
    } catch (err) {
      alert('Ошибка добавления ученика: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Расчет основных показателей
  const activeStudentsCount = students.filter(s => s.status === 'active' || !s.status).length;
  const pausedStudentsCount = students.filter(s => s.status === 'paused').length;
  const leftStudentsCount = students.filter(s => s.status === 'left').length;
  const lowBalanceCount = students.filter(s => (s.left_trainings !== undefined ? s.left_trainings : (s.remaining_workouts !== undefined ? s.remaining_workouts : 12)) <= 2).length;
  const totalEarnings = students.reduce((acc, s) => acc + (Number(s.monthly_price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between relative bg-[#F2F2F7] shadow-xl">
        
        {/* Шапка тренера со встроенным боковым меню */}
        <div className="flex-1 pb-10">
          <TrainerHeader 
            trainer={trainerData} 
            onLogout={onLogout} 
            onBack={onBack}
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId)}
          />

          <main className="p-3.5 space-y-3.5">
            {activeTab === 'overview' && (
              <OverviewTab 
                trainer={trainerData}
                students={students}
                activeCount={activeStudentsCount}
                pausedCount={pausedStudentsCount}
                leftCount={leftStudentsCount}
                lowBalanceCount={lowBalanceCount}
                totalEarnings={totalEarnings}
                onSelectStudent={() => setActiveTab('students')}
                onAddStudentClick={() => setIsAddStudentOpen(true)}
              />
            )}

            {activeTab === 'students' && (
              <StudentsListTab 
                students={students} 
                onSelectStudent={() => {}}
                onOpenAddModal={() => setIsAddStudentOpen(true)}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutsTab 
                students={students} 
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab 
                trainerProfile={trainerData}
                onUpdate={refreshTrainerData}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceTab 
                students={students}
                onUpdate={refreshTrainerData}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab 
                students={students}
                onUpdate={refreshTrainerData}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                students={students} 
              />
            )}
          </main>
        </div>

        {/* Автономная модалка добавления ученика */}
        <AddStudentModal 
          isOpen={isAddStudentOpen} 
          onClose={() => setIsAddStudentOpen(false)}
          form={addStudentForm}
          setForm={setAddStudentForm}
          onSubmit={handleAddStudentSubmit}
        />

      </div>
    </div>
  );
}
