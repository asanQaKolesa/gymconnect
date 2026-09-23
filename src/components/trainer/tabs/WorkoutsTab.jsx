// src/components/trainer/tabs/WorkoutsTab.jsx
import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, CheckCircle2, Activity, Flame, Calendar } from 'lucide-react';

export default function WorkoutsTab({ students }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  
  // Параметры программы
  const [workoutType, setWorkoutType] = useState('fullbody'); // 'fullbody' | 'split'
  const [experienceLevel, setExperienceLevel] = useState('beginner_1'); // Расширенная градация
  const [frequency, setFrequency] = useState(3); // 2, 3, 4 или 5 дней

  // Кардио, разминка и ограничения
  const [warmup, setWarmup] = useState('Суставная разминка 10 мин');
  const [cardioBefore, setCardioBefore] = useState('Эллипс 5-7 мин');
  const [cardioAfter, setCardioAfter] = useState('Заминка / Дорожка 10 мин');
  const [contraindications, setContraindications] = useState('Без осевой нагрузки на поясницу');

  // База упражнений по группам мышц
  const exerciseDatabase = {
    'Грудь': ['Жим лежа со штангой', 'Жим гантелей на наклонной', 'Сведение рук в кроссовере', 'Отжимания на брусьях'],
    'Спина': ['Подтягивания на перекладине', 'Тяга верхнего блока', 'Тяга штанги в наклоне', 'Горизонтальная тяга'],
    'Ноги': ['Приседания со штангой', 'Жим ногами в платформе', 'Болгарские выпады', 'Сгибание ног лежа'],
    'Плечи': ['Жим штанги стоя (Армейский)', 'Махи гантелями в стороны', 'Протяжка к подбородку', 'Махи в наклоне'],
    'Руки': ['Подъем штанги на бицепс', 'Французский жим лежа', 'Сгибание рук с гантелями (молотки)', 'Разгибания на трицепс в блоке'],
    'Пресс / Кор': ['Скручивания на полу', 'Подъем ног в висе', 'Планка', 'Русские скручивания']
  };

  // Сегментация по дням: объект, где ключ — день (1, 2, 3...), а значение — массив упражнений
  const [daysWorkouts, setDaysWorkouts] = useState({
    1: { title: 'День 1: Верх тела / Грудь-Спина', exercises: [{ muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 4, reps: '8-10', weight: '60 кг' }] },
    2: { title: 'День 2: Низ тела / Ноги', exercises: [{ muscleGroup: 'Ноги', name: 'Приседания со штангой', sets: 4, reps: '10-12', weight: '50 кг' }] },
    3: { title: 'День 3: Плечи и Руки', exercises: [{ muscleGroup: 'Плечи', name: 'Жим штанги стоя (Армейский)', sets: 3, reps: '10-12', weight: '30 кг' }] }
  });

  const [activeDay, setActiveDay] = useState(1);

  // Обработка изменения количества дней
  const handleFrequencyChange = (newFreq) => {
    setFrequency(newFreq);
    const updatedDays = {};
    for (let i = 1; i <= newFreq; i++) {
      updatedDays[i] = daysWorkouts[i] || {
        title: `День ${i}: Тренировка ${i}`,
        exercises: [{ muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 3, reps: '10', weight: '0 кг' }]
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
        exercises: [...currentExercises, { muscleGroup: 'Грудь', name: 'Жим лежа со штангой', sets: 3, reps: '10', weight: '0 кг' }]
      }
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const currentExercises = [...daysWorkouts[activeDay].exercises];
    currentExercises[index][field] = value;
    
    // Если поменялась группа мышц, сбрасываем название упражнения на первое из списка
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

  const handleSaveProgram = () => {
    if (!selectedStudentId) {
      alert('Выберите ученика!');
      return;
    }
    alert(`Многодневная программа тренировок (${frequency} дня/нед) успешно сохранена и назначена ученику!`);
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* ШАГ 1: Параметры и ученик */}
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
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
            <label className="block font-medium text-slate-700 mb-1">Тип нагрузки</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWorkoutType('fullbody')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  workoutType === 'fullbody' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Full Body
              </button>
              <button
                type="button"
                onClick={() => setWorkoutType('split')}
                className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                  workoutType === 'split' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Split (Сплит)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Расширенная градация уровня подготовки */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Уровень подготовки</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              <option value="beginner_0">Абсолютный новичок (никогда не занимался)</option>
              <option value="beginner_1">Новичок (базовое понимание упражнений)</option>
              <option value="intermediate_low">Любитель (стаж от 3 до 6 месяцев)</option>
              <option value="intermediate_high">Уверенный любитель (стаж от 6 мес до 1.5 лет)</option>
              <option value="advanced">Продвинутый атлет (стаж от 1.5 - 3 лет)</option>
              <option value="pro">Профи / Опытный культурист</option>
            </select>
          </div>

          {/* Частота в неделю */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Дней тренировок в неделю</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleFrequencyChange(num)}
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

      {/* ШАГ 2: Разминка, кардио и ограничения */}
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

      {/* ШАГ 3: Сегментация по дням и упражнения с подходами и весом */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900">Шаг 3: Наполнение тренировок по дням</h3>
          </div>
        </div>

        {/* Переключатель дней недели */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: frequency }, (_, i) => i + 1).map((dayNum) => (
            <button
              key={dayNum}
              type="button"
              onClick={() => setActiveDay(dayNum)}
              className={`py-2 px-4 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                activeDay === dayNum ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> День {dayNum}
            </button>
          ))}
        </div>

        {/* Название текущего дня */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="block font-semibold text-slate-700">Название тренировки (День {activeDay})</label>
          <input 
            type="text"
            value={daysWorkouts[activeDay]?.title || ''}
            onChange={(e) => {
              const updated = { ...daysWorkouts };
              updated[activeDay].title = e.target.value;
              setDaysWorkouts(updated);
            }}
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
          />
        </div>

        {/* Список упражнений для выбранного дня */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Упражнения для Дня {activeDay}:</h4>
            <button 
              type="button"
              onClick={handleAddExerciseToCurrentDay}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить упражнение
            </button>
          </div>

          <div className="space-y-2">
            {(daysWorkouts[activeDay]?.exercises || []).map((ex, index) => {
              const currentMuscle = ex.muscleGroup || 'Грудь';
              const availableExercises = exerciseDatabase[currentMuscle] || [];

              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  
                  {/* Выбор группы мышц */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Группа мышц</label>
                    <select
                      value={currentMuscle}
                      onChange={(e) => handleExerciseChange(index, 'muscleGroup', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-blue-600"
                    >
                      {Object.keys(exerciseDatabase).map((mg, i) => (
                        <option key={i} value={mg}>{mg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Выбор упражнения из базы или свое */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Упражнение</label>
                    <select
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      {availableExercises.map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  {/* Подходы с кнопками плюс/минус */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Подходы</label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleExerciseChange(index, 'sets', Math.max(1, Number(ex.sets || 3) - 1))}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))}
                        className="w-full p-1.5 text-center text-xs font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleExerciseChange(index, 'sets', Number(ex.sets || 3) + 1)}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Повторения */}
                  <div className="md:col-span-1">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Повторы</label>
                    <input 
                      type="text"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      placeholder="10"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center"
                    />
                  </div>

                  {/* Вес в кг */}
                  <div className="md:col-span-1">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Вес (кг)</label>
                    <input 
                      type="text"
                      value={ex.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      placeholder="0 кг"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>

                  {/* Кнопка удаления упражнения */}
                  <div className="md:col-span-1 text-right pt-4">
                    {daysWorkouts[activeDay].exercises.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                        title="Удалить упражнение"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveProgram}
          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs"
        >
          <CheckCircle2 className="w-4 h-4" /> Сохранить многодневную программу и выдать ученику
        </button>
      </div>
    </div>
  );
}
