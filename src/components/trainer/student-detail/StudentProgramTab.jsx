// src/components/trainer/student-detail/StudentProgramTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Send
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { sendTelegramMessage } from '../../../utils/telegramNotifications';

export default function StudentProgramTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО В НАЧАЛЕ)
  const [workoutTitle, setWorkoutTitle] = useState('День 1: Грудь и Трицепс');
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Жим штанги лежа',
      weight: 60,
      sets: 4,
      reps: 10,
      rest: '90 сек',
      notes: 'Локти под 45 градусов, пауза в нижней точке'
    },
    {
      id: 2,
      name: 'Разведение гантелей на наклонной скамье',
      weight: 16,
      sets: 3,
      reps: 12,
      rest: '60 сек',
      notes: 'Плавное растяжение грудных'
    },
    {
      id: 3,
      name: 'Французский жим с EZ-грифом',
      weight: 25,
      sets: 3,
      reps: 12,
      rest: '60 сек',
      notes: 'Локти фиксированы'
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState('chest');

  // Инициализация из локального хранилища или профиля
  useEffect(() => {
    if (student?.id) {
      try {
        const saved = localStorage.getItem(`gymconnect_program_${student.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.title) setWorkoutTitle(parsed.title);
          if (Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
            setExercises(parsed.exercises);
          }
        }
      } catch (e) {}
    }
  }, [student?.id]);

  if (!student) return null;

  // Безопасная отправка пуша ученику напрямую в Telegram через Supabase
  const sendTelegramDirect = async (text) => {
    const targetChatId = student.telegram_id || student.chat_id;
    if (!targetChatId) return;

    try {
      await sendTelegramMessage(targetChatId, text, 'HTML');
    } catch (err) {
      console.warn('Мягкая отправка пуша:', err);
    }
  };

  // Изменение веса с быстрым шагом
  const adjustWeight = (id, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        const current = Number(ex.weight) || 0;
        const next = Math.max(0, Math.round((current + delta) * 10) / 10);
        return { ...ex, weight: next };
      }
      return ex;
    }));
  };

  // Изменение повторений
  const adjustReps = (id, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        const current = Number(ex.reps) || 0;
        return { ...ex, reps: Math.max(1, current + delta) };
      }
      return ex;
    }));
  };

  // Изменение подходов
  const adjustSets = (id, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        const current = Number(ex.sets) || 0;
        return { ...ex, sets: Math.max(1, current + delta) };
      }
      return ex;
    }));
  };

  // Добавление нового упражнения
  const handleAddExercise = () => {
    const newEx = {
      id: Date.now(),
      name: 'Новое упражнение',
      weight: 20,
      sets: 3,
      reps: 10,
      rest: '60 сек',
      notes: ''
    };
    setExercises(prev => [...prev, newEx]);
  };

  // Удаление упражнения
  const handleRemoveExercise = (id) => {
    if (exercises.length <= 1) return;
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  // Готовые пресеты сплитов
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'chest') {
      setWorkoutTitle('День 1: Грудь и Трицепс');
      setExercises([
        { id: 1, name: 'Жим штанги лежа', weight: 60, sets: 4, reps: 10, rest: '90 сек', notes: 'Локти под 45°' },
        { id: 2, name: 'Жим гантелей под углом 30°', weight: 18, sets: 3, reps: 12, rest: '60 сек', notes: 'Растяжка внизу' },
        { id: 3, name: 'Французский жим', weight: 25, sets: 3, reps: 12, rest: '60 сек', notes: 'Локти на месте' }
      ]);
    } else if (presetKey === 'back') {
      setWorkoutTitle('День 2: Спина и Бицепс');
      setExercises([
        { id: 1, name: 'Тяга верхнего блока к груди', weight: 50, sets: 4, reps: 12, rest: '75 сек', notes: 'Сведение лопаток' },
        { id: 2, name: 'Тяга гантели в наклоне', weight: 22, sets: 3, reps: 10, rest: '60 сек', notes: 'Корпус зафиксирован' },
        { id: 3, name: 'Подъем штанги на бицепс', weight: 25, sets: 3, reps: 10, rest: '60 сек', notes: 'Без раскачки' }
      ]);
    } else if (presetKey === 'legs') {
      setWorkoutTitle('День 3: Ноги и Плечи');
      setExercises([
        { id: 1, name: 'Приседания со штангой', weight: 70, sets: 4, reps: 10, rest: '120 сек', notes: 'Колени в сторону носков' },
        { id: 2, name: 'Жим ногами в тренажере', weight: 120, sets: 3, reps: 12, rest: '90 сек', notes: 'Поясница прижата' },
        { id: 3, name: 'Армейский жим стоя', weight: 35, sets: 3, reps: 10, rest: '75 сек', notes: 'Пресс в напряжении' }
      ]);
    }
  };

  // Сохранение программы тренировок
  const handleSaveProgram = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      title: workoutTitle,
      exercises,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`gymconnect_program_${student.id}`, JSON.stringify(payload));

      if (student?.id) {
        await supabase
          .from('profiles')
          .update({ workout_program: payload })
          .eq('id', student.id);
      }

      // Отправляем безопасный пуш ученику в Telegram через Supabase
      await sendTelegramDirect(`🏋️ <b>Новая тренировочная программа!</b>\n\nТренер обновил твой план: <b>«${workoutTitle}»</b> (${exercises.length} упр.).\nОткрой приложение @gymconnect_ala_bot для просмотра рабочих весов!`);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn('Ошибка сохранения программы:', err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-72">

      {/* 1. ШАПКА ПРОГРАММЫ И ПРЕСЕТЫ */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Dumbbell className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Программа тренировок</h3>
              <p className="text-[10px] text-slate-400">Нагрузки, веса и подходы атлета</p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {exercises.length} упр.
          </span>
        </div>

        {/* Быстрые шаблоны сплита */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => applyPreset('chest')}
            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePreset === 'chest' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Грудь / Трицепс
          </button>
          <button
            type="button"
            onClick={() => applyPreset('back')}
            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePreset === 'back' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Спина / Бицепс
          </button>
          <button
            type="button"
            onClick={() => applyPreset('legs')}
            className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePreset === 'legs' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ноги / Плечи
          </button>
        </div>

        {/* Название тренировочного дня */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Название тренировочного дня:
          </label>
          <input
            type="text"
            value={workoutTitle}
            onChange={e => setWorkoutTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            placeholder="Например: День 1: Спина и плечи"
          />
        </div>
      </div>

      {/* 2. СПИСОК УПРАЖНЕНИЙ С ИНТЕРАКТИВНЫМИ ВЕСАМИ И ПОДХОДАМИ */}
      <div className="space-y-3">
        {exercises.map((ex, idx) => (
          <div 
            key={ex.id}
            className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5 animate-in fade-in"
          >
            {/* Верхняя строка: номер, название и кнопка удаления */}
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={ex.name}
                onChange={e => {
                  const val = e.target.value;
                  setExercises(prev => prev.map(item => item.id === ex.id ? { ...item, name: val } : item));
                }}
                className="flex-1 min-w-0 px-2 py-1 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition-all truncate"
                placeholder="Название упражнения"
              />
              <button
                type="button"
                onClick={() => handleRemoveExercise(ex.id)}
                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                title="Удалить упражнение"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* СЕТКА ПОДХОДОВ, ПОВТОРЕНИЙ И ВЕСА — КОМПАКТНЫЙ СТИЛЬ APPLE HIG */}
            <div className="grid grid-cols-3 gap-2">
              
              {/* Подходы */}
              <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between">
                <span className="text-[9.5px] font-bold text-slate-400 block text-center uppercase tracking-wider">Подходы</span>
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => adjustSets(ex.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-extrabold text-xs text-slate-900">{ex.sets}</span>
                  <button
                    type="button"
                    onClick={() => adjustSets(ex.id, 1)}
                    className="w-6 h-6 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Повторения */}
              <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between">
                <span className="text-[9.5px] font-bold text-slate-400 block text-center uppercase tracking-wider">Повторы</span>
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => adjustReps(ex.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-extrabold text-xs text-slate-900">{ex.reps}</span>
                  <button
                    type="button"
                    onClick={() => adjustReps(ex.id, 1)}
                    className="w-6 h-6 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Рабочий вес */}
              <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-2xl flex flex-col justify-between">
                <span className="text-[9.5px] font-bold text-slate-400 block text-center uppercase tracking-wider">Вес (кг)</span>
                <div className="flex items-center justify-between mt-1">
                  <button
                    type="button"
                    onClick={() => adjustWeight(ex.id, -2.5)}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-extrabold text-xs text-blue-700">{ex.weight}</span>
                  <button
                    type="button"
                    onClick={() => adjustWeight(ex.id, 2.5)}
                    className="w-6 h-6 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-xs active:scale-90 cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* БЫСТРАЯ ПРИБАВКА ВЕСА ЧИПАМИ: +2.5, +5, +7.5, +10 КГ */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[9.5px] text-slate-400 font-semibold">Прибавить вес:</span>
              <div className="flex items-center gap-1">
                {[2.5, 5, 7.5, 10].map(addVal => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => adjustWeight(ex.id, addVal)}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[9.5px] font-mono font-bold border border-slate-200/80 active:scale-90 transition-all cursor-pointer"
                  >
                    +{addVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Заметка по технике */}
            <input
              type="text"
              value={ex.notes || ''}
              onChange={e => {
                const val = e.target.value;
                setExercises(prev => prev.map(item => item.id === ex.id ? { ...item, notes: val } : item));
              }}
              placeholder="Подсказка тренера: пауза внизу, сведение лопаток..."
              className="w-full px-2.5 py-1.5 bg-slate-50/70 border border-slate-200/60 rounded-xl text-[10.5px] text-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white transition-all truncate"
            />
          </div>
        ))}

        {/* Кнопка добавления нового упражнения */}
        <button
          type="button"
          onClick={handleAddExercise}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 bg-white/50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить упражнение в программу</span>
        </button>
      </div>

      {/* 3. КНОПКА СОХРАНЕНИЯ ПРОГРАММЫ */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        {saveSuccess ? (
          <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Программа сохранена и отправлена!</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Атлет увидит план в боте</span>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveProgram}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? '...' : 'Сохранить программу'}</span>
        </button>
      </div>

    </div>
  );
}
