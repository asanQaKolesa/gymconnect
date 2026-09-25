// src/components/profile/ProfileCard.jsx
import React, { useState } from 'react';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Instagram,
  Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function ProfileCard({ user, onOpenEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user?.status || 'Хочу в зал 🔥');
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);

  // Креативные статусы атлета
  const statuses = [
    { id: 'in_gym', label: 'В зале 🏋️‍♂️' },
    { id: 'going_gym', label: 'Иду в зал 🚶‍♂️' },
    { id: 'want_gym', label: 'Хочу в зал 🔥' },
    { id: 'left_gym', label: 'Вышел из зала 🥤' },
    { id: 'home', label: 'Отдыхаю дома 🏠' },
    { id: 'sick', label: 'Болею 🤒' }
  ];

  // Расшифровка уровней подготовки
  const experienceLabels = {
    first_time: 'Первый раз в зале',
    scared_beginner: 'Пару раз заходил, было страшно',
    beginner: 'Новичок (до 6 мес)',
    regular: 'Уверенный любитель (1–2 года)',
    advanced: 'Опытный атлет (2–5 лет)',
    pro_monster: 'Профи / Монстр базы'
  };

  const experienceText = experienceLabels[user?.experience_level] || user?.experience_level || 'Любитель';
  const workoutDays = Array.isArray(user?.workout_days) ? user.workout_days : [];

  // Быстрая смена статуса в базе и локально
  const handleSelectStatus = async (statusLabel) => {
    setCurrentStatus(statusLabel);
    setIsStatusPickerOpen(false);

    try {
      const tgId = user?.telegram_id || localStorage.getItem('gymconnect_telegram_id');
      if (tgId) {
        await supabase
          .from('profiles')
          .update({ status: statusLabel })
          .eq('telegram_id', tgId);
      }
      
      const local = localStorage.getItem('gymconnect_user_profile');
      if (local) {
        const parsed = JSON.parse(local);
        localStorage.setItem('gymconnect_user_profile', JSON.stringify({ ...parsed, status: statusLabel }));
      }
    } catch (e) {
      console.warn('Не удалось обновить статус:', e);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5 select-none">
      
      {/* 1. ШАПКА: Аватар, Имя, Иконки Telegram/Instagram, Кнопка редактирования */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          {/* Аватар */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
              {user?.photo_url || user?.avatar_url ? (
                <img 
                  src={user.photo_url || user.avatar_url} 
                  alt="Аватар" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400" />
              )}
            </div>
            {user?.is_pro && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                PRO
              </span>
            )}
          </div>

          {/* Имя и соц-иконки */}
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {user?.first_name || 'Атлет'} {user?.last_name || ''}
            </h3>

            {/* Иконки соцсетей (Telegram + Instagram если заполнен) */}
            <div className="flex items-center gap-2 mt-1.5">
              {user?.telegram_username && (
                <a
                  href={`https://t.me/${user.telegram_username.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center shadow-sm transition-transform active:scale-90"
                  title={`Telegram @${user.telegram_username}`}
                >
                  {/* Telegram SVG лого */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>
              )}

              {user?.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm transition-transform active:scale-90"
                  title={`Instagram @${user.instagram}`}
                >
                  <Instagram className="w-3.5 h-3.5 stroke-[2.2]" />
                </a>
              )}

              {user?.age && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {user.age} лет
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Кнопка редактирования */}
        <button
          type="button"
          onClick={onOpenEdit}
          className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl border border-slate-200/80 active:scale-95 transition-all shadow-sm"
          title="Редактировать анкету"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. КРЕАТИВНЫЙ СТАТУС АТЛЕТА */}
      <div className="relative">
        <div 
          onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/70 rounded-full cursor-pointer active:scale-95 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold text-blue-900">{currentStatus}</span>
          <ChevronDown className="w-3 h-3 text-blue-600" />
        </div>

        {/* Выпадающий список статусов */}
        {isStatusPickerOpen && (
          <div className="absolute left-0 top-9 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 w-48 animate-in fade-in duration-150">
            {statuses.map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStatus(st.label)}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentStatus === st.label ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{st.label}</span>
                {currentStatus === st.label && <Check className="w-3 h-3 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. О СЕБЕ (БИО) — всегда на виду */}
      {user?.bio ? (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic">
          "{user.bio}"
        </div>
      ) : null}

      {/* 4. СТАТУС GYMBRO — всегда на виду */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${user?.gymbro_search ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-700">Поиск напарника GymBro</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          user?.gymbro_search 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          {user?.gymbro_search ? 'Включен' : 'Отключен'}
        </span>
      </div>

      {/* 5. КНОПКА СО СТРЕЛКОЙ: Скрыть / Раскрыть подробные параметры */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-between active:scale-98 transition-all"
      >
        <span>{isExpanded ? 'Скрыть параметры атлета' : 'Параметры, клуб и график'}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {/* 6. РАСКРЫВАЮЩИЙСЯ БЛОК (Скрыт по умолчанию) */}
      {isExpanded && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          
          {/* Рост, Вес, Цель */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F8F9FB] p-2.5 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400">Рост</p>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">
                {user?.height ? `${user.height} см` : '—'}
              </p>
            </div>

            <div className="bg-[#F8F9FB] p-2.5 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400">Вес</p>
              <p className="text-xs font-black text-slate-800 font-mono mt-0.5">
                {user?.weight ? `${user.weight} кг` : '—'}
              </p>
            </div>

            <div className="bg-[#F8F9FB] p-2.5 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400">Цель</p>
              <p className="text-[11px] font-bold text-blue-600 truncate mt-0.5">
                {user?.goal || 'Тонус'}
              </p>
            </div>
          </div>

          {/* Фитнес-клуб и район */}
          <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{user?.gym || 'Зал не выбран'}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pl-5">
              <span>{user?.district ? `${user.district} район` : 'Алматы'}</span>
              <span className="font-semibold text-blue-700">{user?.city || 'Алматы'}</span>
            </div>
          </div>

          {/* Уровень подготовки и формат тренировок */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-slate-500">Уровень подготовки:</span>
              <span className="font-bold text-slate-800 text-[11px] text-right truncate max-w-[200px]">
                {experienceText}
              </span>
            </div>

            {user?.trainer_telegram && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-900">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Личный тренер:</span>
                </div>
                <a 
                  href={`https://t.me/${user.trainer_telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold font-mono text-blue-600 hover:underline"
                >
                  @{user.trainer_telegram.replace('@', '')}
                </a>
              </div>
            )}
          </div>

          {/* График тренировок */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex gap-1">
                {workoutDays.length > 0 ? (
                  workoutDays.map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-blue-600 text-white font-bold rounded-lg text-[10px]">
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">Дни не выбраны</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">
                {user?.workout_time_slot ? user.workout_time_slot.split(' ')[0] : 'Вечер'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
