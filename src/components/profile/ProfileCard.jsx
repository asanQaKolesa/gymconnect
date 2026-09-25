// src/components/profile/ProfileCard.jsx
import React, { useState } from 'react';
import { Edit3, ChevronDown, ChevronUp, User } from 'lucide-react';

export default function ProfileCard({ userProfile, onEditClick }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}` : 'Асанәли Құсайынов';
  const age = userProfile?.age || 26;
  const gym = userProfile?.gym || 'Invictus Go';
  const bio = userProfile?.bio || 'Digital marketing freelancer. Качаю спину и ноги, слежу за питанием.';
  const avatar = userProfile?.avatar_url;
  const leftTrainings = userProfile?.left_trainings !== undefined ? userProfile.left_trainings : 12;
  const goal = userProfile?.goal === 'mass' ? 'Набор массы' : userProfile?.goal === 'cut' ? 'Сушка' : 'Тонус';
  const city = userProfile?.city || 'Алматы';
  const district = userProfile?.district || 'Медеуский';

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 relative mb-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
            {avatar ? (
              <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{fullName}, {age}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-500 font-medium truncate">В зале ({gym.split('|')[0].trim()})</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onEditClick}
          className="w-9 h-9 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors border border-slate-200/60 shadow-inner"
          title="Редактировать профиль"
        >
          <Edit3 className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
        {bio}
      </p>

      {/* Раскрывающаяся шторка с деталями абонемента и целей */}
      <div className="pt-1">
        <button 
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors"
        >
          <span>Детали абонемента и целей</span>
          {isDetailsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isDetailsOpen && (
          <div className="mt-2 space-y-2 animate-in fade-in duration-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Остаток занятий</span>
                <span className="font-bold text-blue-700 text-sm">{leftTrainings} зан.</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Цель</span>
                <span className="font-bold text-emerald-700 truncate block">{goal}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 text-slate-600">
              <p><b>Основной зал:</b> {gym}</p>
              <p><b>Локация:</b> {city} ({district})</p>
              <p className="font-mono text-[11px] text-blue-600 pt-0.5">Telegram: {userProfile?.username || '@username'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
