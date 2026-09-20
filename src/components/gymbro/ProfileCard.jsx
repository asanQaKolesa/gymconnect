import React from 'react';
import { Edit3 } from 'lucide-react';

export default function ProfileCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
            alt="Асанәли" 
            className="w-14 h-14 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Асанәли Құсайынов, 26</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-slate-500 font-medium">В зале (Invictus Go)</span>
            </div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
          <Edit3 className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed border-t border-slate-50 pt-2.5">
        Digital marketing freelancer. Качаю спину и ноги, слежу за питанием.
      </p>
    </div>
  );
}
