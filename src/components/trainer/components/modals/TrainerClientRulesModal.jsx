// src/components/trainer/components/modals/TrainerClientRulesModal.jsx
import React, { useState } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';

export default function TrainerClientRulesModal({ isOpen, onClose, coachName = 'Тренер' }) {
  const [isCopied, setIsCopied] = useState(false);
  const [rulesForm, setRulesForm] = useState({
    cancellation_hours: 3,
    expiry_days: 35,
    freeze_days: 7,
    late_policy: 'Опоздание клиента сокращает время тренировки на количество минут задержки.',
    custom_rule: 'Абонемент является персональным и не подлежит передаче третьим лицам без согласования.'
  });

  if (!isOpen) return null;

  const handleCopyRules = () => {
    const text = `📌 Регламент посещения персональных тренировок (${coachName}):
1. Отмена или перенос: не менее чем за ${rulesForm.cancellation_hours} часа до начала (иначе занятие сгорает).
2. Срок действия блока занятий: ${rulesForm.expiry_days} дней.
3. Допустимая заморозка: до ${rulesForm.freeze_days} дней.
4. ${rulesForm.late_policy}
5. ${rulesForm.custom_rule}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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
        <h2 className="text-xs font-bold text-slate-900">Регламент для клиентов</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28 text-xs">
        <p className="text-slate-500 text-[11px] px-1">
          Настройте условия посещений под свой график. Готовый регламент можно в один клик скопировать в буфер и отправить ученику в WhatsApp или Telegram:
        </p>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <p className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">Параметры регламента</p>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Отмена или перенос тренировки (за сколько часов):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rulesForm.cancellation_hours}
                onChange={e => setRulesForm({ ...rulesForm, cancellation_hours: Number(e.target.value) })}
                className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center text-xs"
              />
              <span className="text-slate-600 text-xs">часа до начала (иначе занятие сгорает)</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Срок действия блока занятий:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rulesForm.expiry_days}
                onChange={e => setRulesForm({ ...rulesForm, expiry_days: Number(e.target.value) })}
                className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center text-xs"
              />
              <span className="text-slate-600 text-xs">календарных дней</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Допустимая заморозка абонемента:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rulesForm.freeze_days}
                onChange={e => setRulesForm({ ...rulesForm, freeze_days: Number(e.target.value) })}
                className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center text-xs"
              />
              <span className="text-slate-600 text-xs">дней (по болезни/командировке)</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Политика при опоздании:
            </label>
            <textarea
              rows={2}
              value={rulesForm.late_policy}
              onChange={e => setRulesForm({ ...rulesForm, late_policy: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">
              Дополнительное правило тренера:
            </label>
            <textarea
              rows={2}
              value={rulesForm.custom_rule}
              onChange={e => setRulesForm({ ...rulesForm, custom_rule: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
            />
          </div>
        </div>

        {/* Превью регламента */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Готовый регламент к отправке:</span>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-700 space-y-1.5 leading-relaxed">
            <p className="font-bold text-slate-900">Правила посещения персональных тренировок ({coachName}):</p>
            <p>1. Отмена/перенос тренировки принимается не менее чем за <strong>{rulesForm.cancellation_hours} часа</strong> до начала. При более поздней отмене занятие считается проведенным.</p>
            <p>2. Срок действия блока занятий — <strong>{rulesForm.expiry_days} дней</strong> с момента старта.</p>
            <p>3. Предусмотрена заморозка абонемента до <strong>{rulesForm.freeze_days} дней</strong>.</p>
            <p>4. {rulesForm.late_policy}</p>
            <p>5. {rulesForm.custom_rule}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <button
          type="button"
          onClick={handleCopyRules}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{isCopied ? 'Регламент скопирован в буфер!' : 'Скопировать для отправки ученику'}</span>
        </button>
      </div>
    </div>
  );
}
