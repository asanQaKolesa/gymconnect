// src/components/profile/ClientRulesAgreementModal.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Clock, 
  Calendar, 
  Snowflake, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { 
  DEFAULT_TRAINER_RULES, 
  generateRulesFullText 
} from '../../data/defaultTrainerRules';

export default function ClientRulesAgreementModal({ 
  isOpen, 
  onClose, 
  trainerName = 'Ваш тренер',
  trainerRules = DEFAULT_TRAINER_RULES,
  userProfile,
  onAgreementSuccess
}) {
  const [showFullText, setShowFullText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3 интерактивных чекбокса осознанного согласия
  const [agreements, setAgreements] = useState({
    cancellation: false,
    validity: false,
    latePolicy: false
  });

  if (!isOpen) return null;

  const r = { ...DEFAULT_TRAINER_RULES, ...trainerRules };
  const allChecked = agreements.cancellation && agreements.validity && agreements.latePolicy;
  const fullText = generateRulesFullText(r, trainerName);

  const toggleAgreement = (key) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmAgreement = async () => {
    if (!allChecked) return;
    setIsSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const tgId = userProfile?.telegram_id || localStorage.getItem('gymconnect_telegram_id');

      const payload = {
        rules_accepted: true,
        rules_accepted_at: nowIso,
        rules_snapshot: r
      };

      if (userProfile?.id) {
        await supabase
          .from('profiles')
          .update(payload)
          .eq('id', userProfile.id);
      } else if (tgId) {
        await supabase
          .from('profiles')
          .update(payload)
          .eq('telegram_id', tgId);
      }

      // Обновляем локальное хранилище
      try {
        const saved = localStorage.getItem('gymconnect_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('gymconnect_user_profile', JSON.stringify({ ...parsed, ...payload }));
        }
      } catch (e) {}

      if (onAgreementSuccess) {
        onAgreementSuccess(payload);
      }
      onClose();
    } catch (err) {
      console.warn('Ошибка сохранения согласия:', err);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-100 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Правила тренировок
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              Наставник: {trainerName}
            </p>
          </div>

          <div className="w-9" />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ ОБЛАСТЬ УСЛОВИЙ */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5">
        
        {/* Приветственный баннер */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-900">
            Регламент персонального ведения
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Для эффективных тренировок и уважения времени наставника подтвердите правила взаимодействия.
          </p>
        </div>

        {/* Сетка ключевых условий */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          
          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Отмена
            </span>
            <span className="text-base font-extrabold font-mono text-blue-600 mt-1 block">
              за {r.cancellationHoursLimit} ч
            </span>
            <span className="text-[9.5px] text-neutral-400 block mt-0.5">без сгорания</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Срок блока
            </span>
            <span className="text-base font-extrabold font-mono text-blue-600 mt-1 block">
              {r.packageValidityDays} дн.
            </span>
            <span className="text-[9.5px] text-neutral-400 block mt-0.5">на отработку</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Заморозка
            </span>
            <span className="text-base font-extrabold font-mono text-blue-600 mt-1 block">
              до {r.freezeMaxDays} дн.
            </span>
            <span className="text-[9.5px] text-neutral-400 block mt-0.5">1 раз за блок</span>
          </div>

        </div>

        {/* 3 интерактивных чекбокса подтверждения */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
          <span className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block border-b border-neutral-100 pb-2">
            Подтвердите ознакомление:
          </span>

          {/* Пункт 1 */}
          <div 
            onClick={() => toggleAgreement('cancellation')}
            className="flex items-start gap-3 p-2 rounded-2xl hover:bg-neutral-50 active:scale-98 transition-all cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
              agreements.cancellation ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-neutral-300'
            }`}>
              {agreements.cancellation && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="min-w-0 flex-1 leading-snug">
              <span className="text-xs font-bold text-neutral-900 block">
                Отмена не менее чем за {r.cancellationHoursLimit} часа
              </span>
              <span className="text-[10.5px] text-neutral-500">
                При более поздней отмене занятие считается проведенным и списывается с абонемента.
              </span>
            </div>
          </div>

          {/* Пункт 2 */}
          <div 
            onClick={() => toggleAgreement('validity')}
            className="flex items-start gap-3 p-2 rounded-2xl hover:bg-neutral-50 active:scale-98 transition-all cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
              agreements.validity ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-neutral-300'
            }`}>
              {agreements.validity && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="min-w-0 flex-1 leading-snug">
              <span className="text-xs font-bold text-neutral-900 block">
                Срок действия абонемента — {r.packageValidityDays} дней
              </span>
              <span className="text-[10.5px] text-neutral-500">
                Предоставляется 1 бесплатная заморозка до {r.freezeMaxDays} дней по предварительному согласованию.
              </span>
            </div>
          </div>

          {/* Пункт 3 */}
          <div 
            onClick={() => toggleAgreement('latePolicy')}
            className="flex items-start gap-3 p-2 rounded-2xl hover:bg-neutral-50 active:scale-98 transition-all cursor-pointer"
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
              agreements.latePolicy ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-neutral-300'
            }`}>
              {agreements.latePolicy && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="min-w-0 flex-1 leading-snug">
              <span className="text-xs font-bold text-neutral-900 block">
                Пунктуальность и перерасчет возвратов
              </span>
              <span className="text-[10.5px] text-neutral-500">
                Опоздание сокращает время текущей тренировки; при досрочном возврате пройденные занятия пересчитываются по разовому тарифу.
              </span>
            </div>
          </div>

        </div>

        {/* Разворачиваемый блок полного текста соглашения */}
        <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2">
          <button
            type="button"
            onClick={() => setShowFullText(!showFullText)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-800 cursor-pointer active:scale-98 transition-transform"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Полный юридический текст регламента</span>
            </span>
            {showFullText ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {showFullText && (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-[10.5px] text-neutral-600 font-mono leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto animate-in fade-in">
              {fullText}
            </div>
          )}
        </div>

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg shrink-0">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={!allChecked || isSubmitting}
            onClick={handleConfirmAgreement}
            className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              allChecked 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-98 cursor-pointer' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting ? 'Сохранение согласия...' : allChecked ? 'Подтвердить и начать тренировки' : 'Отметьте все 3 пункта выше'}
            </span>
          </button>
        </div>
      </footer>

    </div>
  );
}
