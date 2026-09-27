// src/components/trainer/tabs/NotesTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  FileText, 
  User, 
  CheckCircle2, 
  Save, 
  Lock, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import StudentDetailModal from '../components/StudentDetailModal';

export default function NotesTab({ students = [], onUpdate }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);

  // Синхронизация текста заметки при смене выбранного ученика
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
    const current = students.find(s => s.id === selectedStudentId);
    setNoteText(current?.trainer_notes || current?.notes || '');
    setSaveSuccess(false);
  }, [selectedStudentId, students]);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.id);
    setNoteText(student.trainer_notes || student.notes || '');
    setSaveSuccess(false);
  };

  const handleSaveNote = async () => {
    if (!selectedStudentId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ trainer_notes: noteText })
        .eq('id', selectedStudentId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Ошибка сохранения заметки: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-3.5 select-none pb-12 text-xs">
      
      {/* 1. Горизонтальный селектор учеников */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
            Выберите атлета
          </span>
          <span className="text-[10px] text-blue-600 font-medium">
            Всего: {students.length}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {students.length > 0 ? (
            students.map((student) => {
              const isSelected = selectedStudentId === student.id;
              const hasNotes = Boolean(student.trainer_notes || student.notes);

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectStudent(student)}
                  className={`py-2 px-3 rounded-2xl text-left transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {student.first_name ? student.first_name[0] : 'U'}
                  </div>

                  <span className="text-xs truncate max-w-[120px]">
                    {student.first_name} {student.last_name || ''}
                  </span>

                  {hasNotes && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <p className="text-slate-400 italic py-2 text-center text-xs w-full">Ученики не найдены</p>
          )}
        </div>
      </div>

      {/* 2. Рабочая область редактирования заметки */}
      {currentStudent ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 leading-tight">
                  {currentStudent.first_name} {currentStudent.last_name || ''}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {currentStudent.gym ? currentStudent.gym.split('|')[0] : 'Зал не указан'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStudentForModal(currentStudent)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Вся анкета</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Плашка приватности */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2 text-[10.5px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Приватный дневник тренера: заметка не видна ученику в приложении.</span>
          </div>

          {/* Поле ввода заметки */}
          <textarea
            rows={7}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Фиксируйте сюда: 
• Травмы и ограничения по упражнениям (например: болит плечо при жиме)
• Рабочие веса и динамику
• Психологический настрой и пожелания подопечного..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed resize-none focus:outline-none focus:border-blue-600"
          />

          {/* Кнопка сохранения с обратной связью */}
          <div className="flex items-center justify-between pt-1">
            {saveSuccess ? (
              <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Заметка сохранена!</span>
              </span>
            ) : (
              <span className="text-slate-400 text-[10px]">Изменения сохраняются в облаке Supabase</span>
            )}

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveNote}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xs">
          Выберите ученика сверху, чтобы открыть его личные заметки.
        </div>
      )}

      {/* Полноэкранный профиль ученика */}
      <StudentDetailModal 
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        student={selectedStudentForModal}
        onUpdate={onUpdate}
      />

    </div>
  );
}
