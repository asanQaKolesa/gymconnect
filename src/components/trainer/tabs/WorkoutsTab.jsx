// src/components/trainer/tabs/WorkoutsTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Flame, 
  Calendar, 
  Sparkles, 
  Save, 
  ChevronRight,
  User,
  ExternalLink,
  Layers,
  ChevronDown
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';

export default function WorkoutsTab({ students = [], onUpdate, onSelectStudent }) {
  const isStudentActive = (s) => {
    if (!s) return false;
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  };

  const activeStudents = students.filter(isStudentActive);
  const [selectedStudentId, setSelectedStudentId] = useState(activeStudents[0]?.id || '');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  
  // Параметры программы
  const [workoutType, setWorkoutType] = useState('fullbody');
  const [frequency, setFrequency] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [warmup, setWarmup] = useState('Суставная разминка 10 мин');
  const [contraindications, setContraindications] = useState('Без осевой нагрузки');

  // База упражнений по группам мышц
  const exerciseDatabase = {
    'Грудь': ['Жим лежа со штангой', 'Жим гантелей на наклонной', 'Сведение рук в кроссовере', 'Отжимания на брусьях'],
    'Спина': ['Подтягивания на перекладине', 'Тяга верхнего блока', 'Тяга штанги в наклоне', 'Горизонтальная тяга'],
    'Ноги': ['Приседания со штангой', 'Жим ногами в платформе', 'Болгарские выпады', 'Румынская тяга', 'Сгибание ног'],
    'Плечи': ['Жим штанги стоя (Армейский)', 'Махи гантелями в стороны', 'Протяжка к подбородку', 'Махи в наклоне'],
    'Руки': ['Подъем штанги на бицепс', 'Французский жим лежа', 'Сгибание рук с гантелями', 'Разгибания в блоке'],
    'Пресс': ['Скручивания на полу', 'Подъем ног в висе', 'Планка', 'Русские скручивания']
  };

  const [daysWorkouts, setDaysWorkouts] = useState({
    1: { title: 'День 1: Верх тела (Грудь + Спина)', exercises: [{ muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 4, reps: 10, weight: 60 }] },
    2: { title: 'День 2: Низ тела (Ноги + Пресс)', exercises: [{ muscleGroup: 'Ноги', name: 'Приседания со штангой', sets: 4, reps: 10, weight: 50 }] },
    3: { title: 'День 3: Плечи и Руки', exercises: [{ muscleGroup: 'Плечи', name: 'Жим штанги стоя (Армейский)', sets: 3, reps: 12, weight: 30 }] }
  });

  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    if (activeStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(activeStudents[0].id);
    }
    const current = activeStudents.find(s => s.id === selectedStudentId);
    if (current?.assigned_program && typeof current.assigned_program === 'object') {
      const prog = current.assigned_program;
      if (prog.days) setDaysWorkouts(prog.days);
      if (prog.frequency) setFrequency(prog.frequency);
      if (prog.workoutType) setWorkoutType(prog.workoutType);
      if (prog.warmup) setWarmup(prog.warmup);
      if (prog.contraindications) setContraindications(prog.contraindications);
    }
    setSaveSuccess(false);
  }, [selectedStudentId, activeStudents]);

  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    const updatedDays = {};
    for (let i = 1; i <= newFreq; i++) {
      updatedDays[i] = daysWorkouts[i] || {
        title: `День ${i}: Тренировка ${i}`,
        exercises: [{ muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 3, reps: 10, weight: 40 }]
      };
    }
    setDaysWorkouts(updatedDays);
    if (activeDay > newFreq) setActiveDay(1);
  };

  const handleAddExerciseToCurrentDay = () => {
    const currentExercises = daysWorkouts[activeDay]?.exercises || [];
    setDaysWorkouts({
      ...daysWorkouts,
      [activeDay]: {
        ...daysWorkouts[activeDay],
        exercises: [...currentExercises, { muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 3, reps: 10, weight: 40 }]
      }
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const currentExercises = [...daysWorkouts[activeDay].exercises];
    currentExercises[index][field] = value;
    
    if (field === 'muscleGroup') {
      currentExercises[index]['name'] = exerciseDatabase[value]?.[0] || '';
    }

    setDaysWorkouts({
      ...daysWorkouts,
      [activeDay]: {
        ...daysWorkouts[activeDay],
        exercises: currentExercises
      }
    });
  };

  const handleRemoveExercise = (index) => {
    const currentExercises = daysWorkouts[activeDay].exercises.filter((_, i) => i !== index);
    setDaysWorkouts({
      ...daysWorkouts,
      [activeDay]: {
        ...daysWorkouts[activeDay],
        exercises: currentExercises
      }
    });
  };

  const applyPresetTemplate = (presetKey) => {
    if (presetKey === 'fullbody3') {
      setFrequency(3);
      setWorkoutType('fullbody');
      setDaysWorkouts({
        1: { title: 'День 1: Full Body (Сила A)', exercises: [
          { muscleGroup: 'Ноги', name: 'Приседания со штангой', sets: 4, reps: 8, weight: 60 },
          { muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 4, reps: 8, weight: 60 },
          { muscleGroup: 'Спина', name: 'Тяга верхнего блока', sets: 4, reps: 10, weight: 50 }
        ]},
        2: { title: 'День 2: Full Body (Гипертрофия B)', exercises: [
          { muscleGroup: 'Ноги', name: 'Жим ногами в платформе', sets: 4, reps: 12, weight: 100 },
          { muscleGroup: 'Плечи', name: 'Жим штанги стоя (Армейский)', sets: 4, reps: 10, weight: 35 },
          { muscleGroup: 'Спина', name: 'Горизонтальная тяга', sets: 3, reps: 12, weight: 45 }
        ]},
        3: { title: 'День 3: Full Body (Объем C)', exercises: [
          { muscleGroup: 'Ноги', name: 'Румынская тяга', sets: 4, reps: 10, weight: 55 },
          { muscleGroup: 'Грудь', name: 'Жим гантелей на наклонной', sets: 3, reps: 12, weight: 22 },
          { muscleGroup: 'Руки', name: 'Подъем штанги на бицепс', sets: 3, reps: 12, weight: 25 }
        ]}
      });
    } else if (presetKey === 'split_upper_lower') {
      setFrequency(4);
      setWorkoutType('split');
      setDaysWorkouts({
        1: { title: 'День 1: Верх (Тяжелый)', exercises: [{ muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 4, reps: 8, weight: 70 }] },
        2: { title: 'День 2: Низ (Тяжелый)', exercises: [{ muscleGroup: 'Ноги', name: 'Приседания со штангой', sets: 4, reps: 8, weight: 70 }] },
        3: { title: 'День 3: Верх (Многоповторный)', exercises: [{ muscleGroup: 'Спина', name: 'Тяга верхнего блока', sets: 4, reps: 12, weight: 50 }] },
        4: { title: 'День 4: Низ (Многоповторный)', exercises: [{ muscleGroup: 'Ноги', name: 'Болгарские выпады', sets: 3, reps: 12, weight: 14 }] }
      });
    }
  };

  const handleSaveProgram = async () => {
    if (!selectedStudentId) {
      alert('Выберите ученика!');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const programPayload = {
        days: daysWorkouts,
        frequency,
        workoutType,
        warmup,
        contraindications,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ assigned_program: programPayload })
        .eq('id', selectedStudentId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка сохранения программы: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = activeStudents.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-3 select-none pb-20 text-xs">
      
      {/* 1. Карточка выбора подопечного и готовых схем */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 leading-tight">Программа тренировок</h3>
              <p className="text-[10px] text-slate-400">Назначение плана подопечному</p>
            </div>
          </div>

          {currentStudent && (
            <button
              type="button"
              onClick={() => setSelectedStudentForModal(currentStudent)}
              className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Вся анкета</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Выбор подопечного с кастомной стрелочкой */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Подопечный атлет *
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all truncate"
            >
              {activeStudents.length > 0 ? (
                activeStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name || ''} ({s.goal || 'Тонус'}) • {s.gym ? s.gym.split('|')[0] : 'Зал'}
                  </option>
                ))
              ) : (
                <option value="">Нет активных учеников</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Готовые схемы сплитов */}
        <div className="pt-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Готовые схемы сплитов:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => applyPresetTemplate('fullbody3')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left text-[10.5px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-amber-500">⚡</span>
              <span className="truncate">Full Body (3 дня)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetTemplate('split_upper_lower')}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left text-[10.5px] font-bold text-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-amber-500">⚡</span>
              <span className="truncate">Сплит Верх / Низ (4 дня)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Параметры сплита, разминка и ограничения */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-xs space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Формат тренировок
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setWorkoutType('fullbody')}
                className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                  workoutType === 'fullbody' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Full Body
              </button>
              <button
                type="button"
                onClick={() => setWorkoutType('split')}
                className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                  workoutType === 'split' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Split
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Дней в неделю
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleFrequencyChange(num)}
                  className={`py-1 rounded-xl font-bold border transition-all text-center text-[11px] ${
                    frequency === num 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Разминка и ограничения — аккуратная вертикальная или компактная сетка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Разминка
            </label>
            <input 
              type="text"
              value={warmup}
              onChange={(e) => setWarmup(e.target.value)}
              placeholder="Суставная разминка 10 мин"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ограничения (PAR-Q)
            </label>
            <input 
              type="text"
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
              placeholder="Без осевой нагрузки"
              className="w-full px-2.5 py-1.5 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs font-bold text-rose-800 outline-none focus:border-rose-400 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Упражнения по тренировочным дням */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-900">Упражнения и нагрузки</span>
          
          <button 
            type="button"
            onClick={handleAddExerciseToCurrentDay}
            className="text-[11px] text-blue-600 font-bold flex items-center gap-1 active:scale-95 cursor-pointer hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Добавить</span>
          </button>
        </div>

        {/* Переключатель активного дня */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {Array.from({ length: frequency }, (_, i) => i + 1).map((dayNum) => (
            <button
              key={dayNum}
              type="button"
              onClick={() => setActiveDay(dayNum)}
              className={`py-1 px-3 rounded-xl font-bold transition-all text-[11px] shrink-0 cursor-pointer ${
                activeDay === dayNum 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              День {dayNum}
            </button>
          ))}
        </div>

        {/* Название тренировочного дня */}
        <input 
          type="text"
          value={daysWorkouts[activeDay]?.title || ''}
          onChange={(e) => {
            const updated = { ...daysWorkouts };
            updated[activeDay].title = e.target.value;
            setDaysWorkouts(updated);
          }}
          placeholder={`Название Дня ${activeDay}`}
          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
        />

        {/* Список упражнений текущего дня */}
        <div className="space-y-2 pt-0.5">
          {(daysWorkouts[activeDay]?.exercises || []).map((ex, index) => {
            const currentMuscle = ex.muscleGroup || 'Грудь';
            const availableExercises = exerciseDatabase[currentMuscle] || [];

            return (
              <div key={index} className="p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5 flex-1 min-w-0">
                    <div className="relative">
                      <select
                        value={currentMuscle}
                        onChange={(e) => handleExerciseChange(index, 'muscleGroup', e.target.value)}
                        className="w-full appearance-none pl-2 pr-6 py-1 bg-white border border-slate-200/90 rounded-lg text-[11px] font-bold text-blue-700 outline-none truncate"
                      >
                        {Object.keys(exerciseDatabase).map((mg, i) => (
                          <option key={i} value={mg}>{mg}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        className="w-full appearance-none pl-2 pr-6 py-1 bg-white border border-slate-200/90 rounded-lg text-[11px] font-bold text-slate-900 outline-none truncate"
                      >
                        {availableExercises.map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {daysWorkouts[activeDay].exercises.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors shrink-0 active:scale-90"
                      title="Удалить упражнение"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 3 ячейки: Подходы / Повторы / Вес */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Подходы</span>
                    <input 
                      type="number"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))}
                      className="w-full text-center text-xs font-bold font-mono text-slate-900 bg-transparent outline-none"
                    />
                  </div>

                  <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Повторы</span>
                    <input 
                      type="number"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', Number(e.target.value))}
                      className="w-full text-center text-xs font-bold font-mono text-slate-900 bg-transparent outline-none"
                    />
                  </div>

                  <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Вес (кг)</span>
                    <input 
                      type="number"
                      value={ex.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', Number(e.target.value))}
                      className="w-full text-center text-xs font-bold font-mono text-blue-600 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Кнопка сохранения */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {saveSuccess ? (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>План назначен!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">Синхронизируется с учеником</span>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveProgram}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? '...' : 'Сохранить программу'}</span>
          </button>
        </div>
      </div>

      {/* Полноэкранный профиль ученика */}
      <StudentDetailModal 
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        student={selectedStudentForModal}
        onUpdate={onUpdate}
      />

    </div>
  );
}
