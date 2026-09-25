// src/components/profile/ProfileHeader.jsx
import React from 'react';

export default function ProfileHeader() {
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 mb-3 relative overflow-hidden">
      <div>
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">Личный кабинет</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">Управление подпиской, профилем и целями</p>
      </div>
    </div>
  );
}
