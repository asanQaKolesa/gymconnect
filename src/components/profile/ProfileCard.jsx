// src/components/profile/ProfileCard.jsx
import React, { useState } from 'react';
import { Edit3, ChevronDown, ChevronUp, User, Award, Send, Instagram, Smile } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'in_gym', label: 'В зале', color: 'bg-emerald-500' },
  { id: 'want_gym', label: 'Хочу в зал', color: 'bg-blue-500' },
  { id: 'at_home', label: 'Дома', color: 'bg-amber-500' },
  { id: 'sick', label: 'Заболел', color: 'bg-rose-500' },
  { id: 'rest', label: 'Отдыхаю', color: 'bg-purple-500' }
];

export default function ProfileCard({ userProfile, onEditClick }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('in_gym');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}` : 'Асанәли Құсайынов';
  const age = userProfile?.age || 26;
  const gym = userProfile?.gym || 'Invictus Go';
  const bio = userProfile?.bio || 'Digital marketing freelancer. Качаю спину и ноги, слежу за питанием.';
  const avatar = userProfile?.avatar_url;
  const leftTrainings = userProfile?.left_trainings !== undefined ? userProfile.left_trainings : 12;
  const goal = userProfile?.goal === 'mass' ? 'Набор массы' : userProfile?.goal === 'cut' ? 'Сушка' : 'Тонус';
  const city = userProfile?.city || 'Алматы';
  const district = userProfile?.district || 'Медеуский';
  const username = userProfile?.username || '';
  const instagram = userProfile?.instagram || '';

  const activeStatusObj = STATUS_OPTIONS.find(s => s.id === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 relative mb-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shrink-0 shadow-inner">
            {avatar ? (
              <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full mb-1">
              <Award className="w-3 h-3" /> PRO Атлет
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">{fullName}, {age}</h2>
            
            {/* Интерактивный статус */}
            <div className="relative mt-0.5">
              <button 
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60"
              >
                <span className={`w-2 h-2 rounded-full ${activeStatusObj.color} animate-pulse shrink-0`}></span>
                <span className="font-medium truncate">{activeStatusObj.label} ({gym.split('|')[0].trim()})</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" />
              </button>

              {isStatusMenuOpen && (
                <div className="absolute z-50 left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                  {STATUS_OPTIONS.map(status => (
                    <button
                      key={status.id}
                      onClick={() => {
                        setCurrentStatus(status.id);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 text-slate-700 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                      <span>{status.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки соцсетей и редактирования сверху */}
        <div className="flex items-center gap-1.5 shrink-0">
          {username && (
            <a 
              href={`https://t.me/${username.replace(/^@+/, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center transition-all border border-blue-200/60 shadow-inner"
              title="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          )}

          {instagram && (
            <a 
              href={`https://instagram.com/${instagram.replace(/^@+/, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center transition-all border border-pink-200/60 shadow-inner"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}

          <button 
            onClick={onEditClick}
            className="w-9 h-9 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors border border-slate-200 shadow-inner"
            title="Редактировать профиль"
          >
            <Edit3 className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
        {bio}
      </p>

      {/* Раскрывающаяся шторка с деталями (без дублирования телеграма) */}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
