// src/components/trainer/templates/MessageEditorPreview.jsx
import React from 'react';
import { Sparkles, Send, Copy, Check } from 'lucide-react';

export default function MessageEditorPreview({ 
  title, 
  setTitle, 
  messageBody, 
  setMessageBody, 
  previewText, 
  onSaveAsCustomTemplate,
  savedSuccess 
}) {
  const insertTag = (tag) => {
    setMessageBody(prev => `${prev} ${tag}`);
  };

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 select-none">
      
      {/* Шапка редактора */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Редактор текста уведомления</h3>
          <p className="text-[10px] text-slate-400 font-medium">Текст можно изменить перед отправкой</p>
        </div>

        <button
          type="button"
          onClick={onSaveAsCustomTemplate}
          className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
          title="Сохранить изменённый текст в список шаблонов"
        >
          {savedSuccess ? <Check className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
          <span>{savedSuccess ? 'Сохранено!' : 'Сохранить шаблон'}</span>
        </button>
      </div>

      {/* Тема / Заголовок */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Заголовок сообщения
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Название уведомления..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
        />
      </div>

      {/* Поле ввода текста */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Текст сообщения
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

      {/* Быстрые теги-переменные для подстановки */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-400 block">
          Нажмите на тег, чтобы вставить в текст:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { tag: '{имя}', desc: 'Имя атлета' },
            { tag: '{зал}', desc: 'Фитнес-клуб' },
            { tag: '{время}', desc: 'Время занятия' }
          ].map(item => (
            <button
              key={item.tag}
              type="button"
              onClick={() => insertTag(item.tag)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10.5px] font-mono font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {item.tag} <span className="font-normal font-sans text-slate-400 text-[9.5px]">({item.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Живой предпросмотр сообщения (как в Telegram) */}
      <div className="space-y-1 pt-1 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Предпросмотр сообщения у атлета:
        </span>
        
        <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 space-y-1">
          <p className="text-[10px] font-mono text-slate-400 border-b border-slate-200 pb-0.5">
            Сообщение от бота @gymconnect_ala_bot
          </p>
          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line pt-0.5">
            <span className="font-bold text-slate-900 block mb-0.5">
              🔔 GymConnect: {title || 'Уведомление от наставника'}
            </span>
            {previewText}
          </div>
        </div>
      </div>

    </div>
  );
}
