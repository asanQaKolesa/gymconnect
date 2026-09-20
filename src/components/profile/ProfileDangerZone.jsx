import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';

export default function ProfileDangerZone() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      <div className="divide-y divide-slate-50">
        <button 
          onClick={() => alert('Выход из аккаунта')}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-amber-600 transition-colors">
            <LogOut className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">Выйти из аккаунта</span>
        </button>

        <button 
          onClick={() => alert('Удаление аккаунта')}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-rose-50/50 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50/80 flex items-center justify-center text-rose-500 transition-colors">
            <Trash2 className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-sm font-medium text-rose-600">Удалить аккаунт</span>
        </button>
      </div>
    </div>
  );
}
