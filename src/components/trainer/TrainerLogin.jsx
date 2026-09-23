// src/components/trainer/TrainerLogin.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Dumbbell, ArrowRight, UserPlus, Lock } from 'lucide-react';

export default function TrainerLogin({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace('@', '');
    if (!cleanUsername || !password) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('trainer_profiles')
      .select('*')
      .or(`username.eq.@${cleanUsername},username.eq.${cleanUsername}`)
      .maybeSingle();

    if (error || !data) {
      alert('Тренер с таким Telegram ником не найден. Пожалуйста, пройдите регистрацию.');
      setLoading(false);
      return;
    }

    // Проверка введенного пароля
    if (data.password && data.password !== password) {
      alert('Неверный пароль. Пожалуйста, проверьте введенные данные.');
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

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                placeholder="username"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Пароль</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="text-right pt-0.5">
            <a 
              href="https://t.me/asanali_kk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] text-blue-600 hover:underline"
            >
              Забыли пароль? Напишите в техподдержку
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Проверка...' : 'Войти в кабинет'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">Еще нет аккаунта партнера?</p>
          <button
            type="button"
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
