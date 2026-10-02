import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  Plus, 
  CheckCircle2, 
  Save, 
  Zap
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';

// Builder Components
import StudentSelectorHeader from '../builder/StudentSelectorHeader';
import SplitDaysTabs from '../builder/SplitDaysTabs';
import ExerciseCardItem from '../builder/ExerciseCardItem';
import ExerciseSearchModal from '../builder/ExerciseSearchModal';

export default function WorkoutsTab({ students = [], onUpdate }) {
  // 1. Selector State
  const activeStudents = students.filter(s => {
    const st = (s.status || '').toLowerCase().trim();
    return st !== 'left' && st !== 'archived';
  });
  const [selectedStudentId, setSelectedStudentId] = useState(activeStudents[0]?.id || '');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // 2. Builder State
  const [daysCount, setDaysCount] = useState(3);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [daysWorkouts, setDaysWorkouts] = useState([
    { title: 'День 1', exercises: [] },
    { title: 'День 2', exercises: [] },
    { title: 'День 3', exercises: [] }
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Load from LocalStorage when student changes
  useEffect(() => {
    if (!selectedStudentId) return;
    try {
      const draft = localStorage.getItem(`gymconnect_builder_draft_${selectedStudentId}`);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.daysCount) setDaysCount(parsed.daysCount);
        if (parsed.daysWorkouts) setDaysWorkouts(parsed.daysWorkouts);
      } else {
        // Reset to default
        setDaysCount(3);
        setDaysWorkouts([
          { title: 'День 1', exercises: [] },
          { title: 'День 2', exercises: [] },
          { title: 'День 3', exercises: [] }
        ]);
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }, [selectedStudentId]);

  // Save to LocalStorage when builder state changes
  useEffect(() => {
    if (!selectedStudentId) return;
    try {
      const draft = JSON.stringify({ daysCount, daysWorkouts });
      localStorage.setItem(`gymconnect_builder_draft_${selectedStudentId}`, draft);
    } catch (e) {
      console.error('Error saving draft', e);
    }
  }, [daysCount, daysWorkouts, selectedStudentId]);

  const handleSelectExercise = (exDb) => {
    const newExercise = {
      id: Date.now().toString(),
      dbId: exDb.id,
      name: exDb.nameRu,
      muscleGroup: exDb.muscleGroup,
      setsList: [{ weight: 0, reps: 10, rest: '90s' }],
      notes: ''
    };

    setDaysWorkouts(prev => {
      const nw = [...prev];
      if (!nw[activeDayIndex]) return prev;
      nw[activeDayIndex] = {
        ...nw[activeDayIndex],
        exercises: [...nw[activeDayIndex].exercises, newExercise]
      };
      return nw;
    });
  };

  const handleUpdateExercise = (exIndex, updatedEx) => {
    setDaysWorkouts(prev => {
      const nw = [...prev];
      nw[activeDayIndex].exercises[exIndex] = updatedEx;
      return nw;
    });
  };

  const handleRemoveExercise = (exIndex) => {
    setDaysWorkouts(prev => {
      const nw = [...prev];
      nw[activeDayIndex].exercises = nw[activeDayIndex].exercises.filter((_, i) => i !== exIndex);
      return nw;
    });
  };

  const handleSaveProgram = async () => {
    if (!selectedStudentId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        type: 'program',
        date: new Date().toISOString(),
        daysCount,
        daysWorkouts
      };

      const { data: profile } = await supabase
        .from('profiles')
        .select('fitness_data')
        .eq('id', selectedStudentId)
        .single();

      let currentData = profile?.fitness_data || {};
      let updates = [...(currentData.updates || []), payload];

      const { error } = await supabase
        .from('profiles')
        .update({ fitness_data: { ...currentData, updates, currentProgram: payload } })
        .eq('id', selectedStudentId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      localStorage.removeItem(`gymconnect_builder_draft_${selectedStudentId}`);

    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert('Ошибка при сохранении программы');
    } finally {
      setSaving(false);
    }
  };

  if (activeStudents.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-400">
        У вас пока нет активных учеников для назначения программы.
      </div>
    );
  }

  const currentDay = daysWorkouts[activeDayIndex] || { exercises: [] };

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Selector Header */}
      <StudentSelectorHeader
        students={activeStudents}
        selectedStudentId={selectedStudentId}
        onSelectStudent={setSelectedStudentId}
        onOpenProfile={(student) => setSelectedStudentForModal(student)}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Split Tabs */}
        <SplitDaysTabs
          daysCount={daysCount}
          setDaysCount={setDaysCount}
          activeDayIndex={activeDayIndex}
          setActiveDayIndex={setActiveDayIndex}
          daysWorkouts={daysWorkouts}
          setDaysWorkouts={setDaysWorkouts}
        />

        {/* Exercises List */}
        <div className="p-4 space-y-4">
          {currentDay.exercises.length === 0 ? (
            <div className="text-center py-10 bg-neutral-900 border border-neutral-800 rounded-2xl border-dashed">
              <Zap className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">В этот день пока нет упражнений</p>
              <p className="text-xs text-neutral-500 mt-1">Добавьте первое упражнение из базы</p>
            </div>
          ) : (
            currentDay.exercises.map((ex, idx) => (
              <ExerciseCardItem
                key={ex.id}
                exercise={ex}
                index={idx}
                onUpdate={handleUpdateExercise}
                onRemove={handleRemoveExercise}
              />
            ))
          )}

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить упражнение
          </button>
        </div>
      </div>

      {/* Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 pb-[calc(1rem+env(safe-area-inset-bottom))] z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {saveSuccess ? (
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Программа назначена!
            </span>
          ) : (
            <span className="text-neutral-500 text-xs">
              Автосохранение черновика...
            </span>
          )}

          <button
            onClick={handleSaveProgram}
            disabled={saving}
            className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Сохранение...' : 'Отправить ученику'}
          </button>
        </div>
      </div>

      {/* Modals */}
      <ExerciseSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectExercise={handleSelectExercise}
      />

      <StudentDetailModal 
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        student={selectedStudentForModal}
        onUpdate={onUpdate}
      />
    </div>
  );
}
