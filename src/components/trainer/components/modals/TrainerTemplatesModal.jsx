// src/components/trainer/components/modals/TrainerTemplatesModal.jsx
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Send, 
  ExternalLink 
} from 'lucide-react';
import { sendStudentNotification } from '../../../../utils/telegramNotifications';

import TemplateSelector from '../../templates/TemplateSelector';
import AudienceSelector from '../../templates/AudienceSelector';
import MessageEditorPreview from '../../templates/MessageEditorPreview';

export default function TrainerTemplatesModal({ 
  isOpen, 
  onClose, 
  studentsList = [], 
  gymName = 'Invictus Go' 
}) {
  if (!isOpen) return null;

  // 1. 6 ровных полноценных сценариев (по 1 в строку, без неровных кнопок)
  const defaultTemplates = useMemo(() => [
    {
      id: 'today_workout',
      title: 'Напоминание о тренировке сегодня',
      category: 'Тренировка',
      defaultTitle: 'Тренировка по плану',
      body: `Привет, {имя}! Напоминаю, что сегодня у нас тренировка в зале {зал} в {время}. Не забудь форму, воду и отличное настроение! 💪 Жду вовремя.`
    },
    {
      id: 'coach_day_off',
      title: 'Тренера сегодня не будет в зале (перенос)',
      category: 'Отмена занятия',
      defaultTitle: 'Перенос сегодняшней тренировки',
      body: `Привет, {имя}! Вынужден предупредить: по непредвиденным обстоятельствам меня сегодня не будет в зале, наше занятие переносится. Тренировка сохраняется на твоём балансе. Давай согласуем удобный день для отработки!`
    },
    {
      id: 'body_measurement',
      title: 'Контрольный срез веса и замеров',
      category: 'Замеры тела',
      defaultTitle: 'Контрольный чек-ап',
      body: `Привет, {имя}! Подошло время контрольного среза. Зафиксируй, пожалуйста, вес натощак утром и пришли свежие замеры (талия, грудь, бёдра) в этот чат для отслеживания динамики 📊`
    },
    {
      id: 'membership_ending',
      title: 'Абонемент заканчивается (продление)',
      category: 'Абонемент',
      defaultTitle: 'Продление блока занятий',
      body: `Привет, {имя}! По твоему абонементу осталась крайняя тренировка. Чтобы зафиксировать за собой привычное время в графике и продолжить прогресс, давай согласуем продление блока на следующий месяц!`
    },
    {
      id: 'nutrition_check',
      title: 'Отчёт по питанию и рациону',
      category: 'Питание',
      defaultTitle: 'Контроль рациона',
      body: `Привет, {имя}! Пришли, пожалуйста, отчёт по питанию за последние дни. Проверим соблюдение нормы белков и калорийности и при необходимости скорректируем рацион 🥗`
    },
    {
      id: 'trial_intro',
      title: 'Приглашение на вводную тренировку',
      category: 'Новые заявки',
      defaultTitle: 'Вводное занятие',
      body: `Здравствуйте, {имя}! Мы договаривались о вводной персональной тренировке в зале {зал}. Подскажите, в какой день на этой неделе вам будет удобнее встретиться?`
    }
  ], []);

  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('gymconnect_coach_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allTemplates = [...defaultTemplates, ...customTemplates];

  // Стейты шаблона
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [currentTitle, setCurrentTitle] = useState(allTemplates[0].defaultTitle);
  const [currentMessageBody, setCurrentMessageBody] = useState(allTemplates[0].body);

  // Стейты аудитории
  const [recipientMode, setRecipientMode] = useState('individual'); // 'individual' | 'all' | 'custom'
  const [selectedStudentId, setSelectedStudentId] = useState(studentsList[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [quickFilter, setQuickFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Стейты отправки
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Переключение шаблона
  const handleSelectTemplate = (idx) => {
    setSelectedTemplateIndex(idx);
    const tpl = allTemplates[idx];
    if (tpl) {
      setCurrentTitle(tpl.defaultTitle);
      setCurrentMessageBody(tpl.body);
    }
  };

  // Сохранить текущий текст как свой шаблон
  const handleSaveAsCustomTemplate = () => {
    const newTpl = {
      id: `custom_${Date.now()}`,
      title: currentTitle || 'Авторский шаблон',
      category: 'Мой шаблон',
      defaultTitle: currentTitle,
      body: currentMessageBody
    };
    const updated = [...customTemplates, newTpl];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('gymconnect_coach_custom_templates', JSON.stringify(updated));
    } catch (e) {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const singleStudent = studentsList.find(s => s.id === selectedStudentId) || studentsList[0];

  // Автоматическая индивидуальная интерполяция для каждого ученика
  const interpolateText = (rawText, studentObj) => {
    const studentName = studentObj?.first_name || 'Атлет';
    const club = studentObj?.gym ? studentObj.gym.split('|')[0].trim() : gymName;
    const time = studentObj?.exact_time || studentObj?.workout_time_slot?.split(' ')[0] || '18:30';

    return rawText
      .replace(/{имя}/gi, studentName)
      .replace(/{зал}/gi, club)
      .replace(/{время}/gi, time);
  };

  // Текст живого предпросмотра
  const previewFormattedText = useMemo(() => {
    return interpolateText(currentMessageBody, singleStudent);
  }, [currentMessageBody, singleStudent]);

  // Список целевых получателей
  const targetRecipients = useMemo(() => {
    if (recipientMode === 'individual') {
      return singleStudent ? [singleStudent] : [];
    }
    if (recipientMode === 'all') {
      return studentsList;
    }
    if (recipientMode === 'custom') {
      return studentsList.filter(s => selectedStudentIds.includes(s.id));
    }
    return [];
  }, [recipientMode, singleStudent, studentsList, selectedStudentIds]);

  // 1. Отправка через бота (с индивидуальной заменой имени для каждого адресата)
  const handleStartBroadcast = async () => {
    if (targetRecipients.length === 0) {
      alert('Выберите хотя бы одного получателя для отправки.');
      return;
    }

    if (!currentMessageBody.trim()) {
      alert('Текст уведомления не может быть пустым.');
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    setSendProgress({ current: 0, total: targetRecipients.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetRecipients.length; i++) {
      const st = targetRecipients[i];
      // Здесь для каждого ученика имя подставляется индивидуально!
      const personalizedBody = interpolateText(currentMessageBody, st);

      try {
        const res = await sendStudentNotification({
          studentTelegramId: st.telegram_id,
          studentUsername: st.username || st.telegram_username,
          studentId: st.id,
          title: currentTitle,
          message: personalizedBody
        });

        if (res && res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }

      setSendProgress({ current: i + 1, total: targetRecipients.length });
      await new Promise(r => setTimeout(r, 50));
    }

    setIsSending(false);
    setSendProgress(null);

    setStatusMessage({
      text: `Уведомления отправлены! Доставлено: ${successCount}, не доставлено: ${failCount} (ученик должен нажать старт в боте).`,
      isOk: successCount > 0
    });

    setTimeout(() => setStatusMessage(null), 7000);
  };

  // 2. Открыть личный диалог в Telegram с предзаполненным текстом
  const handleOpenIndividualChat = () => {
    if (!singleStudent) return;
    const personalizedBody = interpolateText(currentMessageBody, singleStudent);
    const cleanNick = (singleStudent.username || singleStudent.telegram_username || '').replace('@', '').trim();

    if (cleanNick) {
      window.open(`https://t.me/${cleanNick}?text=${encodeURIComponent(personalizedBody)}`, '_blank');
    } else if (singleStudent.phone) {
      const digits = String(singleStudent.phone).replace(/\D/g, '');
      window.open(`https://wa.me/7${digits.slice(-10)}?text=${encodeURIComponent(personalizedBody)}`, '_blank');
    } else {
      navigator.clipboard.writeText(personalizedBody);
      alert('У атлета не указан Telegram никнейм. Текст скопирован в буфер обмена.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between overflow-hidden select-none">
      
      {/* 1. НАМЕРТВО ЗАФИКСИРОВАННАЯ ВЕРХНЯЯ ШАПКА */}
      <header className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Назад в меню</span>
          </button>

          <div className="text-center">
            <h1 className="text-xs font-bold text-slate-900">Рассылки и шаблоны</h1>
            <p className="text-[10px] text-slate-400 font-medium">Персонализированные уведомления</p>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* 2. СКРОЛЛИРУЕМАЯ СЕРЕДИНА */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 max-w-md mx-auto w-full pb-8">
        
        {/* Статус отправки */}
        {statusMessage && (
          <div className="p-3 rounded-2xl border text-xs font-semibold text-center bg-white text-slate-900 border-slate-300 shadow-2xs animate-in fade-in">
            {statusMessage.text}
          </div>
        )}

        {/* 1. Каталог сценариев (по 1 строке на сценарий) */}
        <TemplateSelector
          templates={allTemplates}
          selectedIndex={selectedTemplateIndex}
          onSelectIndex={handleSelectTemplate}
        />

        {/* 2. Сегментация аудитории */}
        <AudienceSelector
          students={studentsList}
          recipientMode={recipientMode}
          setRecipientMode={setRecipientMode}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          selectedStudentIds={selectedStudentIds}
          setSelectedStudentIds={setSelectedStudentIds}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* 3. Редактор текста и превью Telegram */}
        <MessageEditorPreview
          title={currentTitle}
          setTitle={setCurrentTitle}
          messageBody={currentMessageBody}
          setMessageBody={setCurrentMessageBody}
          previewText={previewFormattedText}
          onSaveAsCustomTemplate={handleSaveAsCustomTemplate}
          savedSuccess={savedSuccess}
        />

      </div>

      {/* 3. НАМЕРТВО ЗАФИКСИРОВАННЫЙ НИЖНИЙ ДОК (НЕ ПЛАВАЕТ И НЕ ПРЫГАЕТ) */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3 max-w-md mx-auto w-full shadow-lg flex gap-2">
        {recipientMode === 'individual' && (
          <button
            type="button"
            onClick={handleOpenIndividualChat}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Открыть диалог в Telegram с предзаполненным сообщением"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            <span>В Telegram-диалог</span>
          </button>
        )}

        <button
          type="button"
          disabled={isSending || targetRecipients.length === 0}
          onClick={handleStartBroadcast}
          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>
            {isSending && sendProgress
              ? `Отправка ${sendProgress.current} из ${sendProgress.total}...`
              : `Отправить через бота (${targetRecipients.length})`}
          </span>
        </button>
      </div>

    </div>
  );
}
