// src/utils/telegramNotifications.js

const BOT_TOKEN = '8825396654:AAH0GzJqWOzqjys5re9De-Bc7jPIqwxtfDI';

// Реестр известных Chat ID для тестирования и основателя
const KNOWN_CHAT_IDS = {
  'asanali_kk': '8120357675',
  'dattabanee': '1463087181'
};

const STORAGE_KEY = 'gymconnect_bot_sent_messages';

/**
 * Определение корректного числового Telegram Chat ID
 */
export function resolveTelegramChatId(telegramId, username) {
  if (telegramId && /^\d+$/.test(String(telegramId).trim())) {
    return String(telegramId).trim();
  }
  const cleanU = (username || '').toLowerCase().replace(/[@\s]/g, '').trim();
  if (cleanU && KNOWN_CHAT_IDS[cleanU]) {
    return KNOWN_CHAT_IDS[cleanU];
  }
  return null;
}

/**
 * Получение списка отправленных сообщений из локального реестра
 */
function getTrackedBotMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Сохранение списка отправленных сообщений
 */
function saveTrackedBotMessages(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }
}

/**
 * Запоминание отправленного сообщения для последующего автоудаления
 */
function trackSentBotMessage(chatId, messageId, category = 'general') {
  if (!chatId || !messageId) return;
  const list = getTrackedBotMessages();
  list.push({
    chatId: String(chatId),
    messageId: Number(messageId),
    category,
    timestamp: Date.now()
  });
  saveTrackedBotMessages(list);
}

/**
 * Удаление конкретного сообщения из чата Telegram через метод deleteMessage
 */
export async function deleteBotMessage(chatId, messageId) {
  if (!chatId || !messageId) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId),
        message_id: Number(messageId)
      })
    });
    const data = await response.json();
    return data.ok;
  } catch (e) {
    console.warn('Не удалось удалить сообщение бота в Telegram:', e);
    return false;
  }
}

/**
 * Режим «Чистый чат»: удалить предыдущее сообщение этого типа в диалоге
 */
export async function deletePreviousBotMessage(chatId, category = 'general') {
  if (!chatId) return;
  const list = getTrackedBotMessages();
  const target = list.find(item => item.chatId === String(chatId) && item.category === category);
  
  if (target) {
    await deleteBotMessage(target.chatId, target.messageId);
    const updated = list.filter(item => item !== target);
    saveTrackedBotMessages(updated);
  }
}

/**
 * Автоматическое удаление сообщений бота старше 24 часов из переписки
 */
export async function pruneExpiredBotMessages(maxAgeHours = 24) {
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const now = Date.now();
  const list = getTrackedBotMessages();
  const remaining = [];

  for (const item of list) {
    if (now - item.timestamp > maxAgeMs) {
      // Удаляем из Telegram чата
      await deleteBotMessage(item.chatId, item.messageId);
    } else {
      remaining.push(item);
    }
  }

  saveTrackedBotMessages(remaining);
}

/**
 * Отправка персонального уведомления ученику от имени бота @gymconnect_ala_bot
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentUsername,
  studentId,
  title,
  message,
  category = 'reminder',
  replacePrevious = true,
  buttonText = '🏋️ Открыть GymConnect',
  buttonUrl = 'https://asanqakolesa.github.io/gymconnect/'
}) {
  const chatId = resolveTelegramChatId(studentTelegramId, studentUsername);

  if (!chatId) {
    return {
      ok: false,
      error: `У атлета ${studentUsername ? `@${studentUsername}` : ''} не найден числовой Telegram ID.`
    };
  }

  // 1. Очистка старых сообщений старше 24 часов
  pruneExpiredBotMessages(24).catch(() => {});

  // 2. Режим «Чистый чат»: удаляем предыдущее уведомление этого типа
  if (replacePrevious) {
    await deletePreviousBotMessage(chatId, category);
  }

  const messageHtml = `🔔 <b>GymConnect: ${title}</b>\n\n${message}`.trim();

  const isInternal = buttonUrl.startsWith('https://asanqakolesa.github.io');
  const buttonObject = isInternal
    ? { text: buttonText, web_app: { url: buttonUrl } }
    : { text: buttonText, url: buttonUrl };

  const payload = {
    chat_id: String(chatId),
    text: messageHtml,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[buttonObject]]
    }
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      if (data.description && data.description.includes('chat not found')) {
        return {
          ok: false,
          error: `Атлет должен нажать «Запустить» (/start) в боте @gymconnect_ala_bot.`
        };
      }
      return {
        ok: false,
        error: data.description || 'Ошибка Telegram Bot API'
      };
    }

    // Сохраняем message_id для автоудаления через 24 часа
    if (data.result?.message_id) {
      trackSentBotMessage(chatId, data.result.message_id, category);
    }

    return {
      ok: true,
      data: data.result
    };
  } catch (err) {
    console.error('Ошибка отправки уведомления ученику:', err);
    return {
      ok: false,
      error: 'Сетевая ошибка: ' + err.message
    };
  }
}

/**
 * Отправка уведомления тренеру об отметке явки учеником
 */
export async function sendTrainerAttendanceNotification({
  trainerTelegramId,
  trainerUsername,
  studentName,
  timeSlot,
  gymName,
  isAttending
}) {
  const chatId = resolveTelegramChatId(trainerTelegramId, trainerUsername);

  if (!chatId) {
    return {
      ok: false,
      error: `У тренера @${trainerUsername || 'coach'} не найден Telegram ID.`
    };
  }

  // Очистка сообщений старше 24 часов
  pruneExpiredBotMessages(24).catch(() => {});

  const statusText = isAttending 
    ? '✅ <b>Будет на тренировке</b>' 
    : '❌ <b>Не сможет прийти (пропуск)</b>';

  const messageHtml = `📋 <b>GymConnect CoachOS: Отметка явки</b>\n\n` +
    `Атлет: <b>${studentName}</b>\n` +
    `Статус: ${statusText}\n` +
    `Время: <b>${timeSlot || 'Сегодня'}</b>\n` +
    `Зал: <b>${gymName || 'Фитнес-клуб'}</b>`;

  const payload = {
    chat_id: String(chatId),
    text: messageHtml,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[
        { text: '📊 Открыть CoachOS CRM', web_app: { url: 'https://asanqakolesa.github.io/gymconnect/?trainer=true' } }
      ]]
    }
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      if (data.description && data.description.includes('chat not found')) {
        return {
          ok: false,
          error: `Тренеру нужно нажать /start в боте @gymconnect_ala_bot.`
        };
      }
      return { ok: false, error: data.description || 'Ошибка Telegram Bot API' };
    }

    if (data.result?.message_id) {
      trackSentBotMessage(chatId, data.result.message_id, 'attendance_alert');
    }

    return { ok: true, data: data.result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
