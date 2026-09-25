// src/components/trainer/TrainerLogin.jsx
import React, { useState } from 'react';
import { ArrowLeft, KeyRound, UserCheck, ShieldCheck, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function TrainerLogin({ onLoginSuccess, onSwitchToRegister, onBack }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('trainer');
      url.searchParams.set('tab', 'profile');
      window.location.href = url.pathname + url.search;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Введите ваш Telegram Username');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const cleanU = username.trim().replace('@', '');
      
      const { data, error } = await supabase
        .from('trainer_profiles')
        .select('*')
        .or(`username.eq.@${cleanU},username.eq.${cleanU}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg('Тренер с таким username не найден. Подайте заявку на регистрацию.');
        setIsLoading(false);
        return;
      }

      if (data.status === 'pending') {
        setErrorMsg('Ваша заявка находится на модерации администратора.');
        setIsLoading(false);
        return;
      }

      if (data.status === 'rejected') {
        setErrorMsg('Ваша заявка была отклонена администратором.');
        setIsLoading(false);
        return;
      }

      // Успешный вход в Trainer CRM
      onLoginSuccess(data.username);
    } catch (err) {
      console.error('Ошибка входа тренера:', err);
      setErrorMsg('Ошибка связи с базой данных: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col justify-between p-4 overflow-y-auto select-none">
      <div className="max-w-md mx-auto w-full space-y-4 pt-2">
        
        {/* Кнопка Назад в профиль атлета */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-700 active:scale-95 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Назад в профиль</span>
          </button>
          
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            GymConnect Partner
          </span>
        </div>

        {/* Заголовок */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Вход в Trainer CRM
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Экосистема для сертифицированных тренеров: учет учеников, расписание и финансовая аналитика
          </p>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Ваш Telegram Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-mono text-sm font-bold">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value.replace(/[@\s]/g, ''))}
                placeholder="coach_almaty"
                className="w-full pl-8 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Укажите ник Telegram, под которым вы подавали заявку
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Проверка аккаунта...' : 'Войти в панель тренера'}</span>
          </button>

        </form>

        {/* Переход к подаче заявки */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">Еще не являетесь партнером?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-blue-600 active:scale-98 transition-all"
          >
            Подать заявку тренера
          </button>
        </div>

      </div>
    </div>
  );
}
