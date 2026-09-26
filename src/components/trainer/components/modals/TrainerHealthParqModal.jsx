// src/components/trainer/components/modals/TrainerHealthParqModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, X } from 'lucide-react';

export default function TrainerHealthParqModal({ isOpen, onClose, studentsList = [] }) {
  const [healthTab, setHealthTab] = useState('questions'); // 'questions' | 'submissions'
  const [customHealthQuestions, setCustomHealthQuestions] = useState([]);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [studentHealthSearch, setStudentHealthSearch] = useState('');

  if (!isOpen) return null;

  const handleAddCustomHealthQuestion = () => {
    if (!newQuestionInput.trim()) return;
    setCustomHealthQuestions([...customHealthQuestions, newQuestionInput.trim()]);
    setNewQuestionInput('');
  };

  const filteredStudents = studentsList.filter(s =>
    `${s.first_name || ''} ${s.last_name || ''} ${s.phone || ''}`
      .toLowerCase()
      .includes(studentHealthSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">Анкета здоровья (PAR-Q)</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setHealthTab('questions')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              healthTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Вопросы анкеты
          </button>
          <button
            type="button"
            onClick={() => setHealthTab('submissions')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              healthTab === 'submissions' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Ответы учеников ({studentsList.length})
          </button>
        </div>

        {healthTab === 'questions' ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
              <span className="font-bold text-slate-900 text-xs">Базовые вопросы скрининга:</span>
              <ul className="space-y-2 text-slate-700 text-[11px] list-disc pl-4">
                <li>Травмы суставов, связок, переломы и операции</li>
                <li>Диагностированные грыжи и протрузии позвоночника</li>
                <li>Повышенное или пониженное артериальное давление</li>
                <li>Одышка, боли за грудиной и головокружения при нагрузке</li>
                <li>Ограничения по подвижности и официальные противопоказания врачей</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="font-bold text-slate-900 text-xs">Добавить свой вопрос в опросник:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={e => setNewQuestionInput(e.target.value)}
                  placeholder="Например: Есть ли аллергия на протеин или спортпит?"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomHealthQuestion}
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {customHealthQuestions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ваши добавленные вопросы:</span>
                  {customHealthQuestions.map((q, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span>{q}</span>
                      <button
                        type="button"
                        onClick={() => setCustomHealthQuestions(customHealthQuestions.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={studentHealthSearch}
                onChange={e => setStudentHealthSearch(e.target.value)}
                placeholder="Поиск ученика по имени или телефону..."
                className="w-full p-2.5 pl-9 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <p className="text-center py-6 text-slate-400">Ученики не найдены</p>
              ) : (
                filteredStudents.map(st => (
                  <div key={st.id} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-xs">{st.first_name} {st.last_name}</p>
                      <span className="text-[10px] font-mono text-slate-500">{st.phone || 'Без телефона'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-800">Медицинские ограничения: </span>
                      <span>{st.health_notes || 'Анкета заполнена, противопоказаний не выявлено.'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
