// src/components/admin/tabs/AdminBroadcastTab.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Dumbbell, 
  Building2, 
  Crown, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Layers,
  Search,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Check
} from 'lucide-react';
import { showConfirm } from '../../../utils/uiUtils';
import { supabase } from '../../../supabaseClient';
import { escapeHtml } from '../../../utils/telegramNotifications';

const STORAGE_KEY = 'gymconnect_bot_sent_messages';

// Резервный реестр Chat ID для тестов основателя
const KNOWN_CHAT_IDS = {
  'asanali_kk': '8120357675',
  'dattabanee': '1463087181'
};

export default function AdminBroadcastTab({ profiles = [], trainers = [] }) {
  // 1. ХУКИ СОСТОЯНИЯ (СТРОГО НА САМОМ ВЕРХУ)
  const [targetSegment, setTargetSegment] = useState('all'); // 'all' | 'athletes' | 'trainers' | 'gym' | 'pro' | 'individual'
  const [selectedGym, setSelectedGym] = useState('Invictus Go (Mega Park)');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Конструктор сообщения
  const [broadcastTitle, setBroadcastTitle] = useState('Новости GymConnect');
  const [broadcastText, setBroadcastText] = useState(
    'Привет, атлет! Мы обновили платформу GymConnect: теперь в приложении доступно расписание тренировок и живая синхронизация с залами Алматы. Заходи и пробуй!'
  );
  const [buttonText, setButtonText] = useState('🏋️ Открыть GymConnect');
  const [buttonUrl, setButtonUrl] = useState('https://asanqakolesa.github.io/gymconnect/');

  // Стейты отправки и прогресса
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, successCount: 0, failCount: 0 });
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Стейты закрытой админской очистки сообщений бота
  const [isDeletingBotMessages, setIsDeletingBotMessages] = useState(false);
  const [purgeFeedback, setPurgeFeedback] = useState(null);
  const [manualChatId, setManualChatId] = useState('8120357675');
  const [manualMessageId, setManualMessageId] = useState('');
  const [trackedCount, setTrackedCount] = useState(0);

  // Обновление счетчика сохраненных сообщений бота
  const updateTrackedCount = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setTrackedCount(list.length);
    } catch (e) {
      setTrackedCount(0);
    }
  };

  useEffect(() => {
    updateTrackedCount();
  }, [broadcastResult]);

  // Список уникальных залов из базы
  const uniqueGyms = useMemo(() => {
    return [...new Set(profiles.map(p => p.gym))].filter(Boolean);
  }, [profiles]);

  // Расчет получателей рассылки
  const recipientsList = useMemo(() => {
    let result = [];

    if (targetSegment === 'all') {
      const athletesWithTg = profiles.filter(p => p.telegram_id || KNOWN_CHAT_IDS[p.username?.toLowerCase()]);
      const trainersWithTg = trainers.filter(t => t.telegram_id || KNOWN_CHAT_IDS[t.username?.toLowerCase()]);
      result = [...athletesWithTg, ...trainersWithTg];
    } else if (targetSegment === 'athletes') {
      result = profiles.filter(p => p.telegram_id || KNOWN_CHAT_IDS[p.username?.toLowerCase()]);
    } else if (targetSegment === 'trainers') {
      result = trainers.filter(t => t.telegram_id || KNOWN_CHAT_IDS[t.username?.toLowerCase()]);
    } else if (targetSegment === 'gym') {
      result = profiles.filter(p => p.gym === selectedGym && (p.telegram_id || KNOWN_CHAT_IDS[p.username?.toLowerCase()]));
    } else if (targetSegment === 'pro') {
      result = profiles.filter(p => p.is_pro && (p.telegram_id || KNOWN_CHAT_IDS[p.username?.toLowerCase()]));
    } else if (targetSegment === 'individual') {
      const found = profiles.find(p => p.id === selectedUserId) || trainers.find(t => t.id === selectedUserId);
      if (found) result = [found];
    }

    const seen = new Set();
    return result.filter(item => {
      const chatId = item.telegram_id || KNOWN_CHAT_IDS[item.username?.toLowerCase()];
      if (!chatId || seen.has(chatId)) return false;
      seen.add(chatId);
      return true;
    });
  }, [targetSegment, selectedGym, selectedUserId, profiles, trainers]);

  // Безопасная отправка одного сообщения через Supabase Edge Function
  const sendSingleMessage = async (chatId, title, text, btnText, btnUrl) => {
    const messageHtml = `🔔 <b>GymConnect: ${escapeHtml(title)}</b>\n\n${text}`.trim();
    
    const isInternalApp = btnUrl.startsWith('https://asanqakolesa.github.io');
    const buttonObject = isInternalApp
      ? { text: btnText, web_app: { url: btnUrl } }
      : { text: btnText, url: btnUrl };

    const payload = {
      chat_id: String(chatId),
      text: messageHtml,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[buttonObject]]
      }
    };

    try {
      const { data, error } = await supabase.functions.invoke('send-telegram', {
        body: payload
      });

      if (error) {
        console.warn('Ошибка отправки через Edge Function:', error);
        return false;
      }

      // Сохраняем в реестр отправленных сообщений для возможности удаления
      if (data?.ok && data.result?.message_id) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const list = raw ? JSON.parse(raw) : [];
          list.push({
            chatId: String(chatId),
            messageId: Number(data.result.message_id),
            category: 'broadcast',
            timestamp: Date.now()
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {}
      }

      return data?.ok === true;
    } catch (e) {
      console.warn('Ошибка отправки:', e);
      return false;
    }
  };

  // Безопасное удаление сообщения бота через Supabase
  const executeDeleteBotMessage = async (chatId, messageId) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram', {
        body: {
          action: 'deleteMessage',
          chat_id: String(chatId),
          message_id: Number(messageId)
        }
      });
      if (error) return false;
      return data?.ok === true;
    } catch (e) {
      return false;
    }
  };

  // Запуск рассылки
  const handleStartBroadcast = async () => {
    if (recipientsList.length === 0) {
      alert('В выбранном сегменте нет пользователей с известным Telegram ID.');
      return;
    }

    if (!broadcastText.trim()) {
      alert('Введите текст сообщения для рассылки.');
      return;
    }

    const confirmSend = await showConfirm(
      `Запустить рассылку в Telegram для ${recipientsList.length} пользователей?`
    );
    if (!confirmSend) return;

    setIsSending(true);
    setBroadcastResult(null);
    setSendProgress({ current: 0, total: recipientsList.length, successCount: 0, failCount: 0 });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < recipientsList.length; i++) {
      const userItem = recipientsList[i];
      const chatId = userItem.telegram_id || KNOWN_CHAT_IDS[userItem.username?.toLowerCase()];

      const isOk = await sendSingleMessage(
        chatId, 
        broadcastTitle, 
        broadcastText, 
        buttonText, 
        buttonUrl
      );

      if (isOk) successCount++;
      else failCount++;

      setSendProgress({
        current: i + 1,
        total: recipientsList.length,
        successCount,
        failCount
      });

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsSending(false);
    setBroadcastResult({
      total: recipientsList.length,
      successCount,
      failCount
    });
    updateTrackedCount();
  };

  // СЕРВИСНЫЙ ТЕСТ: СТЕРЕТЬ ВСЕ ОТПРАВЛЕННЫЕ СООБЩЕНИЯ БОТА ИЗ TELEGRAM ПРЯМО СЕЙЧАС
  const handlePurgeAllBotMessagesNow = async () => {
    let trackedList = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      trackedList = raw ? JSON.parse(raw) : [];
    } catch (e) {}

    if (trackedList.length === 0) {
      alert('В очереди нет зафиксированных сообщений бота для удаления.');
      return;
    }

    const confirmPurge = await showConfirm(
      `Стереть из Telegram все ${trackedList.length} отправленных сообщений бота прямо сейчас?`
    );
    if (!confirmPurge) return;

    setIsDeletingBotMessages(true);
    setPurgeFeedback('Удаление сообщений через Telegram Bot API...');

    let deletedOk = 0;
    let deletedFail = 0;

    for (const item of trackedList) {
      const ok = await executeDeleteBotMessage(item.chatId, item.messageId);
      if (ok) deletedOk++;
      else deletedFail++;
      await new Promise(r => setTimeout(r, 40));
    }

    // Очищаем локальный реестр
    localStorage.removeItem(STORAGE_KEY);
    updateTrackedCount();
    setIsDeletingBotMessages(false);

    setPurgeFeedback(`✅ Успешно! Стёрто из Telegram: ${deletedOk} сообщений (ошибок: ${deletedFail}).`);
    setTimeout(() => setPurgeFeedback(null), 7000);
  };

  // ТЕСТ: РУЧНОЕ УДАЛЕНИЕ КОНКРЕТНОГО СООБЩЕНИЯ ПО ID
  const handleManualSingleDelete = async (e) => {
    e.preventDefault();
    if (!manualChatId.trim() || !manualMessageId.trim()) {
      alert('Укажите Chat ID и Message ID');
      return;
    }

    setIsDeletingBotMessages(true);
    setPurgeFeedback('Отправка запроса deleteMessage в Telegram...');

    const ok = await executeDeleteBotMessage(manualChatId.trim(), manualMessageId.trim());

    setIsDeletingBotMessages(false);
    if (ok) {
      setPurgeFeedback(`✅ Сообщение #${manualMessageId} успешно стёрто из чата Telegram!`);
      setManualMessageId('');
    } else {
      setPurgeFeedback(`⚠️ Не удалось стереть сообщение #${manualMessageId}. Проверьте правильность ID.`);
    }

    setTimeout(() => setPurgeFeedback(null), 6000);
  };

  return (
    <div className="space-y-4 text-xs text-slate-700 select-none pb-12">
      
      {/* 1. ВЫБОР АУДИТОРИИ (СЕГМЕНТАЦИЯ) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Сегментация аудитории</h3>
              <p className="text-[10.5px] text-slate-400">Выберите, кому именно доставить уведомление</p>
            </div>
          </div>

          <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-xl text-xs font-mono border border-blue-100">
            Охват: {recipientsList.length} чел.
          </span>
        </div>

        {/* Сетка сегментов */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { id: 'all', title: 'Все пользователи', desc: 'Атлеты + Тренеры', icon: Users },
            { id: 'athletes', title: 'Только атлеты', desc: 'Все клиенты в базе', icon: User },
            { id: 'trainers', title: 'Только тренеры', desc: 'Партнеры CoachOS', icon: Dumbbell },
            { id: 'gym', title: 'По фитнес-клубу', desc: 'Клиенты конкретного зала', icon: Building2 },
            { id: 'pro', title: 'Только PRO статус', desc: 'Платные подписчики', icon: Crown },
            { id: 'individual', title: 'Индивидуально', desc: 'Один конкретный человек', icon: Send }
          ].map(seg => {
            const Icon = seg.icon;
            const isSelected = targetSegment === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setTargetSegment(seg.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">{seg.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">{seg.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Фильтр: выбор зала */}
        {targetSegment === 'gym' && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 animate-in fade-in">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">
              Выберите фитнес-клуб Алматы:
            </label>
            <select
              value={selectedGym}
              onChange={e => setSelectedGym(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              {uniqueGyms.map((gym, idx) => (
                <option key={idx} value={gym}>{gym}</option>
              ))}
            </select>
          </div>
        )}

        {/* Фильтр: индивидуальный выбор */}
        {targetSegment === 'individual' && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">
              Поиск пользователя по имени или Telegram:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Поиск по имени или нику..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="">-- Выберите адресата из списка --</option>
              {profiles
                .filter(p => `${p.first_name || ''} ${p.last_name || ''} ${p.username || ''}`.toLowerCase().includes(userSearchQuery.toLowerCase()))
                .slice(0, 30)
                .map(u => (
                  <option key={u.id} value={u.id}>
                    Атлет: {u.first_name} {u.last_name || ''} (@{u.username || 'нет ника'})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. КОНСТРУКТОР СООБЩЕНИЯ И ЖИВОЙ ПРЕДПРОСМОТР */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Конструктор */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">2. Текст сообщения</h3>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Заголовок рассылки
            </label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={e => setBroadcastTitle(e.target.value)}
              placeholder="Заголовок..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Текст сообщения (поддерживаются эмодзи)
            </label>
            <textarea
              rows={5}
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              placeholder="Введите текст рассылки..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs leading-relaxed resize-none focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Текст кнопки</label>
              <input
                type="text"
                value={buttonText}
                onChange={e => setButtonText(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ссылка кнопки</label>
              <input
                type="text"
                value={buttonUrl}
                onChange={e => setButtonUrl(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Предпросмотр */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Предпросмотр в Telegram</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">@gymconnect_ala_bot</span>
            </div>

            <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 space-y-2.5 max-w-sm">
              <div className="space-y-1">
                <p className="font-bold text-xs text-slate-900">
                  🔔 GymConnect: {broadcastTitle || 'Заголовок'}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {broadcastText || 'Текст сообщения появится здесь...'}
                </p>
              </div>

              {buttonText && (
                <div className="pt-1">
                  <div className="w-full py-2 bg-blue-600 text-white rounded-xl text-center text-xs font-bold shadow-xs">
                    {buttonText}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Индикатор статуса рассылки */}
          {isSending && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                <span>Идет отправка через бота...</span>
                <span>{sendProgress.current} из {sendProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.round((sendProgress.current / (sendProgress.total || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-blue-700 font-mono">
                <span>Успешно: {sendProgress.successCount}</span>
                <span>Ошибок: {sendProgress.failCount}</span>
              </div>
            </div>
          )}

          {/* Итог */}
          {broadcastResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-950 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Рассылка успешно завершена!</span>
              </div>
              <p className="text-[11px] text-emerald-900 font-mono">
                Всего адресатов: {broadcastResult.total} • Доставлено: {broadcastResult.successCount} • Ошибок: {broadcastResult.failCount}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={isSending || recipientsList.length === 0}
            onClick={handleStartBroadcast}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Рассылаем...' : `Запустить рассылку (${recipientsList.length} чел.)`}</span>
          </button>
        </div>

      </div>

      {/* ================= 3. ЗАКРЫТАЯ ПАНЕЛЬ ОСНОВАТЕЛЯ: СТИРАНИЕ СООБЩЕНИЙ БОТА В TELEGRAM ================= */}
      <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">3. Управление сообщениями бота в Telegram (deleteMessage)</h3>
              <p className="text-[10.5px] text-slate-400">Эксклюзивный доступ основателя: удаление сообщений прямо из переписки</p>
            </div>
          </div>

          <span className="text-[10.5px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            В очереди: {trackedCount} сообщ.
          </span>
        </div>

        {purgeFeedback && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs font-semibold text-center animate-in fade-in">
            {purgeFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Кнопка пакетного удаления всех зафиксированных сообщений бота */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-rose-900 block">
                Стереть все зафиксированные сообщения бота
              </span>
              <p className="text-[11px] text-rose-800 leading-snug">
                Бот отправит запрос <code>deleteMessage</code> в Telegram для каждого сообщения в очереди ({trackedCount} шт.). Сообщения моментально пропадут из чатов пользователей.
              </p>
            </div>

            <button
              type="button"
              disabled={isDeletingBotMessages || trackedCount === 0}
              onClick={handlePurgeAllBotMessagesNow}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeletingBotMessages ? 'Удаление...' : `Стереть все сообщения (${trackedCount}) сейчас`}</span>
            </button>
          </div>

          {/* Ручной тест удаления по Message ID */}
          <form onSubmit={handleManualSingleDelete} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="font-bold text-xs text-slate-900 block">
              Ручной тест удаления одного сообщения:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Chat ID</label>
                <input
                  type="text"
                  required
                  value={manualChatId}
                  onChange={e => setManualChatId(e.target.value)}
                  placeholder="8120357675"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">Message ID</label>
                <input
                  type="number"
                  required
                  value={manualMessageId}
                  onChange={e => setManualMessageId(e.target.value)}
                  placeholder="12345"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDeletingBotMessages || !manualMessageId}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Стереть это сообщение из чата</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
