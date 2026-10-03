// src/components/trainer/templates/MessageEditorPreview.jsx
import React from 'react';
import { Sparkles, Check, Info } from 'lucide-react';

export default function MessageEditorPreview({ 
  title, 
  setTitle, 
  messageBody, 
  setMessageBody, 
  previewText, 
  onSaveAsCustomTemplate,
  savedSuccess 
}) {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка редактора */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Текст сообщения и предпросмотр</h3>
          <p className="text-[10px] text-slate-400 font-medium">Вы можете скорректировать текст перед отправкой</p>
        </div>

        <button
          type="button"
          onClick={onSaveAsCustomTemplate}
          className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
          title="Сохранить текущий текст в список шаблонов"
        >
          {savedSuccess ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3 text-slate-600" />}
          <span>{savedSuccess ? 'Сохранено!' : 'Сохранить шаблон'}</span>
        </button>
      </div>

      {/* Понятная плашка: объяснение авто-подстановки имени */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2 text-[10.5px] text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Имя, зал и время тренировки подставляются каждому атлету автоматически.</span>
      </div>

      {/* Заголовок уведомления */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Тема уведомления
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Заголовок сообщения..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
        />
      </div>

      {/* Редактируемое поле текста */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Редактируемый текст
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {messageBody.length} симв.
          </span>
        </div>

        <textarea
          rows={4}
          value={messageBody}
          onChange={e => setMessageBody(e.target.value)}
          placeholder="Введите текст сообщения..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed outline-none focus:border-blue-600 focus:bg-white resize-none transition-all"
        />
      </div>

      {/* Реалистичный предпросмотр сообщения у ученика */}
      <div className="space-y-1 pt-1 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Вид сообщения в чате ученика:
        </span>
        
        <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 space-y-1">
          <p className="text-[9.5px] font-mono text-slate-400 border-b border-slate-200 pb-0.5">
            От бота @gymconnect_ala_bot
          </p>
          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line pt-0.5">
            <span className="font-bold text-slate-900 block mb-0.5">
              🔔 GymConnect: {title || 'Уведомление'}
            </span>
            {previewText}
          </div>
        </div>
      </div>

    </div>
  );
}
