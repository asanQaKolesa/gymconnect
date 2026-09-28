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
  X, 
  Check, 
  ArrowLeft 
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

  // Стейты полноэкранного поиска и шаблонов
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('Все группы');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isTitlePresetsOpen, setIsTitlePresetsOpen] = useState(false);

  // Пользовательские авторские упражнения тренера
  const [customExercises, setCustomExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_custom_exercises');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Программа подопечного по дням
  const [programDays, setProgramDays] = useState({
    1: {
      title: 'День 1: Full Body (Сила А)',
      exercises: [
        { name: 'Приседания со штангой на плечах (классические)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'Контроль коленей' },
        { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 60, notes: 'Пауза внизу 1 сек' },
        { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Сведение лопаток' }
      ]
    },
    2: {
      title: 'День 2: Full Body (Гипертрофия Б)',
      exercises: [
        { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 60, notes: 'Спина прямая' },
        { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 22, notes: 'Угол 30°' },
        { name: 'Подтягивания на перекладине широким хватом к груди', muscleGroup: 'Спина', isBodyweight: true, sets: 3, reps: 8, weight: 0, notes: 'Свой вес' }
      ]
    },
    3: {
      title: 'День 3: Плечи и Руки',
      exercises: [
        { name: 'Армейский жим штанги стоя над головой (базовый)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 8, weight: 35, notes: 'Без прогиба поясницы' },
        { name: 'Подъем штанги на бицепс стоя (прямой / EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 25, notes: 'Чистая техника' },
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

  // Применение готовой схемы сплита
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
      sets: 3,
      reps: 10,
      weight: ex.isBodyweight ? 0 : 40,
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
      isBodyweight: false
    };

    // Сохраняем в локальную базу тренера
    const updatedCustomList = [...customExercises, newCustom];
    setCustomExercises(updatedCustomList);
    try {
      localStorage.setItem('gymconnect_coach_custom_exercises', JSON.stringify(updatedCustomList));
    } catch (e) {
      console.warn(e);
    }

    // Добавляем в текущий день программы
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
      alert('Ошибка при сохранении программы: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDayData = programDays[selectedDay] || { title: `День ${selectedDay}`, exercises: [] };

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-8">
      
      {/* 1. АРХИТЕКТУРА СПЛИТА И КОЛИЧЕСТВО ДНЕЙ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Архитектура сплита</h3>
              <p className="text-[10px] text-slate-400">Схемы и частота тренировок</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Готовые сплиты</span>
          </button>
        </div>

        {/* Степпер количества дней в неделю */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="font-semibold text-slate-800 text-xs">Дней тренировок:</span>
          
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

      {/* 2. ВЫБОР ДНЯ И КРУПНЫЕ ПРЕСЕТЫ НАЗВАНИЙ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Горизонтальный переключатель дней */}
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

        {/* Название текущего дня с кнопкой выпадающих пресетов */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Название Дня {selectedDay}:
            </label>

            <button
              type="button"
              onClick={() => setIsTitlePresetsOpen(true)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <span>Популярные названия ▾</span>
            </button>
          </div>

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
        </div>
      </div>

      {/* 3. СПИСОК УПРАЖНЕНИЙ СО СТЕППЕРАМИ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900">Упражнения Дня {selectedDay}</h4>
            <p className="text-[10px] text-slate-400">Назначено: {currentDayData.exercises?.length || 0}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer"
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
                
                {/* Шапка упражнения: только чистая группа мышц и чистое название */}
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

                {/* 3 КОЛОНКИ СО СТЕППЕРАМИ */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  {/* Подходы */}
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

                  {/* Повторения */}
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

                  {/* Вес */}
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

                {/* Поле заметки */}
                <input
                  type="text"
                  value={ex.notes || ''}
                  onChange={e => handleUpdateExercise(exIdx, 'notes', e.target.value)}
                  placeholder="Заметка к упражнению (пауза 1 сек, дропсет...)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 placeholder:text-slate-400"
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <Dumbbell className="w-6 h-6 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">В Дне {selectedDay} пока нет упражнений.</p>
              <p className="text-[10.5px]">Нажмите «Добавить упражнение», чтобы выбрать из базы или создать авторское.</p>
            </div>
          )}
        </div>

        {/* Кнопка сохранения в Supabase */}
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

      {/* ================= 4. ПОЛНОЭКРАННЫЙ ПОИСК И ДОБАВЛЕНИЕ УПРАЖНЕНИЙ ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[120] bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          
          {/* Верхняя навигация поиска */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад к программе</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Каталог упражнений</h2>
            <div className="w-16" />
          </div>

          <div className="p-4 space-y-3.5 max-w-md mx-auto w-full pb-20">
            {/* Поисковая строка */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск (жим, присед, турник, планка...)"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            {/* Фильтр по группам мышц */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(muscle)}
                  className={`py-1.5 px-3 rounded-xl text-[10.5px] font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedMuscleFilter === muscle
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-2xl text-left flex items-center justify-between text-xs text-blue-900 active:scale-98 transition-all cursor-pointer shadow-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1 text-blue-700">
                    <Plus className="w-3.5 h-3.5" /> Добавить своё упражнение:
                  </span>
                  <p className="text-[11px] text-blue-950 font-medium italic">«{searchQuery.trim()}»</p>
                </div>
                <span className="text-[10px] bg-blue-600 text-white px-2.5 py-1 rounded-xl font-bold shrink-0">
                  Добавить
                </span>
              </button>
            )}

            {/* Список упражнений: ЧИСТЫЙ ВИЗУАЛ БЕЗ КИЛОГРАММОВ И СНАРЯДОВ */}
            <div className="space-y-2">
              {filteredCatalog.length > 0 ? (
                filteredCatalog.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleSelectExerciseFromDb(ex)}
                    className="p-3 bg-white hover:bg-blue-50/60 rounded-2xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition-all shadow-2xs active:scale-[0.99]"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block font-sans">
                        {ex.muscle}
                      </span>
                      <p className="font-bold text-xs text-slate-900 leading-snug">{ex.name}</p>
                    </div>

                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 shrink-0 ml-2">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200/80">
                  Упражнение не найдено в каталоге. Нажмите кнопку выше, чтобы добавить своё авторское!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. ПОЛНОЭКРАННЫЙ ВЫБОР ГОТОВОГО СПЛИТА ================= */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-[120] bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(false)}
              className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
            <h2 className="text-xs font-bold text-slate-900">Готовые схемы сплитов</h2>
            <div className="w-16" />
          </div>

          <div className="p-4 space-y-3 max-w-md mx-auto w-full pb-20">
            <p className="text-[11px] text-slate-500 leading-snug px-1">
              Выберите проверенную архитектуру тренировок. После применения вы сможете изменить любые упражнения, веса и подходы:
            </p>

            <div className="space-y-2.5">
              {SPLIT_ARCHITECTURES.map(arch => (
                <div
                  key={arch.id}
                  onClick={() => handleApplySplitArchitecture(arch)}
                  className="p-4 bg-white hover:bg-blue-50/70 border border-slate-200 rounded-3xl cursor-pointer transition-all space-y-1.5 shadow-2xs active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">{arch.name}</h5>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-lg font-mono">
                      {arch.daysCount} дня
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{arch.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. МОДАЛКА ВЫБОРА НАЗВАНИЙ ДНЯ ================= */}
      {isTitlePresetsOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">Популярные названия Дня {selectedDay}</h3>
              <button
                type="button"
                onClick={() => setIsTitlePresetsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {POPULAR_DAY_TITLES.map((titlePreset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProgramDays(prev => ({
                      ...prev,
                      [selectedDay]: { ...prev[selectedDay], title: `День ${selectedDay}: ${titlePreset}` }
                    }));
                    setIsTitlePresetsOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl text-xs hover:bg-blue-50 text-left cursor-pointer font-semibold text-slate-800 transition-colors border border-slate-100 bg-slate-50"
                >
                  День {selectedDay}: {titlePreset}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsTitlePresetsOpen(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer active:scale-98"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
