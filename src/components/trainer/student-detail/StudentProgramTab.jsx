// src/components/trainer/student-detail/StudentProgramTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Minus, 
  Search, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ChevronDown, 
  X, 
  Check, 
  Clock, 
  HelpCircle 
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { 
  MUSCLE_GROUPS, 
  EXERCISES_DATABASE, 
  SPLIT_ARCHITECTURES, 
  POPULAR_DAY_TITLES 
} from './exercisesData';

export default function StudentProgramTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayCount, setDayCount] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Стейты поиска и добавления упражнений
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('Все группы');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isTitlePresetsOpen, setIsTitlePresetsOpen] = useState(false);

  // Пользовательские авторские упражнения тренера (из localStorage)
  const [customExercises, setCustomExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_custom_exercises');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Основная программа тренировок подопечного по дням
  const [programDays, setProgramDays] = useState({
    1: {
      title: 'День 1: Full Body (Сила А)',
      exercises: [
        { name: 'Приседания со штангой на плечах (классика)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'Контроль коленей' },
        { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 60, notes: 'Пауза внизу 1 сек' },
        { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Лопатки вместе' }
      ]
    },
    2: {
      title: 'День 2: Full Body (Гипертрофия Б)',
      exercises: [
        { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 60, notes: 'Спина прямая' },
        { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 22, notes: 'Угол 30°' },
        { name: 'Подтягивания на перекладине широким хватом', muscleGroup: 'Спина', isBodyweight: true, sets: 3, reps: 8, weight: 0, notes: 'Свой вес' }
      ]
    },
    3: {
      title: 'День 3: Плечи и Руки',
      exercises: [
        { name: 'Армейский жим штанги стоя над головой', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 8, weight: 35, notes: 'Без прогиба поясницы' },
        { name: 'Подъем штанги на бицепс стоя (прямой/EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 25, notes: 'Чистая техника' },
        { name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 12, weight: 25, notes: 'Внизу пауза' }
      ]
    }
  });

  // Синхронизация сохраненной программы из карточки атлета
  useEffect(() => {
    if (student?.assigned_program && typeof student.assigned_program === 'object') {
      const savedProg = student.assigned_program;
      if (savedProg.days) {
        setProgramDays(savedProg.days);
        const count = Object.keys(savedProg.days).length;
        if (count > 0) setDayCount(count);
      }
    }
  }, [student]);

  if (!student) return null;

  // Изменение количества дней программы (от 1 до 7)
  const handleChangeDayCount = (newCount) => {
    setDayCount(newCount);
    setProgramDays(prev => {
      const updated = { ...prev };
      for (let i = 1; i <= newCount; i++) {
        if (!updated[i]) {
          updated[i] = {
            title: `День ${i}: Тренировочный день`,
            exercises: []
          };
        }
      }
      return updated;
    });
    if (selectedDay > newCount) setSelectedDay(1);
  };

  // Применение готовой архитектуры сплита
  const handleApplySplitArchitecture = (arch) => {
    setDayCount(arch.daysCount);
    setProgramDays(arch.days);
    setSelectedDay(1);
    setIsPresetModalOpen(false);
  };

  // Редактирование упражнения в текущем дне
  const handleUpdateExercise = (index, field, value) => {
    setProgramDays(prev => {
      const dayData = prev[selectedDay] || { title: `День ${selectedDay}`, exercises: [] };
      const updatedExercises = [...dayData.exercises];
      updatedExercises[index] = { ...updatedExercises[index], [field]: value };
      return {
        ...prev,
        [selectedDay]: { ...dayData, exercises: updatedExercises }
      };
    });
  };

  // Удаление упражнения
  const handleRemoveExercise = (index) => {
    setProgramDays(prev => {
      const dayData = prev[selectedDay];
      if (!dayData) return prev;
      const updatedExercises = dayData.exercises.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedDay]: { ...dayData, exercises: updatedExercises }
      };
    });
  };

  // Добавление упражнения из каталога
  const handleSelectExerciseFromDb = (ex) => {
    const newEx = {
      name: ex.name,
      muscleGroup: ex.muscle,
      isBodyweight: Boolean(ex.isBodyweight),
      sets: ex.defaultSets || 3,
      reps: ex.defaultReps || 10,
      weight: ex.isBodyweight ? 0 : (ex.defaultWeight || 40),
      notes: ''
    };

    setProgramDays(prev => {
      const dayData = prev[selectedDay] || { title: `День ${selectedDay}`, exercises: [] };
      return {
        ...prev,
        [selectedDay]: {
          ...dayData,
          exercises: [...dayData.exercises, newEx]
        }
      };
    });

    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Добавление авторского упражнения тренера
  const handleAddCustomExercise = (customName) => {
    if (!customName.trim()) return;
    const cleanName = customName.trim();

    const newCustom = {
      id: `custom_${Date.now()}`,
      name: cleanName,
      muscle: selectedMuscleFilter === 'Все группы' ? 'Грудь' : selectedMuscleFilter,
      isBodyweight: false,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 30
    };

    // Сохраняем в локальную базу тренера
    const updatedCustomList = [...customExercises, newCustom];
    setCustomExercises(updatedCustomList);
    try {
      localStorage.setItem('gymconnect_coach_custom_exercises', JSON.stringify(updatedCustomList));
    } catch (e) {
      console.warn(e);
    }

    // Сразу добавляем в программу дня
    handleSelectExerciseFromDb(newCustom);
  };

  // Фильтрация каталога упражнений
  const allAvailableExercises = [...EXERCISES_DATABASE, ...customExercises];
  const filteredCatalog = allAvailableExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'Все группы' || ex.muscle === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const exactMatchExists = allAvailableExercises.some(
    ex => ex.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  // Сохранение всей программы в Supabase
  const handleSaveProgramToSupabase = async () => {
    if (!student.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        assigned_program: {
          days: programDays,
          dayCount: dayCount,
          updated_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', student.id);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка сохранения программы: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDayData = programDays[selectedDay] || { title: `День ${selectedDay}`, exercises: [] };

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-8">
      
      {/* 1. ВЫБОР АРХИТЕКТУРЫ СПЛИТА И КОЛИЧЕСТВА ДНЕЙ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Архитектура программы</h3>
              <p className="text-[10px] text-slate-400">Сплиты и количество тренировочных дней</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10.5px] font-bold border border-blue-200 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Готовые сплиты</span>
          </button>
        </div>

        {/* Степпер количества дней в неделю */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="font-semibold text-slate-800 text-xs">Тренировок в неделю:</span>
          
          <div className="flex items-center gap-1">
            {[2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleChangeDayCount(num)}
                className={`w-8 h-8 rounded-xl font-bold font-mono text-xs border transition-all cursor-pointer ${
                  dayCount === num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ПЕРЕКЛЮЧАТЕЛЬ ДНЕЙ И РЕДАКТИРОВАНИЕ НАЗВАНИЯ ДНЯ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Горизонтальный выбор тренировочного дня */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {Array.from({ length: dayCount }, (_, i) => i + 1).map(dayNum => (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedDay(dayNum)}
              className={`py-2 px-3.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                selectedDay === dayNum
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              День {dayNum}
            </button>
          ))}
        </div>

        {/* Название выбранного дня с выпадающими пресетами */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Название Дня {selectedDay}:
            </label>

            <button
              type="button"
              onClick={() => setIsTitlePresetsOpen(!isTitlePresetsOpen)}
              className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Популярные названия ▾
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={currentDayData.title}
              onChange={e => {
                const val = e.target.value;
                setProgramDays(prev => ({
                  ...prev,
                  [selectedDay]: { ...prev[selectedDay], title: val }
                }));
              }}
              placeholder={`Например: День ${selectedDay}: Спина + Бицепс`}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            />

            {/* Выпадающий список популярных названий дня */}
            {isTitlePresetsOpen && (
              <div className="absolute top-12 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-48 overflow-y-auto space-y-1">
                {POPULAR_DAY_TITLES.map((titlePreset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setProgramDays(prev => ({
                        ...prev,
                        [selectedDay]: { ...prev[selectedDay], title: `День ${selectedDay}: ${titlePreset}` }
                      }));
                      setIsTitlePresetsOpen(false);
                    }}
                    className="p-2 rounded-xl text-xs hover:bg-blue-50 cursor-pointer font-medium text-slate-800 transition-colors"
                  >
                    День {selectedDay}: {titlePreset}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. КАРТОЧКИ УПРАЖНЕНИЙ ТЕКУЩЕГО ДНЯ СО СТЕППЕРАМИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Список упражнений Дня {selectedDay}</h4>
            <p className="text-[10px] text-slate-400">Упражнений: {currentDayData.exercises?.length || 0}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить упражнение</span>
          </button>
        </div>

        {/* Список упражнений дня */}
        <div className="space-y-3">
          {currentDayData.exercises && currentDayData.exercises.length > 0 ? (
            currentDayData.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                
                {/* Шапка упражнения */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block font-sans">
                      {ex.muscleGroup || 'Базовое'}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 leading-snug">
                      {exIdx + 1}. {ex.name}
                    </h5>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    title="Удалить упражнение"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Тумблер: Свой вес ↔ С отягощением */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateExercise(exIdx, 'isBodyweight', true);
                      handleUpdateExercise(exIdx, 'weight', 0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      ex.isBodyweight
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Свой вес (турник/планка)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateExercise(exIdx, 'isBodyweight', false);
                      if (ex.weight === 0) handleUpdateExercise(exIdx, 'weight', 40);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      !ex.isBodyweight
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    С отягощением (кг)
                  </button>
                </div>

                {/* 3 ЧЕТКИЕ КОЛОНКИ СО СТЕППЕРАМИ */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  {/* Колонка 1: Подходы */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      Подходы
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateExercise(exIdx, 'sets', Math.max(1, Number(ex.sets || 3) - 1))}
                        className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {ex.sets || 3}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateExercise(exIdx, 'sets', Number(ex.sets || 3) + 1)}
                        className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Колонка 2: Повторения */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      Повторения
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateExercise(exIdx, 'reps', Math.max(1, Number(ex.reps || 10) - 1))}
                        className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {ex.reps || 10}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateExercise(exIdx, 'reps', Number(ex.reps || 10) + 1)}
                        className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Колонка 3: Вес */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                      {ex.isBodyweight ? 'Доп. вес' : 'Вес (кг)'}
                    </span>

                    {ex.isBodyweight ? (
                      <div className="flex items-center justify-between mt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateExercise(exIdx, 'weight', Math.max(0, Number(ex.weight || 0) - 2.5))}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-[11px] text-blue-600 font-mono">
                          {ex.weight > 0 ? `+${ex.weight}кг` : 'Свой'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateExercise(exIdx, 'weight', Number(ex.weight || 0) + 2.5)}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateExercise(exIdx, 'weight', Math.max(0, Number(ex.weight || 0) - 2.5))}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs text-blue-600 font-mono">
                          {ex.weight || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateExercise(exIdx, 'weight', Number(ex.weight || 0) + 2.5)}
                          className="w-6 h-6 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Поле заметки к упражнению */}
                <input
                  type="text"
                  value={ex.notes || ''}
                  onChange={e => handleUpdateExercise(exIdx, 'notes', e.target.value)}
                  placeholder="Заметка к технике (пауза 1 сек, отдых 90 сек...)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 placeholder:text-slate-400"
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <Dumbbell className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">В Дне {selectedDay} пока нет упражнений.</p>
              <p className="text-[10.5px]">Нажмите «Добавить упражнение», чтобы выбрать из базы или создать своё.</p>
            </div>
          )}
        </div>

        {/* Кнопка сохранения в базу данных Supabase */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {saveSuccess ? (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Программа сохранена в базе атлета!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">Атлет сразу увидит программу в своём приложении</span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveProgramToSupabase}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить программу'}</span>
          </button>
        </div>
      </div>

      {/* ================= 4. ВСПЛЫВАЮЩИЙ ПОИСК И ДОБАВЛЕНИЕ УПРАЖНЕНИЙ ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">База упражнений в День {selectedDay}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Поисковая строка */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск (жим, присед, турник...)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Фильтр по группам мышц */}
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(muscle)}
                  className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedMuscleFilter === muscle
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>

            {/* КНОПКА ДОБАВЛЕНИЯ СВОЕГО АВТОРСКОГО УПРАЖНЕНИЯ */}
            {searchQuery.trim().length > 0 && !exactMatchExists && (
              <button
                type="button"
                onClick={() => handleAddCustomExercise(searchQuery)}
                className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded-2xl text-left flex items-center justify-between text-xs text-blue-900 active:scale-98 transition-all cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-blue-600" /> Добавить своё упражнение:
                  </span>
                  <p className="text-[11px] text-blue-800 font-medium italic">«{searchQuery.trim()}»</p>
                </div>
                <span className="text-[9.5px] bg-blue-600 text-white px-2 py-1 rounded-lg font-bold shrink-0">
                  Создать
                </span>
              </button>
            )}

            {/* Список упражнений из каталога */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleSelectExerciseFromDb(ex)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{ex.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {ex.muscle} • {ex.equipment} • {ex.isBodyweight ? 'Свой вес' : `${ex.defaultWeight} кг`}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-400 text-xs">
                  Упражнение не найдено. Нажмите кнопку выше, чтобы добавить своё авторское!
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer active:scale-98 transition-all"
            >
              Закрыть каталог
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. МОДАЛКА ВЫБОРА ГОТОВОГО СПЛИТА ================= */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Готовые схемы сплитов</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Выберите проверенную тренировочную схему. Вы сможете отредактировать любые упражнения и веса после применения:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {SPLIT_ARCHITECTURES.map(arch => (
                <div
                  key={arch.id}
                  onClick={() => handleApplySplitArchitecture(arch)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-2xl cursor-pointer transition-all space-y-1 active:scale-98"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">{arch.name}</h5>
                    <span className="text-[9.5px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md font-mono">
                      {arch.daysCount} дня
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-snug">{arch.desc}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPresetModalOpen(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer active:scale-98"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
