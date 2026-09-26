// src/components/trainer/components/modals/TrainerTemplatesModal.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { sendStudentNotification } from '../../../../utils/telegramNotifications';

export default function TrainerTemplatesModal({ 
  isOpen, 
  onClose, 
  studentsList = [], 
  gymName = 'клуб' 
}) {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customMessageBody, setCustomMessageBody] = useState('');
  const [recipientSegment, setRecipientSegment] = useState('all'); // 'all' | 'gym' | 'online' | 'selected'
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const defaultTemplates = [
    {
      title: 'Напоминание о тренировке сегодня',
      text: `Привет! Напоминаю, что сегодня у нас персональная тренировка в зале ${gymName}. Не забудь форму, воду и отличное настроение! 💪 Жду вовремя.`
    },
    {
      title: 'Абонемент заканчивается',
      text: `Привет! Напоминаю, что по твоему абонементу осталась крайняя тренировка. Чтобы сохранить за собой график и продолжить прогресс, давай запланируем продление на следующий месяц!`
    },
    {
      title: 'Контрольный замер веса и питания',
      text: `Привет! Завершилась очередная тренировочная неделя. Пришли, пожалуйста, вес натощак утром и отчет по питанию за последние дни для корректировки плана 📊`
    },
    {
      title: 'Приглашение на вводную тренировку',
      text: `Здравствуйте! Мы договаривались о вводной тренировке в зале ${gymName}. Удобно ли вам встретиться на этой неделе?`
    }
  ];

  useEffect(() => {
    setCustomMessageBody(defaultTemplates[selectedTemplateIndex]?.text || '');
  }, [selectedTemplateIndex, gymName]);

  if (!isOpen) return null;

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const targetRecipients = studentsList.filter(s => {
    if (recipientSegment === 'gym') return s.format === 'gym';
    if (recipientSegment === 'online') return s.format === 'online';
    if (recipientSegment === 'selected') return selectedStudentIds.includes(s.id);
    return true;
  });

  const handleSendBroadcast = async () => {
    if (targetRecipients.length === 0) {
      alert('Выберите хотя бы одного получателя для отправки сообщения.');
      return;
    }

    setIsSendingBroadcast(true);
    const selectedTemplateTitle = defaultTemplates[selectedTemplateIndex]?.title || 'Уведомление от тренера';

    try {
      let sentCount = 0;
      for (const st of targetRecipients) {
        await sendStudentNotification({
          studentTelegramId: st.telegram_id,
          studentId: st.id,
          title: selectedTemplateTitle,
          message: customMessageBody
        });
        sentCount++;
      }

      alert(`✅ Успешно! Уведомление отправлено ${sentCount} ученикам от имени бота в Telegram и сохранено внутри приложения.`);
      onClose();
    } catch (err) {
      alert('Ошибка при отправке: ' + err.message);
    } finally {
      setIsSendingBroadcast(false);
    }
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
        <h2 className="text-xs font-bold text-slate-900">Шаблоны и рассылка в Telegram</h2>
        <div className="w-16" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full pb-28 text-xs">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="font-bold text-slate-900 text-xs">1. Выберите готовый шаблон:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {defaultTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedTemplateIndex(i)}
                className={`p-2 rounded-xl text-left text-[11px] border transition-all ${
                  selectedTemplateIndex === i 
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-semibold text-slate-500 block mb-1">Редактировать текст перед отправкой:</label>
            <textarea
              rows={3}
              value={customMessageBody}
              onChange={e => setCustomMessageBody(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed resize-none focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <span className="font-bold text-slate-900 text-xs">2. Кому отправить уведомление:</span>
          
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'all', label: 'Все' },
              { id: 'gym', label: 'В зале' },
              { id: 'online', label: 'Онлайн' },
              { id: 'selected', label: 'Выбор' }
            ].map(seg => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setRecipientSegment(seg.id)}
                className={`py-1.5 px-2 rounded-xl text-center text-xs font-medium border transition-all ${
                  recipientSegment === seg.id 
                    ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {recipientSegment === 'selected' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Выберите учеников из базы:</span>
              {studentsList.map(st => (
                <label key={st.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-semibold text-xs text-slate-900">{st.first_name} {st.last_name}</p>
                    <p className="text-[10px] text-slate-500">{st.phone} • {st.format === 'gym' ? 'Зал' : 'Онлайн'}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(st.id)}
                    onChange={() => toggleStudentSelection(st.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex justify-between items-center">
            <span>Будет доставлено от Telegram-бота:</span>
            <span className="font-bold">{targetRecipients.length} ученикам</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto shadow-lg">
        <button
          type="button"
          disabled={isSendingBroadcast}
          onClick={handleSendBroadcast}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSendingBroadcast ? 'Отправка...' : `Отправить от бота в Telegram (${targetRecipients.length})`}</span>
        </button>
      </div>
    </div>
  );
}
