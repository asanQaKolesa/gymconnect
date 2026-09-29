import { supabase } from '../supabaseClient';

/**
 * Экранирование спецсимволов HTML, чтобы сообщения с символами <, >, & не ломались в Telegram
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
 * (Токен бота скрыт на сервере)
 */
export async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  if (!chatId || !text) {
    console.warn('sendTelegramMessage: Не указан chatId или text');
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke('send-telegram', {
      body: {
        chat_id: String(chatId),
        text: text,
        parse_mode: parseMode,
      },
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
 * Совместимость со старыми вызовами в проекте: отправка уведомления ученику
 */
export async function sendStudentNotification(telegramId, message, parseMode = 'HTML') {
  return await sendTelegramMessage(telegramId, message, parseMode);
}
