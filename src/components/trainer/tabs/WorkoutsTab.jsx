// src/components/trainer/tabs/WorkoutsTab.jsx
import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function WorkoutsTab({ students }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [exercises, setExercises] = useState([
    { name: 'Жим лежа', sets: '4', reps: '8-10', weight: '70 кг' }
  ]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: '3', reps: '10', weight: '0 кг' }]);
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
      exercisesList: exercises,
      date: new Date().toLocaleDateString()
    };

    setSavedWorkouts([newProgram, ...savedWorkouts]);
    setWorkoutTitle('');
    setExercises([{ name: '', sets: '3', reps: '10', weight: '0 кг' }]);
    alert('Программа тренировок успешно сохранена и назначена ученику!');
  };

  const targetStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-4">
      {/* Форма создания программы */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Dumbbell className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Конструктор тренировочных программ</h3>
        </div>

        <form onSubmit={handleSaveProgram} className="space-y-3 text-xs">
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
                placeholder="День 1: Грудь + Трицепс"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-slate-700">Список упражнений:</label>
              <button 
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить упражнение
              </button>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input 
                    type="text"
                    placeholder="Название упражнения"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    required
                  />
                  <input 
                    type="text"
                    placeholder="Подходы"
                    value={ex.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    className="w-16 p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                  />
                  <input 
                    type="text"
                    placeholder="Повторения"
                    value={ex.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                  />
                  <input 
                    type="text"
                    placeholder="Вес"
                    value={ex.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono"
                  />
                  {exercises.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all"
          >
            Сохранить и отправить программу
          </button>
        </form>
      </div>

      {/* Список назначенных программ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-3">История назначенных программ</h3>
        <div className="space-y-2">
          {savedWorkouts.length > 0 ? (
            savedWorkouts.map(w => {
              const studentObj = students.find(s => s.id === w.studentId);
              return (
                <div key={w.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{w.title}</h4>
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
