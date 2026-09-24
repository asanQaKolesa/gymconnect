// src/components/trainer/tabs/NotesTab.jsx
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { FileText, Save, User, CheckCircle2 } from 'lucide-react';

export default function NotesTab({ students, onUpdate }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [noteText, setNoteText] = useState(students.find(s => s.id === students[0]?.id)?.trainer_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.id);
    setNoteText(student.trainer_notes || '');
  };

  const handleSaveNote = async () => {
    if (!selectedStudentId) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ trainer_notes: noteText })
      .eq('id', selectedStudentId);

    setSaving(false);
    if (error) {
      alert('Ошибка сохранения заметки: ' + error.message);
    } else {
      alert('Заметка по ученику успешно сохранена!');
      if (onUpdate) onUpdate();
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
      {/* Список учеников для выбора */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
        <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" /> Выберите атлета
        </h3>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {students.length > 0 ? (
            students.map((student) => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`w-full p-2.5 rounded-xl text-left font-semibold transition-all flex items-center justify-between ${
                  selectedStudentId === student.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{student.first_name} {student.last_name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedStudentId === student.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {student.left_trainings !== undefined ? student.left_trainings : 12} зан.
                </span>
              </button>
            ))
          ) : (
            <p className="text-slate-400 italic py-4 text-center">Нет учеников</p>
          )}
        </div>
      </div>

      {/* Поле ввода заметок */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Заметки тренера: {currentStudent ? `${currentStudent.first_name} ${currentStudent.last_name}` : 'Выберите ученика'}
              </h3>
              <p className="text-[10px] text-slate-500">Интимные технические детали, травмы, пожелания (клиент не видит)</p>
            </div>
          </div>
        </div>

        {currentStudent ? (
          <div className="space-y-3">
            <textarea
              rows="8"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Например: Жалуется на поясницу при становой, вес снизить до 50кг. Любит пить кофе перед тренировкой..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed font-sans"
            />
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveNote}
              className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Сохранение...' : 'Сохранить заметку'}</span>
            </button>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Выберите ученика слева, чтобы просмотреть или оставить заметку.
          </div>
        )}
      </div>
    </div>
  );
}
