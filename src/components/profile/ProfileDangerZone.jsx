import React from 'react';
import { LogOut, Trash2, ChevronRight } from 'lucide-react';

export default function ProfileDangerZone({ onLogout, onDeleteAccount }) {
  return (
    <div className="space-y-1.5 pt-0.5">
      <p className="px-2 text-[11px] font-bold text-rose-500 tracking-wider uppercase">ЗОНА ОПАСНОСТИ</p>
      <div className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xs divide-y divide-rose-50">
        
        {/* Кнопка выхода в едином красном стиле */}
        <button 
          onClick={onLogout}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-rose-600">Выйти из аккаунта</h4>
              <p className="text-[10px] text-rose-400">Завершить сессию на этом устройстве</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500 transition-colors" />
        </button>

        {/* Удаление профиля */}
        <button 
          onClick={onDeleteAccount}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50/70 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-rose-700">Удалить профиль</h4>
              <p className="text-[10px] text-rose-400">Безвозвратное удаление всех данных</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500 transition-colors" />
        </button>

      </div>
    </div>
  );
}
