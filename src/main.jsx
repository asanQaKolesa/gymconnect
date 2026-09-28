// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ================= ГЛОБАЛЬНЫЙ ПЕРЕХВАТЧИК ДЛЯ ВСЕХ ПОЛЕЙ ПРИЛОЖЕНИЯ =================
if (typeof window !== 'undefined') {
  // Разворачиваем Telegram Mini App на максимум
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
    }
  } catch (e) {
    console.warn(e);
  }

  // Единый глобальный слушатель фокуса на весь документ
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (!target) return;

    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    if (!isInput) return;

    // 1. АВТОВЫДЕЛЕНИЕ: при нажатии выделяет весь текст/число (легко заменить без бэкспейса)
    if (target.tagName === 'INPUT' && !['checkbox', 'radio', 'date', 'time', 'file'].includes(target.type)) {
      setTimeout(() => {
        try {
          target.select();
        } catch (err) {}
      }, 60);
    }

    // 2. АВТОСКРОЛЛ: плавно подтягивает активное поле в центр экрана над клавиатурой
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
