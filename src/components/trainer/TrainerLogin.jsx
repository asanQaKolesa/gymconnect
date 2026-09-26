// src/components/trainer/TrainerLogin.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, UserCheck, ShieldCheck, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function TrainerLogin({ onLoginSuccess, onSwitchToRegister, onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [trainerStatus, setTrainerStatus] = useState(null);

  // Получаем защищенные данные владельца из Telegram Mini App API
  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const currentUsername = tgUser?.username ? tgUser.username.replace('@', '').trim() : '';
  const currentTgId = tgUser?.id ? String(tgUser.id) : localStorage.getItem('gymconnect_telegram_id');

  const handleBackAction = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      window.location.href = window.location.pathname + '?tab=profile';
    }
  };

  // Автоматическая проверка аккаунта при открытии
  const handleSecureLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setTrainerStatus(null);

    try {
      if (!currentUsername && !currentTgId) {
        setErrorMsg('Не удалось определить аккаунт Telegram. Запустите мини-апп внутри Telegram.');
        setIsLoading(false);
        return;
      }

      // Поиск тренера по username или telegram_id в базе Supabase
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.eq.${currentUsername},username.eq.@${currentUsername}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg('Тренерский аккаунт для этого Telegram не найден. Заполните анкету для подключения к CoachOS.');
        setIsLoading(false);
        return;
      }

      // Если заявка еще на модерации
      if (data.status === 'pending') {
        setTrainerStatus('pending');
        setIsLoading(false);
        return;
      }

      if (data.status === 'rejected') {
        setErrorMsg('Ваша заявка была отклонена администратором GymConnect.');
        setIsLoading(false);
        return;
      }

      // Успешный безопасный вход владельца аккаунта
      onLoginSuccess(data.username);
    } catch (err) {
      console.error('Ошибка авторизации тренера:', err);
      setErrorMsg('Ошибка связи с сервером: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-4 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-4 pt-2">
        
        {/* Верхняя навигация */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700 active:scale-95 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Назад в профиль</span>
          </button>
          
          <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            CoachOS Защита
          </span>
        </div>

        {/* Заголовок */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-2">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Вход в GymConnect CoachOS
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Безопасный доступ к панели тренера привязан к вашему аккаунту Telegram
          </p>
        </div>

        {/* Карточка безопасной авторизации */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          
          {/* Отображение привязанного Telegram-аккаунта */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {currentUsername ? currentUsername[0]?.toUpperCase() : 'T'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : 'Пользователь Telegram'}
              </p>
              <p className="text-[11px] text-blue-600 font-mono">
                {currentUsername ? `@${currentUsername}` : 'ID не определен'}
              </p>
            </div>
          </div>

          {/* Предупреждение о статусе модерации */}
          {trainerStatus === 'pending' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-900">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Анкета на проверке у администратора</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Ваша анкета получена и проверяется. Если вы хотите войти для тестирования функционала прямо сейчас, нажмите кнопку ниже:
              </p>
              <button
                type="button"
                onClick={() => onLoginSuccess(currentUsername)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] transition-colors"
              >
                Войти в режиме предварительного просмотра
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Главная кнопка безопасного входа */}
          <button
            type="button"
            onClick={handleSecureLogin}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isLoading ? 'Проверка прав доступа...' : `Войти как @${currentUsername || 'тренер'}`}
            </span>
          </button>
        </div>

        {/* Кнопка подачи анкеты */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">Еще не подавали анкету наставника?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-blue-600 active:scale-98 transition-all"
          >
            Подать заявку тренера CoachOS
          </button>
        </div>

      </div>
    </div>
  );
}
