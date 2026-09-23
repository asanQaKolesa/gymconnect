// src/components/trainer/tabs/WorkoutsTab.jsx
import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, CheckCircle2, Activity, Flame, Layers } from 'lucide-react';

export default function WorkoutsTab({ students }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  
  // Параметры программы
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState('fullbody'); // 'fullbody' | 'split'
  const [experienceLevel, setExperienceLevel] = useState('beginner'); // 'beginner' | 'intermediate' | 'advanced'
  const [frequency, setFrequency] = useState(3); // 2, 3, 4 раза в неделю

  // Кардио, разминка и ограничения
  const [warmup, setWarmup] = useState('Суставная разминка 10 мин');
  const [cardioBefore, setCardioBefore] = useState('Эллипс 5-7 мин');
  const [cardioAfter, setCardioAfter] = useState('Беговая дорожка (заминка) 10 мин');
  const [contraindications, setContraindications] = useState('Без осевой нагрузки на поясницу');

  // Упражнения
  const [exercises, setExercises] = useState([
    { muscleGroup: 'Грудь', name: 'Жим лежа', sets: '4', reps: '8-10', weight: '70 кг' }
  ]);

  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const muscleGroupsList = ['Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс / Кор'];

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { muscleGroup: 'Грудь', name: '', sets: '3', reps: '10', weight: '0 кг' }]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    if (!workoutTitle) {
      alert('Укажите название тренировочной программы');
      return;
    }

    const newProgram = {
      id: Date.now(),
      studentId: selectedStudentId,
      title: workoutTitle,
      workoutType,
      experienceLevel,
      frequency,
      warmup,
      cardioBefore,
      cardioAfter,
      contraindications,
      exercisesList: exercises,
      date: new Date().toLocaleDateString()
    };

    setSavedWorkouts([newProgram, ...savedWorkouts]);
    setWorkoutTitle('');
    setExercises([{ muscleGroup: 'Грудь', name: '', sets: '3', reps: '10', weight: '0 кг' }]);
    alert('Программа тренировок успешно сохранена и назначена ученику!');
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* РАЗДЕЛ 1: Параметры и выбор ученика */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Dumbbell className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Шаг 1: Параметры программы и ученик</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Выберите ученика *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              {students.length > 0 ? (
                students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.goal})</option>
                ))
              ) : (
                <option value="">Нет учеников в базе</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Название тренировки *</label>
            <input 
              type="text"
              required
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              placeholder="Например: День 1: Верх тела"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Тип тренировки */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Тип нагрузки</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setWorkoutType('fullbody')}
                className={`py-2 px-2 rounded-xl font-semibold border transition-all text-center ${
                  workoutType === 'fullbody' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Full Body
              </button>
              <button
                type="button"
                onClick={() => setWorkoutType('split')}
                className={`py-2 px-2 rounded-xl font-semibold border transition-all text-center ${
                  workoutType === 'split' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Split
              </button>
            </div>
          </div>

          {/* Уровень подготовки */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Уровень подготовки</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option value="beginner">Новичок (первые шаги)</option>
              <option value="intermediate">Базовый (занимается от 6 мес)</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>

          {/* Частота в неделю */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Дней в неделю</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFrequency(num)}
                  className={`py-2 rounded-xl font-semibold border transition-all text-center ${
                    frequency === num ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {num} дн.
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* РАЗДЕЛ 2: Разминка, кардио и противопоказания */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Шаг 2: Разминка, Кардио и Ограничения</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Разминка</label>
            <input 
              type="text"
              value={warmup}
              onChange={(e) => setWarmup(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Противопоказания / Травмы</label>
            <input 
              type="text"
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-rose-600 font-medium"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Кардио ДО тренировки</label>
            <input 
              type="text"
              value={cardioBefore}
              onChange={(e) => setCardioBefore(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Кардио ПОСЛЕ (Заминка)</label>
            <input 
              type="text"
              value={cardioAfter}
              onChange={(e) => setCardioAfter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* РАЗДЕЛ 3: Список упражнений по группам мышц */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900">Шаг 3: Упражнения и подходы</h3>
          </div>
          <button 
            type="button"
            onClick={handleAddExerciseRow}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить упражнение
          </button>
        </div>

        <div className="space-y-2">
          {exercises.map((ex, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              {/* Выбор группы мышц */}
              <div className="md:col-span-3">
                <select
                  value={ex.muscleGroup}
                  onChange={(e) => handleExerciseChange(index, 'muscleGroup', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-blue-600"
                >
                  {muscleGroupsList.map((mg, i) => (
                    <option key={i} value={mg}>{mg}</option>
                  ))}
                </select>
              </div>

              {/* Название упражнения */}
              <div className="md:col-span-4">
                <input 
                  type="text"
                  placeholder="Название упражнения"
                  value={ex.name}
                  onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              {/* Подходы */}
              <div className="md:col-span-2">
                <input 
                  type="text"
                  placeholder="Подходы"
                  value={ex.sets}
                  onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                />
              </div>

              {/* Повторения */}
              <div className="md:col-span-2">
                <input 
                  type="text"
                  placeholder="Повторения"
                  value={ex.reps}
                  onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                />
              </div>

              {/* Удалить */}
              <div className="md:col-span-1 text-right">
                {exercises.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                    title="Удалить строку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSaveProgram}
          className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
        >
          <CheckCircle2 className="w-4 h-4" /> Сохранить и выдать программу ученику
        </button>
      </div>

      {/* История назначенных программ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-3">История назначенных программ</h3>
        <div className="space-y-2">
          {savedWorkouts.length > 0 ? (
            savedWorkouts.map(w => {
              const studentObj = students.find(s => s.id === w.studentId);
              return (
                <div key={w.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{w.title} ({w.workoutType === 'fullbody' ? 'Full Body' : 'Split'}, {w.frequency} дн/нед)</h4>
                    <p className="text-[10px] text-slate-500">Ученик: <span className="text-blue-600 font-medium">{studentObj ? `${studentObj.first_name} ${studentObj.last_name}` : 'Не найден'}</span> | Упражнений: {w.exercisesList.length}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-semibold">
                    Активна
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Вы еще не создали ни одной программы для учеников.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
