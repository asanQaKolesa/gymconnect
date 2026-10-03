// src/components/trainer/components/modals/TrainerClientRulesModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  X, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Snowflake, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../../../supabaseClient';
import { 
  DEFAULT_TRAINER_RULES, 
  CANCELLATION_HOURS_OPTIONS, 
  FREEZE_DAYS_OPTIONS, 
  VALIDITY_DAYS_OPTIONS,
  generateRulesFullText 
} from '../../../../data/defaultTrainerRules';
import { sendStudentNotification } from '../../../../utils/telegramNotifications';

export default function TrainerClientRulesModal({ 
  isOpen, 
  onClose, 
  coachName = 'Тренер',
  cleanUsername = 'coach',
  selectedStudent = null
}) {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'text'
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Стейт конфигурации регламента
  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem(`gymconnect_rules_${cleanUsername}`);
      if (saved) return { ...DEFAULT_TRAINER_RULES, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_TRAINER_RULES;
  });

  // Загрузка сохраненных настроек из Supabase
  useEffect(() => {
    async function loadTrainerRules() {
      if (!cleanUsername || cleanUsername === 'coach') return;
      try {
        const { data } = await supabase
          .from('trainer_profiles')
          .select('client_rules')
          .or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`)
          .maybeSingle();

        if (data?.client_rules && typeof data.client_rules === 'object') {
          setRules(prev => ({ ...prev, ...data.client_rules }));
        }
      } catch (err) {
        console.warn('Загрузка правил тренера:', err);
      }
    }

    if (isOpen) {
      loadTrainerRules();
    }
  }, [isOpen, cleanUsername]);

  if (!isOpen) return null;

  const fullText = generateRulesFullText(rules, coachName);
  const botLink = `https://t.me/gymconnect_ala_bot?start=rules_${cleanUsername}`;

  // Сохранение параметров правил
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setStatusFeedback(null);
    try {
      localStorage.setItem(`gymconnect_rules_${cleanUsername}`, JSON.stringify(rules));

      if (cleanUsername && cleanUsername !== 'coach') {
        await supabase
          .from('trainer_profiles')
          .update({ client_rules: rules })
          .or(`username.ilike.${cleanUsername},username.ilike.@${cleanUsername}`);
      }

      setStatusFeedback({ type: 'success', text: 'Параметры регламента успешно сохранены' });
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      setStatusFeedback({ type: 'error', text: 'Ошибка сохранения: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Копирование текста регламента
  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Отправка атлету в Telegram
  const handleSendToStudent = async () => {
    if (!selectedStudent) {
      handleCopyLink();
      alert('Текст регламента скопирован в буфер обмена! Отправьте его атлету в чат.');
      return;
    }

    setIsSending(true);
    setStatusFeedback(null);

    const message = `📋 <b>Регламент тренировок от наставника (${coachName})</b>\n\n` +
      `Пожалуйста, ознакомьтесь с правилами посещения, отмен и заморозки:\n` +
      `• Отмена без списания: не менее чем за <b>${rules.cancellationHoursLimit} ч</b>\n` +
      `• Срок действия абонемента: <b>${rules.packageValidityDays} дней</b>\n` +
      `• Допустимая заморозка: <b>${rules.freezeMaxDays} дней</b>\n\n` +
      `Откройте приложение для подтверждения регламента.`;

    try {
      const res = await sendStudentNotification({
        studentTelegramId: selectedStudent.telegram_id,
        studentUsername: selectedStudent.username || selectedStudent.telegram_username,
        studentId: selectedStudent.id,
        title: 'Регламент посещения тренировок',
        message
      });

      if (res?.ok) {
        setStatusFeedback({ type: 'success', text: 'Регламент успешно отправлен атлету в Telegram!' });
      } else {
        handleCopyLink();
        setStatusFeedback({ type: 'info', text: 'Текст скопирован. Отправьте его напрямую в личный диалог.' });
      }
    } catch (e) {
      handleCopyLink();
      setStatusFeedback({ type: 'info', text: 'Текст скопирован в буфер обмена.' });
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusFeedback(null), 4000);
    }
  };

  const isAcceptedByStudent = selectedStudent?.rules_accepted === true;
  const acceptedDate = selectedStudent?.rules_accepted_at 
    ? new Date(selectedStudent.rules_accepted_at).toLocaleDateString('ru-RU') 
    : null;

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
              Регламент для атлетов
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Client Agreement & Cancellation Policy
            </p>
          </div>

          <div className="w-9" />
        </div>

        {/* Переключатель вкладок Apple Segmented Control */}
        <div className="max-w-md mx-auto mt-2.5 grid grid-cols-2 p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Параметры</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Текст регламента</span>
          </button>
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">
        
        {/* Статус-фидбек */}
        {statusFeedback && (
          <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xs ${
            statusFeedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusFeedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusFeedback.text}</span>
          </div>
        )}

        {/* Статус подтверждения текущим атлетом (если открыто из досье) */}
        {selectedStudent && (
          <div className="bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isAcceptedByStudent ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {isAcceptedByStudent ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-neutral-900 block truncate">
                  {selectedStudent.full_name || selectedStudent.first_name || 'Атлет'}
                </span>
                <span className="text-[10px] text-neutral-400 block truncate">
                  {isAcceptedByStudent 
                    ? `Принят атлетом ${acceptedDate ? `(${acceptedDate})` : ''}` 
                    : 'Ожидает подтверждения'}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              isAcceptedByStudent 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isAcceptedByStudent ? 'Согласован' : 'Не подписан'}
            </span>
          </div>
        )}

        {/* ================= ВКЛАДКА 1: ПАРАМЕТРЫ ПРАВИЛ ================= */}
        {activeTab === 'config' && (
          <div className="space-y-3">
            
            {/* Карточка 1: Дедлайн отмены */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      Бесплатная отмена тренировки
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 font-normal">
                      Минимум за сколько часов предупреждать
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  {rules.cancellationHoursLimit} ч
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {CANCELLATION_HOURS_OPTIONS.map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setRules({ ...rules, cancellationHoursLimit: hours })}
                    className={`py-2 rounded-xl text-xs font-extrabold font-mono transition-all border cursor-pointer ${
                      rules.cancellationHoursLimit === hours
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {hours} ч
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400 leading-snug">
                Если атлет отменит занятие позже этого времени, оно автоматически считается проведенным и списывается.
              </p>
            </div>

            {/* Карточка 2: Срок действия абонемента */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      Срок сгорания абонемента
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 font-normal">
                      Период на отработку блока тренировок
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  {rules.packageValidityDays} дн.
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {VALIDITY_DAYS_OPTIONS.map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRules({ ...rules, packageValidityDays: days })}
                    className={`py-2 rounded-xl text-xs font-extrabold font-mono transition-all border cursor-pointer ${
                      rules.packageValidityDays === days
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {days} дн
                  </button>
                ))}
              </div>
            </div>

            {/* Карточка 3: Заморозка абонемента */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Snowflake className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      Лимит дней заморозки
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 font-normal">
                      Пауза по болезни или отпуску (1 раз за блок)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  {rules.freezeMaxDays} дн.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {FREEZE_DAYS_OPTIONS.map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRules({ ...rules, freezeMaxDays: days })}
                    className={`py-2 rounded-xl text-xs font-extrabold font-mono transition-all border cursor-pointer ${
                      rules.freezeMaxDays === days
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {days === 0 ? 'Без заморозки' : `${days} дней`}
                  </button>
                ))}
              </div>
            </div>

            {/* Карточка 4: Стоимость разовой для возврата */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      Разовый тариф для возвратов (₸)
                    </h3>
                    <p className="text-[10.5px] text-neutral-400 font-normal">
                      Перерасчет пройденных тренировок при возврате
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="500"
                  value={rules.singleSessionPrice}
                  onChange={e => setRules({ ...rules, singleSessionPrice: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-extrabold text-neutral-900 outline-none focus:border-blue-600 focus:bg-white"
                  placeholder="7000"
                />
              </div>
              <p className="text-[10px] text-neutral-400">
                Защищает тренера от ситуации, когда атлет отходил 2 тренировки со скидкой опта и требует возврат.
              </p>
            </div>

            {/* Карточка 5: Индивидуальные заметки тренера */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                Индивидуальные правила и пожелания
              </h3>
              <textarea
                rows={3}
                value={rules.customNotes}
                onChange={e => setRules({ ...rules, customNotes: e.target.value })}
                placeholder="Например: чистая сменная обувь обязательна, полотенце на тренажер..."
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 outline-none focus:border-blue-600 focus:bg-white resize-none leading-relaxed"
              />
            </div>

          </div>
        )}

        {/* ================= ВКЛАДКА 2: ГОТОВЫЙ ТЕКСТ РЕГЛАМЕНТА ================= */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Текст договора-регламента
                </span>
                <span className="text-[10px] text-blue-600 font-semibold font-mono">
                  Готов к отправке
                </span>
              </div>

              <div className="p-3.5 bg-neutral-50/80 rounded-2xl border border-neutral-200/60 font-mono text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
                {fullText}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР (НЕ СЪЕЗЖАЕТ ПРИ СКРОЛЛЕ) */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          
          <button
            type="button"
            disabled={isSaving}
            onClick={activeTab === 'config' ? handleSaveConfig : handleCopyLink}
            className="py-3 px-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-neutral-200/80 shadow-2xs truncate"
          >
            {activeTab === 'config' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
              </>
            ) : (
              <>
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Скопировано!' : 'Копировать'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendToStudent}
            className="py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-600/25 truncate"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Отправка...' : 'Отправить в TG'}</span>
          </button>

        </div>
      </footer>

    </div>
  );
}
