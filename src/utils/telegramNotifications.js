// src/utils/telegramNotifications.js
import { supabase } from '../supabaseClient';

// Официальный токен бота GymConnect (@gymconnect_ala_bot)
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8825396654:AAH0GzJqWOzqjys5re9De-Bc7jPIqwxtfDI';

// Валидные прямые адреса WebApp (Telegram API запрещает t.me в web_app.url)
const APP_URL = 'https://asanqakolesa.github.io/gymconnect/';
const CRM_WEBAPP_URL = 'https://asanqakolesa.github.io/gymconnect/?trainer=true';

// Реестр проверенных Telegram ID для гарантированной доставки при тестах
const KNOWN_CHAT_IDS = {
  'asanali_kk': '8120357675',
  'dattabanee': '1463087181'
};

/**
 * Отправка сообщения через Telegram Bot API с нативной WebApp кнопкой
 */
async function sendTelegramApiMessage(chatId, htmlText, webAppUrl = null, buttonText = '🏋️ Открыть GymConnect') {
  if (!chatId || !BOT_TOKEN) {
    console.warn('Отправка отменена: отсутствует chat_id или BOT_TOKEN', { chatId, hasToken: Boolean(BOT_TOKEN) });
    return { ok: false, success: false, error: 'У пользователя не привязан числовой Telegram ID' };
  }

  const payload = {
    chat_id: String(chatId),
    text: htmlText,
    parse_mode: 'HTML'
  };

  if (webAppUrl) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: buttonText,
            web_app: {
              url: webAppUrl
            }
          }
        ]
      ]
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    
    if (!resData.ok) {
      console.error('Ошибка Telegram Bot API:', resData);
      return { 
        ok: false, 
        success: false, 
        error: resData.description?.includes('bot can\'t initiate')
          ? 'Пользователь не нажал /start в боте @gymconnect_ala_bot'
          : (resData.description || 'Ошибка Telegram API')
      };
    }

    return { ok: true, success: true, data: resData };
  } catch (err) {
    console.error('Сбой сетевого запроса к Telegram API:', err);
    return { ok: false, success: false, error: err.message || 'Ошибка сети/CORS' };
  }
}

/**
 * 1. Мгновенный пуш тренеру при отметке явки ученика («Буду» / «Не приду»)
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

  let targetChatId = trainerTelegramId || KNOWN_CHAT_IDS[cleanU] || null;

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

  if (!targetChatId) {
    targetChatId = KNOWN_CHAT_IDS['asanali_kk'];
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

<i>Статус зафиксирован в вашей CRM CoachOS. Нажмите кнопку ниже для перехода:</i>
`.trim();

  return await sendTelegramApiMessage(
    targetChatId, 
    messageHtml, 
    CRM_WEBAPP_URL, 
    '🏋️ Открыть CoachOS CRM'
  );
}

/**
 * 2. Сервисные уведомления подопечному от имени бота (напоминания о тренировке, оплата)
 */
export async function sendStudentNotification({
  studentTelegramId,
  studentUsername,
  studentId,
  title = 'Уведомление от тренера',
  message
}) {
  const cleanU = (studentUsername || '').replace('@', '').trim().toLowerCase();

  // Автоматический поиск точного Telegram ID ученика
  let targetChatId = studentTelegramId || KNOWN_CHAT_IDS[cleanU] || null;

  // Если не нашли сразу — запрашиваем из базы Supabase
  if (!targetChatId && cleanU) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('telegram_id')
        .or(`username.ilike.${cleanU},username.ilike.@${cleanU}`)
        .maybeSingle();

      if (data?.telegram_id) {
        targetChatId = data.telegram_id;
      }
    } catch (e) {
      console.warn('Ошибка поиска telegram_id по username:', e);
    }
  }

  if (!targetChatId && studentId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('telegram_id, username')
        .eq('id', studentId)
        .maybeSingle();

      if (data?.telegram_id) {
        targetChatId = data.telegram_id;
      } else if (data?.username) {
        const u = data.username.replace('@', '').trim().toLowerCase();
        if (KNOWN_CHAT_IDS[u]) targetChatId = KNOWN_CHAT_IDS[u];
      }
    } catch (e) {
      console.warn('Ошибка поиска telegram_id по studentId:', e);
    }
  }

  // Резервный поиск для тестовых аккаунтов основателя
  if (!targetChatId) {
    if (cleanU === 'asanali_kk' || cleanU.includes('asanali')) {
      targetChatId = KNOWN_CHAT_IDS['asanali_kk'];
    } else if (cleanU === 'dattabanee') {
      targetChatId = KNOWN_CHAT_IDS['dattabanee'];
    }
  }

  const messageHtml = `
🔔 <b>GymConnect: ${title}</b>

${message}
`.trim();

  // БЕЗОПАСНАЯ ЗАПИСЬ В БАЗУ ЧЕРЕЗ TRY/CATCH (БЕЗ .catch() КОТОРЫЙ ВЫЗЫВАЛ СБОЙ!)
  if (studentId || targetChatId) {
    try {
      await supabase.from('notifications').insert([{
        title,
        message,
        type: 'coach_message',
        is_read: false,
        user_id: studentId || null,
        telegram_id: targetChatId ? String(targetChatId) : null,
        created_at: new Date().toISOString()
      }]);
    } catch (dbErr) {
      console.warn('Таблица notifications еще не создана, пропускаем запись в БД:', dbErr);
    }
  }

  // Отправляем пуш ученику в Telegram
  return await sendTelegramApiMessage(
    targetChatId, 
    messageHtml, 
    APP_URL, 
    '🏋️ Открыть GymConnect'
  );
}
