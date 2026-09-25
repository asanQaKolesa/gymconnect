// src/components/profile/ProfileCard.jsx
import React from 'react';
import { 
  Edit3, 
  MapPin, 
  Calendar, 
  Users, 
  UserCheck, 
  Flame, 
  Award, 
  Clock, 
  Dumbbell 
} from 'lucide-react';

export default function ProfileCard({ user, onOpenEdit }) {
  // Расшифровка креативных уровней подготовки
  const experienceLabels = {
    first_time: 'Первый раз в зале',
    scared_beginner: 'Пару раз заходил, было страшно',
    beginner: 'Новичок (до 6 мес)',
    regular: 'Уверенный любитель (1–2 года)',
    advanced: 'Опытный атлет (2–5 лет)',
    pro_monster: 'Профи / Монстр базы'
  };

  // Расшифровка формата тренировок
  const trainingFormatLabels = {
    alone: 'Тренируется самостоятельно',
    coach_gym: 'С персональным тренером в зале',
    coach_online: 'С тренером онлайн',
    looking_for_coach: 'В поиске персонального тренера'
  };

  const experienceText = experienceLabels[user?.experience_level] || user?.experience_level || 'Любитель';
  const formatText = trainingFormatLabels[user?.training_format] || 'Тренируюсь сам';
  const workoutDays = Array.isArray(user?.workout_days) ? user.workout_days : [];

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-4">
      
      {/* Шапка карточки: Аватар, Имя, Telegram, Кнопка редактирования */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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

          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {user?.first_name || 'Атлет'} {user?.last_name || ''}
            </h3>
            {user?.telegram_username && (
              <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                @{user.telegram_username}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {user?.age ? `${user.age} лет` : '25 лет'}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {user?.gender === 'female' ? 'Женский' : 'Мужской'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEdit}
          className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl border border-slate-200/80 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          title="Редактировать анкету"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Описание о себе (Био) */}
      {user?.bio && (
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
          "{user.bio}"
        </div>
      )}

      {/* Физические параметры (Рост, Вес, Цель) */}
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

      {/* Основной фитнес-клуб и район */}
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

      {/* Формат тренировок и Привязанный тренер */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Формат тренировок:</span>
          <span className="font-bold text-slate-800 text-[11px]">{formatText}</span>
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

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
          <span className="text-[11px] font-semibold text-slate-500">Уровень подготовки:</span>
          <span className="font-bold text-slate-800 text-[11px] text-right truncate max-w-[200px]">
            {experienceText}
          </span>
        </div>
      </div>

      {/* График тренировок и время */}
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
          <span className="truncate max-w-[120px]">{user?.workout_time_slot ? user.workout_time_slot.split(' ')[0] : 'Вечер'}</span>
        </div>
      </div>

      {/* Статус GymBro Matching */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${user?.gymbro_search ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-700">Поиск напарника GymBro</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          user?.gymbro_search 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-200 text-slate-500'
        }`}>
          {user?.gymbro_search ? 'Активен' : 'Отключен'}
        </span>
      </div>

    </div>
  );
}
