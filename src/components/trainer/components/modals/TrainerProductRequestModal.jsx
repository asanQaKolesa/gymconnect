// src/components/trainer/components/modals/TrainerProductRequestModal.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import { supabase } from '../../../../supabaseClient';
import { sendTelegramMessage, escapeHtml } from '../../../../utils/telegramNotifications';
import { DIGITAL_PRODUCT_TYPES } from '../../../../data/digitalProductsConfig';

export default function TrainerProductRequestModal({ 
  isOpen, 
  onClose, 
  initialType = 'checklist',
  trainer 
}) {
  const [productType, setProductType] = useState(initialType);
  const [topic, setTopic] = useState('');
  const [targetPrice, setTargetPrice] = useState('4990');
  const [materialsReadiness, setMaterialsReadiness] = useState('notes'); // 'ready' | 'notes' | 'voice'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCoachUsername = (trainer?.username || '').replace(/[@\s]/g, '');
  const currentCoachPhone = trainer?.phone || '';
  const currentCoachName = trainer?.full_name || `${trainer?.first_name || 'Тренер'} ${trainer?.last_name || ''}`.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert('Укажите примерную тему или рабочее название продукта');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTypeObj = DIGITAL_PRODUCT_TYPES.find(p => p.id === productType) || DIGITAL_PRODUCT_TYPES[0];

      const readinessText = 
        materialsReadiness === 'ready' ? 'Есть готовый черновик текста' :
        materialsReadiness === 'notes' ? 'Есть наброски и заметки' : 'Нужно упаковать по моим голосовым сообщениям';

      const payload = {
        trainer_id: trainer?.id || null,
        trainer_username: currentCoachUsername,
        trainer_name: currentCoachName,
        trainer_phone: currentCoachPhone,
        product_type: productType,
        product_type_name: selectedTypeObj.name,
        topic: topic.trim(),
        target_sale_price: Number(targetPrice) || 0,
        materials_readiness: readinessText,
        notes: notes.trim(),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Фиксация заявки в базе Supabase
      try {
        await supabase
          .from('trainer_product_requests')
          .insert([payload]);
      } catch (err) {
        console.warn('Сохранение заявки в Supabase (fallback режим):', err);
      }

      // Уведомление основателю / продюсеру в Telegram
      const FOUNDER_TG_ID = '8120357675';
      const tgMessage = `🚀 <b>Новая заявка на упаковку продукта в GymConnect Studio!</b>\n\n` +
        `Тренер: <b>${escapeHtml(currentCoachName)}</b> (@${escapeHtml(currentCoachUsername)})\n` +
        `Телефон: <code>+${escapeHtml(currentCoachPhone)}</code>\n\n` +
        `• Тип продукта: <b>${escapeHtml(selectedTypeObj.name)}</b>\n` +
        `• Тема: <i>«${escapeHtml(topic.trim())}»</i>\n` +
        `• Планируемый чек продажи: <b>${Number(targetPrice).toLocaleString()} ₸</b>\n` +
        `• Готовность: ${escapeHtml(readinessText)}\n` +
        (notes.trim() ? `• Комментарий: «${escapeHtml(notes.trim())}»` : '');

      sendTelegramMessage(FOUNDER_TG_ID, tgMessage).catch(() => {});

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      alert('Ошибка отправки заявки: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200 h-[100dvh]">
      
      {/* 1. ШАПКА APPLE LIGHT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 py-3 shadow-xs shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-neutral-200/60 shrink-0"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-extrabold text-neutral-900 tracking-tight truncate">
              Заявка на упаковку
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium truncate">
              GymConnect Launch Studio
            </p>
          </div>

          <div className="w-9" />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ ФОРМА */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3.5 pb-8">
        
        {submittedSuccess ? (
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs text-center space-y-2.5 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Заявка успешно принята!
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
              Продюсер команды GymConnect Studio свяжется с вами в Telegram <b>@{currentCoachUsername || 'аккаунт'}</b> в течение 2 часов для обсуждения деталей.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Выбор типа продукта */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                1. Тип цифрового продукта *
              </label>

              <div className="grid grid-cols-2 gap-2">
                {DIGITAL_PRODUCT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setProductType(t.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      productType === t.id
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs font-bold text-blue-900'
                        : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{t.shortName}</span>
                    <span className={`text-[10px] block mt-0.5 font-mono ${productType === t.id ? 'text-blue-700' : 'text-neutral-400'}`}>
                      от {t.packagingPrice.toLocaleString()} ₸
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Тема и цена продажи */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                2. Концепция и монетизация
              </label>

              <div>
                <span className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Примерная тема или идея продукта *
                </span>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Например: Гайд по сушке без потери мышц"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Планируемая цена продажи для клиентов (₸)
                </span>
                <input
                  type="number"
                  step="500"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                  placeholder="4990"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Степень готовности материалов */}
            <div className="bg-white rounded-3xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                3. Готовность ваших материалов
              </label>

              <div className="space-y-1.5">
                {[
                  { id: 'ready', label: 'Есть готовый текст / черновик' },
                  { id: 'notes', label: 'Есть мысли и тезисы в заметках телефона' },
                  { id: 'voice', label: 'Нужно написать с нуля по моим голосовым' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMaterialsReadiness(opt.id)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      materialsReadiness === opt.id
                        ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold shadow-2xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      materialsReadiness === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-neutral-300'
                    }`}>
                      {materialsReadiness === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[10.5px] font-semibold text-neutral-500 block mb-1">
                  Дополнительные пожелания к продюсеру (опционально):
                </span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Какие цели ставите, есть ли примеры дизайна..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Контакты заявителя */}
            <div className="bg-white rounded-3xl p-3.5 border border-neutral-200/80 shadow-xs flex items-center justify-between text-xs font-mono text-neutral-600">
              <div>
                <span className="text-[10px] text-neutral-400 font-sans block">Связь в Telegram:</span>
                <span className="font-bold text-blue-700">@{currentCoachUsername || 'не указан'}</span>
              </div>
              <span className="text-[10.5px] text-neutral-500 font-sans">Ответ за 2 часа</span>
            </div>

          </form>
        )}

      </main>

      {/* 3. ЖЕСТКО ЗАФИКСИРОВАННЫЙ НИЖНИЙ БАР */}
      {!submittedSuccess && (
        <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] shadow-lg shrink-0">
          <div className="max-w-md mx-auto">
            <button
              type="button"
              disabled={isSubmitting || !topic.trim()}
              onClick={handleSubmit}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Отправка заявки...' : 'Отправить заявку в GymConnect Studio'}</span>
            </button>
          </div>
        </footer>
      )}

    </div>
  );
}
