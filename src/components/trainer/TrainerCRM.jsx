// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import TrainerHeader from './components/TrainerHeader';
import TrainerNav from './components/TrainerNav';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainerData() {
      try {
        const cleanUsername = trainerUsername?.replace('@', '') || '';
        const { data, error } = await supabase
          .from('trainer_profiles')
          .select('*')
          .or(`username.eq.@${cleanUsername},username.eq.${cleanUsername}`)
          .maybeSingle();

        if (error) throw error;
        setTrainerData(data);
      } catch (err) {
        console.error('Ошибка загрузки данных тренера:', err);
      } finally {
        setLoading(false);
      }
    }
    if (trainerUsername) fetchTrainerData();
  }, [trainerUsername]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between relative bg-[#F2F2F7] shadow-2xl">
        
        {/* Шапка тренера с рабочей кнопкой возврата в профиль */}
        <div className="flex-1 pb-24">
          <TrainerHeader 
            trainer={trainerData} 
            onLogout={onLogout} 
            onBack={onBack}
          />

          <main className="p-4 space-y-4">
            {activeTab === 'overview' && (
              <OverviewTab 
                trainer={trainerData} 
                onAddStudent={() => setIsAddStudentOpen(true)}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'students' && (
              <StudentsListTab 
                trainerId={trainerData?.id} 
                onAddStudent={() => setIsAddStudentOpen(true)} 
              />
            )}
            {activeTab === 'workouts' && (
              <WorkoutsTab 
                trainerId={trainerData?.id} 
              />
            )}
            {activeTab === 'schedule' && (
              <ScheduleTab 
                trainerId={trainerData?.id} 
              />
            )}
            {activeTab === 'finance' && (
              <FinanceTab 
                trainerId={trainerData?.id} 
              />
            )}
            {activeTab === 'notes' && (
              <NotesTab 
                trainerId={trainerData?.id} 
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                trainerId={trainerData?.id} 
              />
            )}
          </main>
        </div>

        {/* Навигация тренера */}
        <TrainerNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Модальное окно добавления ученика */}
        <AddStudentModal 
          isOpen={isAddStudentOpen} 
          onClose={() => setIsAddStudentOpen(false)}
          trainerId={trainerData?.id}
        />

      </div>
    </div>
  );
}
