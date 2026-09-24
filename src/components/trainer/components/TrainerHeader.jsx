import React from 'react';
import { Settings, RefreshCw, LogOut, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export default function TrainerHeader({ trainerProfile, trainerUsername, loading, subscription, onOpenProfile, onRefresh, onLogout, onTelegramRedirect }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {trainerProfile?.avatar_url ? (
            <img src={trainerProfile.avatar_url} alt="Trainer" className="w-12 h-12 rounded-2xl object-cover shadow-md border border-slate-200" />
          ) : (
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-md shadow-blue-600/20">
              {trainerProfile?.first_name?.[0] || 'T'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                {trainerProfile ? `${trainerProfile.first_name} ${trainerProfile.last_name}` : 'Кабинет тренера'}
              </h1>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-mono px-2 py-0.5 rounded-md border border-blue-100">
                {trainerProfile?.role_type === 'group' ? 'Групповой тренинг' : trainerProfile?.role_type === 'both' ? 'Универсал' : 'Персональный тренер'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">@{trainerUsername?.replace('@', '')} • {trainerProfile?.experience_years || 0} лет стажа</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenProfile}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Мой профиль</span>
          </button>
          <button onClick={onRefresh} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="Обновить">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100" title="Выйти">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Виджет подписки и продвижения профиля */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {subscription.isActive ? (
          <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Подписка CRM активна</p>
                <p className="text-[11px] text-slate-500">Доступ действителен до <span className="font-semibold text-emerald-700">{subscription.expiresAt}</span></p>
              </div>
            </div>
            <button
              onClick={() => onTelegramRedirect('renew')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px]"
            >
              Продлить
            </button>
          </div>
        ) : (
          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Подписка не оформлена</p>
                <p className="text-[11px] text-slate-500">Оформите доступ для работы с базой</p>
              </div>
            </div>
            <button
              onClick={() => onTelegramRedirect('buy')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px]"
            >
              Оформить
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Продвижение профиля</p>
              <p className="text-[11px] text-slate-500">Получайте новых клиентов в свой зал</p>
            </div>
          </div>
          <button
            onClick={() => alert('Скоро здесь появится модуль настройки лидогенерации и продвижения!')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all text-[11px] flex items-center gap-1"
          >
            <span>Скоро</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
