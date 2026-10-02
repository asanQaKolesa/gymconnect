import React from 'react';
import { Trash2, Plus, GripVertical, History } from 'lucide-react';

export default function ExerciseCardItem({
  exercise,
  index,
  onUpdate,
  onRemove
}) {
  const updateExercise = (updates) => {
    onUpdate(index, { ...exercise, ...updates });
  };

  const addSet = () => {
    const newSet = exercise.setsList.length > 0
      ? { ...exercise.setsList[exercise.setsList.length - 1] }
      : { weight: 0, reps: 10, rest: '90s' };

    updateExercise({ setsList: [...exercise.setsList, newSet] });
  };

  const updateSet = (setIndex, field, value) => {
    const newSets = [...exercise.setsList];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    updateExercise({ setsList: newSets });
  };

  const removeSet = (setIndex) => {
    if (exercise.setsList.length <= 1) return;
    updateExercise({
      setsList: exercise.setsList.filter((_, i) => i !== setIndex)
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 shadow-sm relative group">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-6 h-6 rounded-lg bg-blue-900/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </div>
          <div className="flex flex-col flex-1">
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => updateExercise({ name: e.target.value })}
              className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b focus:border-blue-500 w-full"
              placeholder="Название упражнения"
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                {exercise.muscleGroup || 'Без группы'}
              </span>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <History className="w-3 h-3" />
                {exercise.pastWeight ? `Прошлый вес: ${exercise.pastWeight}` : 'Первое занятие'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onRemove(index)}
          className="p-1.5 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Sets Table */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-neutral-500 uppercase px-2">
          <div className="col-span-2 text-center">Сет</div>
          <div className="col-span-3 text-center">КГ</div>
          <div className="col-span-3 text-center">Повт</div>
          <div className="col-span-3 text-center">Отдых</div>
          <div className="col-span-1"></div>
        </div>

        {exercise.setsList.map((set, setIdx) => (
          <div key={setIdx} className="grid grid-cols-12 gap-2 items-center bg-neutral-800/50 p-2 rounded-xl border border-neutral-800/50">
            <div className="col-span-2 text-center text-xs font-bold text-neutral-400">
              {setIdx + 1}
            </div>

            <div className="col-span-3">
              <input
                type="number"
                value={set.weight || ''}
                onChange={(e) => updateSet(setIdx, 'weight', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-1 px-2 text-center text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div className="col-span-3">
              <input
                type="number"
                value={set.reps || ''}
                onChange={(e) => updateSet(setIdx, 'reps', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-1 px-2 text-center text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                placeholder="10"
              />
            </div>

            <div className="col-span-3">
              <input
                type="text"
                value={set.rest || ''}
                onChange={(e) => updateSet(setIdx, 'rest', e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-1 px-2 text-center text-xs font-medium text-neutral-300 focus:outline-none focus:border-blue-500"
                placeholder="90s"
              />
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeSet(setIdx)}
                disabled={exercise.setsList.length <= 1}
                className="p-1 text-neutral-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-neutral-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addSet}
          className="w-full py-2 border border-dashed border-neutral-700 hover:border-blue-500/50 text-neutral-400 hover:text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Добавить подход
        </button>
      </div>

      {/* Notes */}
      <div>
        <input
          type="text"
          value={exercise.notes || ''}
          onChange={(e) => updateExercise({ notes: e.target.value })}
          placeholder="Заметка: пауза внизу, темп 2-0-2..."
          className="w-full bg-neutral-800/50 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

    </div>
  );
}
