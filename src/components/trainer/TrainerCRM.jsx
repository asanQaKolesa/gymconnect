// src/components/trainer/TrainerCRM.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Utensils, X, Settings } from 'lucide-react';
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

  // Расширенная форма профиля тренера с полями залов и формата
  const [trainerEditForm, setTrainerEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    instagram: '',
    experience_years: '',
    products: '',
    avatar_url: '',
    gyms: 'Invictus Go',
    work_format: 'Офлайн'
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
        avatar_url: tData.avatar_url || '',
        gyms: tData.gyms || 'Invictus Go',
        work_format: tData.work_format || 'Офлайн'
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

  // Обработчик обновления настроек тренера (включая залы и формат)
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
        avatar_url: trainerEditForm.avatar_url,
        gyms: trainerEditForm.gyms,
        work_format: trainerEditForm.work_format
      })
      .eq('id', trainerProfile.id);

    if (error) {
      alert('Ошибка обновления профиля: ' + error.message);
    } else {
      alert('Настройки залов и формата успешно сохранены!');
      setIsProfileModalOpen(false);
      fetchTrainerAndStudents();
    }
  };

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

        {/* Модальное окно настроек профиля тренера с выбором залов и формата */}
        {isProfileModalOpen && trainerProfile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Настройки профиля и залов</h3>
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
                  <label className="block font-medium text-slate-700 mb-1">Мои залы (через запятую)</label>
                  <input 
                    type="text"
                    value={trainerEditForm.gyms}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, gyms: e.target.value})}
                    placeholder="Invictus Go, World Class"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Укажите клубы, в которых вы проводите офлайн-тренировки.</p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Основной формат работы</label>
                  <select 
                    value={trainerEditForm.work_format}
                    onChange={(e) => setTrainerEditForm({...trainerEditForm, work_format: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Офлайн">Офлайн (в залах)</option>
                    <option value="Онлайн">Онлайн (удаленно)</option>
                    <option value="Смешанный">Смешанный (Офлайн + Онлайн)</option>
                  </select>
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

      </div>
    </div>
  );
}
