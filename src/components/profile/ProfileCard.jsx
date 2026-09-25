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

  const cleanTelegram = typeof user?.telegram_username === 'string' ? user.telegram_username.replace('@', '') : '';
  const cleanInstagram = typeof user?.instagram === 'string' ? user.instagram.replace('@', '') : '';

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3 select-none">
      
      {/* 1. ВЕРХНИЙ БЛОК: Аватар, Имя, Статус прямо под именем, Возраст/Пол и Кнопка редактирования */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          
          {/* Аватар атлета */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shadow-sm">
              {user?.photo_url || user?.avatar_url ? (
                <img 
                  src={user.photo_url || user.avatar_url} 
                  alt="Аватар" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400 stroke-[1.5]" />
              )}
            </div>
            {user?.is_pro && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                PRO
              </span>
            )}
          </div>

          {/* Имя, статус под именем и возраст */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {user?.first_name || 'Атлет'} {user?.last_name || ''}
            </h3>

            {/* Статус атлета прямо под именем (легкий тонкий шрифт) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusPickerOpen(!isStatusPickerOpen)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 rounded-lg text-[11px] font-medium text-slate-700 active:scale-95 transition-all"
              >
                <span>{currentStatus}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Выпадающее окно статусов */}
              {isStatusPickerOpen && (
                <div className="absolute left-0 top-7 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 w-44 animate-in fade-in duration-150">
                  {statuses.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStatus(st.label)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        currentStatus === st.label ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{st.label}</span>
                      {currentStatus === st.label && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Возраст и пол в виде легкой аккуратной строчки */}
            <p className="text-[11px] text-slate-400 font-normal">
              {user?.age ? `${user.age} лет` : '24 года'} • {user?.gender === 'female' ? 'Женский' : 'Мужской'} • {user?.city || 'Алматы'}
            </p>
          </div>
        </div>

        {/* Кнопка редактирования анкеты */}
        <button
          type="button"
          onClick={onOpenEdit}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200/70 active:scale-95 transition-all shadow-sm shrink-0"
          title="Редактировать анкету"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* 2. УДОБНЫЙ БЛОК СОЦСЕТЕЙ (Увеличенный Telegram, комфортный для нажатия) */}
      <div className="flex items-center gap-2 pt-0.5">
        {cleanTelegram ? (
          <a
            href={`https://t.me/${cleanTelegram}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2 px-3 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#1982b6] rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all active:scale-98 border border-[#229ED9]/25 shadow-sm"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <span className="truncate">@{cleanTelegram}</span>
          </a>
        ) : null}

        {cleanInstagram ? (
          <a
            href={`https://instagram.com/${cleanInstagram}`}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all active:scale-98 border border-rose-200/60 shadow-sm shrink-0"
          >
            <Instagram className="w-4 h-4 stroke-[2]" />
            <span>@{cleanInstagram}</span>
          </a>
        ) : null}
      </div>

      {/* 3. БИО (О себе) */}
      {user?.bio ? (
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs text-slate-600 font-normal leading-relaxed italic">
          "{user.bio}"
        </div>
      ) : null}

      {/* 4. СТАТУС GYMBRO */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${user?.gymbro_search ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-xs font-medium text-slate-700">Поиск напарника GymBro</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          user?.gymbro_search 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          {user?.gymbro_search ? 'Включен' : 'Отключен'}
        </span>
      </div>

      {/* 5. КНОПКА РАСКРЫТИЯ ПАРАМЕТРОВ */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-2xl text-xs font-semibold text-slate-700 flex items-center justify-between active:scale-98 transition-all"
      >
        <span>{isExpanded ? 'Скрыть параметры атлета' : 'Параметры атлета, клуб и график'}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* 6. РАСКРЫВАЮЩИЕСЯ ПАРАМЕТРЫ С ЛЕГКИМИ ТОНКИМИ ШРИФТАМИ */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
          
          {/* Рост, Вес, Цель (шрифты облегчены до font-medium / font-semibold) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Рост</p>
              <p className="text-xs font-semibold text-slate-700 font-mono mt-0.5">
                {user?.height ? `${user.height} см` : '—'}
              </p>
            </div>

            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Вес</p>
              <p className="text-xs font-semibold text-slate-700 font-mono mt-0.5">
                {user?.weight ? `${user.weight} кг` : '—'}
              </p>
            </div>

            <div className="bg-[#F8F9FB] p-2 rounded-2xl text-center border border-slate-100">
              <p className="text-[10px] font-normal text-slate-400">Цель</p>
              <p className="text-[11px] font-medium text-blue-600 truncate mt-0.5">
                {user?.goal || 'Тонус'}
              </p>
            </div>
          </div>

          {/* Фитнес-клуб (название облегчено с жирного до аккуратного font-medium) */}
          <div className="bg-blue-50/40 p-2.5 rounded-2xl border border-blue-100 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{user?.gym || 'Зал не выбран'}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pl-5 font-normal">
              <span>{user?.district ? `${user.district} район` : 'Алматы'}</span>
              <span>{user?.city || 'г. Алматы'}</span>
            </div>
          </div>

          {/* Уровень подготовки и тренер (тонкие шрифты) */}
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-normal text-slate-500">Уровень подготовки:</span>
              <span className="font-medium text-slate-700 text-[11px] text-right truncate max-w-[200px]">
                {experienceText}
              </span>
            </div>

            {user?.trainer_telegram && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1 text-[11px] font-normal text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Личный тренер:</span>
                </div>
                <a 
                  href={`https://t.me/${String(user.trainer_telegram).replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium font-mono text-blue-600 hover:underline"
                >
                  @{String(user.trainer_telegram).replace('@', '')}
                </a>
              </div>
            )}
          </div>

          {/* График тренировок (легкие бейджи) */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex gap-1">
                {workoutDays.length > 0 ? (
                  workoutDays.map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-medium rounded-lg text-[10px]">
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px] font-normal">Дни не выбраны</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">
                {typeof user?.workout_time_slot === 'string' ? user.workout_time_slot.split(' ')[0] : 'Вечер'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
