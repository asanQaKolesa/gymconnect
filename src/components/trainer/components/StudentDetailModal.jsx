// src/components/trainer/components/StudentDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Dumbbell, 
  Apple, 
  UserCheck, 
  PauseCircle, 
  Archive
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import StudentInfoTab from '../student-detail/StudentInfoTab';
import StudentFinanceTab from '../student-detail/StudentFinanceTab';
import StudentProgramTab from '../student-detail/StudentProgramTab';
import TrainerNutritionTab from '../tabs/TrainerNutritionTab';

export default function StudentDetailModal({ 
  student, 
  isOpen, 
  onClose, 
  onUpdate 
}) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО В НАЧАЛЕ)
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'finance' | 'program' | 'nutrition'
  const [currentStudent, setCurrentStudent] = useState(student);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Синхронизация при открытии
  useEffect(() => {
    if (student) {
      setCurrentStudent(student);
    }
  }, [student]);

  if (!isOpen || !currentStudent) return null;

  // Тактильный отклик Telegram
  const triggerHaptic = () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (e) {}
  };

  // Определение текущего статуса подопечного
  const rawStatus = (currentStudent.status || '').toLowerCase().trim();
  const currentStatusKey = rawStatus === 'paused' ? 'paused' : (rawStatus === 'left' || rawStatus === 'archived') ? 'left' : 'active';

  // Быстрая смена статуса из шапки
  const handleSwitchStatus = async (newStatus) => {
    if (currentStatusKey === newStatus || isUpdatingStatus) return;
    triggerHaptic();
    setIsUpdatingStatus(true);
    setStatusSuccess(false);

    // Оптимистичное обновление в UI
    const updated = { ...currentStudent, status: newStatus };
    setCurrentStudent(updated);

    try {
      let query = supabase.from('profiles').update({ status: newStatus });
      if (currentStudent.id) {
        query = query.eq('id', currentStudent.id);
      } else if (currentStudent.telegram_id) {
        query = query.eq('telegram_id', currentStudent.telegram_id);
      }

      await query;
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка смены статуса в шапке:', err);
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Баланс занятий с защитой от null
  const leftTrainings = Number(currentStudent.left_trainings ?? currentStudent.remaining_workouts ?? 0);
  const totalTrainings = Number(currentStudent.total_trainings ?? 12);

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-[#F2F2F7] flex flex-col overflow-y-auto animate-in fade-in duration-200">
      
      {/* 1. ФИКСИРОВАННАЯ ШАПКА APPLE HIG */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        
        {/* Верхняя строка: Кнопка назад + Аватар + Имя + Баланс */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-90 transition-all cursor-pointer shrink-0"
              title="Назад к списку"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
              {currentStudent.full_name ? currentStudent.full_name.charAt(0).toUpperCase() : 'A'}
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-extrabold text-slate-900 truncate">
                {currentStudent.full_name || 'Атлет без имени'}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                <span>@{currentStudent.username || currentStudent.telegram_username || 'id' + (currentStudent.telegram_id || currentStudent.id?.slice(0, 5))}</span>
                <span>•</span>
                <span className="font-mono font-bold text-slate-700">
                  {leftTrainings} из {totalTrainings} зан.
                </span>
              </div>
            </div>
          </div>

          {/* Плашка баланса */}
          <div className="shrink-0 text-right">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
              leftTrainings <= 2 
                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {leftTrainings <= 2 ? `Остаток: ${leftTrainings}` : `${leftTrainings} зан.`}
            </span>
          </div>
        </div>

        {/* Строка 2: Переключатель статуса («В строю» / «Заморозка» / «Завершил») */}
        <div className="px-4 pb-2.5">
          <div className="p-1 bg-slate-100/90 rounded-2xl grid grid-cols-3 gap-1">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleSwitchStatus('active')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                currentStatusKey === 'active'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>В строю</span>
            </button>

            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleSwitchStatus('paused')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                currentStatusKey === 'paused'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PauseCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Заморозка</span>
            </button>

            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => handleSwitchStatus('left')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                currentStatusKey === 'left'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Завершил</span>
            </button>
          </div>
        </div>

        {/* Строка 3: 4 ТАБА ДОСЬЕ */}
        <div className="px-4 pb-2 border-t border-slate-100/80 pt-2 bg-white">
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'info', label: 'Анкета', icon: User },
              { id: 'finance', label: 'Касса', icon: CreditCard },
              { id: 'program', label: 'План', icon: Dumbbell },
              { id: 'nutrition', label: 'Питание', icon: Apple }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab(tab.id);
                  }}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 font-semibold'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400'}`} />
                  <span className="text-[11px] whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. СОДЕРЖИМОЕ АКТИВНОГО ТАБА */}
      <div className="flex-1 w-full max-w-lg mx-auto p-4 animate-in fade-in duration-150">
        {activeTab === 'info' && (
          <StudentInfoTab 
            student={currentStudent} 
            onUpdate={() => {
              if (onUpdate) onUpdate();
            }} 
          />
        )}

        {activeTab === 'finance' && (
          <StudentFinanceTab 
            student={currentStudent} 
            onUpdate={() => {
              if (onUpdate) onUpdate();
            }} 
          />
        )}

        {activeTab === 'program' && (
          <StudentProgramTab 
            student={currentStudent} 
            onUpdate={() => {
              if (onUpdate) onUpdate();
            }} 
          />
        )}

        {activeTab === 'nutrition' && (
          <TrainerNutritionTab 
            student={currentStudent} 
            onUpdate={() => {
              if (onUpdate) onUpdate();
            }} 
          />
        )}
      </div>

    </div>
  );
}
