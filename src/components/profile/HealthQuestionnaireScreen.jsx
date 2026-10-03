// src/components/profile/HealthQuestionnaireScreen.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Check, 
  HeartPulse, 
  Activity, 
  Bone, 
  Pill, 
  AlertCircle, 
  ChevronRight, 
  Send, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { 
  HEALTH_CATEGORIES, 
  DEFAULT_HEALTH_QUESTIONS 
} from '../../data/defaultHealthQuestions';
import { sendTelegramMessage, escapeHtml } from '../../utils/telegramNotifications';

export default function HealthQuestionnaireScreen({ 
  onBack, 
  userProfile, 
  trainerProfile,
  customQuestions = [],
  onComplete 
}) {
  const [currentStep, setCurrentStep] = useState(0); // 0..3 по категориям
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Базовые биометрические параметры
  const [biometrics, setBiometrics] = useState({
    age: String(userProfile?.age || '25'),
    height: String(userProfile?.height || '178'),
    weight: String(userProfile?.weight || userProfile?.current_weight || '75')
  });

  // Ответы на вопросы: { [questionId]: { hasIssue: boolean, details: string } }
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    DEFAULT_HEALTH_QUESTIONS.forEach(q => {
      initial[q.id] = { hasIssue: false, details: '' };
    });
    (customQuestions || []).forEach((cq, idx) => {
      initial[`custom_${idx}`] = { hasIssue: false, details: '' };
    });
    return initial;
  });

  // Специальные поля для блока сна и анализов
  const [sleepOption, setSleepOption] = useState('7_8'); // 'less_6' | '7_8' | 'more_8'
  const [labStatus, setLabStatus] = useState('not_taken'); // 'taken_normal' | 'taken_issues' | 'not_taken'
  const [labDetails, setLabDetails] = useState('');

  const currentCategory = HEALTH_CATEGORIES[currentStep];

  const questionsForCurrentStep = useMemo(() => {
    const list = DEFAULT_HEALTH_QUESTIONS.filter(q => q.category === currentCategory.id);
    if (currentCategory.id === 'lifestyle' && customQuestions?.length > 0) {
      customQuestions.forEach((cq, idx) => {
        list.push({
          id: `custom_${idx}`,
          category: 'lifestyle',
          title: typeof cq === 'string' ? cq : cq.title || 'Дополнительный вопрос наставника',
          description: 'Индивидуальный вопрос от вашего тренера',
          isRedFlag: false,
          promptPlaceholder: 'Ваш ответ...'
        });
      });
    }
    return list;
  }, [currentCategory.id, customQuestions]);

  const handleSelectHasIssue = (questionId, hasIssue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        hasIssue,
        details: hasIssue ? prev[questionId]?.details : ''
      }
    }));
  };

  const handleUpdateDetails = (questionId, details) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        details
      }
    }));
  };

  // Валидация: если выбрано "Да, есть нюансы", поле описания обязательно к заполнению
  const canProceedCurrentStep = useMemo(() => {
    for (const q of questionsForCurrentStep) {
      if (q.isSleepSpecial || q.isLabSpecial) continue;
      const ans = answers[q.id];
      if (ans?.hasIssue && (!ans.details || ans.details.trim().length < 2)) {
        return false;
      }
    }
    return true;
  }, [questionsForCurrentStep, answers]);

  // Подсчет красных флагов
  const detectedRedFlags = useMemo(() => {
    const flags = [];
    DEFAULT_HEALTH_QUESTIONS.forEach(q => {
      if (q.isRedFlag && answers[q.id]?.hasIssue) {
        flags.push({
          title: q.title,
          riskHint: q.riskHint,
          details: answers[q.id]?.details
        });
      }
    });
    return flags;
  }, [answers]);

  const handleNextStep = () => {
    if (currentStep < HEALTH_CATEGORIES.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const tgId = userProfile?.telegram_id || localStorage.getItem('gymconnect_telegram_id');

      const healthSnapshot = {
        completed_at: nowIso,
        biometrics,
        answers,
        sleepOption,
        labStatus,
        labDetails,
        redFlagsCount: detectedRedFlags.length,
        redFlags: detectedRedFlags
      };

      const summaryText = detectedRedFlags.length > 0 
        ? `⚠️ Ограничения: ${detectedRedFlags.map(f => f.title).join(', ')}`
        : 'Противопоказаний и травм не зафиксировано (норма)';

      const updatePayload = {
        health_questionnaire_completed: true,
        health_completed_at: nowIso,
        health_data: healthSnapshot,
        health_notes: summaryText,
        injury_notes: summaryText,
        age: Number(biometrics.age) || userProfile?.age,
        height: Number(biometrics.height) || userProfile?.height,
        weight: Number(biometrics.weight) || userProfile?.weight
      };

      if (userProfile?.id) {
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userProfile.id);
      } else if (tgId) {
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('telegram_id', tgId);
      }

      try {
        const saved = localStorage.getItem('gymconnect_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('gymconnect_user_profile', JSON.stringify({ ...parsed, ...updatePayload }));
        }
      } catch (e) {}

      // Оповещение тренера в Telegram
      const coachTgId = trainerProfile?.telegram_id;
      if (coachTgId) {
        const athleteName = `${userProfile?.first_name || 'Атлет'} ${userProfile?.last_name || ''}`.trim();
        const redFlagsWarning = detectedRedFlags.length > 0 
          ? `\n\n🚨 <b>Выявлено факторов риска: ${detectedRedFlags.length}</b>\n${detectedRedFlags.map(f => `• ${escapeHtml(f.title)}: ${escapeHtml(f.details || 'да')}`).join('\n')}`
          : '\n\n✅ <i>Травм и критических ограничений не выявлено (норма).</i>';

        const coachMsg = `🩺 <b>Атлет заполнил медицинскую анкету PAR-Q!</b>\n\nПодопечный: <b>${escapeHtml(athleteName)}</b> (@${escapeHtml(userProfile?.username || 'нет')})${redFlagsWarning}\n\nПолное досье открывается в CoachOS CRM.`;
        sendTelegramMessage(coachTgId, coachMsg).catch(() => {});
      }

      if (onComplete) {
        onComplete(healthSnapshot);
      }
      onBack();
    } catch (err) {
      console.warn('Ошибка сохранения анкеты здоровья:', err);
      alert('Данные сохранены локально.');
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Bone': return <Bone className="w-4 h-4 stroke-[2.2]" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 stroke-[2.2]" />;
      case 'Activity': return <Activity className="w-4 h-4 stroke-[2.2]" />;
      case 'Pill': return <Pill className="w-4 h-4 stroke-[2.2]" />;
      default: return <FileText className="w-4 h-4 stroke-[2.2]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-100 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* 1. ШАПКА APPLE LIGHT C ПРОГРЕСС-БАРОМ */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevStep}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Медицинская анкета PAR-Q
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Шаг {currentStep + 1} из {HEALTH_CATEGORIES.length} • {currentCategory.title}
            </p>
          </div>

          <div className="w-9 text-right font-mono text-[11px] font-bold text-blue-600">
            {Math.round(((currentStep + 1) / HEALTH_CATEGORIES.length) * 100)}%
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="max-w-md mx-auto mt-2.5 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / HEALTH_CATEGORIES.length) * 100}%` }}
          />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">

        {/* Карточка текущей категории */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            {getCategoryIcon(currentCategory.icon)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-extrabold text-neutral-900 leading-tight">
              {currentCategory.title}
            </h2>
            <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">
              {currentCategory.subtitle}
            </p>
          </div>
        </div>

        {/* Шаг 1: быстрая верификация возраста, роста и веса */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Антропометрия на старте
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Проверьте данные</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-[9.5px] font-medium text-neutral-400 block">Возраст</span>
                <input
                  type="number"
                  value={biometrics.age}
                  onChange={e => setBiometrics({ ...biometrics, age: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-neutral-900 bg-transparent outline-none mt-0.5"
                />
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-[9.5px] font-medium text-neutral-400 block">Рост (см)</span>
                <input
                  type="number"
                  value={biometrics.height}
                  onChange={e => setBiometrics({ ...biometrics, height: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-neutral-900 bg-transparent outline-none mt-0.5"
                />
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-center">
                <span className="text-[9.5px] font-medium text-neutral-400 block">Вес (кг)</span>
                <input
                  type="number"
                  value={biometrics.weight}
                  onChange={e => setBiometrics({ ...biometrics, weight: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-neutral-900 bg-transparent outline-none mt-0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Вопросы текущей категории */}
        <div className="space-y-3">
          {questionsForCurrentStep.map((q) => {
            // Специальный виджет для анализов крови
            if (q.isLabSpecial) {
              return (
                <div key={q.id} className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-neutral-900 leading-tight">
                      {q.title}
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">
                      {q.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: 'not_taken', label: 'Не сдавал (хочу получить памятку от тренера)' },
                      { id: 'taken_normal', label: 'Сдавал недавно, все показатели в норме' },
                      { id: 'taken_issues', label: 'Сдавал, были отклонения (ферритин / вит. D / ТТГ)' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLabStatus(opt.id)}
                        className={`w-full p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          labStatus === opt.id
                            ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs font-bold'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="leading-snug">{opt.label}</span>
                        {labStatus === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>

                  {labStatus === 'taken_issues' && (
                    <div className="pt-1 animate-in fade-in">
                      <label className="text-[10px] font-semibold text-neutral-500 block mb-1">
                        Какие показатели были ниже или выше нормы:
                      </label>
                      <input
                        type="text"
                        value={labDetails}
                        onChange={e => setLabDetails(e.target.value)}
                        placeholder="Например: ферритин 14 (низкий), витамин D 18 нг/мл..."
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            }

            // Специальный виджет для сна
            if (q.isSleepSpecial) {
              return (
                <div key={q.id} className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-neutral-900 leading-tight">
                      {q.title}
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">
                      {q.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'less_6', label: '< 6 часов', sub: 'Дефицит сна' },
                      { id: '7_8', label: '7–8 часов', sub: 'Оптимум' },
                      { id: 'more_8', label: '> 8 часов', sub: 'Полный отдых' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSleepOption(item.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          sleepOption === item.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className={`text-[9.5px] block mt-0.5 ${sleepOption === item.id ? 'text-blue-100' : 'text-neutral-400'}`}>
                          {item.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            const currentAnswer = answers[q.id] || { hasIssue: false, details: '' };

            return (
              <div 
                key={q.id} 
                className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-3 ${
                  currentAnswer.hasIssue 
                    ? (q.isRedFlag ? 'border-red-300 bg-red-50/15' : 'border-blue-300 bg-blue-50/15')
                    : 'border-neutral-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-extrabold text-neutral-900 leading-tight">
                        {q.title}
                      </h3>
                      {q.isRedFlag && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-md">
                          PAR-Q
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-snug">
                      {q.description}
                    </p>
                  </div>
                </div>

                {/* Переключатель: Нет / Да */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectHasIssue(q.id, false)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !currentAnswer.hasIssue
                        ? 'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-2xs'
                        : 'bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Нет, в норме</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectHasIssue(q.id, true)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentAnswer.hasIssue
                        ? (q.isRedFlag ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-blue-600 text-white border-blue-600 shadow-xs')
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Да, есть нюансы</span>
                  </button>
                </div>

                {/* Динамическое поле ввода подробностей при выборе "Да" */}
                {currentAnswer.hasIssue && (
                  <div className="pt-1 space-y-1 animate-in fade-in">
                    <label className="text-[10px] font-bold text-neutral-600 block">
                      Опишите подробнее для наставника <span className="text-red-500">*</span>:
                    </label>
                    <textarea
                      rows={2}
                      value={currentAnswer.details}
                      onChange={e => handleUpdateDetails(q.id, e.target.value)}
                      placeholder={q.promptPlaceholder || 'Опишите диагноз, характер боли или ограничения...'}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-neutral-800 outline-none focus:border-blue-600 leading-relaxed resize-none shadow-2xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={!canProceedCurrentStep || isSubmitting}
            onClick={handleNextStep}
            className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              canProceedCurrentStep
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-98 cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            {currentStep < HEALTH_CATEGORIES.length - 1 ? (
              <>
                <span>Следующий раздел: {HEALTH_CATEGORIES[currentStep + 1]?.title}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Сохранение анкеты...' : 'Отправить анкету здоровья тренеру'}</span>
              </>
            )}
          </button>
        </div>
      </footer>

    </div>
  );
}
