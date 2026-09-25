import React from 'react';

export default function ProfileHeader() {
  return (
    <div className="bg-white rounded-2xl py-2.5 px-3.5 shadow-xs border border-slate-100 flex items-center justify-between">
      <div>
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
        <p className="text-[11px] text-slate-400">Управление подпиской, профилем и целями</p>
      </div>
    </div>
  );
}
