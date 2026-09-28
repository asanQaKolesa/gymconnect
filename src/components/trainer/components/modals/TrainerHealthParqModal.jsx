// src/components/trainer/components/modals/TrainerHealthParqModal.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, X, HeartPulse, MessageCircle } from 'lucide-react';

export default function TrainerHealthParqModal({ isOpen, onClose, studentsList = [] }) {
  const [healthTab, setHealthTab] = useState('questions'); // 'questions' | 'submissions'
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [studentHealthSearch, setStudentHealthSearch] = useState('');

  // Сохранение добавленных тренером вопросов навсегда в localStorage
  const [customHealthQuestions, setCustomHealthQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_custom_parq');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  if (!isOpen) return null;

  const handleAddCustomHealthQuestion = () => {
    if (!newQuestionInput.trim()) return;
    const updated = [...customHealthQuestions, newQuestionInput.trim()];
    setCustomHealthQuestions(updated);
    try {
      localStorage.setItem('gymconnect_coach_custom_parq', JSON.stringify(updated));
    } catch (e) {}
    setNewQuestionInput('');
  };

  const handleRemoveQuestion = (idx) => {
    const updated = customHealthQuestions.filter((_, i) => i !== idx);
    setCustomHealthQuestions(updated);
    try {
      localStorage.setItem('gymconnect_coach_custom_parq', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredStudents = studentsList.filter(s =>
    `${s.first_name || ''} ${s.last_name || ''} ${s.phone || ''} ${s.gym || ''}`
      .toLowerCase()
      .includes(studentHealthSearch.toLowerCase())
  );

  const handleWhatsAppContact = (e, phone, name) => {
    e.stopPropagation();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      alert('У ученика не указан номер телефона');
      return;
    }
    const text = encodeURIComponent(`Привет, ${name}! Хочу уточнить по твоей анкете здоровья: есть ли дискомфорт или противопоказания перед тренировкой?`);
    window.open(`https://wa.me/7${cleanPhone.startsWith('7') ? cleanPhone.slice(1) : cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col overflow-y-auto select-none animate-in fade-in duration-150">
      
      {/* Шапка */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-blue-600 font-semibold text-xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад в меню</span>
        </button>
        <h2 className="text-xs font-bold text-slate-900">Анкета здоровья (PAR-Q)</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-24 text-xs">
        
        {/* Переключатель табов */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setHealthTab('questions')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              healthTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Вопросы анкеты
          </button>
          <button
            type="button"
            onClick={() => setHealthTab('submissions')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              healthTab === 'submissions' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Ответы учеников ({studentsList.length})
          </button>
        </div>

        {healthTab === 'questions' ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2.5">
              <span className="font-bold text-slate-900 text-xs">Базовые вопросы скрининга PAR-Q:</span>
              <ul className="space-y-2 text-slate-700 text-[11px] list-disc pl-4">
                <li>Травмы суставов, связок, переломы и хирургические операции</li>
                <li>Диагностированные грыжи и протрузии пояснично-грудного отдела</li>
                <li>Повышенное или пониженное артериальное давление</li>
                <li>Одышка, боли за грудиной и головокружения при кардионагрузке</li>
                <li>Официальные медицинские ограничения врачей по осевым нагрузкам</li>
              </ul>
            </div>

            {/* Добавление своего вопроса */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="font-bold text-slate-900 text-xs">Добавить свой вопрос в опросник:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={e => setNewQuestionInput(e.target.value)}
                  placeholder="Например: Были ли травмы коленей при приседаниях?"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCustomHealthQuestion}
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {customHealthQuestions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ваши сохраненные вопросы:</span>
                  {customHealthQuestions.map((q, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                        title="Удалить вопрос"
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
                placeholder="Поиск ученика по имени или залу..."
                className="w-full p-2.5 pl-9 bg-white border border-slate-200/80 rounded-2xl text-xs shadow-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-2.5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(st => (
                  <div key={st.id} className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{st.first_name} {st.last_name || ''}</p>
                        <p className="text-[10px] text-slate-400">{st.gym ? st.gym.split('|')[0] : 'Зал'} • {st.age ? `${st.age} лет` : 'Возраст не указан'}</p>
                      </div>

                      {st.phone && (
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppContact(e, st.phone, st.first_name)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-[10.5px] flex items-center gap-1 border border-emerald-200 active:scale-95 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Связаться</span>
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-[11px] text-amber-950">
                      <span className="font-bold text-amber-900 block mb-0.5">Ограничения и противопоказания:</span>
                      <p className="leading-snug">
                        {st.health_notes || st.trainer_notes || 'Жалобы на суставы, давление и травмы отсутствуют.'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                  Ученики не найдены.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
