// src/utils/telegramNotifications.js

const BOT_TOKEN = '8825396654:AAH0GzJqWOzqjys5re9De-Bc7jPIqwxtfDI';

// Реестр известных Chat ID для тестирования и основателя
const KNOWN_CHAT_IDS = {
  'asanali_kk': '8120357675',
  'dattabanee': '1463087181'
};

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
 * Отправка персонального уведомления ученику от имени бота @gymconnect_ala_bot
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentUsername,
  studentId,
  title,
  message,
  buttonText = '🏋️ Открыть GymConnect',
  buttonUrl = 'https://asanqakolesa.github.io/gymconnect/'
}) {
  const chatId = resolveTelegramChatId(studentTelegramId, studentUsername);

  if (!chatId) {
    return {
      ok: false,
      error: `У атлета ${studentUsername ? `@${studentUsername}` : ''} не найден числовой Telegram ID. Убедитесь, что атлет запустил приложение через Telegram.`
    };
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
          error: `Атлет должен нажать кнопку «Запустить» (/start) в боте @gymconnect_ala_bot, чтобы бот получил право отправлять ему сообщения.`
        };
      }
      return {
        ok: false,
        error: data.description || 'Ошибка Telegram Bot API'
      };
    }

    return {
      ok: true,
      data: data.result
    };
  } catch (err) {
    console.error('Ошибка отправки уведомления ученику:', err);
    return {
      ok: false,
      error: 'Сетевая ошибка отправки: ' + err.message
    };
  }
}

/**
 * Отправка уведомления тренеру, когда ученик отмечает явку («Буду» / «Не смогу»)
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
          error: `Тренеру нужно нажать /start в боте @gymconnect_ala_bot для получения пушей.`
        };
      }
      return {
        ok: false,
        error: data.description || 'Ошибка Telegram Bot API'
      };
    }

    return { ok: true, data: data.result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
