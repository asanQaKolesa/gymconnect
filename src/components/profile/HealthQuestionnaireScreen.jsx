// src/components/profile/HealthQuestionnaireScreen.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  HeartPulse, 
  Activity, 
  Bone, 
  Pill, 
  AlertCircle, 
  ChevronRight, 
  Send, 
  ShieldCheck, 
  Info,
  Sparkles,
  AlertTriangle
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

  // Стартовая антропометрия
  const [biometrics, setBiometrics] = useState({
    age: String(userProfile?.age || '25'),
    height: String(userProfile?.height || '178'),
    weight: String(userProfile?.weight || userProfile?.current_weight || '75')
  });

  // Ответы: { [questionId]: { hasIssue: boolean, selectedSymptoms: string[], details: string } }
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    DEFAULT_HEALTH_QUESTIONS.forEach(q => {
      initial[q.id] = { hasIssue: false, selectedSymptoms: [], details: '' };
    });
    (customQuestions || []).forEach((cq, idx) => {
      initial[`custom_${idx}`] = { hasIssue: false, selectedSymptoms: [], details: '' };
    });
    return initial;
  });

  // Сон и лабораторные анализы
  const [sleepOption, setSleepOption] = useState('7_8'); // 'less_6' | '7_8' | 'more_8'
  const [labStatus, setLabStatus] = useState('not_taken'); // 'not_taken' | 'taken_normal' | 'taken_issues'
  const [labDetails, setLabDetails] = useState('');

  const currentCategory = HEALTH_CATEGORIES[currentStep];

  const questionsForCurrentStep = useMemo(() => {
    const list = DEFAULT_HEALTH_QUESTIONS.filter(q => q.category === currentCategory.id);
    if (currentCategory.id === 'lifestyle' && customQuestions?.length > 0) {
      customQuestions.forEach((cq, idx) => {
        list.push({
          id: `custom_${idx}`,
          category: 'lifestyle',
          question: typeof cq === 'string' ? cq : cq.title || 'Дополнительный вопрос наставника',
          title: 'Индивидуальный вопрос тренера',
          whyItMatters: 'Вопрос сформулирован вашим наставником для точной адаптации тренировок под ваши цели.',
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
        selectedSymptoms: hasIssue ? prev[questionId]?.selectedSymptoms || [] : [],
        details: hasIssue ? prev[questionId]?.details || '' : ''
      }
    }));
  };

  const toggleSymptom = (questionId, symptom) => {
    setAnswers(prev => {
      const curList = prev[questionId]?.selectedSymptoms || [];
      const updated = curList.includes(symptom)
        ? curList.filter(s => s !== symptom)
        : [...curList, symptom];

      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedSymptoms: updated
        }
      };
    });
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

  // Валидация: если выбрано "Да, есть нюансы", должны быть отмечены симптомы либо написано пояснение
  const canProceedCurrentStep = useMemo(() => {
    for (const q of questionsForCurrentStep) {
      if (q.isSleepSpecial || q.isLabSpecial) continue;
      const ans = answers[q.id];
      if (ans?.hasIssue) {
        const hasSymptoms = (ans.selectedSymptoms || []).length > 0;
        const hasText = ans.details && ans.details.trim().length >= 2;
        if (!hasSymptoms && !hasText) {
          return false;
        }
      }
    }
    return true;
  }, [questionsForCurrentStep, answers]);

  // Расчет красных флагов
  const detectedRedFlags = useMemo(() => {
    const flags = [];
    DEFAULT_HEALTH_QUESTIONS.forEach(q => {
      if (q.isRedFlag && answers[q.id]?.hasIssue) {
        flags.push({
          id: q.id,
          title: q.title,
          riskHint: q.riskHint,
          symptoms: answers[q.id]?.selectedSymptoms || [],
          details: answers[q.id]?.details || ''
        });
      }
    });
    return flags;
  }, [answers]);

  const handleNextStep = () => {
    if (!canProceedCurrentStep || isSubmitting) return;

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
          ? `\n\n🚨 <b>Выявлено факторов риска: ${detectedRedFlags.length}</b>\n${detectedRedFlags.map(f => `• <b>${escapeHtml(f.title)}:</b> ${escapeHtml(f.symptoms.join(', ') || f.details || 'да')}`).join('\n')}`
          : '\n\n✅ <i>Травм и критических ограничений не выявлено (норма).</i>';

        const coachMsg = `🩺 <b>Атлет заполнил медицинскую анкету PAR-Q!</b>\n\nПодопечный: <b>${escapeHtml(athleteName)}</b> (@${escapeHtml(userProfile?.username || 'нет')})${redFlagsWarning}\n\nПолное досье открыто в CoachOS CRM.`;
        sendTelegramMessage(coachTgId, coachMsg).catch(() => {});
      }

      if (onComplete) {
        onComplete(healthSnapshot);
      }
      onBack();
    } catch (err) {
      console.warn('Ошибка сохранения анкеты здоровья:', err);
      alert('Данные сохранены.');
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
      default: return <Activity className="w-4 h-4 stroke-[2.2]" />;
    }
  };

  const isLastStep = currentStep === HEALTH_CATEGORIES.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-[#F2F2F7] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200 h-[100dvh]">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevStep}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-slate-200/60 shrink-0"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-slate-900 tracking-tight truncate">
              Медицинский скрининг PAR-Q
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Шаг {currentStep + 1} из {HEALTH_CATEGORIES.length} • {currentCategory.title}
            </p>
          </div>

          <button
            type="button"
            disabled={!canProceedCurrentStep || isSubmitting}
            onClick={handleNextStep}
            className={`h-9 px-3 rounded-2xl font-extrabold text-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              canProceedCurrentStep
                ? 'bg-blue-600 text-white shadow-xs active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{isLastStep ? 'Готово' : 'Далее'}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Прогресс-бар */}
        <div className="max-w-md mx-auto mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / HEALTH_CATEGORIES.length) * 100}%` }}
          />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ ОБЛАСТЬ */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5 pb-10">

        {/* ВАЖНЕЙШАЯ ПАМЯТКА ДОВЕРИЯ И ЭТИКИ (ПОКАЗЫВАЕТСЯ НА 1-М ШАГЕ) */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl p-4 border border-blue-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-tight">
                  Безопасность и квалификация тренера
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">Почему мы запрашиваем эти данные?</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-blue-950 leading-relaxed space-y-1.5">
              <p>
                Ваше здоровье и безопасность — <b>абсолютный приоритет</b>. Силовые тренировки в тренажерном зале многократно усиливают давление на позвоночник и сердечно-сосудистую систему.
              </p>
              <p>
                На основе этой анкеты тренер видит ваш точный статус и определяет:
                <br />• Достаточна ли его тренерская квалификация для работы с вашими особенностями;
                <br />• Нужна ли консультация спортивного врача/ЛФК перед выходом на помост;
                <br />• Какие биомеханические углы и рабочие веса гарантируют прогресс без травм.
              </p>
              <p className="text-[10.5px] text-blue-800 font-semibold pt-0.5">
                Пожалуйста, отвечайте максимально искренне — даже давняя травма имеет решающее значение.
              </p>
            </div>
          </div>
        )}

        {/* Шапка текущей категории */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              {getCategoryIcon(currentCategory.icon)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 leading-tight">
                {currentCategory.title}
              </h2>
              <p className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">
                {currentCategory.subtitle}
              </p>
            </div>
          </div>

          <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shrink-0">
            {currentCategory.badge}
          </span>
        </div>

        {/* Антропометрия на старте (только на шаге 1) */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Стартовые биометрические параметры
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Проверьте точность</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-[9.5px] font-medium text-slate-400 block">Возраст</span>
                <input
                  type="number"
                  value={biometrics.age}
                  onChange={e => setBiometrics({ ...biometrics, age: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-slate-900 bg-transparent outline-none mt-0.5"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-[9.5px] font-medium text-slate-400 block">Рост (см)</span>
                <input
                  type="number"
                  value={biometrics.height}
                  onChange={e => setBiometrics({ ...biometrics, height: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-slate-900 bg-transparent outline-none mt-0.5"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                <span className="text-[9.5px] font-medium text-slate-400 block">Вес (кг)</span>
                <input
                  type="number"
                  value={biometrics.weight}
                  onChange={e => setBiometrics({ ...biometrics, weight: e.target.value })}
                  className="w-full text-center text-xs font-mono font-bold text-slate-900 bg-transparent outline-none mt-0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* СПИСОК ГЛУБОКИХ ВОПРОСОВ */}
        <div className="space-y-3.5">
          {questionsForCurrentStep.map((q) => {
            // Специальный виджет для анализов крови
            if (q.isLabSpecial) {
              return (
                <div key={q.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[10.5px] text-blue-900 leading-snug mt-1.5">
                      💡 <b>Почему это важно:</b> {q.whyItMatters}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: 'not_taken', label: 'Не сдавал (хочу получить памятку от тренера)' },
                      { id: 'taken_normal', label: 'Сдавал недавно, все показатели в норме' },
                      { id: 'taken_issues', label: 'Сдавал, были отклонения (ферритин, вит. D, печень, ТТГ)' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLabStatus(opt.id)}
                        className={`w-full p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          labStatus === opt.id
                            ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="leading-snug">{opt.label}</span>
                        {labStatus === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />}
                      </button>
                    ))}
                  </div>

                  {labStatus === 'taken_issues' && (
                    <div className="pt-1 animate-in fade-in space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 block">
                        Какие показатели отклонены от нормы:
                      </label>
                      <input
                        type="text"
                        value={labDetails}
                        onChange={e => setLabDetails(e.target.value)}
                        placeholder="Например: ферритин 16 (низкий), витамин D 19 нг/мл..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            }

            // Специальный виджет для сна
            if (q.isSleepSpecial) {
              return (
                <div key={q.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[10.5px] text-blue-900 leading-snug mt-1.5">
                      💡 <b>Почему это важно:</b> {q.whyItMatters}
                    </div>
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
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className={`text-[9.5px] block mt-0.5 ${sleepOption === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            const currentAnswer = answers[q.id] || { hasIssue: false, selectedSymptoms: [], details: '' };

            return (
              <div 
                key={q.id} 
                className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-3 ${
                  currentAnswer.hasIssue 
                    ? (q.isRedFlag ? 'border-red-300 bg-red-50/15' : 'border-blue-300 bg-blue-50/15')
                    : 'border-slate-200/80'
                }`}
              >
                {/* Заголовок и прямой медицинский вопрос */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {q.title}
                    </span>
                    {q.isRedFlag && (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-md">
                        Фактор риска (PAR-Q)
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>

                  {q.whyItMatters && (
                    <p className="text-[10.5px] text-slate-500 leading-snug pt-0.5">
                      💡 <b>Зачем наставнику знать:</b> {q.whyItMatters}
                    </p>
                  )}
                </div>

                {/* Переключатель: Нет / Да */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectHasIssue(q.id, false)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      !currentAnswer.hasIssue
                        ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Нет, в полной норме</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectHasIssue(q.id, true)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentAnswer.hasIssue
                        ? (q.isRedFlag ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-blue-600 text-white border-blue-600 shadow-xs')
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Да, есть диагноз / симптомы</span>
                  </button>
                </div>

                {/* ДИНАМИЧЕСКИЙ БЛОК ЧИПСОВ СИМПТОМОВ ПРИ ВЫБОРЕ «ДА» */}
                {currentAnswer.hasIssue && (
                  <div className="pt-2 space-y-2.5 animate-in fade-in border-t border-slate-100">
                    
                    {/* Список симптомов для выбора в 1 клик */}
                    {q.symptomsList && q.symptomsList.length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1.5">
                          Отметьте симптомы и проявления (можно несколько):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {q.symptomsList.map((symptom, sIdx) => {
                            const isSelected = (currentAnswer.selectedSymptoms || []).includes(symptom);
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => toggleSymptom(q.id, symptom)}
                                className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all border cursor-pointer leading-tight ${
                                  isSelected 
                                    ? 'bg-red-100 text-red-900 border-red-300 shadow-2xs font-bold' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {symptom}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Поле подробных рекомендаций лечащего врача */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 block">
                        Что конкретно запретил или рекомендовал врач <span className="text-red-500">*</span>:
                      </label>
                      <textarea
                        rows={2}
                        value={currentAnswer.details}
                        onChange={e => handleUpdateDetails(q.id, e.target.value)}
                        placeholder={q.promptPlaceholder || 'Опишите диагноз, характер боли или ограничения...'}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 leading-relaxed resize-none shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР (Z-[100]) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={!canProceedCurrentStep || isSubmitting}
            onClick={handleNextStep}
            className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              canProceedCurrentStep
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isLastStep ? (
              <>
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Сохранение анкеты...' : 'Отправить медицинскую анкету тренеру'}</span>
              </>
            ) : (
              <>
                <span>Далее: {HEALTH_CATEGORIES[currentStep + 1]?.title}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </footer>

    </div>
  );
}
