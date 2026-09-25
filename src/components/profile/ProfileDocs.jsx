import React from 'react';
import { HelpCircle, BookOpen, ChevronRight } from 'lucide-react';

export default function ProfileDocs({ onOpenDocs }) {
  return (
    <div className="space-y-1.5">
      <p className="px-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">ИНФОРМАЦИОННАЯ ПОМОЩЬ</p>
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs divide-y divide-slate-100">
        
        {/* 1. Чат поддержки */}
        <button 
          onClick={() => window.open('https://t.me/gymconnect_support', '_blank')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-slate-900">Поддержка пользователей</h4>
              <p className="text-[10px] text-slate-400">Чат службы заботы в Telegram</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>

        {/* 2. Документация */}
        <button 
          onClick={onOpenDocs}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <BookOpen className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 truncate">Документация</h4>
              <p className="text-[10px] text-slate-400 truncate">Официальные правила, оферта и соглашения</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* whitespace-nowrap гарантирует отображение "7 актов" в одну строку */}
            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
              7 актов
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </button>

      </div>
    </div>
  );
}
