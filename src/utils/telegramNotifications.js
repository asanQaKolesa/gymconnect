// src/utils/telegramNotifications.js
import { supabase } from '../supabaseClient';

// Официальный токен бота GymConnect (@gymconnect_ala_bot)
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8825396654:AAH0GzJqWOzqjys5re9De-Bc7jPIqwxtfDI';
const BOT_USERNAME = 'gymconnect_ala_bot';
const MINI_APP_URL = `https://t.me/${BOT_USERNAME}`;

// Реестр проверенных Telegram ID наставников для гарантированной доставки
const KNOWN_COACH_CHAT_IDS = {
  'asanali_kk': '8120357675'
};

/**
 * Отправка сообщения через Telegram Bot API с поддержкой HTML и кнопкой
 */
async function sendTelegramApiMessage(chatId, htmlText, buttonUrl = null, buttonText = '🏋️ Открыть GymConnect') {
  if (!chatId || !BOT_TOKEN) {
    console.warn('Отправка отменена: отсутствует chat_id или BOT_TOKEN', { chatId, hasToken: Boolean(BOT_TOKEN) });
    return false;
  }

  const payload = {
    chat_id: String(chatId),
    text: htmlText,
    parse_mode: 'HTML'
  };

  if (buttonUrl) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: buttonText,
            url: buttonUrl
          }
        ]
      ]
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    if (!resData.ok) {
      console.warn('Telegram API вернул ошибку:', resData);
    }
    return resData.ok;
  } catch (err) {
    console.error('Сбой отправки сообщения через Telegram Bot API:', err);
    return false;
  }
}

/**
 * 1. Мгновенный пуш тренеру в Telegram при отметке явки («Буду» / «Не приду»)
 */
export async function sendTrainerAttendanceNotification({
  trainerTelegramId,
  trainerUsername,
  studentName,
  timeSlot = 'Сегодня',
  gymName = 'Зал в Алматы',
  isAttending = true
}) {
  const cleanU = (trainerUsername || '').replace('@', '').trim().toLowerCase();

  // Определяем точный Chat ID тренера
  let targetChatId = trainerTelegramId || KNOWN_COACH_CHAT_IDS[cleanU] || null;

  // Если в памяти нет — запрашиваем из базы Supabase
  if (!targetChatId && cleanU) {
    try {
      const { data } = await supabase
        .from('trainer_profiles')
        .select('telegram_id')
        .or(`username.ilike.${cleanU},username.ilike.@${cleanU}`)
        .maybeSingle();

      if (data?.telegram_id) {
        targetChatId = data.telegram_id;
      }
    } catch (e) {
      console.warn('Ошибка поиска telegram_id тренера в базе:', e);
    }
  }

  const statusEmoji = isAttending ? '✅' : '⚠️';
  const statusTitle = isAttending ? 'ПОДТВЕРЖДЕНИЕ ТРЕНИРОВКИ' : 'ОТМЕНА / ПРОПУСК';
  const statusAction = isAttending 
    ? '<b>Будет на тренировке!</b>' 
    : '<b>Не сможет прийти на тренировку.</b>';

  const messageHtml = `
${statusEmoji} <b>GymConnect: ${statusTitle}</b>

🏋️‍♂️ <b>Ученик:</b> ${studentName}
⏰ <b>Время:</b> ${timeSlot}
📍 <b>Зал:</b> ${gymName}
📌 <b>Статус:</b> ${statusAction}

<i>Статус автоматически зафиксирован в вашей CRM CoachOS.</i>
`.trim();

  const crmUrl = `${MINI_APP_URL}?startapp=trainer`;

  return await sendTelegramApiMessage(
    targetChatId, 
    messageHtml, 
    crmUrl, 
    '🏋️ Открыть CoachOS CRM'
  );
}

/**
 * 2. Сервисные уведомления подопечному от имени бота (шаблоны, касса, замеры)
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentId,
  title = 'Уведомление от тренера',
  message
}) {
  const messageHtml = `
🔔 <b>GymConnect: ${title}</b>

${message}
`.trim();

  // 1. Сохраняем уведомление в таблице notifications для истории в приложении
  if (studentId || studentTelegramId) {
    const dbPayload = {
      title,
      message,
      type: 'coach_message',
      is_read: false,
      created_at: new Date().toISOString()
    };

    if (studentId) dbPayload.user_id = studentId;
    if (studentTelegramId) dbPayload.telegram_id = String(studentTelegramId);

    supabase.from('notifications').insert([dbPayload]).catch(() => {});
  }

  // 2. Отправляем пуш в Telegram чат ученика
  return await sendTelegramApiMessage(
    studentTelegramId, 
    messageHtml, 
    MINI_APP_URL, 
    '🏋️ Открыть GymConnect'
  );
}
