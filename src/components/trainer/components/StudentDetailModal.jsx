// src/components/trainer/components/StudentDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Dumbbell, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  ShieldAlert, 
  Check, 
  Activity, 
  TrendingUp,
  Cake,
  Edit3
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentDetailModal({ isOpen, onClose, student, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'program' | 'finance' | 'notes'
  const [isSaving, setIsSaving] = useState(false);

  // Локальные состояния для редактирования данных тренером
  const [trainerNotes, setTrainerNotes] = useState('');
  const [remainingWorkouts, setRemainingWorkouts] = useState(12);
  const [totalWorkouts, setTotalWorkouts] = useState(12);
  const [monthlyPrice, setMonthlyPrice] = useState(70000);
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'pending'

  // Программа тренировок подопечного по дням
  const [assignedProgram, setAssignedProgram] = useState({
    1: { title: 'День 1: База (Грудь и Спина)', exercises: [{ name: 'Жим лежа', sets: '4 × 10', weight: '60 кг' }] },
    2: { title: 'День 2: Низ (Ноги и Пресс)', exercises: [{ name: 'Приседания со штангой', sets: '4 × 10', weight: '50 кг' }] },
    3: { title: 'День 3: Плечи и Руки', exercises: [{ name: 'Жим гантелей сидя', sets: '3 × 12', weight: '16 кг' }] }
  });
  const [selectedDay, setSelectedDay] = useState(1);
  const [newExercise, setNewExercise] = useState({ name: '', sets: '3 × 12', weight: '' });

  // Загрузка актуальных данных ученика при открытии
  useEffect(() => {
    if (student) {
      setTrainerNotes(student.trainer_notes || student.notes || '');
      const left = student.left_trainings !== undefined 
        ? student.left_trainings 
        : (student.remaining_workouts !== undefined ? student.remaining_workouts : 12);
      setRemainingWorkouts(Number(left));
      setTotalWorkouts(Number(student.total_trainings || 12));
      setMonthlyPrice(Number(student.monthly_price || 70000));
      setPaymentStatus(student.payment_status || 'paid');

      if (student.assigned_program && typeof student.assigned_program === 'object') {
        setAssignedProgram(student.assigned_program.days || student.assigned_program);
      }
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // Очистка контактов для WhatsApp и Telegram
  const cleanPhone = student.phone ? student.phone.replace(/\D/g, '') : '';
  const cleanUsername = student.username ? student.username.replace('@', '').trim() : '';

  // Сохранение обновлений в базу данных Supabase
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const payload = {
        trainer_notes: trainerNotes,
        left_trainings: Number(remainingWorkouts),
        remaining_workouts: Number(remainingWorkouts),
        total_trainings: Number(totalWorkouts),
        monthly_price: Number(monthlyPrice),
        payment_status: paymentStatus,
        assigned_program: { days: assignedProgram }
      };

      if (student.id) {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', student.id);

        if (error) throw error;
      }

      alert('Все изменения по карточке ученика сохранены!');
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Добавление упражнения в выбранный день
  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;

    setAssignedProgram(prev => {
      const currentDay = prev[selectedDay] || { title: `День ${selectedDay}`, exercises: [] };
      return {
        ...prev,
        [selectedDay]: {
          ...currentDay,
          exercises: [...(currentDay.exercises || []), { ...newExercise }]
        }
      };
    });

    setNewExercise({ name: '', sets: '3 × 12', weight: '' });
  };

  // Удаление упражнения
  const handleRemoveExercise = (exIndex) => {
    setAssignedProgram(prev => {
      const currentDay = prev[selectedDay];
      if (!currentDay) return prev;
      return {
        ...prev,
        [selectedDay]: {
          ...currentDay,
          exercises: currentDay.exercises.filter((_, i) => i !== exIndex)
        }
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* 1. Верхний бар с кнопкой назад в расписание */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К расписанию</span>
        </button>

        <h2 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
          {student.first_name} {student.last_name || ''}
        </h2>

        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1 active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? '...' : 'Сохранить'}</span>
        </button>
      </div>

      <div className="p-4 space-y-3.5 max-w-lg mx-auto w-full pb-28">

        {/* 2. Карточка профиля ученика */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-xs">
                {student.photo_url || student.avatar_url ? (
                  <img src={student.photo_url || student.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{student.first_name ? student.first_name[0] : 'U'}</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {student.first_name} {student.last_name || ''}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {student.age ? `${student.age} лет` : 'Возраст не указан'} • {student.gender === 'female' ? 'Женский' : 'Мужской'}
                </p>
                <div className="flex items-center gap-1 text-[10.5px] text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{student.gym || 'Зал не указан'}</span>
                </div>
              </div>
            </div>

            {/* Быстрые кнопки мессенджеров (SVG) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {cleanUsername && (
                <a
                  href={`https://t.me/${cleanUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/20 shadow-2xs active:scale-95"
                  title="Telegram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs active:scale-95"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.67-1.4 1.23-1.92 1.31-.5.08-1.15.11-3.69-.94-3.25-1.34-5.32-4.66-5.48-4.88-.16-.22-1.31-1.74-1.31-3.32 0-1.58.83-2.35 1.12-2.67.3-.32.65-.4.87-.4.22 0 .44 0 .63.01.2.01.47-.08.73.57.27.67.92 2.24 1 2.4.08.16.13.35.03.57-.1.22-.16.35-.31.54-.16.19-.34.42-.48.56-.16.16-.33.33-.14.66.19.33.85 1.4 1.82 2.26 1.25 1.11 2.3 1.46 2.63 1.62.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.44-.28.74-.17.3.11 1.9.9 2.23 1.06.33.16.55.24.63.38.08.14.08.81-.16 1.48z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Параметры тела атлета из базы */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Рост</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{student.height ? `${student.height} см` : '—'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Вес</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{student.weight ? `${student.weight} кг` : '—'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Цель</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{student.goal || 'Тонус'}</span>
            </div>
          </div>
        </div>

        {/* 3. Табы разделов внутри профиля ученика */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl">
          {[
            { id: 'overview', label: 'Анкета' },
            { id: 'program', label: 'Программа' },
            { id: 'finance', label: 'Касса' },
            { id: 'notes', label: 'Заметки' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 text-[11px] font-semibold rounded-xl text-center transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= ВКЛАДКА 1: АНКЕТА И ДЕТАЛИ ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900 border-b border-slate-100 pb-2">Спортивная анкета атлета</p>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Формат тренировок:</span>
                <span className="font-semibold text-slate-800">
                  {student.format === 'online' ? 'Онлайн-ведение' : 'Персонально в зале'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-400">График тренировок:</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(student.workout_days) && student.workout_days.length > 0 ? student.workout_days.join(', ') : 'Пн, Ср, Пт'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-400">Временной слот:</span>
                <span className="font-semibold text-slate-800">
                  {student.workout_time_slot || 'Вечер (16:00 - 21:00)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-50">
                <span className="text-slate-400">Район города:</span>
                <span className="font-semibold text-slate-800">{student.district || 'Алматы'}</span>
              </div>
            </div>

            {/* Медицинские ограничения (PAR-Q) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Здоровье и ограничения (PAR-Q)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                {student.health_notes || 'Анкета пройдена: жалоб на суставы, давление и травмы не зафиксировано.'}
              </p>
            </div>
          </div>
        )}

        {/* ================= ВКЛАДКА 2: НАЗНАЧЕНИЕ ПРОГРАММЫ ПО ДНЯМ ================= */}
        {activeTab === 'program' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-xs font-bold text-slate-900">Программа тренировок ученика</p>
              <span className="text-[10px] text-blue-600 font-mono">по дням</span>
            </div>

            {/* Выбор тренировочного дня */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[1, 2, 3, 4, 5].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedDay === day ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  День {day}
                </button>
              ))}
            </div>

            {/* Список упражнений дня */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                {assignedProgram[selectedDay]?.title || `День ${selectedDay}: Комплекс`}
              </span>

              {assignedProgram[selectedDay]?.exercises && assignedProgram[selectedDay].exercises.length > 0 ? (
                assignedProgram[selectedDay].exercises.map((ex, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{idx + 1}. {ex.name}</p>
                      <p className="text-[10px] text-slate-500">{ex.sets}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {ex.weight || 'Свой вес'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic py-2">На этот день упражнения пока не назначены.</p>
              )}
            </div>

            {/* Форма добавления нового упражнения */}
            <form onSubmit={handleAddExercise} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 pt-2.5 text-xs">
              <span className="font-bold text-slate-800 text-[11px] block">+ Добавить упражнение в День {selectedDay}:</span>
              
              <input
                type="text"
                value={newExercise.name}
                onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="Название (например: Жим гантелей)"
                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newExercise.sets}
                  onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })}
                  placeholder="Подходы (4 × 10)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={newExercise.weight}
                  onChange={e => setNewExercise({ ...newExercise, weight: e.target.value })}
                  placeholder="Вес (45 кг)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
              >
                Добавить в программу
              </button>
            </form>
          </div>
        )}

        {/* ================= ВКЛАДКА 3: КАССА, АБОНЕМЕНТ И ОСТАТКИ ================= */}
        {activeTab === 'finance' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
            <p className="font-bold text-slate-900 border-b border-slate-100 pb-2">Абонемент и учет оплат</p>

            {/* Счетчик остатка тренировок */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Остаток тренировок</span>
                <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{remainingWorkouts} из {totalWorkouts} зан.</p>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRemainingWorkouts(Math.max(0, remainingWorkouts - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90"
                  title="Списать тренировку"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setRemainingWorkouts(remainingWorkouts + 1)}
                  className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center justify-center text-xs active:scale-90"
                  title="Добавить тренировку"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Стоимость абонемента и статус оплаты */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Сумма абонемента (₸)</label>
                <input
                  type="number"
                  value={monthlyPrice}
                  onChange={e => setMonthlyPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Всего в блоке</label>
                <input
                  type="number"
                  value={totalWorkouts}
                  onChange={e => setTotalWorkouts(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 text-center"
                />
              </div>
            </div>

            {/* Переключатель статуса оплаты */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1.5">Статус оплаты:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    paymentStatus === 'paid' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Оплачено
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStatus('pending')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    paymentStatus === 'pending' 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Ожидает оплаты
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ВКЛАДКА 4: ЗАМЕТКИ ТРЕНЕРА ================= */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="font-bold text-slate-900">Личные заметки тренера</p>
              <span className="text-[10px] text-slate-400">видно только вам</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Фиксируйте сюда рабочие веса, комментарии по технике, любимые упражнения или психологические особенности подопечного:
            </p>

            <textarea
              rows={6}
              value={trainerNotes}
              onChange={e => setTrainerNotes(e.target.value)}
              placeholder="Например: Болит колено при глубоком приседе. Перешли на жим платформы с широкой постановкой ног. Любит пить кофе перед залом..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed resize-none focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

      </div>

      {/* Фиксированная нижняя кнопка сохранения */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveChanges}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Сохранение в базу...' : 'Сохранить данные ученика'}</span>
        </button>
      </div>

    </div>
  );
}
