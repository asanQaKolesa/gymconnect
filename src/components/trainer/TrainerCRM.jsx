// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Экран входящих заявок
import InquiriesScreen from './screens/InquiriesScreen';

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

// Вспомогательная функция гарантированного извлечения имени атлета
const formatAthleteFullName = (st) => {
  if (!st) return 'Атлет';
  if (st.full_name && st.full_name.trim()) return st.full_name.trim();
  const combined = `${st.first_name || ''} ${st.last_name || ''}`.trim();
  if (combined) return combined;
  if (st.username) return `@${st.username.replace('@', '')}`;
  if (st.telegram_username) return `@${st.telegram_username.replace('@', '')}`;
  return 'Атлет';
};

export default function TrainerCRM({ trainerUsername, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [trainerData, setTrainerData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeScreen, setActiveScreen] = useState(null);
  const [openDrawerOnReturn, setOpenDrawerOnReturn] = useState(false);

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [studentDetailOrigin, setStudentDetailOrigin] = useState('overview');

  const [addStudentForm, setAddStudentForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    monthly_price: 70000,
    total_trainings: 12,
    gym: ''
  });

  // Загрузка данных строго по требованию
  const refreshTrainerData = useCallback(async (isSilent = false) => {
    try {
      const cleanUsername = trainerUsername ? trainerUsername.replace('@', '').trim().toLowerCase() : '';
      if (!cleanUsername) return;

      const { data: tData, error: tErr } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`)
        .maybeSingle();

      if (tErr) throw tErr;
      if (tData) setTrainerData(tData);

      const { data: sData } = await supabase
        .from('profiles')
        .select('*')
        .or(`trainer_username.ilike.${cleanUsername},trainer_username.ilike.@${cleanUsername},trainer_telegram.ilike.${cleanUsername},trainer_telegram.ilike.@${cleanUsername}`);

      const validStudents = (sData || [])
        .filter(student => {
          const studentTrainerU = (student.trainer_username || '').replace('@', '').trim().toLowerCase();
          const studentTrainerTg = (student.trainer_telegram || '').replace('@', '').trim().toLowerCase();
          return studentTrainerU === cleanUsername || studentTrainerTg === cleanUsername;
        })
        .map(student => ({
          ...student,
          full_name: formatAthleteFullName(student)
        }));

      setStudents(validStudents);
    } catch (err) {
      if (!isSilent) console.error('Ошибка загрузки данных в TrainerCRM:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [trainerUsername]);

  // Загрузка при открытии + Подписка на Realtime (0 холостых запросов!)
  useEffect(() => {
    if (!trainerUsername) {
      setLoading(false);
      return;
    }

    // 1. Первоначальная загрузка
    refreshTrainerData(false);

    // 2. Realtime-подписка: база сама пришлет сигнал, если изменился профиль или ученик
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          refreshTrainerData(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trainer_leads' },
        () => {
          refreshTrainerData(true);
        }
      )
      .subscribe();

    // 3. Обновление при возвращении тренера в приложение (когда развернул Telegram)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshTrainerData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trainerUsername, refreshTrainerData]);

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!addStudentForm.first_name.trim()) {
      alert('Укажите имя ученика');
      return;
    }

    try {
      const cleanU = addStudentForm.username ? addStudentForm.username.replace(/[@\s]/g, '').trim().toLowerCase() : '';
      const cleanPhone = addStudentForm.phone ? addStudentForm.phone.replace(/\D/g, '') : '';
      const currentCoachNick = (trainerData?.username || trainerUsername).replace(/[@\s]/g, '').trim().toLowerCase();

      const totalNum = Number(addStudentForm.total_trainings) || 12;
      const priceNum = Number(addStudentForm.monthly_price) || 70000;
      const gymName = addStudentForm.gym || trainerData?.gym || 'Invictus Go';
      const fullName = `${addStudentForm.first_name.trim()} ${addStudentForm.last_name.trim()}`.trim();

      let existingProfile = null;
      if (cleanU) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${cleanU},username.ilike.@${cleanU}`)
          .maybeSingle();
        if (data) existingProfile = data;
      }

      if (!existingProfile && cleanPhone && cleanPhone.length >= 10) {
        const last10 = cleanPhone.slice(-10);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`phone.ilike.%${last10}%,whatsapp.ilike.%${last10}%`)
          .maybeSingle();
        if (data) existingProfile = data;
      }

      if (existingProfile) {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({
            trainer_username: currentCoachNick,
            trainer_telegram: currentCoachNick,
            monthly_price: priceNum,
            total_trainings: totalNum,
            left_trainings: totalNum,
            remaining_workouts: totalNum,
            gym: gymName,
            status: 'active'
          })
          .eq('id', existingProfile.id);

        if (updErr) throw updErr;
        alert(`✅ Атлет ${existingProfile.first_name || ''} найден и привязан к вам!`);
      } else {
        const payload = {
          first_name: addStudentForm.first_name.trim(),
          last_name: addStudentForm.last_name.trim(),
          full_name: fullName,
          username: cleanU || null,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          monthly_price: priceNum,
          total_trainings: totalNum,
          left_trainings: totalNum,
          remaining_workouts: totalNum,
          gym: gymName,
          trainer_username: currentCoachNick,
          trainer_telegram: currentCoachNick,
          status: 'active',
          workout_days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          workout_time_slot: 'Вечер (16:00 - 21:00)',
          created_at: new Date().toISOString()
        };

        const { error: insErr } = await supabase
          .from('profiles')
          .insert([payload]);

        if (insErr) throw insErr;
        alert('Ученик успешно зарегистрирован в базе CRM!');
      }

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

  // 1. Полноэкранное досье ученика
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

  // 2. Экран входящих заявок
  if (activeScreen === 'notifications' || activeScreen === 'inquiries') {
    return (
      <InquiriesScreen
        trainer={trainerData}
        onBack={() => setActiveScreen(null)}
        onRefresh={() => refreshTrainerData(false)}
      />
    );
  }

  // 3. Полноэкранные разделы меню
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

  // 4. Основной дашборд CRM
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
            students={students}
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
                onOpenPublicProfile={() => setActiveScreen('public_card')}
                onOpenInquiries={() => setActiveScreen('inquiries')}
                onNavigateToCalendar={() => setActiveTab('schedule')}
                onNavigateToFinance={() => setActiveTab('finance')}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
                onNavigateToStudents={() => setActiveTab('students')}
                onNavigateToBroadcasts={() => setActiveScreen('templates')}
                onAddStudentClick={() => setIsAddStudentOpen(true)}
                onRefresh={() => refreshTrainerData(false)}
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
          coachUsername={trainerData?.username || trainerUsername}
          coachGym={trainerData?.gym}
        />
      </div>
    </div>
  );
}
