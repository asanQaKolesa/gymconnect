// src/components/trainer/components/modals/AthleteHealthSheetModal.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Save,
  Bone,
  HeartPulse,
  Activity,
  Pill,
  Info
} from 'lucide-react';
import { supabase } from '../../../../supabaseClient';
import { 
  HEALTH_CATEGORIES, 
  DEFAULT_HEALTH_QUESTIONS,
  RECOMMENDED_LAB_CHECKUP_LIST 
} from '../../../../data/defaultHealthQuestions';
import { sendStudentNotification } from '../../../../utils/telegramNotifications';

export default function AthleteHealthSheetModal({ 
  isOpen, 
  onClose, 
  student, 
  trainer,
  onUpdate 
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'full' | 'labs'
  const [trainerPrivateNote, setTrainerPrivateNote] = useState(
    student?.trainer_notes || student?.health_coach_notes || ''
  );
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [labsSentFeedback, setLabsSentFeedback] = useState(false);

  if (!isOpen || !student) return null;

  const healthData = student?.health_data || {};
  const answers = healthData.answers || {};
  const redFlags = healthData.redFlags || [];
  const completedDate = healthData.completed_at 
    ? new Date(healthData.completed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : (student.health_completed_at ? new Date(student.health_completed_at).toLocaleDateString('ru-RU') : 'Не заполнена');

  const fullName = student?.full_name || `${student?.first_name || 'Атлет'} ${student?.last_name || ''}`.trim();

  // Сохранение приватной заметки наставника
  const handleSavePrivateNote = async () => {
    setIsSavingNote(true);
    try {
      if (student?.id) {
        await supabase
          .from('profiles')
          .update({ 
            trainer_notes: trainerPrivateNote.trim(),
            health_coach_notes: trainerPrivateNote.trim() 
          })
          .eq('id', student.id);
      }
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2500);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.warn('Ошибка сохранения заметки:', e);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Отправка памятки лабораторного чекапа подопечному в Telegram
  const handleSendLabCheckupToAthlete = async () => {
    const listText = RECOMMENDED_LAB_CHECKUP_LIST.map((item, idx) => `${idx + 1}. <b>${item.name}</b>\n   <i>${item.desc}</i>`).join('\n\n');
    const message = `📋 <b>Рекомендованный чекап анализов от наставника</b>\n\nПривет, ${fullName}! Для безопасного старта и контроля метаболизма рекомендуется сдать:\n\n${listText}\n\nСдавать строго натощак. Результаты можно отправить тренеру прямо в чат!`;

    setLabsSentFeedback(true);
    try {
      await sendStudentNotification({
        studentTelegramId: student.telegram_id,
        studentUsername: student.username || student.telegram_username,
        studentId: student.id,
        title: 'Рекомендация анализов перед тренировками',
        message
      });
    } catch (e) {
      console.warn('Ошибка отправки:', e);
    } finally {
      setTimeout(() => setLabsSentFeedback(false), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-slate-200/60"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-slate-900 tracking-tight truncate">
              Медицинская карта атлета
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {fullName} • PAR-Q скрининг
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Табы */}
        <div className="max-w-md mx-auto mt-2.5 grid grid-cols-3 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === 'summary' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Факторы риска
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === 'full' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Все ответы
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('labs')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === 'labs' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Чекап анализов
          </button>
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">

        {/* ================= ВКЛАДКА 1: СВОДКА РИСКОВ ================= */}
        {activeTab === 'summary' && (
          <div className="space-y-3.5">
            
            {/* Статус анкеты */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  redFlags.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {redFlags.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                    {redFlags.length > 0 ? `Факторов внимания: ${redFlags.length}` : 'Противопоказаний нет'}
                  </h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    Заполнена: {completedDate}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                redFlags.length > 0 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {redFlags.length > 0 ? 'Требует адаптации' : 'Норма'}
              </span>
            </div>

            {/* СПИСОК КРАСНЫХ ФЛАГОВ С ВЫБРАННЫМИ СИМПТОМАМИ */}
            {redFlags.length > 0 ? (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Обнаруженные клинические ограничения:
                </span>

                {redFlags.map((flag, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-4 border border-red-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <h4 className="text-xs font-extrabold text-slate-900">{flag.title}</h4>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded-md">
                        Внимание
                      </span>
                    </div>

                    {/* Выбранные симптомы */}
                    {flag.symptoms && flag.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {flag.symptoms.map((sym, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-red-50 text-red-800 text-[10.5px] font-semibold rounded-lg border border-red-200/60">
                            • {sym}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Описание от атлета */}
                    {flag.details && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Указания врача / комментарий:</span>
                        «{flag.details}»
                      </div>
                    )}

                    {flag.riskHint && (
                      <p className="text-[10.5px] text-slate-600 leading-snug pt-0.5">
                        <b className="text-slate-800">Биомеханический протокол:</b> {flag.riskHint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">Критических ограничений нет</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Подопечный не отметил травм позвоночника, суставов, скачков давления или операций.
                </p>
              </div>
            )}

            {/* ПРИВАТНЫЕ ЗАМЕТКИ НАСТАВНИКА */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-extrabold text-slate-900">
                  Заметки наставника (приватно)
                </span>
                {noteSavedFeedback && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Сохранено
                  </span>
                )}
              </div>

              <textarea
                rows={3}
                value={trainerPrivateNote}
                onChange={e => setTrainerPrivateNote(e.target.value)}
                placeholder="Фиксируйте наблюдения: например, исключить армейский жим стоя, контролировать пульс при приседаниях..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed outline-none focus:border-blue-600 resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSavePrivateNote}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? 'Сохранение...' : 'Сохранить заметку'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= ВКЛАДКА 2: ВСЕ ОТВЕТЫ ================= */}
        {activeTab === 'full' && (
          <div className="space-y-3">
            {HEALTH_CATEGORIES.map(cat => {
              const catQuestions = DEFAULT_HEALTH_QUESTIONS.filter(q => q.category === cat.id);

              return (
                <div key={cat.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <span className="text-xs font-extrabold text-slate-900 block border-b border-slate-100 pb-2">
                    {cat.title}
                  </span>

                  <div className="space-y-2 divide-y divide-slate-100">
                    {catQuestions.map(q => {
                      const ans = answers[q.id];
                      const isIssue = Boolean(ans?.hasIssue);

                      return (
                        <div key={q.id} className="pt-2 first:pt-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">{q.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                              isIssue ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isIssue ? 'Есть диагноз' : 'Норма'}
                            </span>
                          </div>

                          {isIssue && (
                            <div className="space-y-1 pl-2 border-l-2 border-red-400">
                              {ans?.selectedSymptoms && ans.selectedSymptoms.length > 0 && (
                                <p className="text-[10.5px] text-red-900 font-semibold">
                                  Симптомы: {ans.selectedSymptoms.join(', ')}
                                </p>
                              )}
                              {ans?.details && (
                                <p className="text-[11px] text-slate-600 italic">
                                  «{ans.details}»
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= ВКЛАДКА 3: РЕКОМЕНДАЦИЯ АНАЛИЗОВ ================= */}
        {activeTab === 'labs' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                  Памятка базового чекапа анализов
                </h3>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                  Список ключевых маркеров для контроля перегрузки, ЦНС и метаболизма
                </p>
              </div>

              <div className="space-y-2">
                {RECOMMENDED_LAB_CHECKUP_LIST.map((lab, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">{lab.name}</span>
                    <span className="text-[10.5px] text-slate-500 block leading-snug">{lab.desc}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSendLabCheckupToAthlete}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {labsSentFeedback ? 'Памятка отправлена атлету в Telegram!' : 'Отправить список анализов атлету в Telegram'}
                </span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 3. ФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs active:scale-98 transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            Закрыть карту здоровья
          </button>
        </div>
      </footer>

    </div>
  );
}
