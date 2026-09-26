// src/utils/telegramNotifications.js
import { supabase } from '../supabaseClient';

/**
 * Отправляет сообщение ученику от имени Telegram-бота и записывает в базу уведомлений
 * @param {Object} params
 * @param {number|string} params.studentTelegramId - числовой ID пользователя в Telegram (chat_id)
 * @param {string} params.studentId - ID профиля в таблице profiles
 * @param {string} params.title - Заголовок уведомления
 * @param {string} params.message - Текст сообщения
 * @param {string} [params.type='coach_reminder'] - Тип уведомления
 * @param {string} [params.botToken] - Токен бота (или прокси через Supabase Edge Function)
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentId,
  title,
  message,
  type = 'coach_reminder',
  botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
}) {
  try {
    // 1. Сохраняем уведомление в таблице notifications для отображения внутри Mini App
    if (studentId || studentTelegramId) {
      const dbPayload = {
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      };

      if (studentId) dbPayload.user_id = studentId;
      if (studentTelegramId) dbPayload.telegram_id = String(studentTelegramId);

      await supabase.from('notifications').insert([dbPayload]).catch(() => {
        // Игнорируем ошибку, если таблица еще создается
      });
    }

    // 2. Если у ученика есть числовой telegram_id и передан токен бота — шлем в Telegram чат
    if (studentTelegramId && botToken) {
      const miniAppUrl = 'https://t.me/gymconnect_almaty_bot/app';
      const tgText = `🔔 *${title}*\n\n${message}`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: studentTelegramId,
          text: tgText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🏋️ Открыть GymConnect',
                  url: miniAppUrl
                }
              ]
            ]
          }
        })
      });

      const resData = await response.json();
      return { success: resData.ok, data: resData };
    }

    return { success: true, message: 'Сохранено внутри приложения' };
  } catch (error) {
    console.error('Ошибка отправки уведомления ученику:', error);
    return { success: false, error: error.message };
  }
}
