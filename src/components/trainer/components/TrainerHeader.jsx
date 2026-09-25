// src/components/trainer/components/TrainerHeader.jsx
import React from 'react';
import { Dumbbell, LogOut, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function TrainerHeader({ trainer, onLogout, onBack }) {
  const isApproved = trainer?.status === 'approved';

  return (
    <header className="bg-white border-b border-slate-200/80 p-4 sticky top-0 z-30 select-none shadow-sm">
      <div className="flex items-center justify-between">
        
        {/* Кнопка быстрого возврата в профиль атлета */}
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
              title="Вернуться в профиль атлета"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Профиль</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
              <Dumbbell className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black text-slate-900 tracking-tight">
                  {trainer?.full_name || 'Фитнес-тренер'}
                </h1>
                {isApproved && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                @{trainer?.username || 'тренер'} • CRM
              </p>
            </div>
          </div>
        </div>

        {/* Выход из учетной записи тренера */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
          title="Выйти из аккаунта тренера"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>
    </header>
  );
}
