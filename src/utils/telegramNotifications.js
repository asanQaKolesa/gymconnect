// src/utils/telegramNotifications.js
import { supabase } from '../supabaseClient';

// Токен бота GymConnect из переменных окружения
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const MINI_APP_URL = 'https://t.me/gymconnect_almaty_bot';

/**
 * 1. Отправка мгновенного пуш-уведомления тренеру, когда ученик отметил явку («Буду» / «Не приду»)
 */
export async function sendTrainerAttendanceNotification({
  trainerTelegramId,
  trainerUsername,
  studentName,
  timeSlot = 'сегодня',
  gymName = 'Зал',
  isAttending = true
}) {
  const statusEmoji = isAttending ? '✅' : '⚠️';
  const statusTitle = isAttending ? 'ПОДТВЕРЖДЕНИЕ ТРЕНИРОВКИ' : 'ОТМЕНА / ПРОПУСК';
  const statusText = isAttending 
    ? 'Будет на тренировке!' 
    : 'Не сможет прийти на тренировку.';

  const messageText = `🔔 *GymConnect: ${statusTitle}*\n\n` +
    `🏋️‍♂️ *Ученик:* ${studentName}\n` +
    `⏰ *Время:* ${timeSlot}\n` +
    `📍 *Зал:* ${gymName}\n` +
    `📌 *Статус:* ${statusEmoji} ${statusText}\n\n` +
    `_Статус автоматически обновлен в вашей CRM CoachOS._`;

  // Ищем числовой Telegram ID тренера, если передан только ник
  let targetChatId = trainerTelegramId;
  if (!targetChatId && trainerUsername) {
    try {
      const cleanU = trainerUsername.replace('@', '').trim().toLowerCase();
      const { data } = await supabase
        .from('trainer_profiles')
        .select('telegram_id')
        .or(`username.ilike.${cleanU},username.ilike.@${cleanU}`)
        .maybeSingle();

      if (data?.telegram_id) {
        targetChatId = data.telegram_id;
      }
    } catch (e) {
      console.warn('Не удалось найти telegram_id тренера:', e);
    }
  }

  // Если известен ID чата и задан токен — отправляем реальное сообщение в Telegram
  if (targetChatId && BOT_TOKEN) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🏋️ Открыть CoachOS CRM',
                  url: `${MINI_APP_URL}?startapp=trainer`
                }
              ]
            ]
          }
        })
      });

      const resData = await response.json();
      return { success: resData.ok, data: resData };
    } catch (err) {
      console.error('Ошибка отправки пуша тренеру:', err);
      return { success: false, error: err.message };
    }
  }

  // Фоновый лог для отладки
  console.log(`[Telegram Bot -> Тренеру ${targetChatId || trainerUsername}]:\n${messageText}`);
  return { success: true, message: 'Локальное логирование' };
}

/**
 * 2. Отправка сервисного сообщения ученику от имени Telegram-бота (шаблоны, касса, замеры)
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentId,
  title,
  message,
  type = 'coach_reminder',
  botToken = BOT_TOKEN
}) {
  try {
    // 1. Сохраняем уведомление в таблице notifications для отображения внутри приложения
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
        // Игнорируем, если таблица еще создается
      });
    }

    // 2. Отправляем в Telegram чат ученику от имени бота
    if (studentTelegramId && botToken) {
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
                  url: MINI_APP_URL
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
