import React, { useState, useMemo } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';
import { EXERCISES_DATABASE, MUSCLE_GROUPS } from '../student-detail/exercisesData';

export default function ExerciseSearchModal({ isOpen, onClose, onSelectExercise }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Все группы');

  const filteredExercises = useMemo(() => {
    return EXERCISES_DATABASE.filter(ex => {
      const matchesSearch = ex.nameRu.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'Все группы' || ex.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [searchQuery, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full h-[90vh] sm:h-[80vh] sm:max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            Библиотека упражнений
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 space-y-3 border-b border-neutral-800 bg-neutral-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск упражнения..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {MUSCLE_GROUPS.map(mg => (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedMuscle === mg
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                }`}
              >
                {mg}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredExercises.length > 0 ? (
            <div className="space-y-1">
              {filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelectExercise(ex);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-800 transition-colors text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-200 group-hover:text-white">
                      {ex.nameRu}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {ex.muscleGroup} • {ex.type === 'compound' ? 'Базовое' : 'Изолированное'}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-neutral-500 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-neutral-500 space-y-2">
              <Dumbbell className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm font-medium">Ничего не найдено</p>
              <p className="text-xs">Попробуйте изменить запрос или фильтры</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
