// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import posthog from 'posthog-js';

// ================= ИНИЦИАЛИЗАЦИЯ ANALYTICS (POSTHOG) =================
if (typeof window !== 'undefined') {
  try {
    posthog.init('phc_ok48BUQfdDDYDyFTyFbiT5pxz2Rez7Bv4PtoqroRAWXX', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    });
  } catch (err) {
    console.warn('PostHog init error:', err);
  }
}

// ================= ГЛОБАЛЬНЫЕ СИСТЕМНЫЕ УЛУЧШЕНИЯ ДЛЯ ВСЕГО ПРИЛОЖЕНИЯ =================
if (typeof window !== 'undefined') {
  // 1. Разворачиваем Telegram Mini App и включаем защиту от случайного смахивания
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      // Предотвращает случайное закрытие шторки Telegram при скролле списков
      window.Telegram.WebApp.enableClosingConfirmation?.();
    }
  } catch (e) {
    console.warn(e);
  }

  // 2. ГЛОБАЛЬНАЯ ТАКТИЛЬНАЯ ОТДАЧА (Telegram Haptic Feedback)
  // Каждое нажатие на кнопку или ссылку в приложении дает приятный микро-щелчок Taptic Engine
  document.addEventListener('click', (e) => {
    const clickable = e.target.closest('button, a, [role="button"]');
    if (clickable) {
      try {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
      } catch (err) {}
    }
  }, { passive: true });

  // 3. ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ФОКУСА
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (!target) return;

    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    if (!isInput) return;

    // Автовыделение всего текста при нажатии (легко заменить число без бэкспейса)
    if (target.tagName === 'INPUT' && !['checkbox', 'radio', 'date', 'time', 'file'].includes(target.type)) {
      setTimeout(() => {
        try {
          target.select();
        } catch (err) {}
      }, 60);
    }

    // Автоскролл над клавиатурой (подтягивает поле в центр экрана над клавиатурой)
    setTimeout(() => {
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {}
    }, 320);
  }, true);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
