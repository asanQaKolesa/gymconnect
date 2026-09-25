// src/components/profile/ProfileDangerZone.jsx
import React from 'react';
import { LogOut, Trash2, ShieldAlert } from 'lucide-react';

export default function ProfileDangerZone({ onLogout, onDeleteAccount }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3 select-none">
      
      {/* Заголовок зоны опасности */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Опасная зона
        </span>
      </div>

      <div className="space-y-2">
        {/* Кнопка выхода из сессии */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full p-3 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 rounded-2xl flex items-center justify-between text-rose-600 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-rose-200/50 flex items-center justify-center shrink-0 shadow-sm">
              <LogOut className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-700 leading-tight">Завершить сессию</p>
              <p className="text-[10px] text-rose-500/90 mt-0.5">Выйти из профиля на этом устройстве</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white/80 px-2.5 py-1 rounded-xl border border-rose-200/50 text-rose-600">
            Выйти
          </span>
        </button>

        {/* Кнопка безвозвратного удаления аккаунта */}
        <button
          type="button"
          onClick={onDeleteAccount}
          className="w-full p-3 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 rounded-2xl flex items-center justify-between text-rose-600 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white/90 border border-rose-200/50 flex items-center justify-center shrink-0 shadow-sm">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-700 leading-tight">Удалить профиль</p>
              <p className="text-[10px] text-rose-500/90 mt-0.5">Безвозвратное удаление всех анкетных данных</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white/80 px-2.5 py-1 rounded-xl border border-rose-200/50 text-rose-600">
            Удалить
          </span>
        </button>
      </div>

    </div>
  );
}
