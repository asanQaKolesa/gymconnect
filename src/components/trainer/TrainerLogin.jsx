// src/components/trainer/TrainerLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Dumbbell, ArrowRight, UserPlus } from 'lucide-react';

export default function TrainerLogin({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace('@', '');
    if (!cleanUsername) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .or(`username.eq.@${cleanUsername},username.eq.${cleanUsername}`)
      .single();

    if (error || !data) {
      alert('Тренер с таким Telegram ником не найден. Пожалуйста, пройдите регистрацию.');
      setLoading(false);
      return;
    }

    localStorage.setItem('gymconnect_trainer_registered', 'true');
    localStorage.setItem('gymconnect_trainer_username', data.username);
    onLoginSuccess(data.username);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">GymConnect Trainer</h1>
          <p className="text-xs text-slate-500 mt-1">Вход в партнерскую CRM-панель</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Ваш Telegram Username</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Проверка...' : 'Войти в кабинет'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">Еще нет аккаунта партнера?</p>
          <button
            onClick={onSwitchToRegister}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Зарегистрироваться как тренер</span>
          </button>
        </div>
      </div>
    </div>
  );
}
