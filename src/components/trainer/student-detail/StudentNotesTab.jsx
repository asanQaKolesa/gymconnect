// src/components/trainer/student-detail/StudentNotesTab.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Lock, 
  Save, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export default function StudentNotesTab({ student, onUpdate }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [trainerNotes, setTrainerNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setTrainerNotes(student.trainer_notes || student.notes || '');
    }
  }, [student]);

  if (!student) return null;

  const handleSaveNotes = async () => {
    if (!student.id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ trainer_notes: trainerNotes.trim() })
        .eq('id', student.id);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка при сохранении заметки: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3.5 text-xs text-slate-700 select-none pb-6">
      
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">Приватные заметки наставника</h3>
              <p className="text-[10px] text-slate-400">Видны исключительно вам</p>
            </div>
          </div>
        </div>

        {/* Индикатор приватности */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-[10.5px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Ученик не видит содержимое этого блока в своем приложении.</span>
        </div>

        <textarea
          rows={7}
          value={trainerNotes}
          onChange={e => setTrainerNotes(e.target.value)}
          placeholder="Фиксируйте сюда важные нюансы:
• Рабочие веса и прогресс (например: жим 65 кг на 8 раз с чистой техникой)
• Травмы и дискомфорт (болит левое плечо при отведениях)
• Личные привычки и предпочтения подопечного..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-blue-600"
        />

        {/* Кнопка сохранения с индикацией */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-100">
          {saveSuccess ? (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Заметка сохранена!</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">Сохраняется в профиле подопечного</span>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveNotes}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? '...' : 'Сохранить заметку'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
