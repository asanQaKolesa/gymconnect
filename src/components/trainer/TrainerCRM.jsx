// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import TrainerHeader from './components/TrainerHeader';
import OverviewTab from './tabs/OverviewTab';
import StudentsListTab from './tabs/StudentsListTab';
import WorkoutsTab from './tabs/WorkoutsTab';
import TrainerNutritionTab from './tabs/TrainerNutritionTab';
import ScheduleTab from './tabs/ScheduleTab';
import FinanceTab from './tabs/FinanceTab';
import NotesTab from './tabs/NotesTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AddStudentModal from './components/AddStudentModal';
import StudentDetailModal from './components/StudentDetailModal';

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

  // Состояние выбранного ученика для открытия досье
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [studentDetailOrigin, setStudentDetailOrigin] = useState('overview'); // 'overview' | 'students'

  // Форма добавления студента
  const [addStudentForm, setAddStudentForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    monthly_price: 70000,
    total_trainings: 12,
    gym: ''
  });

  // Загрузка данных тренера и его учеников (с поддержкой тихого фонового опроса)
  const refreshTrainerData = async (isSilent = false) => {
    try {
      const cleanUsername = trainerUsername ? trainerUsername.replace('@', '').trim().toLowerCase() : '';
      if (!cleanUsername) return;

      // 1. Профиль тренера
      const { data: tData, error: tErr } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`)
        .maybeSingle();

      if (tErr) throw tErr;
      if (tData) setTrainerData(tData);

      // 2. Список учеников тренера
      const { data: sData } = await supabase
        .from('profiles')
        .select('*')
        .or(`trainer_username.ilike.${cleanUsername},trainer_username.ilike.@${cleanUsername},trainer_telegram.ilike.${cleanUsername},trainer_telegram.ilike.@${cleanUsername}`);

      // Строгая фильтрация по актуальному наставнику
      const validStudents = (sData || []).filter(student => {
        const studentTrainerU = (student.trainer_username || '').replace('@', '').trim().toLowerCase();
        const studentTrainerTg = (student.trainer_telegram || '').replace('@', '').trim().toLowerCase();

        if (studentTrainerU) {
          return studentTrainerU === cleanUsername;
        }
        return studentTrainerTg === cleanUsername;
      });

      setStudents(validStudents);
    } catch (err) {
      if (!isSilent) console.error('Ошибка загрузки данных в TrainerCRM:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // ПЕРВИЧНАЯ ЗАГРУЗКА + 5-СЕКУНДНЫЙ ТИХИЙ ПОЛЛИНГ БАЗЫ ДАННЫХ
  useEffect(() => {
    if (!trainerUsername) {
      setLoading(false);
      return;
    }

    // 1. Первая загрузка с лоадером
    refreshTrainerData(false);

    // 2. Фоновый тихий опрос каждые 5 секунд (живой поллинг)
    const pollTimer = setInterval(() => {
      refreshTrainerData(true);
    }, 5000);

    return () => clearInterval(pollTimer);
  }, [trainerUsername]);

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addStudentForm.first_name.trim()) {
      alert('Укажите имя ученика');
      return;
    }

    try {
      const cleanU = addStudentForm.username.replace('@', '').trim();
      const currentCoachNick = (trainerData?.username || trainerUsername).replace('@', '').trim().toLowerCase();

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
        trainer_username: currentCoachNick,
        trainer_telegram: currentCoachNick,
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
      refreshTrainerData(false);
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

  // ================= 1. ПОЛНОЭКРАННОЕ ДОСЬЕ УЧЕНИКА =================
  if (selectedStudentForDetail) {
    return (
      <StudentDetailModal 
        isOpen={true}
        student={selectedStudentForDetail}
        backText={studentDetailOrigin === 'students' ? 'К списку учеников' : 'К расписанию'}
        onClose={() => setSelectedStudentForDetail(null)}
        onUpdate={() => refreshTrainerData(false)}
      />
    );
  }

  // ================= 2. ПОЛНОЭКРАННЫЕ РАЗДЕЛЫ МЕНЮ =================
  if (activeScreen === 'subscription') {
    return <TrainerSubscriptionModal isOpen={true} onClose={handleCloseScreenToMenu} />;
  }

  if (activeScreen === 'promotion') {
    return <TrainerPromotionModal isOpen={true} onClose={handleCloseScreenToMenu} gymName={trainerData?.gym || 'Invictus Go'} />;
  }

  if (activeScreen === 'public_card') {
    return <TrainerPublicCardModal isOpen={true} onClose={handleCloseScreenToMenu} onEditClick={() => setActiveScreen('edit_profile')} trainer={trainerData} cleanUsername={trainerData?.username || trainerUsername} />;
  }

  if (activeScreen === 'edit_profile') {
    return <TrainerEditProfileModal isOpen={true} onClose={handleCloseScreenToMenu} trainer={trainerData} cleanUsername={trainerData?.username || trainerUsername} onSaved={() => refreshTrainerData(false)} />;
  }

  if (activeScreen === 'client_rules') {
    return <TrainerClientRulesModal isOpen={true} onClose={handleCloseScreenToMenu} coachName={trainerData?.full_name || trainerData?.first_name || 'Тренер'} />;
  }

  if (activeScreen === 'health_parq') {
    return <TrainerHealthParqModal isOpen={true} onClose={handleCloseScreenToMenu} studentsList={students} />;
  }

  if (activeScreen === 'templates') {
    return <TrainerTemplatesModal isOpen={true} onClose={handleCloseScreenToMenu} studentsList={students} gymName={trainerData?.gym?.split('|')[0] || 'клуб'} />;
  }

  if (activeScreen === 'income_calc') {
    return <TrainerIncomeCalcModal isOpen={true} onClose={handleCloseScreenToMenu} />;
  }

  if (activeScreen === 'referral') {
    return <TrainerReferralModal isOpen={true} onClose={handleCloseScreenToMenu} cleanUsername={trainerData?.username || trainerUsername} />;
  }

  if (activeScreen === 'support') {
    return <TrainerSupportModal isOpen={true} onClose={handleCloseScreenToMenu} />;
  }

  if (activeScreen === 'delete_account') {
    return <TrainerDeleteModal isOpen={true} onClose={handleCloseScreenToMenu} cleanUsername={trainerData?.username || trainerUsername} onDeleted={onBack} />;
  }

  if (activeScreen === 'qr_code') {
    return <TrainerQrModal isOpen={true} onClose={handleCloseScreenToMenu} coachName={trainerData?.full_name || trainerData?.first_name || 'Тренер'} cleanUsername={trainerData?.username || trainerUsername} />;
  }

  // ================= 3. ОСНОВНОЙ ДАШБОРД CRM =================
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
                onSelectStudent={(st) => {
                  setSelectedStudentForDetail(st);
                  setStudentDetailOrigin('overview');
                }}
                onAddStudentClick={() => setIsAddStudentOpen(true)}
              />
            )}

            {activeTab === 'students' && (
              <StudentsListTab 
                students={students} 
                onSelectStudent={(st) => {
                  setSelectedStudentForDetail(st);
                  setStudentDetailOrigin('students');
                }}
                onOpenAddModal={() => setIsAddStudentOpen(true)}
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutsTab 
                students={students} 
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'nutrition' && (
              <TrainerNutritionTab 
                students={students} 
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab 
                trainerProfile={trainerData}
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceTab 
                students={students} 
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab 
                students={students} 
                onUpdate={() => refreshTrainerData(false)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                students={students} 
                onUpdate={() => refreshTrainerData(false)}
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
