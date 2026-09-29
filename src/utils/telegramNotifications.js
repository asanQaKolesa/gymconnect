// src/utils/telegramNotifications.js
import { supabase } from '../supabaseClient';

/**
 * Экранирование спецсимволов HTML, чтобы сообщение не падало при отправке в Telegram
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Базовая безопасная отправка сообщения через Supabase Edge Function
 */
export async function sendTelegramMessage(chatId, text, parseMode = 'HTML', replyMarkup = null) {
  if (!chatId || !text) {
    console.warn('sendTelegramMessage: Не указан chatId или text');
    return false;
  }

  try {
    const payload = {
      chat_id: String(chatId),
      text: text,
      parse_mode: parseMode,
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const { data, error } = await supabase.functions.invoke('send-telegram', {
      body: payload,
    });

    if (error) {
      console.error('Ошибка отправки уведомления в Telegram через Supabase:', error);
      return false;
    }

    return data?.ok === true;
  } catch (err) {
    console.error('Непредвиденная ошибка отправки сообщения:', err);
    return false;
  }
}

/**
 * Отправка тренеру уведомления о явке атлета («Буду 👍» / «Не приду ✕»)
 */
export async function sendTrainerAttendanceNotification(trainerTelegramId, athleteNameOrMsg, status, workoutDate) {
  if (!trainerTelegramId) return false;

  let text = '';
  if (typeof athleteNameOrMsg === 'string' && (status !== undefined || workoutDate !== undefined)) {
    const statusText = (status === 'attending' || status === 'will_attend' || status === true || String(status).includes('Буду'))
      ? '👍 <b>Будет на тренировке</b>'
      : '✕ <b>Не придет</b>';
    
    text = `🔔 <b>Отметка явки ученика</b>\n\n` +
           `Атлет: <b>${escapeHtml(athleteNameOrMsg)}</b>\n` +
           `Статус: ${statusText}\n` +
           (workoutDate ? `Дата: <b>${escapeHtml(workoutDate)}</b>\n` : '') +
           `\n<i>GymConnect CRM</i>`;
  } else if (typeof athleteNameOrMsg === 'object' && athleteNameOrMsg !== null) {
    const { athleteName = 'Атлет', status: st, workoutDate: dt } = athleteNameOrMsg;
    const statusText = (st === 'attending' || st === 'will_attend' || st === true)
      ? '👍 <b>Будет на тренировке</b>'
      : '✕ <b>Не придет</b>';

    text = `🔔 <b>Отметка явки ученика</b>\n\n` +
           `Атлет: <b>${escapeHtml(athleteName)}</b>\n` +
           `Статус: ${statusText}\n` +
           (dt ? `Дата: <b>${escapeHtml(dt)}</b>\n` : '') +
           `\n<i>GymConnect CRM</i>`;
  } else {
    text = String(athleteNameOrMsg);
  }

  return await sendTelegramMessage(trainerTelegramId, text);
}

/**
 * Отправка персонального уведомления ученику
 */
export async function sendStudentNotification(telegramId, message, parseMode = 'HTML') {
  return await sendTelegramMessage(telegramId, message, parseMode);
}

/**
 * Безопасное удаление сообщения бота через Telegram Bot API
 */
export async function deleteBotMessage(chatId, messageId) {
  if (!chatId || !messageId) return false;
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
}

/**
 * Сервисная очистка устаревших сообщений
 */
export function pruneExpiredBotMessages() {
  try {
    const raw = localStorage.getItem('gymconnect_bot_sent_messages');
    if (!raw) return;
    const list = JSON.parse(raw);
    const TWO_DAYS = 48 * 60 * 60 * 1000;
    const now = Date.now();
    const fresh = list.filter(item => (now - item.timestamp) < TWO_DAYS);
    localStorage.setItem('gymconnect_bot_sent_messages', JSON.stringify(fresh));
  } catch (e) {}
}

export default {
  sendTelegramMessage,
  sendTrainerAttendanceNotification,
  sendStudentNotification,
  deleteBotMessage,
  pruneExpiredBotMessages,
  escapeHtml
};
