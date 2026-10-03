// src/components/trainer/components/modals/TrainerHealthParqModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  X, 
  HeartPulse, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Bone,
  Activity,
  Pill,
  Send,
  Save,
  Check
} from 'lucide-react';
import { supabase } from '../../../../supabaseClient';
import { 
  HEALTH_CATEGORIES, 
  DEFAULT_HEALTH_QUESTIONS 
} from '../../../../data/defaultHealthQuestions';
import AthleteHealthSheetModal from './AthleteHealthSheetModal';

export default function TrainerHealthParqModal({ isOpen, onClose, studentsList = [], trainerProfile }) {
  const [healthTab, setHealthTab] = useState('submissions'); // 'submissions' | 'questions'
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [studentHealthSearch, setStudentHealthSearch] = useState('');
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState(null);
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  // Кастомные вопросы тренера
  const [customHealthQuestions, setCustomHealthQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_custom_parq');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Загрузка кастомных вопросов из базы тренера
  useEffect(() => {
    async function loadTrainerCustomQuestions() {
      if (!trainerProfile?.id) return;
      try {
        const { data } = await supabase
          .from('trainer_profiles')
          .select('custom_health_questions')
          .eq('id', trainerProfile.id)
          .maybeSingle();

        if (data?.custom_health_questions && Array.isArray(data.custom_health_questions)) {
          setCustomHealthQuestions(data.custom_health_questions);
        }
      } catch (err) {}
    }
    if (isOpen) {
      loadTrainerCustomQuestions();
    }
  }, [isOpen, trainerProfile?.id]);

  if (!isOpen) return null;

  const handleAddCustomHealthQuestion = async () => {
    if (!newQuestionInput.trim()) return;
    const updated = [...customHealthQuestions, newQuestionInput.trim()];
    setCustomHealthQuestions(updated);
    setNewQuestionInput('');

    try {
      localStorage.setItem('gymconnect_coach_custom_parq', JSON.stringify(updated));
      if (trainerProfile?.id) {
        setIsSavingCustom(true);
        await supabase
          .from('trainer_profiles')
          .update({ custom_health_questions: updated })
          .eq('id', trainerProfile.id);
      }
    } catch (e) {} finally {
      setIsSavingCustom(false);
    }
  };

  const handleRemoveQuestion = async (idx) => {
    const updated = customHealthQuestions.filter((_, i) => i !== idx);
    setCustomHealthQuestions(updated);

    try {
      localStorage.setItem('gymconnect_coach_custom_parq', JSON.stringify(updated));
      if (trainerProfile?.id) {
        await supabase
          .from('trainer_profiles')
          .update({ custom_health_questions: updated })
          .eq('id', trainerProfile.id);
      }
    } catch (e) {}
  };

  const filteredStudents = useMemo(() => {
    return (studentsList || []).filter(s => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''} ${s.full_name || ''} ${s.gym || ''}`.toLowerCase();
      return fullName.includes(studentHealthSearch.toLowerCase());
    });
  }, [studentsList, studentHealthSearch]);

  const stats = useMemo(() => {
    let redFlagsCount = 0;
    let completedCount = 0;
    studentsList.forEach(s => {
      if (s.health_questionnaire_completed) completedCount++;
      const redCount = s.health_data?.redFlagsCount || 0;
      if (redCount > 0 || s.injury_notes) redFlagsCount++;
    });
    return { redFlagsCount, completedCount, total: studentsList.length };
  }, [studentsList]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-100 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Медицинский скрининг (PAR-Q)
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Контроль ограничений и травм базы
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Переключатель вкладок Apple Segmented Control */}
        <div className="max-w-md mx-auto mt-2.5 grid grid-cols-2 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setHealthTab('submissions')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              healthTab === 'submissions' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Атлеты ({studentsList.length})
          </button>

          <button
            type="button"
            onClick={() => setHealthTab('questions')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              healthTab === 'questions' 
                ? 'bg-white text-blue-600 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Вопросы анкеты
          </button>
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">

        {/* ================= ВКЛАДКА 1: АТЛЕТЫ И ОТВЕТЫ ================= */}
        {healthTab === 'submissions' && (
          <div className="space-y-3">
            
            {/* Сводные KPI карточки */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Заполнили</span>
                <span className="text-base font-extrabold font-mono text-neutral-900 mt-0.5 block">
                  {stats.completedCount} / {stats.total}
                </span>
                <span className="text-[9.5px] text-emerald-600 font-bold block mt-0.5">в базе</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Красные флаги</span>
                <span className="text-base font-extrabold font-mono text-red-600 mt-0.5 block">
                  {stats.redFlagsCount}
                </span>
                <span className="text-[9.5px] text-red-500 font-bold block mt-0.5">требуют внимания</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Без травм</span>
                <span className="text-base font-extrabold font-mono text-emerald-600 mt-0.5 block">
                  {Math.max(0, stats.completedCount - stats.redFlagsCount)}
                </span>
                <span className="text-[9.5px] text-neutral-400 block mt-0.5">полная норма</span>
              </div>
            </div>

            {/* Поиск атлета */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={studentHealthSearch}
                onChange={e => setStudentHealthSearch(e.target.value)}
                placeholder="Поиск по имени или залу..."
                className="w-full p-2.5 pl-9 bg-white border border-neutral-200/80 rounded-2xl text-xs shadow-xs focus:outline-none focus:border-blue-600 text-neutral-900"
              />
            </div>

            {/* Список карточек атлетов (клик открывает подробную карту AthleteHealthSheetModal) */}
            <div className="space-y-2.5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(st => {
                  const isCompleted = Boolean(st.health_questionnaire_completed);
                  const redCount = st.health_data?.redFlagsCount || (st.injury_notes ? 1 : 0);
                  const fullName = st.full_name || `${st.first_name || 'Атлет'} ${st.last_name || ''}`.trim();

                  return (
                    <div 
                      key={st.id}
                      onClick={() => setSelectedStudentForSheet(st)}
                      className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5 cursor-pointer hover:border-blue-400 transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-700 shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-neutral-900 truncate">{fullName}</h4>
                            <p className="text-[10px] text-neutral-400 truncate">
                              {st.gym ? st.gym.split('|')[0] : 'Зал'} • {st.age ? `${st.age} лет` : 'Возраст не указан'}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isCompleted ? (
                            redCount > 0 ? (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>{redCount} риска</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Норма</span>
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-lg">
                              Не заполнена
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      </div>

                      {/* Текстовая выжимка ограничений */}
                      <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                        redCount > 0 
                          ? 'bg-red-50/60 border border-red-200/80 text-red-950 font-medium' 
                          : 'bg-neutral-50 border border-neutral-200/60 text-neutral-600'
                      }`}>
                        {st.health_notes || st.injury_notes || (isCompleted ? 'Ограничений не зафиксировано.' : 'Анкета ожидает заполнения подопечным.')}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-neutral-400 bg-white rounded-3xl border border-neutral-200">
                  Атлеты не найдены.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= ВКЛАДКА 2: БАЗА ВОПРОСОВ И ДОБАВЛЕНИЕ СВОИХ ================= */}
        {healthTab === 'questions' && (
          <div className="space-y-3.5">
            
            {/* Добавление своего вопроса */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-extrabold text-neutral-900 leading-tight">
                  Добавить свой вопрос в анкету подопечных
                </h3>
                <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">
                  Вопрос появится на 4-м шаге у всех ваших учеников
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionInput}
                  onChange={e => setNewQuestionInput(e.target.value)}
                  placeholder="Например: Были ли травмы коленей при глубоких приседаниях?"
                  className="flex-1 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  disabled={isSavingCustom || !newQuestionInput.trim()}
                  onClick={handleAddCustomHealthQuestion}
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {customHealthQuestions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Ваши индивидуальные вопросы:
                  </span>
                  {customHealthQuestions.map((q, idx) => (
                    <div key={idx} className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-900">{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-neutral-400 hover:text-red-600 cursor-pointer p-1"
                        title="Удалить"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Базовые категории и вопросы стандарта */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
                Стандартный скрининг PAR-Q ({DEFAULT_HEALTH_QUESTIONS.length} вопросов):
              </span>

              {HEALTH_CATEGORIES.map(cat => {
                const catQuestions = DEFAULT_HEALTH_QUESTIONS.filter(q => q.category === cat.id);

                return (
                  <div key={cat.id} className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
                    <span className="text-xs font-extrabold text-neutral-900 block border-b border-neutral-100 pb-2">
                      {cat.title}
                    </span>

                    <div className="space-y-2 divide-y divide-neutral-100">
                      {catQuestions.map(q => (
                        <div key={q.id} className="pt-2 first:pt-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-800">{q.title}</span>
                            {q.isRedFlag && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-md">
                                Красный флаг
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-neutral-400 leading-snug">{q.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* 3. ФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl font-bold text-xs active:scale-98 transition-all cursor-pointer border border-neutral-200 shadow-2xs"
          >
            Закрыть раздел
          </button>
        </div>
      </footer>

      {/* МОДАЛКА ПРОСМОТРА ПОЛНОЙ МЕДИЦИНСКОЙ КАРТЫ АТЛЕТА */}
      <AthleteHealthSheetModal
        isOpen={Boolean(selectedStudentForSheet)}
        onClose={() => setSelectedStudentForSheet(null)}
        student={selectedStudentForSheet}
        trainer={trainerProfile}
        onUpdate={() => {
          setSelectedStudentForSheet(null);
        }}
      />

    </div>
  );
}
