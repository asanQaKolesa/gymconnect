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

// Все полноэкранные страницы меню
import TrainerSubscriptionModal from './components/modals/TrainerSubscriptionModal';
import TrainerPromotionModal from './components/modals/TrainerPromotionModal';
import TrainerPublicCardModal from './components/modals/TrainerPublicCardModal';
import TrainerEditProfileModal from './components/modals/TrainerEditProfileModal';
import TrainerClientRulesModal from './components/modals/TrainerClientRulesModal';
import TrainerHealthParqModal from './components/modals/TrainerHealthParqModal';
import TrainerTemplatesModal from './components/modals/TrainerTemplatesModal';
import TrainerIncomeCalcModal from './components/modals/TrainerIncomeCalcModal';
import TrainerReferralModal from './components/modals/TrainerReferralModal';
import TrainerSupportModal from './components/modals/TrainerSupportModal';
import TrainerDeleteModal from './components/modals/TrainerDeleteModal';
import TrainerQrModal from './components/modals/TrainerQrModal';

export default function TrainerCRM({ trainerUsername, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [trainerData, setTrainerData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояние активного полноэкранного раздела из меню
  const [activeScreen, setActiveScreen] = useState(null);
  const [openDrawerOnReturn, setOpenDrawerOnReturn] = useState(false);

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

  const handleCloseScreenToMenu = () => {
    setActiveScreen(null);
    setOpenDrawerOnReturn(true);
  };

  const handleOpenScreenFromHeader = (screenId) => {
    setOpenDrawerOnReturn(false);
    setActiveScreen(screenId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cleanUsername = trainerData?.username ? trainerData.username.replace('@', '').trim() : (trainerUsername?.replace('@', '').trim() || 'coach');
  const coachFullName = trainerData?.full_name || `${trainerData?.first_name || 'Тренер'} ${trainerData?.last_name || ''}`.trim();

  // ================= ПОЛНОЭКРАННЫЕ РАЗДЕЛЫ МЕНЮ (БЕЗ ФОНА СЗАДИ) =================
  if (activeScreen === 'subscription') {
    return (
      <TrainerSubscriptionModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
      />
    );
  }

  if (activeScreen === 'promotion') {
    return (
      <TrainerPromotionModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        gymName={trainerData?.gym || 'Invictus Go'}
      />
    );
  }

  if (activeScreen === 'public_card') {
    return (
      <TrainerPublicCardModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        onEditClick={() => setActiveScreen('edit_profile')}
        trainer={trainerData}
        cleanUsername={cleanUsername}
      />
    );
  }

  if (activeScreen === 'edit_profile') {
    return (
      <TrainerEditProfileModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        trainer={trainerData}
        cleanUsername={cleanUsername}
        onSaved={refreshTrainerData}
      />
    );
  }

  if (activeScreen === 'client_rules') {
    return (
      <TrainerClientRulesModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        coachName={coachFullName}
      />
    );
  }

  if (activeScreen === 'health_parq') {
    return (
      <TrainerHealthParqModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        studentsList={students}
      />
    );
  }

  if (activeScreen === 'templates') {
    return (
      <TrainerTemplatesModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        studentsList={students}
        gymName={trainerData?.gym?.split('|')[0] || 'клуб'}
      />
    );
  }

  if (activeScreen === 'income_calc') {
    return (
      <TrainerIncomeCalcModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
      />
    );
  }

  if (activeScreen === 'referral') {
    return (
      <TrainerReferralModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        cleanUsername={cleanUsername}
      />
    );
  }

  if (activeScreen === 'support') {
    return (
      <TrainerSupportModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
      />
    );
  }

  if (activeScreen === 'delete_account') {
    return (
      <TrainerDeleteModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        cleanUsername={cleanUsername}
        onDeleted={onBack}
      />
    );
  }

  if (activeScreen === 'qr_code') {
    return (
      <TrainerQrModal 
        isOpen={true}
        onClose={handleCloseScreenToMenu}
        coachName={coachFullName}
        cleanUsername={cleanUsername}
      />
    );
  }

  // ================= ОСНОВНОЙ ДАШБОРД CRM =================
  const activeStudentsCount = students.filter(s => s.status === 'active' || !s.status).length;
  const pausedStudentsCount = students.filter(s => s.status === 'paused').length;
  const leftStudentsCount = students.filter(s => s.status === 'left').length;
  const lowBalanceCount = students.filter(s => (s.left_trainings !== undefined ? s.left_trainings : (s.remaining_workouts !== undefined ? s.remaining_workouts : 12)) <= 2).length;
  const totalEarnings = students.reduce((acc, s) => acc + (Number(s.monthly_price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between relative bg-[#F2F2F7] shadow-xl">
        <div className="flex-1 pb-10">
          <TrainerHeader 
            trainer={trainerData} 
            onLogout={onLogout} 
            onBack={onBack}
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId)}
            onOpenScreen={handleOpenScreenFromHeader}
            initialDrawerOpen={openDrawerOnReturn}
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
                onUpdate={refreshTrainerData}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutsTab 
                students={students} 
                onUpdate={refreshTrainerData}
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
                onUpdate={refreshTrainerData}
              />
            )}
          </main>
        </div>

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
