// src/components/profile/ProfileDocs.jsx
import React from 'react';
import { FileText, ChevronRight, ShieldCheck } from 'lucide-react';

export default function ProfileDocs({ onOpenDocs }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5 select-none">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Юридическая документация
        </span>
        <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-slate-200">
          <ShieldCheck className="w-3 h-3 text-slate-600" />
          <span>7 актов РК</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenDocs}
        className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between text-slate-800 active:scale-98 transition-all"
      >
        <div className="flex items-center gap-2.5 text-left">
          {/* Монохромная иконка без синего цвета */}
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-sm text-slate-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Правовые документы и регламенты
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Публичная оферта, политика данных, безопасность и отказ от ответственности
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>
    </div>
  );
}
