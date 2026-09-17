import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Защищенный запуск приложения с отловом ошибок
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: #ff5555; background: #111; font-family: monospace; height: 100vh;">
      <h3>Ошибка запуска приложения:</h3>
      <pre>${error.message}</pre>
    </div>
  `;
}
