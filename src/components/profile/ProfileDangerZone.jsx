// src/components/profile/ProfileDangerZone.jsx
import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';

export default function ProfileDangerZone() {
  const handleLogout = () => {
    if (confirm('Вы действительно хотите выйти из аккаунта?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Внимание! Это действие удалит ваш аккаунт и все данные. Продолжить?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      <div className="divide-y divide-slate-50">
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-amber-600 group-hover:bg-amber-50 transition-colors">
            <LogOut className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">Выйти из аккаунта</span>
        </button>

        <button 
          onClick={handleDeleteAccount}
          className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-rose-50/50 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-rose-600 group-hover:bg-rose-50 transition-colors">
            <Trash2 className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-sm font-medium text-slate-700 group-hover:text-rose-600 transition-colors">Удалить аккаунт</span>
        </button>
      </div>
    </div>
  );
}
